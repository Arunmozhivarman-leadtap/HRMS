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

class EmployeeCreate(EmployeeBase):
    password: str

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
