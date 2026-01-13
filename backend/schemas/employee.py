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
    designation_id: Optional[int] = None
    employment_type: str = "full-time"
    role: str = "employee"
    is_active: bool = True
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    marital_status: Optional[str] = None
    personal_email: Optional[EmailStr] = None
    
    # Emergency Contact
    emergency_contact_name: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    
    department_id: Optional[int] = None
    manager_id: Optional[int] = None
    
    # Banking Information
    bank_account_holder_name: Optional[str] = None
    bank_name: Optional[str] = None
    branch_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    account_type: Optional[str] = None
    
    # Statutory Information
    pan_number: Optional[str] = None
    aadhaar_number: Optional[str] = None
    uan_number: Optional[str] = None
    esic_number: Optional[str] = None
    
    profile_photo: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    password: str

class BankingInfoUpdate(BaseModel):
    bank_account_holder_name: str
    bank_name: str
    branch_name: str
    account_number: str
    ifsc_code: str
    account_type: str

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    marital_status: Optional[str] = None
    personal_email: Optional[EmailStr] = None
    date_of_joining: Optional[date] = None
    
    # Emergency Contact
    emergency_contact_name: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    
    # Admin only fields (should be handled by RBAC in service/API)
    designation_id: Optional[int] = None
    department_id: Optional[int] = None
    manager_id: Optional[int] = None
    employment_type: Optional[str] = None
    employment_status: Optional[str] = None
    employee_code: Optional[str] = None
    is_active: Optional[bool] = None
    
    # Banking
    bank_account_holder_name: Optional[str] = None
    bank_name: Optional[str] = None
    branch_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    account_type: Optional[str] = None
    
    # Statutory
    pan_number: Optional[str] = None
    aadhaar_number: Optional[str] = None
    uan_number: Optional[str] = None
    esic_number: Optional[str] = None

class EmployeeResponse(EmployeeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    full_name: str
    archived_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EmployeeListResponse(BaseModel):
    items: List[EmployeeResponse]
    total: int
    page: int
    size: int
