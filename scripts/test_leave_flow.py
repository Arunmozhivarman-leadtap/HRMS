import sys
from pathlib import Path
from datetime import date, timedelta
from decimal import Decimal

# Add project root to python path
project_root = Path(__file__).resolve().parents[1]
sys.path.append(str(project_root))

from backend.core.database import SessionLocal, engine, Base
import backend.models
from backend.services.leave_service import leave_service
from backend.repositories.leave_repository import leave_repository
from backend.models.user import User, UserRole
from backend.models.employee import Employee
from backend.models.leave import LeaveApplicationStatus, LeaveTypeEnum
from backend.schemas.leave import LeaveApplicationCreate
from backend.core.security import get_password_hash

def test_leave_flow():
    db = SessionLocal()
    try:
        print("1. Initializing Leave Types...")
        leave_service.initialize_leave_types(db)
        leave_types = leave_repository.get_leave_types(db)
        el_type = next(t for t in leave_types if t.name == LeaveTypeEnum.earned_leave)
        print(f"   Created {len(leave_types)} leave types.")

        print("\n2. Setting up Test Users...")
        # Manager
        manager_email = "test_manager@leadtap.in"
        manager_user = db.query(User).filter(User.email == manager_email).first()
        if not manager_user:
            manager_emp = Employee(
                first_name="Test", last_name="Manager", email=manager_email,
                hashed_password=get_password_hash("password"), role="manager",
                date_of_joining=date(2024, 1, 1)
            )
            db.add(manager_emp)
            db.commit()
            db.refresh(manager_emp)
            manager_user = User(
                username="test_manager", email=manager_email,
                password_hash=get_password_hash("password"), role=UserRole.manager,
                employee_id=manager_emp.id
            )
            db.add(manager_user)
            db.commit()
        else:
            manager_emp = manager_user.employee

        # Employee
        emp_email = "test_emp@leadtap.in"
        emp_user = db.query(User).filter(User.email == emp_email).first()
        if not emp_user:
            emp_emp = Employee(
                first_name="Test", last_name="Employee", email=emp_email,
                hashed_password=get_password_hash("password"), role="employee",
                date_of_joining=date(2025, 1, 1), # Joined Jan 1st 2025
                manager_id=manager_emp.id
            )
            db.add(emp_emp)
            db.commit()
            db.refresh(emp_emp)
            emp_user = User(
                username="test_emp", email=emp_email,
                password_hash=get_password_hash("password"), role=UserRole.employee,
                employee_id=emp_emp.id
            )
            db.add(emp_user)
            db.commit()
        else:
            emp_emp = emp_user.employee

        print(f"   Manager: {manager_emp.full_name}, Employee: {emp_emp.full_name}")

        print("\n3. Calculating Accruals for 2025...")
        # If today is in 2026, it will calculate full year 2025
        leave_service.calculate_pro_rata_accrual(db, emp_emp.id, 2025)
        
        balances = leave_repository.get_balances(db, emp_emp.id, 2025)
        el_balance = next(b for b in balances if b.leave_type_id == el_type.id)
        print(f"   Earned Leave Accrued: {el_balance.accrued}, Available: {el_balance.available}")

        print("\n4. Applying for Leave...")
        leave_request = LeaveApplicationCreate(
            leave_type_id=el_type.id,
            from_date=date(2025, 6, 1),
            to_date=date(2025, 6, 3),
            number_of_days=3.0,
            reason="Vacation"
        )
        app = leave_service.apply_leave(db, leave_request, emp_emp.id)
        print(f"   Applied for 3 days. Status: {app.status}")
        
        db.refresh(el_balance)
        print(f"   Balance after apply -> Pending: {el_balance.pending_approval}, Available: {el_balance.available}")

        print("\n5. Approving Leave...")
        leave_service.approve_leave(db, app.id, manager_emp.id)
        print(f"   Approved by manager. Status: {app.status}")
        
        db.refresh(el_balance)
        print(f"   Balance after approval -> Taken: {el_balance.taken}, Pending: {el_balance.pending_approval}, Available: {el_balance.available}")

        print("\nLeave Flow Test Passed!")

    except Exception as e:
        print(f"\nTest Failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_leave_flow()
