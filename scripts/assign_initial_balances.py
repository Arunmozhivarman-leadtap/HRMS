import sys
import os
from pathlib import Path
from datetime import date
from decimal import Decimal

# Add project root to python path
project_root = Path(__file__).resolve().parents[1]
sys.path.append(str(project_root))

from sqlalchemy.orm import Session
from backend.core.database import SessionLocal
from backend.models.employee import Employee
from backend.models.leave import LeaveType, LeaveBalance, LeaveTypeEnum
from backend.repositories.leave_repository import leave_repository
from backend.services.leave_service import leave_service

def main():
    db = SessionLocal()
    try:
        # 1. Initialize Leave Types first
        leave_service.initialize_leave_types(db)
        leave_types = leave_repository.get_leave_types(db)
        
        # 2. Get all employees
        employees = db.query(Employee).all()
        current_year = date.today().year
        
        print(f"Assigning initial balances for {len(employees)} employees for year {current_year}...")
        
        for emp in employees:
            for lt in leave_types:
                # Check if balance exists
                balance = leave_repository.get_balance(db, emp.id, lt.id, current_year)
                
                # We want to give some initial "Opening Balance" so they can actually apply
                initial_available = Decimal("10.0") # Give 10 days of each type for testing
                
                if not balance:
                    balance = LeaveBalance(
                        employee_id=emp.id,
                        leave_type_id=lt.id,
                        leave_year=current_year,
                        opening_balance=initial_available,
                        available=initial_available,
                        accrued=0,
                        taken=0,
                        pending_approval=0,
                        carry_forward=0
                    )
                    db.add(balance)
                    print(f"  Created balance for {emp.email}: {lt.name.value} = {initial_available}")
                else:
                    # Update existing balance to have some days
                    if balance.available == 0:
                        balance.opening_balance = initial_available
                        balance.available = initial_available
                        print(f"  Updated balance for {emp.email}: {lt.name.value} = {initial_available}")
        
        db.commit()
        print("Done.")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
