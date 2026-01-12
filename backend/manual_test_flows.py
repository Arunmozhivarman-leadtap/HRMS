import sys
import os
from datetime import date
from fastapi import HTTPException

# Add backend to path
sys.path.append(os.getcwd())

from backend.core.database import SessionLocal
from backend.models.leave import LeaveBalance, LeaveType, PublicHoliday, LeaveApplication, LeaveTypeEnum, HolidayType
from backend.models.employee import Employee
from backend.services.leave_service import leave_service
from backend.schemas.leave import LeaveApplicationCreate

def run_flows():
    db = SessionLocal()
    try:
        print("\n--- SETUP ---")
        emp = db.query(Employee).first()
        if not emp:
            emp = Employee(full_name="Test User", personal_email="test@test.com", mobile_number="0000000000", employment_type="full_time", joining_date=date(2025,1,1), status="active")
            db.add(emp)
            db.commit()
            db.refresh(emp)
        print(f"Employee ID: {emp.id}")

        lt = db.query(LeaveType).filter(LeaveType.name == LeaveTypeEnum.earned_leave).first()
        if not lt:
            leave_service.initialize_leave_types(db)
            lt = db.query(LeaveType).filter(LeaveType.name == LeaveTypeEnum.earned_leave).first()
        print(f"Leave Type: {lt.name.value} (ID: {lt.id})")

        # Cleanup
        db.query(LeaveApplication).filter(LeaveApplication.employee_id == emp.id).delete()
        db.query(LeaveBalance).filter(LeaveBalance.employee_id == emp.id).delete()
        db.commit()
        
        print("\n--- TEST 1: Apply Leave Success ---")
        app_data = LeaveApplicationCreate(
            leave_type_id=lt.id,
            from_date=date(2024, 6, 1),
            to_date=date(2024, 6, 5), # 5 days total, check weekends
            duration_type="Full Day",
            reason="Test 1",
            number_of_days=0 # Ignored by service
        )
        app = leave_service.apply_leave(db, app_data, emp.id)
        print(f"Applied. ID: {app.id}, Days: {app.number_of_days}")
        
        # Verify days calculation (June 1 2024 is Saturday, June 2 Sunday. So Mon, Tue, Wed = 3 days)
        # Wait, June 1 2024 is Saturday.
        # 1(Sat), 2(Sun), 3(Mon), 4(Tue), 5(Wed).
        # Should be 3 working days.
        if app.number_of_days == 3:
            print("SUCCESS: Day calculation correct (excl weekends).")
        else:
            print(f"FAILURE: Expected 3 days, got {app.number_of_days}")

        print("\n--- TEST 2: Overlap Check ---")
        # Try to apply for June 4 (Tuesday) - Overlps with Test 1
        app_data_overlap = LeaveApplicationCreate(
            leave_type_id=lt.id,
            from_date=date(2024, 6, 4),
            to_date=date(2024, 6, 4),
            duration_type="Full Day",
            reason="Overlap Test",
            number_of_days=0
        )
        try:
            leave_service.apply_leave(db, app_data_overlap, emp.id)
            print("FAILURE: Allowed overlapping leave!")
        except HTTPException as e:
            print(f"SUCCESS: Caught expected error: {e.detail}")
        except Exception as e:
            print(f"FAILURE: Unexpected error: {e}")

        print("\n--- TEST 3: Holiday Exclusion ---")
        # Add holiday on June 10 (Mon)
        hol = PublicHoliday(name="Test Hol", holiday_date=date(2024, 6, 10), holiday_type=HolidayType.declared)
        db.add(hol)
        db.commit()
        
        # Apply for June 10
        app_data_hol = LeaveApplicationCreate(
            leave_type_id=lt.id,
            from_date=date(2024, 6, 10),
            to_date=date(2024, 6, 10),
            duration_type="Full Day",
            reason="Holiday Test",
            number_of_days=0
        )
        try:
            leave_service.apply_leave(db, app_data_hol, emp.id)
            print("FAILURE: Allowed leave on holiday (resulted in >0 days?)")
        except HTTPException as e:
             if "no working days" in str(e.detail):
                 print("SUCCESS: Prevented leave on holiday.")
             else:
                 print(f"FAILURE: Wrong error for holiday: {e.detail}")

        print("\n--- TEST 4: Valid Leave After Rejections ---")
        # Apply for June 20-21 (Thu-Fri) - Should succeed
        app_data_valid = LeaveApplicationCreate(
            leave_type_id=lt.id,
            from_date=date(2024, 6, 20),
            to_date=date(2024, 6, 21),
            duration_type="Full Day",
            reason="Valid Test",
            number_of_days=0
        )
        app_valid = leave_service.apply_leave(db, app_data_valid, emp.id)
        if app_valid.id:
            print(f"SUCCESS: Applied valid leave after rejections. ID: {app_valid.id}")
        else:
            print("FAILURE: Could not apply valid leave.")

    except Exception as e:
        print(f"CRITICAL FAILURE: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    run_flows()
