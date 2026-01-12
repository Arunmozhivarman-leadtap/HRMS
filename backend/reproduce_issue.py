import sys
import os
from datetime import date

# Add backend to path
sys.path.append(os.getcwd())

from backend.core.database import SessionLocal, engine
from backend.models.leave import LeaveBalance, LeaveType
from backend.models.employee import Employee
from backend.services.leave_service import leave_service
from backend.schemas.leave import LeaveApplicationCreate

def reproduce():
    db = SessionLocal()
    try:
        # Setup Data
        print("Setting up test data...")
        emp = db.query(Employee).first()
        if not emp:
            print("No employees found. Creating one.")
            emp = Employee(
                full_name="Repro Employee",
                personal_email="repro@example.com",
                mobile_number="9999999999",
                employment_type="full_time",
                joining_date=date(2025, 1, 1),
                status="active"
            )
            db.add(emp)
            db.commit()
            db.refresh(emp)
        
        lt = db.query(LeaveType).first()
        if not lt:
            print("No leave types found. Initializing.")
            leave_service.initialize_leave_types(db)
            lt = db.query(LeaveType).first()
        
        print(f"Using Employee ID: {emp.id}, LeaveType ID: {lt.id}")
        
        # Cleanup Balance
        existing = db.query(LeaveBalance).filter(
            LeaveBalance.employee_id == emp.id,
            LeaveBalance.leave_type_id == lt.id,
            LeaveBalance.leave_year == 2024
        ).first()
        
        if existing:
            print(f"Deleting existing balance ID: {existing.id}")
            db.delete(existing)
            db.commit()
        
        # Apply Leave
        print("Applying Leave...")
        app_data = LeaveApplicationCreate(
            leave_type_id=lt.id,
            from_date=date(2024, 5, 1),
            to_date=date(2024, 5, 2),
            duration_type="Full Day",
            reason="Repro Test",
            number_of_days=2
        )
        
        try:
            leave_service.apply_leave(db, app_data, emp.id)
        except Exception as e:
            print(f"Error applying leave: {e}")
            raise

        # Verify
        bal = db.query(LeaveBalance).filter(
            LeaveBalance.employee_id == emp.id,
            LeaveBalance.leave_type_id == lt.id,
            LeaveBalance.leave_year == 2024
        ).first()
        
        if bal:
            print(f"RESULT: Balance ID: {bal.id}")
            print(f"Pending Approval: {bal.pending_approval}")
            print(f"Available: {bal.available}")
            
            if bal.pending_approval == 2:
                print("SUCCESS: Balance updated correctly.")
            else:
                print("FAILURE: Pending approval is NOT 2.")
        else:
            print("FAILURE: No balance record found.")
            
    finally:
        db.close()

if __name__ == "__main__":
    reproduce()
