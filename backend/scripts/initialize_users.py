import sys
import os
from pathlib import Path
import secrets
import string

from sqlalchemy.orm import Session
from core.database import SessionLocal, engine, Base
from models.user import User, UserRole
from models.employee import Employee
from models.department import Department
from core.security import get_password_hash

def generate_secure_password(length=12):
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for i in range(length))

def create_user(db: Session, email, username, role, first_name, last_name, department_name=None):
    # Check if user exists in User table
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        print(f"User {email} already exists. Skipping.")
        return

    # Check if employee exists (to avoid duplicate email error if user logic is desynced)
    existing_employee = db.query(Employee).filter(Employee.email == email).first()
    
    password = generate_secure_password()
    hashed_password = get_password_hash(password)

    # Create Department if needed
    dept = None
    if department_name:
        dept = db.query(Department).filter(Department.name == department_name).first()
        if not dept:
            dept = Department(name=department_name)
            db.add(dept)
            db.commit()
            db.refresh(dept)

    if not existing_employee:
        # Create Employee
        employee = Employee(
            first_name=first_name,
            last_name=last_name,
            email=email, 
            hashed_password=hashed_password, # Legacy field
            role=role.value if hasattr(role, 'value') else role,
            department_id=dept.id if dept else None,
            employment_status="active",
            employment_type="full_time"
        )
        db.add(employee)
        db.commit()
        db.refresh(employee)
        employee_id = employee.id
    else:
        employee_id = existing_employee.id
        print(f"Linking to existing employee {email}")

    # Create User
    user = User(
        username=username,
        email=email,
        password_hash=hashed_password,
        role=role,
        employee_id=employee_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    print(f"Created user: {username} ({email})")
    print(f"Role: {role.value}")
    print(f"Password: {password}")
    print("-" * 20)

def main():
    print("Initializing users...")
    
    # Check if tables match schema
    from sqlalchemy import inspect
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    drop_users = False
    drop_employees = False
    
    if "users" in existing_tables:
        columns = [c["name"] for c in inspector.get_columns("users")]
        if "username" not in columns:
            print("Existing 'users' table does not match schema (missing 'username').")
            drop_users = True
            
    if "employees" in existing_tables:
        columns = [c["name"] for c in inspector.get_columns("employees")]
        if "role" not in columns:
            print("Existing 'employees' table does not match schema (missing 'role').")
            drop_employees = True
    
    # If employees need dropping, we must drop users first (FK dependency)
    if drop_employees:
        drop_users = True
        
    from sqlalchemy import text
    with engine.connect() as conn:
        if drop_users and "users" in existing_tables:
            print("Dropping 'users' table (CASCADE)...")
            conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
            conn.commit()
            
        if drop_employees and "employees" in existing_tables:
            print("Dropping 'employees' table (CASCADE)...")
            conn.execute(text("DROP TABLE IF EXISTS employees CASCADE"))
            conn.commit()
            
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Super Admin (CEO)
        create_user(
            db, 
            email="ceo@leadtap.in", 
            username="super_admin", 
            role=UserRole.super_admin, 
            first_name="Super", 
            last_name="Admin",
            department_name="Management"
        )

        # 2. HR Admin
        create_user(
            db, 
            email="hr@leadtap.in", 
            username="hr_admin", 
            role=UserRole.hr_admin, 
            first_name="HR", 
            last_name="Manager",
            department_name="HR"
        )

        # 3. Manager
        create_user(
            db, 
            email="manager@leadtap.in", 
            username="manager_user", 
            role=UserRole.manager, 
            first_name="Project", 
            last_name="Manager",
            department_name="Engineering"
        )

        # 4. Employee
        create_user(
            db, 
            email="employee@leadtap.in", 
            username="employee_user", 
            role=UserRole.employee, 
            first_name="John", 
            last_name="Doe",
            department_name="Engineering"
        )

        print("\nWARNING: Please force password change on first login for all these accounts.")
        print("Initialization complete.")

    except Exception as e:
        print(f"Error initializing users: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    main()
