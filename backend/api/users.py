from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from schemas.employee import EmployeeCreate, EmployeeResponse, BankingInfoUpdate
from services.user_service import user_service
from core.dependencies import get_current_user
from models.user import User
from models.employee import Employee

router = APIRouter()

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_in: EmployeeCreate, db: Session = Depends(get_db)):
    return user_service.create_user(db, user_in)

@router.get("/", response_model=List[EmployeeResponse])
def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return user_service.get_users(db, skip=skip, limit=limit)

@router.get("/me", response_model=EmployeeResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.employee_id:
        raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    employee = db.query(Employee).filter(Employee.id == current_user.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.put("/me/banking", response_model=EmployeeResponse)
def update_my_banking(
    banking_in: BankingInfoUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.employee_id:
        raise HTTPException(status_code=400, detail="User is not linked to an employee record")
    return user_service.update_banking_info(db, current_user.employee_id, banking_in)
