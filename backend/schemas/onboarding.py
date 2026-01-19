from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from backend.models.candidate import CandidateStatus

# --- Candidate Management (Admin) ---

class CandidateBase(BaseModel):
    full_name: str = Field(..., min_length=2)
    personal_email: EmailStr
    mobile_number: str = Field(..., pattern=r"^\d{10}$")
    designation_id: int
    department_id: int
    reporting_manager_id: int
    employment_type: str
    expected_joining_date: date
    work_location: Optional[str] = "Office"
    ctc: Optional[int] = None
    salary_structure: Optional[Dict[str, Any]] = None
    
    # Optional
    alternate_email: Optional[EmailStr] = None
    linkedin_profile: Optional[str] = None
    referral_source: Optional[str] = None
    referred_by_id: Optional[int] = None
    notes: Optional[str] = None

class CandidateCreate(CandidateBase):
    pass

class CandidateUpdate(BaseModel):
    full_name: Optional[str] = None
    personal_email: Optional[EmailStr] = None
    mobile_number: Optional[str] = None
    expected_joining_date: Optional[date] = None
    status: Optional[CandidateStatus] = None
    ctc: Optional[int] = None
    salary_structure: Optional[Dict[str, Any]] = None

class CandidateResponse(CandidateBase):
    id: int
    status: CandidateStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    offer_token_expiry: Optional[datetime] = None
    onboarding_progress: float = 0.0
    missing_required_items: List[str] = []

    class Config:
        from_attributes = True

# --- Offer Letter ---

class OfferGenerationRequest(BaseModel):
    expiry_days: int = 7
    # In future: template_id, custom_clauses

# --- Portal (Candidate View) ---

class PortalAccessResponse(BaseModel):
    candidate: CandidateResponse
    checklist: List[Dict[str, Any]] # List of tasks with status
    offer_valid: bool

class OfferActionRequest(BaseModel):
    action: str # "accept" | "reject"
    reason: Optional[str] = None

class OnboardingTaskResponse(BaseModel):
    id: int
    name: str
    status: str
    required: bool
    uploaded_file: Optional[str] = None

class OnboardingChecklistItemSchema(BaseModel):
    id: int
    name: str
    category: str
    required: bool

    class Config:
        from_attributes = True

class OnboardingTaskDetail(BaseModel):
    id: int
    candidate_id: int
    checklist_item_id: int
    status: str
    uploaded_file: Optional[str] = None
    checklist_item: OnboardingChecklistItemSchema

    class Config:
        from_attributes = True
