from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from backend.models.leave_credit import LeaveCreditStatus

class LeaveCreditRequestBase(BaseModel):
    date_worked: date
    reason: str
    leave_type_id: Optional[int] = None # Defaults to CO if not provided

class LeaveCreditRequestCreate(LeaveCreditRequestBase):
    pass

class LeaveCreditRequestResponse(LeaveCreditRequestBase):
    id: int
    employee_id: int
    status: LeaveCreditStatus
    approver_id: Optional[int] = None
    approved_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    employee_name: Optional[str] = None
    leave_type_name: Optional[str] = None

    class Config:
        from_attributes = True
