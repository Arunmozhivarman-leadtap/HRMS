from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.dependencies import get_current_user
from services.dashboard_service import dashboard_service
from schemas.dashboard import DashboardResponse

router = APIRouter(tags=["Dashboard"])

@router.get("", response_model=DashboardResponse)
def get_dashboard(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data = dashboard_service.get_dashboard_data(db, current_user)
    if not data:
        raise HTTPException(status_code=404, detail="Dashboard data not found")
    return data
