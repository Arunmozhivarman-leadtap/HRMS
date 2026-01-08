from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List
from backend.core.database import get_db
from backend.schemas.employee import EmployeeCreate, EmployeeResponse
from backend.services.user_service import user_service

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
