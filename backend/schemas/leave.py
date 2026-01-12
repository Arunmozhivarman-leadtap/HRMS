from pydantic import BaseModel, Field, condecimal
from typing import Optional, List
from datetime import date, datetime
from backend.models.leave import LeaveTypeEnum, LeaveApplicationStatus, HolidayType

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
    max_consecutive_days: Optional[int] = None

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

    class Config:
        from_attributes = True

# Public Holiday Schemas
class PublicHolidayBase(BaseModel):
    name: str
    holiday_date: date
    holiday_type: HolidayType
    location_id: Optional[int] = None
    is_restricted: bool = False
    description: Optional[str] = None
    recurring: bool = False

class PublicHolidayResponse(PublicHolidayBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
