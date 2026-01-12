from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date

class EmployeeBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    employee_code: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    date_of_joining: Optional[date] = None
    employment_status: str = "active"
    designation: Optional[str] = None
    employment_type: str = "full-time"
    role: str = "employee"
    is_active: bool = True
    department_id: Optional[int] = None
    manager_id: Optional[int] = None
    
    # Banking Information
    bank_account_holder_name: Optional[str] = None
    bank_name: Optional[str] = None
    branch_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    account_type: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    password: str

class BankingInfoUpdate(BaseModel):
    bank_account_holder_name: str
    bank_name: str
    branch_name: str
    account_number: str
    confirm_account_number: str
    ifsc_code: str
    account_type: str

class EmployeeUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    is_active: Optional[bool] = None

class EmployeeResponse(EmployeeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    full_name: str

    class Config:
        from_attributes = True
