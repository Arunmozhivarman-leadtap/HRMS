from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional, Tuple
from models.employee import Employee
from models.user import User
from datetime import datetime

class EmployeeRepository:
    def get_employees(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        search: Optional[str] = None,
        department_id: Optional[int] = None,
        status: Optional[str] = None,
        manager_id: Optional[int] = None,
        archived: bool = False
    ) -> Tuple[List[Employee], int]:
        query = db.query(Employee)
        
        if not archived:
            query = query.filter(Employee.archived_at == None)
        else:
            query = query.filter(Employee.archived_at != None)

        if search:
            search_filter = or_(
                Employee.first_name.ilike(f"%{search}%"),
                Employee.last_name.ilike(f"%{search}%"),
                Employee.employee_code.ilike(f"%{search}%"),
                Employee.email.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        if department_id:
            query = query.filter(Employee.department_id == department_id)
        
            
        if status:
            query = query.filter(Employee.employment_status == status)
            
        if manager_id:
            query = query.filter(or_(Employee.manager_id == manager_id, Employee.id == manager_id))

        total = query.count()
        items = query.offset(skip).limit(limit).all()
        
        return items, total

    def get_employee_by_id(self, db: Session, employee_id: int) -> Optional[Employee]:
        return db.query(Employee).filter(Employee.id == employee_id).first()

    def get_employee_by_email(self, db: Session, email: str) -> Optional[Employee]:
        return db.query(Employee).filter(Employee.email == email).first()

    def update_employee(self, db: Session, employee: Employee, obj_in: dict) -> Employee:
        for field in obj_in:
            if hasattr(employee, field):
                val = obj_in[field]
                # Handle empty strings for unique or nullable fields
                if field == "employee_code" and val == "":
                    val = None
                setattr(employee, field, val)
        db.add(employee)
        db.commit()
        db.refresh(employee)
        return employee

    def archive_employee(self, db: Session, employee_id: int) -> Optional[Employee]:
        employee = self.get_employee_by_id(db, employee_id)
        if employee:
            employee.archived_at = datetime.utcnow()
            employee.is_active = False
            db.add(employee)
            db.commit()
            db.refresh(employee)
        return employee

    def restore_employee(self, db: Session, employee_id: int) -> Optional[Employee]:
        employee = self.get_employee_by_id(db, employee_id)
        if employee:
            employee.archived_at = None
            employee.is_active = True
            db.add(employee)
            db.commit()
            db.refresh(employee)
        return employee

employee_repository = EmployeeRepository()
