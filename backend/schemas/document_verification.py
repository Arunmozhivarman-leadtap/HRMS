from pydantic import BaseModel, Field
from typing import Optional
from models.document import DocumentVerificationStatus

class DocumentVerificationUpdate(BaseModel):
    status: DocumentVerificationStatus
    notes: Optional[str] = Field(None, description="Reason for rejection or comments")
