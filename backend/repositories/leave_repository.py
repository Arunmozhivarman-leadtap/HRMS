from sqlalchemy.orm import Session
from sqlalchemy import and_, func, select, text
from typing import List, Optional, Tuple
from datetime import date
from backend.models.leave import LeaveType, LeaveBalance, LeaveApplication, PublicHoliday, LeaveApplicationStatus
from backend.models.employee import Employee

class LeaveRepository:
    # Leave Types
    def get_leave_types(self, db: Session) -> List[LeaveType]:
        return db.query(LeaveType).all()

    def get_leave_type(self, db: Session, leave_type_id: int) -> Optional[LeaveType]:
        return db.query(LeaveType).filter(LeaveType.id == leave_type_id).first()

    def create_leave_type(self, db: Session, leave_type: LeaveType) -> LeaveType:
        db.add(leave_type)
        db.commit()
        db.refresh(leave_type)
        return leave_type

    def update_leave_type(self, db: Session, leave_type: LeaveType) -> LeaveType:
        db.commit()
        db.refresh(leave_type)
        return leave_type

    def delete_leave_type(self, db: Session, leave_type: LeaveType):
        db.delete(leave_type)
        db.commit()

    # Leave Balances
    def get_balance(self, db: Session, employee_id: int, leave_type_id: int, year: int) -> Optional[LeaveBalance]:
        return db.query(LeaveBalance).filter(
            LeaveBalance.employee_id == employee_id,
            LeaveBalance.leave_type_id == leave_type_id,
            LeaveBalance.leave_year == year
        ).first()

    def get_balances(self, db: Session, employee_id: int, year: int) -> List[LeaveBalance]:
        return db.query(LeaveBalance).filter(
            LeaveBalance.employee_id == employee_id,
            LeaveBalance.leave_year == year
        ).all()

    def create_balance(self, db: Session, balance: LeaveBalance) -> LeaveBalance:
        db.add(balance)
        db.commit()
        db.refresh(balance)
        return balance

    def update_balance(self, db: Session, balance: LeaveBalance):
        db.commit()
        db.refresh(balance)
        return balance

    # Leave Applications
    def create_application(self, db: Session, application: LeaveApplication) -> LeaveApplication:
        db.add(application)
        db.commit()
        db.refresh(application)
        return application

    def get_application(self, db: Session, application_id: int) -> Optional[LeaveApplication]:
        return db.query(LeaveApplication).filter(LeaveApplication.id == application_id).first()

    def get_applications(
        self, 
        db: Session, 
        skip: int = 0,
        limit: int = 10,
        employee_ids: Optional[List[int]] = None, 
        employee_id: Optional[int] = None, 
        status: Optional[str] = None, 
        year: Optional[int] = None,
        search: Optional[str] = None,
        exclude_employee_id: Optional[int] = None
    ) -> Tuple[List[LeaveApplication], int]:
        query = db.query(LeaveApplication).join(Employee, LeaveApplication.employee_id == Employee.id).join(LeaveType, LeaveApplication.leave_type_id == LeaveType.id)
        
        if employee_id:
            query = query.filter(LeaveApplication.employee_id == employee_id)
        if employee_ids:
            query = query.filter(LeaveApplication.employee_id.in_(employee_ids))
        if status:
            query = query.filter(LeaveApplication.status == status)
        if year:
            start_date = date(year, 1, 1)
            end_date = date(year, 12, 31)
            query = query.filter(LeaveApplication.from_date >= start_date, LeaveApplication.from_date <= end_date)
        
        if exclude_employee_id:
            query = query.filter(LeaveApplication.employee_id != exclude_employee_id)
        
        if search:
            from sqlalchemy import or_
            query = query.filter(or_(
                Employee.first_name.ilike(f"%{search}%"),
                Employee.last_name.ilike(f"%{search}%"),
                LeaveApplication.reason.ilike(f"%{search}%")
            ))
            
        total = query.count()
        apps = query.order_by(LeaveApplication.created_at.desc()).offset(skip).limit(limit).all()
        
        for app in apps:
            app.leave_type_name = app.leave_type.name.value.replace('_', ' ').title() if app.leave_type else None
            app.employee_name = app.employee.full_name if app.employee else None
        
        return apps, total
    
    def get_balances_for_employees(self, db: Session, employee_ids: List[int], year: int, skip: int = 0, limit: int = 10, search: Optional[str] = None) -> Tuple[List[LeaveBalance], int]:
        query = db.query(LeaveBalance).join(Employee).join(LeaveType).filter(
            LeaveBalance.employee_id.in_(employee_ids),
            LeaveBalance.leave_year == year
        )

        if search:
            from sqlalchemy import or_
            search_filter = f"%{search}%"
            query = query.filter(
                or_(
                    Employee.first_name.ilike(search_filter),
                    Employee.last_name.ilike(search_filter),
                    LeaveType.name.ilike(search_filter)
                )
            )

        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return items, total

    def get_pending_applications_for_approver(self, db: Session, approver_id: int, skip: int = 0, limit: int = 10, search: Optional[str] = None) -> Tuple[List[LeaveApplication], int]:
         # Uses manager_id to find direct reports
         # Manager only sees Level 1 pending approvals
         # Explicitly exclude the approver's own applications if they somehow report to themselves or if the query structure allows it
         query = db.query(LeaveApplication).join(Employee, LeaveApplication.employee_id == Employee.id).filter(
             Employee.manager_id == approver_id,
             LeaveApplication.status == LeaveApplicationStatus.pending,
             LeaveApplication.current_approval_step == 1,
             LeaveApplication.employee_id != approver_id
         )
         
         if search:
             from sqlalchemy import or_
             query = query.filter(or_(
                 Employee.first_name.ilike(f"%{search}%"),
                 Employee.last_name.ilike(f"%{search}%"),
                 LeaveApplication.reason.ilike(f"%{search}%")
             ))

         total = query.count()
         apps = query.order_by(LeaveApplication.created_at.desc()).offset(skip).limit(limit).all()
         for app in apps:
            app.leave_type_name = app.leave_type.name.value.replace('_', ' ').title() if app.leave_type else None
            app.employee_name = app.employee.full_name if app.employee else None
         return apps, total

    def get_team_employee_ids(self, db: Session, manager_id: int) -> List[int]:
        # Call the recursive function from DB using select()
        result = db.execute(select(func.get_team_employee_ids(manager_id))).fetchall()
        return [r[0] for r in result]

    def update_application_status(self, db: Session, application: LeaveApplication, status: str, approver_id: int):
        application.status = status
        application.approver_id = approver_id
        application.approved_date = func.now()
        db.commit()
        db.refresh(application)
        return application

    # Holidays
    def get_holidays(self, db: Session, year: int) -> List[PublicHoliday]:
        start_date = date(year, 1, 1)
        end_date = date(year, 12, 31)
        return db.query(PublicHoliday).filter(
            PublicHoliday.holiday_date >= start_date,
            PublicHoliday.holiday_date <= end_date
        ).order_by(PublicHoliday.holiday_date).all()

    def get_restricted_holidays(self, db: Session, year: int) -> List[PublicHoliday]:
        start_date = date(year, 1, 1)
        end_date = date(year, 12, 31)
        return db.query(PublicHoliday).filter(
            PublicHoliday.holiday_date >= start_date,
            PublicHoliday.holiday_date <= end_date,
            PublicHoliday.is_restricted == True
        ).order_by(PublicHoliday.holiday_date).all()

    def get_holiday(self, db: Session, holiday_id: int) -> Optional[PublicHoliday]:
        return db.query(PublicHoliday).filter(PublicHoliday.id == holiday_id).first()

    def create_holiday(self, db: Session, holiday: PublicHoliday) -> PublicHoliday:
        db.add(holiday)
        db.commit()
        db.refresh(holiday)
        return holiday

    def update_holiday(self, db: Session, holiday: PublicHoliday) -> PublicHoliday:
        db.commit()
        db.refresh(holiday)
        return holiday

    def delete_holiday(self, db: Session, holiday: PublicHoliday):
        db.delete(holiday)
        db.commit()

leave_repository = LeaveRepository()
