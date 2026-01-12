from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List
from backend.models.document import DocumentType, DocumentVerificationStatus

class EmployeeSimple(BaseModel):
    id: int
    first_name: str
    last_name: str
    employee_code: Optional[str] = None

    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    document_type: DocumentType
    expiry_date: Optional[date] = None

class DocumentCreate(DocumentBase):
    employee_id: int

class DocumentUpdate(BaseModel):
    verification_status: Optional[DocumentVerificationStatus] = None
    notes: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: int
    employee_id: int
    employee: Optional[EmployeeSimple] = None
    file_path: str
    verification_status: DocumentVerificationStatus
    verified_by_id: Optional[int] = None
    verified_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
