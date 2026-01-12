
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date
from backend.core.config import settings
from backend.models.employee import Employee
from backend.models.leave_credit import LeaveCreditRequest, LeaveCreditStatus
from backend.services.leave_service import leave_service
from backend.schemas.leave_credit import LeaveCreditRequestCreate

# Setup DB
engine = create_engine(str(settings.DATABASE_URL))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def test_credit_workflow():
    print("Testing Comp Off Credit Workflow...")
    
    # Ensure leave types exist
    leave_service.initialize_leave_types(db)
    
    # 1. Get/Create Employee
    emp = db.query(Employee).filter(Employee.email == "test_credit@example.com").first()
    if not emp:
        emp = Employee(
            first_name="Test", last_name="Credit", email="test_credit@example.com", 
            date_of_joining=date(2023, 1, 1),
            gender="Male", role="employee",
            hashed_password="dummy"
        )
        db.add(emp)
        db.commit()
        db.refresh(emp)
    
    print(f"Employee ID: {emp.id}")

    # 2. Get Manager (Approver)
    mgr = db.query(Employee).filter(Employee.role == "manager").first()
    if not mgr:
        # Create dummy manager if none
        mgr = Employee(
            first_name="Test", last_name="Manager", email="manager_test@example.com",
            date_of_joining=date(2020, 1, 1),
            gender="Male", role="manager",
            hashed_password="dummy"
        )
        db.add(mgr)
        db.commit()
        db.refresh(mgr)
    print(f"Manager ID: {mgr.id}")

    # 3. Create Request
    req_data = LeaveCreditRequestCreate(
        date_worked=date(2023, 12, 25),
        reason="Worked on Christmas"
    )
    
    # Clean up existing
    existing = db.query(LeaveCreditRequest).filter(
        LeaveCreditRequest.employee_id == emp.id, 
        LeaveCreditRequest.date_worked == req_data.date_worked
    ).first()
    if existing:
        db.delete(existing)
        db.commit()

    try:
        req = leave_service.request_leave_credit(db, req_data, emp.id)
        print(f"Request Created: ID {req.id}, Status {req.status}")
        
        # 4. Approve Request
        req = leave_service.approve_leave_credit(db, req.id, mgr.id)
        print(f"Request Approved: Status {req.status}")
        
        # 5. Check Balance
        # Assuming CO leave type id is same as request
        balance = leave_service.get_employee_balances(db, emp.id, 2023)
        co_balance = next((b for b in balance if b.leave_type_id == req.leave_type_id), None)
        
        if co_balance:
            print(f"CO Balance: Available {co_balance.available}, Accrued {co_balance.accrued}")
            if co_balance.available >= 1:
                print("SUCCESS: Balance credited.")
            else:
                 print("FAILURE: Balance not updated.")
        else:
            print("FAILURE: No balance record found.")

    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_credit_workflow()
