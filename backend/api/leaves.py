from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from backend.core.database import get_db
from backend.services.leave_service import leave_service
from backend.repositories.leave_repository import leave_repository
from backend.schemas.leave import (
    LeaveApplicationCreate, LeaveApplicationResponse, 
    LeaveBalanceResponse, LeaveTypeResponse, PublicHolidayResponse,
    LeaveTypeBase
)
from backend.core.dependencies import get_current_user

router = APIRouter()

@router.get("/types", response_model=List[LeaveTypeResponse])
def get_leave_types(db: Session = Depends(get_db)):
    # Ensure initialized (lazy init for prototype)
    leave_service.initialize_leave_types(db)
    return leave_repository.get_leave_types(db)

@router.post("/types", response_model=LeaveTypeResponse)
def create_leave_type(
    data: LeaveTypeBase,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != 'super_admin':
        raise HTTPException(status_code=403, detail="Only super_admin can create leave types")
    return leave_service.create_leave_type(db, data.model_dump())

@router.put("/types/{lt_id}", response_model=LeaveTypeResponse)
def update_leave_type(
    lt_id: int,
    data: LeaveTypeBase,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != 'super_admin':
        raise HTTPException(status_code=403, detail="Only super_admin can update leave types")
    return leave_service.update_leave_type(db, lt_id, data.model_dump())

@router.delete("/types/{lt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_leave_type(
    lt_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != 'super_admin':
        raise HTTPException(status_code=403, detail="Only super_admin can delete leave types")
    leave_service.delete_leave_type(db, lt_id)
    return None

@router.get("/balances/my", response_model=List[LeaveBalanceResponse])
def get_my_balances(
    year: int = Query(default=date.today().year),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.employee_id:
        raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    return leave_service.get_employee_balances(db, current_user.employee_id, year)

@router.get("/balances/team", response_model=List[LeaveBalanceResponse])
def get_team_balances(
    year: int = Query(default=date.today().year),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['manager', 'hr_admin', 'super_admin']:
         raise HTTPException(status_code=403, detail="Not authorized")
    if not current_user.employee_id:
         raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    return leave_service.get_team_balances(db, current_user.employee_id, year)

@router.get("/balances/all", response_model=List[LeaveBalanceResponse])
def get_all_balances(
    year: int = Query(default=date.today().year),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['hr_admin', 'super_admin']:
         raise HTTPException(status_code=403, detail="Not authorized")
    return leave_service.get_all_balances(db, year)

@router.post("/apply", response_model=LeaveApplicationResponse)
def apply_leave(
    application: LeaveApplicationCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.employee_id:
        raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    return leave_service.apply_leave(db, application, current_user.employee_id)

@router.get("/applications/my", response_model=List[LeaveApplicationResponse])
def get_my_applications(
    year: Optional[int] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.employee_id:
        raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    return leave_repository.get_applications(db, employee_id=current_user.employee_id, year=year)

@router.get("/applications/team", response_model=List[LeaveApplicationResponse])
def get_team_applications(
    year: Optional[int] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['manager', 'hr_admin', 'super_admin']:
         raise HTTPException(status_code=403, detail="Not authorized")
    if not current_user.employee_id:
         raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    return leave_service.get_team_applications(db, current_user.employee_id, year)

@router.get("/applications/all", response_model=List[LeaveApplicationResponse])
def get_all_applications(
    year: Optional[int] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['hr_admin', 'super_admin']:
         raise HTTPException(status_code=403, detail="Not authorized")
    return leave_repository.get_applications(db, year=year)

@router.get("/approvals/pending", response_model=List[LeaveApplicationResponse])
def get_pending_approvals(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only managers/admins/hr
    if current_user.role not in ['manager', 'hr_admin', 'super_admin']:
         raise HTTPException(status_code=403, detail="Not authorized")
    
    if not current_user.employee_id:
         raise HTTPException(status_code=400, detail="User is not linked to an employee record")

    # For HR/Super Admin, maybe show ALL pending? Spec says "Approve Leaves: HR Admin (All), Manager (Team Only)"
    if current_user.role in ['hr_admin', 'super_admin']:
        return leave_repository.get_applications(db, status="pending")
    else:
        return leave_repository.get_pending_applications_for_approver(db, current_user.employee_id)

@router.post("/approve/{application_id}", response_model=LeaveApplicationResponse)
def approve_leave_request(
    application_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['manager', 'hr_admin', 'super_admin']:
         raise HTTPException(status_code=403, detail="Not authorized")
         
    if not current_user.employee_id:
         raise HTTPException(status_code=400, detail="Approver must be an employee")

    # TODO: Add verification that the manager actually manages this employee if role is 'manager'
    return leave_service.approve_leave(db, application_id, current_user.employee_id)

@router.post("/reject/{application_id}", response_model=LeaveApplicationResponse)
def reject_leave_request(
    application_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['manager', 'hr_admin', 'super_admin']:
         raise HTTPException(status_code=403, detail="Not authorized")

    if not current_user.employee_id:
         raise HTTPException(status_code=400, detail="Approver must be an employee")
         
    return leave_service.reject_leave(db, application_id, current_user.employee_id)

@router.put("/update/{application_id}", response_model=LeaveApplicationResponse)
def update_leave_request(
    application_id: int,
    application: LeaveApplicationCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.employee_id:
        raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    return leave_service.update_leave(db, application_id, application, current_user.employee_id)

@router.delete("/cancel/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_leave_request(
    application_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.employee_id:
        raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    leave_service.cancel_leave(db, application_id, current_user.employee_id)
    return None

@router.get("/stats")
def get_leave_statistics(
    year: int = Query(default=date.today().year),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ['hr_admin', 'super_admin', 'manager']:
         raise HTTPException(status_code=403, detail="Not authorized")
    return leave_service.get_leave_stats(db, year)

@router.get("/holidays", response_model=List[PublicHolidayResponse])
def get_holidays(
    year: int = Query(default=date.today().year),
    db: Session = Depends(get_db)
):
    return leave_repository.get_holidays(db, year)
