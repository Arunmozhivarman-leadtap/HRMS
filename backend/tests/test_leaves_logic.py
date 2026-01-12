import pytest
from datetime import date, timedelta
from decimal import Decimal
from backend.models.leave import LeaveBalance, LeaveType, LeaveTypeEnum, LeaveApplication, LeaveApplicationStatus
from backend.services.leave_service import leave_service
from backend.schemas.leave import LeaveApplicationCreate
from backend.models.employee import Employee
from backend.models.leave import PublicHoliday, HolidayType

# Helper to create a dummy employee
def create_test_employee(db, employee_id=1):
    # Check if exists
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if emp:
        return emp
    emp = Employee(
        id=employee_id,
        full_name="Test Employee",
        personal_email="test@example.com",
        mobile_number="1234567890",
        employment_type="full_time",
        joining_date=date(2025, 1, 1),
        status="active" 
    )
    db.add(emp)
    db.commit()
    return emp

def create_test_leave_type(db, name=LeaveTypeEnum.earned_leave, id=1):
    lt = db.query(LeaveType).filter(LeaveType.id == id).first()
    if lt:
        return lt
    lt = LeaveType(
        id=id,
        name=name,
        abbr="EL",
        annual_entitlement=12,
        accrual_method="monthly",
        carry_forward=False,
        negative_balance_allowed=True, # Allow negative for easy testing of apply
        requires_approval=True
    )
    db.add(lt)
    db.commit()
    return lt

def test_calculate_working_days_weekends(db_session):
    # Mon-Fri are working days. Sat-Sun are weekends.
    # Jan 1 2024 is Monday. Jan 6 is Saturday. Jan 7 is Sunday.
    # Range Jan 1 to Jan 7 -> 5 days.
    
    from_date = date(2024, 1, 1)
    to_date = date(2024, 1, 7)
    
    days = leave_service.calculate_working_days(db_session, from_date, to_date, "Full Day")
    assert days == 5

def test_calculate_working_days_holiday(db_session):
    # Jan 1 2024 (Mon). Make Jan 2 (Tue) a holiday.
    # Range Jan 1 to Jan 3 -> 3 days normally. With holiday -> 2 days.
    
    holiday = PublicHoliday(
        name="Test Holiday",
        holiday_date=date(2024, 1, 2),
        holiday_type=HolidayType.declared
    )
    db_session.add(holiday)
    db_session.commit()
    
    days = leave_service.calculate_working_days(
        db_session, 
        date(2024, 1, 1), 
        date(2024, 1, 3), 
        "Full Day"
    )
    assert days == 2

def test_apply_leave_success(db_session):
    emp = create_test_employee(db_session)
    lt = create_test_leave_type(db_session)
    
    app_data = LeaveApplicationCreate(
        leave_type_id=lt.id,
        from_date=date(2024, 2, 1), # Thursday
        to_date=date(2024, 2, 2),   # Friday
        duration_type="Full Day",
        reason="Test Leave",
        number_of_days=2
    )
    
    # Cleanup existing balance to avoid pollution
    existing_bal = db_session.query(LeaveBalance).filter(
        LeaveBalance.employee_id == emp.id, 
        LeaveBalance.leave_type_id == lt.id,
        LeaveBalance.leave_year == 2024
    ).first()
    if existing_bal:
        db_session.delete(existing_bal)
        db_session.commit()
    
    app = leave_service.apply_leave(db_session, app_data, emp.id)
    
    assert app.status == LeaveApplicationStatus.pending
    assert app.number_of_days == 2
    
    # Verify balance impact
    bal = db_session.query(LeaveBalance).filter(
        LeaveBalance.employee_id == emp.id, 
        LeaveBalance.leave_type_id == lt.id
    ).first()
    
    assert bal is not None
    print(f"DEBUG DETAILS: ID={bal.id} Open={bal.opening_balance} Accrued={bal.accrued} CF={bal.carry_forward} Taken={bal.taken} Pending={bal.pending_approval} Avail={bal.available}")
    db_session.refresh(bal)
    
    assert bal.pending_approval == 2
    assert bal.available == -2 # Since opening was 0 and we allowed negative
