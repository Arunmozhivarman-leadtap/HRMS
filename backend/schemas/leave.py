from pydantic import BaseModel, Field, condecimal
from typing import Optional, List
from datetime import date, datetime
from backend.models.leave import LeaveTypeEnum, LeaveApplicationStatus, HolidayType
from backend.schemas.employee import EmployeeResponse

# Leave Type Schemas
class LeaveTypeBase(BaseModel):
    name: LeaveTypeEnum
    abbr: str
    annual_entitlement: int
    carry_forward: bool = False
    max_carry_forward: Optional[int] = None
    encashment: bool = False
    max_encashment_per_year: Optional[int] = None
    min_balance_to_encash: Optional[int] = None
    accrual_method: str
    pro_rata_settings: Optional[dict] = None
    negative_balance_allowed: bool = False
    requires_approval: bool = True
    min_days_in_advance: Optional[int] = None
    min_days_in_advance: Optional[int] = None
    max_consecutive_days: Optional[int] = None
    gender_eligibility: str = "All"
    requires_document: bool = False
    approval_levels: int = 1

class LeaveTypeResponse(LeaveTypeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Leave Balance Schemas
class LeaveBalanceBase(BaseModel):
    leave_type_id: int
    leave_year: int
    available: float

class LeaveBalanceResponse(LeaveBalanceBase):
    id: int
    employee_id: int
    opening_balance: float
    accrued: float
    carry_forward: float
    taken: float
    pending_approval: float
    encashed: float
    leave_type: LeaveTypeResponse
    employee: Optional[EmployeeResponse] = None

    class Config:
        from_attributes = True

# Leave Application Schemas
class LeaveApplicationCreate(BaseModel):
    leave_type_id: int
    duration_type: str = "Full Day"
    from_date: date
    to_date: Optional[date] = None
    number_of_days: float
    reason: str
    attachment: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None

class LeaveApplicationUpdate(BaseModel):
    status: LeaveApplicationStatus
    approver_id: int # Implicitly set by the backend based on current user

class LeaveApplicationResponse(LeaveApplicationCreate):
    id: int
    employee_id: int
    status: LeaveApplicationStatus
    approver_id: Optional[int] = None
    approved_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    employee_name: Optional[str] = None # Helper for UI
    leave_type_name: Optional[str] = None # Helper for UI
    approver_note: Optional[str] = None
    current_approval_step: int = 1

    class Config:
        from_attributes = True

# Public Holiday Schemas
class PublicHolidayBase(BaseModel):
    name: str
    holiday_date: date
    holiday_type: HolidayType
    is_restricted: bool = False
    description: Optional[str] = None
    recurring: bool = False

class PublicHolidayCreate(PublicHolidayBase):
    pass

class PublicHolidayUpdate(BaseModel):
    name: Optional[str] = None
    holiday_date: Optional[date] = None
    holiday_type: Optional[HolidayType] = None
    is_restricted: Optional[bool] = None
    description: Optional[str] = None
    recurring: Optional[bool] = None

class PublicHolidayResponse(PublicHolidayBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class LeaveApprovalAction(BaseModel):
    comments: Optional[str] = None
