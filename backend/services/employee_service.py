from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional, Tuple
from backend.repositories.employee_repository import employee_repository
from backend.repositories.user_repository import user_repository
from backend.schemas.employee import EmployeeCreate, EmployeeUpdate
from backend.core.security import get_password_hash
from backend.models.user import User, UserRole
from backend.models.employee import Employee
from backend.utils.audit import log_action
import csv
import io

class EmployeeService:
    def get_employees_scoped(
        self, 
        db: Session, 
        current_user: User,
        skip: int = 0, 
        limit: int = 100,
        search: Optional[str] = None,
        department_id: Optional[int] = None,
        status_filter: Optional[str] = None,
        archived: bool = False
    ) -> Tuple[List, int]:
        manager_id = None
        if current_user.role == UserRole.manager:
            manager_id = current_user.employee_id
        elif current_user.role == UserRole.employee:
            # Employee can only see themselves
            emp = employee_repository.get_employee_by_id(db, current_user.employee_id)
            return ([emp] if emp else [], 1 if emp else 0)
        
        # Admin and HR Admin can see all
        return employee_repository.get_employees(
            db, skip, limit, search, department_id, status_filter, manager_id, archived
        )

    def create_employee(self, db: Session, employee_in: EmployeeCreate, creator_id: int, ip_address: str = None):
        existing_emp = employee_repository.get_employee_by_email(db, employee_in.email)
        if existing_emp:
            raise HTTPException(status_code=400, detail="Employee with this email already exists")
        
        existing_user = db.query(User).filter(User.email == employee_in.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")

        # Create Employee
        emp_data = employee_in.model_dump(exclude={"password"})
        emp_data["hashed_password"] = get_password_hash(employee_in.password)
        
        db_employee = Employee(**emp_data)
        db.add(db_employee)
        db.flush() # Get ID

        # Create User
        db_user = User(
            username=employee_in.email, # Use email as username for simplicity
            email=employee_in.email,
            password_hash=emp_data["hashed_password"],
            role=employee_in.role,
            employee_id=db_employee.id
        )
        db.add(db_user)
        
        log_action(
            db, creator_id, "CREATE", "Employee", db_employee.id, 
            details={"email": db_employee.email}, ip_address=ip_address
        )
        
        db.commit()
        db.refresh(db_employee)
        return db_employee

    def update_employee(self, db: Session, current_user: User, employee_id: int, employee_in: EmployeeUpdate, ip_address: str = None):
        employee = employee_repository.get_employee_by_id(db, employee_id)
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        old_data = {c.name: str(getattr(employee, c.name)) for c in employee.__table__.columns if c.name not in ['hashed_password', 'created_at', 'updated_at']}

        # RBAC Check
        if current_user.role not in [UserRole.super_admin, UserRole.hr_admin]:
            if current_user.employee_id != employee_id:
                raise HTTPException(status_code=403, detail="Not authorized to update this employee")
            
            # Restricted fields for non-admins
            update_data = employee_in.model_dump(exclude_unset=True)
            admin_only_fields = {
                "designation_id", "department_id", "manager_id", 
                "employment_type", "employment_status", "employee_code", "is_active"
            }
            for field in admin_only_fields:
                update_data.pop(field, None)
        else:
            update_data = employee_in.model_dump(exclude_unset=True)

        updated_employee = employee_repository.update_employee(db, employee, update_data)
        
        log_action(
            db, current_user.id, "UPDATE", "Employee", employee_id,
            details={"old": old_data, "new": {k: str(v) for k, v in update_data.items()}}, ip_address=ip_address
        )
        
        return updated_employee

    def archive_employee(self, db: Session, employee_id: int, archiver_id: int, ip_address: str = None):
        employee = employee_repository.archive_employee(db, employee_id)
        if employee:
            log_action(
                db, archiver_id, "ARCHIVE", "Employee", employee_id, 
                ip_address=ip_address
            )
        return employee

    def restore_employee(self, db: Session, employee_id: int, restorer_id: int, ip_address: str = None):
        employee = employee_repository.restore_employee(db, employee_id)
        if employee:
            log_action(
                db, restorer_id, "RESTORE", "Employee", employee_id,
                ip_address=ip_address
            )
        return employee

    def export_employees(self, db: Session, current_user: User):
        # Implementation for CSV export
        employees, _ = self.get_employees_scoped(db, current_user, limit=1000)
        
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Employee Code", "First Name", "Last Name", "Email", "Department", "Designation", "Status"])
        
        for emp in employees:
            writer.writerow([
                emp.employee_code,
                emp.first_name,
                emp.last_name,
                emp.email,
                emp.department.name if emp.department else "",
                emp.designation_rel.name if emp.designation_rel else "",
                emp.employment_status
            ])
            
        return output.getvalue()

employee_service = EmployeeService()
