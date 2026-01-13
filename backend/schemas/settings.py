from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import re

# --- Company Settings ---

class CompanySettingsBase(BaseModel):
    company_name: str = Field(..., min_length=2)
    trading_name: Optional[str] = None
    registration_number: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    pf_registration: Optional[str] = None
    esi_registration: Optional[str] = None
    registered_address: Optional[str] = None

    @validator("gst_number")
    def validate_gst(cls, v):
        if v and not re.match(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$", v):
            raise ValueError("Invalid GSTIN format")
        return v

    @validator("pan_number")
    def validate_pan(cls, v):
        if v and not re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$", v):
            raise ValueError("Invalid PAN format")
        return v

class CompanySettingsUpdate(CompanySettingsBase):
    pass

class CompanySettingsResponse(CompanySettingsBase):
    id: int
    logo_url: Optional[str] = None
    letterhead_url: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Master Data ---

class MasterBase(BaseModel):
    name: str = Field(..., min_length=1)

class DepartmentCreate(MasterBase):
    description: Optional[str] = None
    head_employee_id: Optional[int] = None

class DepartmentResponse(DepartmentCreate):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class DesignationCreate(MasterBase):
    level: Optional[str] = None # Added grade/level concept

class DesignationResponse(DesignationCreate):
    id: int
    
    class Config:
        from_attributes = True

class EmploymentTypeCreate(MasterBase):
    description: Optional[str] = None

class EmploymentTypeResponse(EmploymentTypeCreate):
    id: int
    
    class Config:
        from_attributes = True
