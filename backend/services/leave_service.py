from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import List, Optional, Tuple
from fastapi import HTTPException, status, UploadFile
from datetime import date, datetime, timedelta
from decimal import Decimal
from backend.repositories.leave_repository import leave_repository
from backend.models.leave import LeaveApplication, LeaveBalance, LeaveTypeEnum, LeaveApplicationStatus, LeaveType, PublicHoliday, LeaveApprovalLog
from backend.models.leave_credit import LeaveCreditRequest, LeaveCreditStatus
from backend.models.employee import Employee
from backend.schemas.leave import LeaveApplicationCreate
from backend.schemas.leave_credit import LeaveCreditRequestCreate
from backend.utils.file_storage import upload_file, delete_file

class LeaveService:
    def initialize_leave_types(self, db: Session):
        """Helper to ensure default types exist (called usually on startup or first run)"""
        # Define default types as per spec
        default_types = [
            LeaveType(name=LeaveTypeEnum.earned_leave, abbr="EL", annual_entitlement=15, accrual_method="monthly", carry_forward=True, max_carry_forward=30, encashment=True),
            LeaveType(name=LeaveTypeEnum.casual_leave, abbr="CL", annual_entitlement=12, accrual_method="monthly", carry_forward=False),
            LeaveType(name=LeaveTypeEnum.sick_leave, abbr="SL", annual_entitlement=12, accrual_method="monthly", carry_forward=True, max_carry_forward=24),
            LeaveType(name=LeaveTypeEnum.compensatory_off, abbr="CO", annual_entitlement=0, accrual_method="manual", carry_forward=False, requires_approval=True),
            LeaveType(name=LeaveTypeEnum.loss_of_pay, abbr="LOP", annual_entitlement=0, accrual_method="manual", carry_forward=False, negative_balance_allowed=True),
            # Special Leave Types
            LeaveType(name=LeaveTypeEnum.maternity_leave, abbr="ML", annual_entitlement=180, accrual_method="manual", carry_forward=False, requires_approval=True, gender_eligibility="Female", requires_document=True),
            LeaveType(name=LeaveTypeEnum.paternity_leave, abbr="PL", annual_entitlement=5, accrual_method="manual", carry_forward=False, requires_approval=True, gender_eligibility="Male", requires_document=True),
            LeaveType(name=LeaveTypeEnum.bereavement_leave, abbr="BL", annual_entitlement=5, accrual_method="manual", carry_forward=False, requires_approval=True, requires_document=True),
            LeaveType(name=LeaveTypeEnum.marriage_leave, abbr="MRL", annual_entitlement=3, accrual_method="manual", carry_forward=False, requires_approval=True, requires_document=True),
            LeaveType(name=LeaveTypeEnum.adoption_leave, abbr="AL", annual_entitlement=84, accrual_method="manual", carry_forward=False, requires_approval=True, requires_document=True),
            LeaveType(name=LeaveTypeEnum.restricted_holiday, abbr="RH", annual_entitlement=2, accrual_method="annual", carry_forward=False, requires_approval=True),
        ]

        existing_types = {lt.name for lt in leave_repository.get_leave_types(db)}
        
        for t in default_types:
            if t.name not in existing_types:
                db.add(t)
        
        db.commit()

    def calculate_pro_rata_accrual(self, db: Session, employee_id: int, year: int) -> None:
        """
        Calculates and updates the 'accrued' field in LeaveBalance for a given employee and year.
        Logic based on spec:
        - Monthly Accrual = (Annual Entitlement / 12)
        - Joining Month: 1-10 (Full), 11-20 (Half), 21+ (None)
        """
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            return

        leave_types = leave_repository.get_leave_types(db)
        current_date = date.today()
        
        # If querying for a past year, assume full accrual unless joined that year
        # If querying for current year, accrue up to current month
        
        target_month = 12 if year < current_date.year else current_date.month
        
        for lt in leave_types:
            # Check if balance record exists
            balance = leave_repository.get_balance(db, employee_id, lt.id, year)
            if not balance:
                balance = LeaveBalance(
                    employee_id=employee_id, 
                    leave_type_id=lt.id, 
                    leave_year=year,
                    available=0,
                    opening_balance=0,
                    accrued=0,
                    taken=0,
                    pending_approval=0,
                    carry_forward=0
                )
                leave_repository.create_balance(db, balance)

            if lt.accrual_method == 'monthly':
                monthly_entitlement = Decimal(str(lt.annual_entitlement)) / 12
                total_accrued = Decimal(0)

                # Iterate months to calculate accrual
                for month in range(1, target_month + 1):
                    # Check joining date logic
                    if employee.date_of_joining:
                        join_date = employee.date_of_joining
                        if join_date.year > year:
                            continue # Not joined yet
                        if join_date.year == year and join_date.month > month:
                            continue # Joined after this month
                        if join_date.year == year and join_date.month == month:
                            # Joining month logic
                            if join_date.day <= 10:
                                total_accrued += monthly_entitlement
                            elif join_date.day <= 20:
                                total_accrued += monthly_entitlement / 2
                            else:
                                total_accrued += 0
                            continue
    
                    # Standard month
                    total_accrued += monthly_entitlement

                balance.accrued = total_accrued
            
            else:
                 # For Manual/Annual/Fixed types (Maternity, Paternity, etc.)
                 if lt.name not in [LeaveTypeEnum.compensatory_off, LeaveTypeEnum.loss_of_pay]:
                      balance.accrued = Decimal(str(lt.annual_entitlement))
            
            balance.available = balance.opening_balance + balance.accrued + balance.carry_forward - balance.taken - balance.pending_approval
            leave_repository.update_balance(db, balance)

    def calculate_working_days(self, db: Session, from_date: date, to_date: date, duration_type: str) -> Decimal:
        """Calculates working days excluding weekends and public holidays."""
        if duration_type == "Half Day":
            return Decimal("0.5")
        
        if not to_date:
            to_date = from_date

        # Fetch non-restricted holidays in range (Regular holidays)
        holidays = db.query(PublicHoliday.holiday_date).filter(
            PublicHoliday.holiday_date >= from_date,
            PublicHoliday.holiday_date <= to_date,
            PublicHoliday.is_restricted == False
        ).all()
        holiday_dates = {h.holiday_date for h in holidays}

        working_days = 0
        current_date = from_date
        while current_date <= to_date:
            # 5 = Saturday, 6 = Sunday
            if current_date.weekday() < 5 and current_date not in holiday_dates:
                working_days += 1
            current_date += timedelta(days=1)
        
        return Decimal(str(working_days))

    def apply_leave(self, db: Session, application_data: LeaveApplicationCreate, employee_id: int, attachment: Optional[UploadFile] = None):
        # 1. Check Balance
        # Ensure accruals are up to date
        current_year = application_data.from_date.year
        self.calculate_pro_rata_accrual(db, employee_id, current_year)
        
        # Calculate precise days excluding weekends/holidays
        days_requested = self.calculate_working_days(
            db, 
            application_data.from_date, 
            application_data.to_date, 
            application_data.duration_type
        )
        
        if days_requested <= 0:
             raise HTTPException(status_code=400, detail="The selected date range contains no working days (weekends or holidays only).")

        leave_type = leave_repository.get_leave_type(db, application_data.leave_type_id)
        if not leave_type:
             raise HTTPException(status_code=404, detail="Leave type not found")

        # Restricted Holiday Specific Validations
        if leave_type.name == LeaveTypeEnum.restricted_holiday:
            # 1. Ensure date is a configured Restricted Holiday
            rh_holiday = db.query(PublicHoliday).filter(
                PublicHoliday.holiday_date == application_data.from_date,
                PublicHoliday.is_restricted == True
            ).first()
            
            if not rh_holiday:
                raise HTTPException(status_code=400, detail=f"The selected date {application_data.from_date} is not a configured Restricted Holiday.")
            
            # 2. Ensure and multi-day RH is not allowed (usually single day)
            if application_data.to_date and application_data.to_date != application_data.from_date:
                raise HTTPException(status_code=400, detail="Restricted Holidays can only be applied for a single day.")

            # 3. Check if employee already applied for THIS specific RH date
            already_applied = db.query(LeaveApplication).filter(
                LeaveApplication.employee_id == employee_id,
                LeaveApplication.leave_type_id == application_data.leave_type_id,
                LeaveApplication.from_date == application_data.from_date,
                LeaveApplication.status.in_([LeaveApplicationStatus.pending, LeaveApplicationStatus.approved])
            ).first()
            
            if already_applied:
                raise HTTPException(status_code=400, detail=f"You have already applied for the Restricted Holiday on {application_data.from_date}.")

        # 1.1 Overlap Check
        # Check if there are any pending or approved leaves that overlap with the requested dates
        # Overlap Logic: (StartA <= EndB) and (EndA >= StartB)
        overlapping_applications = db.query(LeaveApplication).filter(
            LeaveApplication.employee_id == employee_id,
            LeaveApplication.status.in_([LeaveApplicationStatus.pending, LeaveApplicationStatus.approved]),
            LeaveApplication.from_date <= application_data.to_date,
            LeaveApplication.to_date >= application_data.from_date
        ).first()

        if overlapping_applications:
             raise HTTPException(
                 status_code=400, 
                 detail=f"Leave application overlaps with an existing application ({overlapping_applications.from_date} to {overlapping_applications.to_date})"
             )

        # Advanced Validation
        # Advance Notice
        if leave_type.min_days_in_advance:
            notice_days = (application_data.from_date - date.today()).days
            if notice_days < leave_type.min_days_in_advance:
                raise HTTPException(status_code=400, detail=f"This leave type requires {leave_type.min_days_in_advance} days advance notice.")

        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        # Gender Eligibility Check
        if leave_type.gender_eligibility != "All":
             # Assuming 'Male', 'Female', 'Other' are standard values. 
             # Case-insensitive check recommended or strict match if enums used.
             if not employee.gender or employee.gender.lower() != leave_type.gender_eligibility.lower():
                 raise HTTPException(status_code=400, detail=f"This leave type is only applicable for {leave_type.gender_eligibility} employees.")

        # Document Requirement Check
        if leave_type.requires_document and not attachment:
             raise HTTPException(status_code=400, detail=f"Supporting document is required for {leave_type.name.replace('_', ' ').title()}.")

        # Consecutive Days
        if leave_type.max_consecutive_days and days_requested > leave_type.max_consecutive_days:
            raise HTTPException(status_code=400, detail=f"This leave type allows maximum {leave_type.max_consecutive_days} consecutive days.")

        balance = leave_repository.get_balance(db, employee_id, application_data.leave_type_id, current_year)
        if not balance:
             # Initialize a zero balance on the fly if it doesn't exist
             balance = LeaveBalance(
                employee_id=employee_id,
                leave_type_id=application_data.leave_type_id,
                leave_year=current_year,
                available=0,
                opening_balance=0,
                accrued=0,
                taken=0,
                pending_approval=0,
                carry_forward=0
             )
             db.add(balance)
             db.flush() # Get ID
        
        leave_type = leave_repository.get_leave_type(db, application_data.leave_type_id)
        
        if not leave_type.negative_balance_allowed and balance.available < days_requested:
             raise HTTPException(status_code=400, detail=f"Insufficient leave balance. Available: {balance.available}")

        # 2. Create Application
        app = LeaveApplication(
            **application_data.model_dump(exclude={'number_of_days', 'attachment'}),
            number_of_days=float(days_requested),
            employee_id=employee_id,
            status=LeaveApplicationStatus.pending
        )
        
        # Handle attachment
        if attachment:
            sub_folder = f"leaves/{employee_id}/{leave_type.name.value}"
            relative_path = upload_file(attachment, sub_folder)
            app.attachment = relative_path
            
        leave_repository.create_application(db, app)

        # 3. Update Pending Balance
        balance.pending_approval += days_requested
        balance.available -= days_requested
        leave_repository.update_balance(db, balance)
        
        return app

    def approve_leave(self, db: Session, application_id: int, approver_id: int, role: str = 'manager', comments: str = None):
        app = leave_repository.get_application(db, application_id)
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        if app.status != LeaveApplicationStatus.pending:
            raise HTTPException(status_code=400, detail="Application is not pending")

        # Check Leave Type for approval levels
        leave_type = app.leave_type
        max_levels = leave_type.approval_levels
        current_step = app.current_approval_step

        # Role-based validation
        if role == 'manager':
            # Manager can usually only approve first level, unless they are also the second level?
            # For simplicity: Managers approve Level 1.
            if current_step > 1:
                # If it's at level 2, maybe Manager shouldn't touch it unless they are the specific L2 approver?
                # Assuming HR is L2.
                pass 
        
        # Log the action
        log = LeaveApprovalLog(
            application_id=app.id,
            approver_id=approver_id,
            step=current_step,
            status=LeaveApplicationStatus.approved,
            comments=comments
        )
        db.add(log)

        if current_step < max_levels:
            # Move to next step
            app.current_approval_step += 1
            # Status remains pending
            db.commit()
            db.refresh(app)
            return app
        else:
            # Final Approval
            leave_repository.update_application_status(db, app, LeaveApplicationStatus.approved, approver_id)

            # Move from pending to taken
            balance = leave_repository.get_balance(db, app.employee_id, app.leave_type_id, app.from_date.year)
            if balance:
                days = app.number_of_days
                balance.pending_approval -= days
                balance.taken += days
                balance.available = balance.opening_balance + balance.accrued + balance.carry_forward - balance.taken - balance.pending_approval
                leave_repository.update_balance(db, balance)
            
            return app

    def reject_leave(self, db: Session, application_id: int, approver_id: int, comments: str = None):
        app = leave_repository.get_application(db, application_id)
        if not app:
             raise HTTPException(status_code=404, detail="Application not found")

        if app.status != LeaveApplicationStatus.pending:
             raise HTTPException(status_code=400, detail="Application is not pending")

        # Log
        log = LeaveApprovalLog(
            application_id=app.id,
            approver_id=approver_id,
            step=app.current_approval_step,
            status=LeaveApplicationStatus.rejected,
            comments=comments
        )
        db.add(log)

        # Update status
        leave_repository.update_application_status(db, app, LeaveApplicationStatus.rejected, approver_id)

        # Revert pending balance
        balance = leave_repository.get_balance(db, app.employee_id, app.leave_type_id, app.from_date.year)
        if balance:
            days = app.number_of_days
            balance.pending_approval -= days
            balance.available += days # Give it back
            leave_repository.update_balance(db, balance)
            
        return app
    
    def get_team_calendar(self, db: Session, manager_id: int, from_date: date, to_date: date):
        employee_ids = leave_repository.get_team_employee_ids(db, manager_id)
        
        # Fetch approved applications in range
        apps = db.query(LeaveApplication).filter(
            LeaveApplication.employee_id.in_(employee_ids),
            LeaveApplication.status == LeaveApplicationStatus.approved,
            LeaveApplication.from_date <= to_date,
            LeaveApplication.to_date >= from_date
        ).all()
        
        return apps

    def cancel_leave(self, db: Session, application_id: int, employee_id: int):
        app = leave_repository.get_application(db, application_id)
        if not app:
             raise HTTPException(status_code=404, detail="Application not found")
        
        if app.employee_id != employee_id:
             raise HTTPException(status_code=403, detail="Not authorized to cancel this application")

        if app.status != LeaveApplicationStatus.pending:
             raise HTTPException(status_code=400, detail="Only pending applications can be cancelled")

        # Revert pending balance
        balance = leave_repository.get_balance(db, app.employee_id, app.leave_type_id, app.from_date.year)
        if balance:
            days_to_revert = Decimal(str(app.number_of_days))
            balance.pending_approval -= days_to_revert
            balance.available += days_to_revert
            leave_repository.update_balance(db, balance)

        db.delete(app)
        db.commit()
        return None

    def update_leave(self, db: Session, application_id: int, application_data: LeaveApplicationCreate, employee_id: int, attachment: Optional[UploadFile] = None, clear_attachment: bool = False):
        app = leave_repository.get_application(db, application_id)
        if not app:
             raise HTTPException(status_code=404, detail="Application not found")
        
        if app.employee_id != employee_id:
             raise HTTPException(status_code=403, detail="Not authorized to update this application")

        if app.status != LeaveApplicationStatus.pending:
             raise HTTPException(status_code=400, detail="Only pending applications can be edited")

        # Get leave type
        leave_type = leave_repository.get_leave_type(db, application_data.leave_type_id)
        if not leave_type:
             raise HTTPException(status_code=404, detail="Leave type not found")

        # Calculate NEW precise days
        new_days = self.calculate_working_days(
            db, 
            application_data.from_date, 
            application_data.to_date, 
            application_data.duration_type
        )

        if new_days <= 0:
             raise HTTPException(status_code=400, detail="The updated date range contains no working days.")

        # 1. Revert old balance reserved
        old_balance = leave_repository.get_balance(db, app.employee_id, app.leave_type_id, app.from_date.year)
        if old_balance:
            old_balance.pending_approval -= Decimal(str(app.number_of_days))
            old_balance.available += Decimal(str(app.number_of_days))
            leave_repository.update_balance(db, old_balance)

        # 2. Check and reservation for NEW data
        current_year = application_data.from_date.year
        new_balance = leave_repository.get_balance(db, employee_id, application_data.leave_type_id, current_year)
        if not new_balance:
             # Initialize if missing for the new year/type
             new_balance = LeaveBalance(
                employee_id=employee_id,
                leave_type_id=application_data.leave_type_id,
                leave_year=current_year,
                available=0
             )
             db.add(new_balance)
             db.flush()
        
        if not leave_type.negative_balance_allowed and new_balance.available < new_days:
             # Revert back to old before failing
             old_balance.pending_approval += Decimal(str(app.number_of_days))
             old_balance.available -= Decimal(str(app.number_of_days))
             leave_repository.update_balance(db, old_balance)
             raise HTTPException(status_code=400, detail="Insufficient balance for updated request")

        # Handle attachment update
        if attachment:
            # Delete old file if exists
            if app.attachment:
                delete_file(app.attachment)
            
            sub_folder = f"leaves/{employee_id}/{leave_type.name.value}"
            relative_path = upload_file(attachment, sub_folder)
            app.attachment = relative_path
        elif clear_attachment:
            # Explicitly remove attachment
            if app.attachment:
                delete_file(app.attachment)
            app.attachment = None

        # 3. Update fields
        data_to_update = application_data.model_dump(exclude={'number_of_days', 'attachment'})
        for field, value in data_to_update.items():
            setattr(app, field, value)
        app.number_of_days = float(new_days)
        
        # 4. Reserve new balance
        new_balance.pending_approval += new_days
        new_balance.available -= new_days
        
        db.commit()
        db.refresh(app)
        return app
    
    def get_employee_balances(self, db: Session, employee_id: int, year: int):
        # Refresh accruals first
        self.calculate_pro_rata_accrual(db, employee_id, year)
        return leave_repository.get_balances(db, employee_id, year)

    def get_team_balances(self, db: Session, manager_id: int, year: int, skip: int = 0, limit: int = 10, search: Optional[str] = None):
        employee_ids = leave_repository.get_team_employee_ids(db, manager_id)
        # Ensure all are refreshed
        # Optimistically refresh only if searching logic permits or do lazy refresh. 
        # Ideally we should only refresh for the page we are viewing or refresh all async.
        # For simplicity, we refresh all team members' balances as it's a team view.
        # But wait, if employee_ids is huge, this is slow.
        # Let's assume the roster size isn't massive for a manager.
        for eid in employee_ids:
            self.calculate_pro_rata_accrual(db, eid, year)
        return leave_repository.get_balances_for_employees(db, employee_ids, year, skip=skip, limit=limit, search=search)

    def get_all_balances(self, db: Session, year: int, skip: int = 0, limit: int = 10, search: Optional[str] = None) -> Tuple[List[LeaveBalance], int]:
        from sqlalchemy import or_
        query = db.query(Employee).filter(Employee.employment_status == "active")
        
        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                or_(
                    Employee.first_name.ilike(search_filter),
                    Employee.last_name.ilike(search_filter),
                    Employee.employee_code.ilike(search_filter)
                )
            )
        
        total = query.count()
        employees = query.offset(skip).limit(limit).all()
        
        for e in employees:
            self.calculate_pro_rata_accrual(db, e.id, year)
            
        employee_ids = [e.id for e in employees]
        results = db.query(LeaveBalance).filter(
            LeaveBalance.leave_year == year,
            LeaveBalance.employee_id.in_(employee_ids)
        ).all()
        
        return results, total

    def get_team_applications(self, db: Session, manager_id: int, skip: int = 0, limit: int = 10, year: Optional[int] = None, search: Optional[str] = None):
        employee_ids = leave_repository.get_team_employee_ids(db, manager_id)
        if not employee_ids:
            return [], 0
        return leave_repository.get_applications(db, skip=skip, limit=limit, employee_ids=employee_ids, year=year, search=search)

    def create_leave_type(self, db: Session, data: dict):
        lt = LeaveType(**data)
        return leave_repository.create_leave_type(db, lt)

    def update_leave_type(self, db: Session, lt_id: int, data: dict):
        lt = leave_repository.get_leave_type(db, lt_id)
        if not lt:
            raise HTTPException(status_code=404, detail="Leave type not found")
        for key, value in data.items():
            setattr(lt, key, value)
        return leave_repository.update_leave_type(db, lt)

    def delete_leave_type(self, db: Session, lt_id: int):
        lt = leave_repository.get_leave_type(db, lt_id)
        if not lt:
            raise HTTPException(status_code=404, detail="Leave type not found")
        
        # Cascade delete dependencies manually to avoid Foreign Key violations
        # 1. Delete associated balances
        db.query(LeaveBalance).filter(LeaveBalance.leave_type_id == lt_id).delete(synchronize_session=False)
        
        # 2. Delete associated applications (and logs if any)
        # Note: This might be destructive for history. In a real system, we'd Soft Delete.
        # But for this request, we are fixing the 500 error on deletion.
        apps = db.query(LeaveApplication).filter(LeaveApplication.leave_type_id == lt_id).all()
        for app in apps:
             # Delete logs first if cascading isn't set up
             db.query(LeaveApprovalLog).filter(LeaveApprovalLog.application_id == app.id).delete(synchronize_session=False)
        
        db.query(LeaveApplication).filter(LeaveApplication.leave_type_id == lt_id).delete(synchronize_session=False)

        # 3. Delete associated credit requests
        db.query(LeaveCreditRequest).filter(LeaveCreditRequest.leave_type_id == lt_id).delete(synchronize_session=False)

        leave_repository.delete_leave_type(db, lt)
        return True

    def get_leave_stats(self, db: Session, year: int):
        """Aggregate stats for reporting"""
        total_employees = db.query(func.count(Employee.id)).scalar()
        pending_apps = db.query(func.count(LeaveApplication.id)).filter(LeaveApplication.status == LeaveApplicationStatus.pending).scalar()
        
        # Leaves taken by type
        taken_by_type = db.query(
            LeaveType.name, 
            func.sum(LeaveApplication.number_of_days)
        ).join(LeaveType, LeaveApplication.leave_type_id == LeaveType.id)\
         .filter(LeaveApplication.status == LeaveApplicationStatus.approved)\
         .filter(func.extract('year', LeaveApplication.from_date) == year)\
         .group_by(LeaveType.name).all()

        return {
            "total_employees": total_employees,
            "pending_applications": pending_apps,
            "taken_by_type": {name.value: float(total) for name, total in taken_by_type}
        }

    def get_leave_analytics(self, db: Session, year: int):
        # 1. Trend Analysis (Monthly)
        monthly_trend = db.query(
            func.extract('month', LeaveApplication.from_date).label('month'),
            func.sum(LeaveApplication.number_of_days).label('days')
        ).filter(
            LeaveApplication.status == LeaveApplicationStatus.approved,
            func.extract('year', LeaveApplication.from_date) == year
        ).group_by('month').order_by('month').all()
        
        # 2. Utilization by Department
        # Join Employee -> Department
        from backend.models.department import Department
        dept_utilization = db.query(
            Department.name,
            func.sum(LeaveApplication.number_of_days).label('days')
        ).join(Employee, LeaveApplication.employee_id == Employee.id)\
         .join(Department, Employee.department_id == Department.id)\
         .filter(
            LeaveApplication.status == LeaveApplicationStatus.approved,
            func.extract('year', LeaveApplication.from_date) == year
         ).group_by(Department.name).all()

        # 2.1 Utilization by Type
        type_utilization = db.query(
            LeaveType.name,
            func.sum(LeaveApplication.number_of_days).label('days')
        ).join(LeaveType, LeaveApplication.leave_type_id == LeaveType.id)\
         .filter(
            LeaveApplication.status == LeaveApplicationStatus.approved,
            func.extract('year', LeaveApplication.from_date) == year
         ).group_by(LeaveType.name).all()

        # 3. Liability (Earned Leave Balances)
        # Assuming EL is the only encashable/liable type
        el_type = db.query(LeaveType).filter(LeaveType.name == LeaveTypeEnum.earned_leave).first()
        liability_days = 0
        if el_type:
            liability_days = db.query(func.sum(LeaveBalance.available))\
                .filter(LeaveBalance.leave_type_id == el_type.id, LeaveBalance.leave_year == year)\
                .scalar() or 0
        
        # 3.1 Absenteeism Metric (Total LOP days organization-wide)
        total_lop = db.query(func.sum(LeaveApplication.number_of_days))\
            .join(LeaveType, LeaveApplication.leave_type_id == LeaveType.id)\
            .filter(
                LeaveType.name == LeaveTypeEnum.loss_of_pay,
                LeaveApplication.status == LeaveApplicationStatus.approved,
                func.extract('year', LeaveApplication.from_date) == year
            ).scalar() or 0

        # 4. Absenteeism (High LOP/Sick Leave users)
        # Get employees with highest LOP + SL
        absenteeism = db.query(
            Employee.first_name,
            Employee.last_name,
            func.sum(LeaveApplication.number_of_days).label('days')
        ).join(LeaveType, LeaveApplication.leave_type_id == LeaveType.id)\
         .filter(
             LeaveApplication.status == LeaveApplicationStatus.approved,
             func.extract('year', LeaveApplication.from_date) == year,
             LeaveType.name.in_([LeaveTypeEnum.loss_of_pay, LeaveTypeEnum.sick_leave])
         ).join(Employee, LeaveApplication.employee_id == Employee.id)\
         .group_by(Employee.id)\
         .order_by(text('days DESC'))\
         .limit(5).all()

        return {
            "trends": [{"month": int(m), "days": float(d)} for m, d in monthly_trend],
            "department_utilization": [{"department": d, "days": float(c)} for d, c in dept_utilization],
            "type_utilization": [{"type": t.value, "days": float(d)} for t, d in type_utilization],
            "liability": {
                "total_el_days": float(liability_days),
                "total_lop_days": float(total_lop)
            },
            "top_absentees": [{"name": f"{f} {l}", "days": float(d)} for f, l, d in absenteeism]
        }


    # --- Comp Off Credit Workflow ---

    def request_leave_credit(self, db: Session, data: LeaveCreditRequestCreate, employee_id: int):
        # Default to CO leave type if not specified
        if not data.leave_type_id:
            co_type = db.query(LeaveType).filter(LeaveType.name == LeaveTypeEnum.compensatory_off).first()
            if not co_type:
                raise HTTPException(status_code=500, detail="Compensatory Off leave type not configured")
            data.leave_type_id = co_type.id
        
        # Check duplicate
        existing = db.query(LeaveCreditRequest).filter(
            LeaveCreditRequest.employee_id == employee_id,
            LeaveCreditRequest.date_worked == data.date_worked,
            LeaveCreditRequest.status != LeaveCreditStatus.rejected
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Credit request for this date already exists")

        credit_req = LeaveCreditRequest(
            **data.model_dump(),
            employee_id=employee_id,
            status=LeaveCreditStatus.pending
        )
        db.add(credit_req)
        db.commit()
        db.refresh(credit_req)
        return credit_req

    def get_my_credit_requests(self, db: Session, employee_id: int, skip: int = 0, limit: int = 10):
        query = db.query(LeaveCreditRequest).filter(LeaveCreditRequest.employee_id == employee_id)
        total = query.count()
        reqs = query.order_by(LeaveCreditRequest.created_at.desc()).offset(skip).limit(limit).all()
        for req in reqs:
            req.leave_type_name = req.leave_type.name.value.replace('_', ' ').title() if req.leave_type else None
            req.employee_name = req.employee.full_name if req.employee else None
        return reqs, total

    def get_pending_credit_requests(self, db: Session, manager_id: int, role: str, skip: int = 0, limit: int = 10, search: Optional[str] = None):
        query = db.query(LeaveCreditRequest).filter(LeaveCreditRequest.status == LeaveCreditStatus.pending)
        if role not in ['hr_admin', 'super_admin']:
            from backend.repositories.leave_repository import leave_repository
            team_ids = leave_repository.get_team_employee_ids(db, manager_id)
            query = query.filter(LeaveCreditRequest.employee_id.in_(team_ids))
        
        if search:
            from sqlalchemy import or_
            query = query.join(Employee, LeaveCreditRequest.employee_id == Employee.id).filter(or_(
                Employee.first_name.ilike(f"%{search}%"),
                Employee.last_name.ilike(f"%{search}%"),
                LeaveCreditRequest.reason.ilike(f"%{search}%")
            ))
            
        total = query.count()
        reqs = query.order_by(LeaveCreditRequest.created_at.desc()).offset(skip).limit(limit).all()
        for req in reqs:
            req.leave_type_name = req.leave_type.name.value.replace('_', ' ').title() if req.leave_type else None
            req.employee_name = req.employee.full_name if req.employee else None
        return reqs, total

    def approve_leave_credit(self, db: Session, request_id: int, approver_id: int):
        req = db.query(LeaveCreditRequest).filter(LeaveCreditRequest.id == request_id).first()
        if not req:
            raise HTTPException(status_code=404, detail="Request not found")
        
        if req.status != LeaveCreditStatus.pending:
            raise HTTPException(status_code=400, detail="Request is not pending")

        req.status = LeaveCreditStatus.approved
        req.approver_id = approver_id
        req.approved_date = func.now()

        # Update Balance: Credit +1
        current_year = req.date_worked.year
        balance = leave_repository.get_balance(db, req.employee_id, req.leave_type_id, current_year)
        
        if not balance:
            # Create if missing
             balance = LeaveBalance(
                employee_id=req.employee_id,
                leave_type_id=req.leave_type_id,
                leave_year=current_year,
                available=0
             )
             db.add(balance)
             db.flush()

        # Add to Opening Balance or Create new 'credit_earned' field?
        # Typically CO acts like accrual or direct addition. Let's add to 'accrued' or 'opening'.
        # Safest is to add to 'accrued' since it is earned during the year.
        # However, earlier logic overwrites 'accrued' based on pro-rata.
        # CO is "manual" accrual method, so calculate_pro_rata_accrual ignores it.
        
        balance.accrued += Decimal(1)
        balance.available += Decimal(1)
        
        leave_repository.update_balance(db, balance)
        db.commit()
        db.refresh(req)
        return req

    def reject_leave_credit(self, db: Session, request_id: int, approver_id: int):
        req = db.query(LeaveCreditRequest).filter(LeaveCreditRequest.id == request_id).first()
        if not req:
            raise HTTPException(status_code=404, detail="Request not found")
        
        if req.status != LeaveCreditStatus.pending:
            raise HTTPException(status_code=400, detail="Request is not pending")

        req.status = LeaveCreditStatus.rejected
        req.approver_id = approver_id
        db.commit()
        db.refresh(req)
        return req

    # --- Holidays ---
    def create_holiday(self, db: Session, data: dict):
        holiday = PublicHoliday(**data)
        return leave_repository.create_holiday(db, holiday)

    def update_holiday(self, db: Session, holiday_id: int, data: dict):
        holiday = leave_repository.get_holiday(db, holiday_id)
        if not holiday:
            raise HTTPException(status_code=404, detail="Holiday not found")
        
        for key, value in data.items():
            if value is not None:
                setattr(holiday, key, value)
        
        return leave_repository.update_holiday(db, holiday)

    def delete_holiday(self, db: Session, holiday_id: int):
        holiday = leave_repository.get_holiday(db, holiday_id)
        if not holiday:
            raise HTTPException(status_code=404, detail="Holiday not found")
        
        leave_repository.delete_holiday(db, holiday)
        return True

    def recall_leave(self, db: Session, application_id: int, approver_id: int, recall_date: date, reason: str):
        app = leave_repository.get_application(db, application_id)
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        if app.status != LeaveApplicationStatus.approved:
            raise HTTPException(status_code=400, detail="Only approved leaves can be recalled")
        
        if recall_date < app.from_date or recall_date >= app.to_date:
            raise HTTPException(status_code=400, detail=f"Recall date must be between {app.from_date} and {app.to_date}")

        # Calculate new working days up to recall_date
        new_days = self.calculate_working_days(db, app.from_date, recall_date, app.duration_type)
        unused_days = Decimal(str(app.number_of_days)) - new_days

        if unused_days < 0:
            # Should not happen due to validation above, but safety first
            raise HTTPException(status_code=400, detail="Invalid recall date: results in more days than original leave")

        # 1. Update Balance: Credit back unused days
        balance = leave_repository.get_balance(db, app.employee_id, app.leave_type_id, app.from_date.year)
        if balance:
            balance.taken -= unused_days
            balance.available += unused_days
            leave_repository.update_balance(db, balance)

        # 2. Update Application
        app.status = LeaveApplicationStatus.recalled
        app.to_date = recall_date
        app.number_of_days = float(new_days)
        app.approver_note = f"Recalled: {reason}"
        app.approver_id = approver_id
        app.approved_date = func.now()

        # 3. Log the action
        log = LeaveApprovalLog(
            application_id=app.id,
            approver_id=approver_id,
            step=app.current_approval_step,
            status=LeaveApplicationStatus.recalled,
            comments=reason
        )
        db.add(log)
        
        db.commit()
        db.refresh(app)
        return app

leave_service = LeaveService()
