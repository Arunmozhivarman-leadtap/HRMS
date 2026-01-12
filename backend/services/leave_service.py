from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from fastapi import HTTPException, status
from datetime import date, datetime, timedelta
from decimal import Decimal
from backend.repositories.leave_repository import leave_repository
from backend.models.leave import LeaveApplication, LeaveBalance, LeaveTypeEnum, LeaveApplicationStatus, LeaveType, PublicHoliday
from backend.models.employee import Employee
from backend.schemas.leave import LeaveApplicationCreate

class LeaveService:
    def initialize_leave_types(self, db: Session):
        """Helper to ensure default types exist (called usually on startup or first run)"""
        existing = leave_repository.get_leave_types(db)
        if not existing:
            # Create default types as per spec
            types = [
                LeaveType(name=LeaveTypeEnum.earned_leave, abbr="EL", annual_entitlement=15, accrual_method="monthly", carry_forward=True, max_carry_forward=30, encashment=True),
                LeaveType(name=LeaveTypeEnum.casual_leave, abbr="CL", annual_entitlement=12, accrual_method="monthly", carry_forward=False),
                LeaveType(name=LeaveTypeEnum.sick_leave, abbr="SL", annual_entitlement=12, accrual_method="monthly", carry_forward=True, max_carry_forward=24),
                LeaveType(name=LeaveTypeEnum.compensatory_off, abbr="CO", annual_entitlement=0, accrual_method="manual", carry_forward=False, requires_approval=True),
                LeaveType(name=LeaveTypeEnum.loss_of_pay, abbr="LOP", annual_entitlement=0, accrual_method="manual", carry_forward=False, negative_balance_allowed=True),
                LeaveType(name=LeaveTypeEnum.maternity_leave, abbr="ML", annual_entitlement=180, accrual_method="manual", carry_forward=False, requires_approval=True),
                LeaveType(name=LeaveTypeEnum.paternity_leave, abbr="PL", annual_entitlement=5, accrual_method="manual", carry_forward=False, requires_approval=True),
                LeaveType(name=LeaveTypeEnum.bereavement_leave, abbr="BL", annual_entitlement=5, accrual_method="manual", carry_forward=False, requires_approval=True),
                LeaveType(name=LeaveTypeEnum.marriage_leave, abbr="MRL", annual_entitlement=3, accrual_method="manual", carry_forward=False, requires_approval=True),
                LeaveType(name=LeaveTypeEnum.adoption_leave, abbr="AL", annual_entitlement=84, accrual_method="manual", carry_forward=False, requires_approval=True),
                LeaveType(name=LeaveTypeEnum.restricted_holiday, abbr="RH", annual_entitlement=2, accrual_method="annual", carry_forward=False, requires_approval=True),
            ]
            for t in types:
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
            if lt.accrual_method != 'monthly':
                continue # Skip manual or other accruals for now

            # Check if balance record exists
            balance = leave_repository.get_balance(db, employee_id, lt.id, year)
            if not balance:
                balance = LeaveBalance(
                    employee_id=employee_id, 
                    leave_type_id=lt.id, 
                    leave_year=year,
                    available=0
                )
                leave_repository.create_balance(db, balance)

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

            # Update balance
            # Available = Opening + Accrued + CarryForward - Taken - Pending
            # We strictly control 'accrued' here.
            balance.accrued = total_accrued
            balance.available = balance.opening_balance + balance.accrued + balance.carry_forward - balance.taken - balance.pending_approval
            leave_repository.update_balance(db, balance)

    def calculate_working_days(self, db: Session, from_date: date, to_date: date, duration_type: str) -> Decimal:
        """Calculates working days excluding weekends and public holidays."""
        if duration_type == "Half Day":
            return Decimal("0.5")
        
        if not to_date:
            to_date = from_date

        # Fetch holidays in range
        holidays = db.query(PublicHoliday.holiday_date).filter(
            PublicHoliday.holiday_date >= from_date,
            PublicHoliday.holiday_date <= to_date
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

    def apply_leave(self, db: Session, application_data: LeaveApplicationCreate, employee_id: int):
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

        # Advanced Validation
        # Advance Notice
        if leave_type.min_days_in_advance:
            notice_days = (application_data.from_date - date.today()).days
            if notice_days < leave_type.min_days_in_advance:
                raise HTTPException(status_code=400, detail=f"This leave type requires {leave_type.min_days_in_advance} days advance notice.")

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
            **application_data.model_dump(exclude={'number_of_days'}),
            number_of_days=float(days_requested),
            employee_id=employee_id,
            status=LeaveApplicationStatus.pending
        )
        leave_repository.create_application(db, app)

        # 3. Update Pending Balance
        balance.pending_approval += days_requested
        balance.available -= days_requested
        leave_repository.update_balance(db, balance)
        
        return app

    def approve_leave(self, db: Session, application_id: int, approver_id: int):
        app = leave_repository.get_application(db, application_id)
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        if app.status != LeaveApplicationStatus.pending:
            raise HTTPException(status_code=400, detail="Application is not pending")

        # Update status
        leave_repository.update_application_status(db, app, LeaveApplicationStatus.approved, approver_id)

        # Move from pending to taken
        balance = leave_repository.get_balance(db, app.employee_id, app.leave_type_id, app.from_date.year)
        if balance:
            days = app.number_of_days
            balance.pending_approval -= days
            balance.taken += days
            # Available doesn't change because it was already deducted on apply (or rather, reserved)
            # Re-calculate to be safe: Available = Open + Accrued + CF - Taken - Pending
            balance.available = balance.opening_balance + balance.accrued + balance.carry_forward - balance.taken - balance.pending_approval
            leave_repository.update_balance(db, balance)
            
        return app

    def reject_leave(self, db: Session, application_id: int, approver_id: int):
        app = leave_repository.get_application(db, application_id)
        if not app:
             raise HTTPException(status_code=404, detail="Application not found")

        if app.status != LeaveApplicationStatus.pending:
             raise HTTPException(status_code=400, detail="Application is not pending")

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

    def update_leave(self, db: Session, application_id: int, application_data: LeaveApplicationCreate, employee_id: int):
        app = leave_repository.get_application(db, application_id)
        if not app:
             raise HTTPException(status_code=404, detail="Application not found")
        
        if app.employee_id != employee_id:
             raise HTTPException(status_code=403, detail="Not authorized to update this application")

        if app.status != LeaveApplicationStatus.pending:
             raise HTTPException(status_code=400, detail="Only pending applications can be edited")

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
             raise HTTPException(status_code=400, detail="Leave balance not initialized for new type.")
        
        if new_balance.available < new_days:
             # Revert back to old before failing
             old_balance.pending_approval += Decimal(str(app.number_of_days))
             old_balance.available -= Decimal(str(app.number_of_days))
             leave_repository.update_balance(db, old_balance)
             raise HTTPException(status_code=400, detail="Insufficient balance for updated request")

        # 3. Update fields
        data_to_update = application_data.model_dump(exclude={'number_of_days'})
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

    def get_team_balances(self, db: Session, manager_id: int, year: int):
        employee_ids = leave_repository.get_team_employee_ids(db, manager_id)
        # Ensure all are refreshed
        for eid in employee_ids:
            self.calculate_pro_rata_accrual(db, eid, year)
        return leave_repository.get_balances_for_employees(db, employee_ids, year)

    def get_all_balances(self, db: Session, year: int):
        # This could be slow for many employees, but for internal HRMS it's okay for now
        employees = db.query(Employee).all()
        for e in employees:
            self.calculate_pro_rata_accrual(db, e.id, year)
        return db.query(LeaveBalance).filter(LeaveBalance.leave_year == year).all()

    def get_team_applications(self, db: Session, manager_id: int, year: Optional[int] = None):
        employee_ids = leave_repository.get_team_employee_ids(db, manager_id)
        return leave_repository.get_applications(db, employee_ids=employee_ids, year=year)

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

leave_service = LeaveService()
