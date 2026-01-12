from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.core.database import Base
import enum

class DocumentType(str, enum.Enum):
    aadhaar_card = "aadhaar_card"
    pan_card = "pan_card"
    passport = "passport"
    voter_id = "voter_id"
    driving_licence = "driving_licence"
    bank_details = "bank_details"
    cancelled_cheque = "cancelled_cheque"
    tenth_marksheet = "10th_marksheet"
    twelfth_marksheet = "12th_marksheet"
    degree_certificate = "degree_certificate"
    provisional_certificate = "provisional_certificate"
    post_graduate_degree = "post_graduate_degree"
    professional_certifications = "professional_certifications"
    previous_offer_letters = "previous_offer_letters"
    relieving_letter = "relieving_letter"
    experience_letter = "experience_letter"
    last_3_payslips = "last_3_payslips"
    form_16 = "form_16"
    appointment_letter = "appointment_letter"
    passport_size_photo = "passport_size_photo"
    address_proof = "address_proof"
    marriage_certificate = "marriage_certificate"
    medical_fitness_certificate = "medical_fitness_certificate"

class DocumentVerificationStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"
    reupload_required = "reupload_required"
    expired = "expired"

class EmployeeDocument(Base):
    __tablename__ = "employee_documents"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(Enum(DocumentType), nullable=False)
    file_path = Column(String(255), nullable=False)
    expiry_date = Column(Date, nullable=True)
    verification_status = Column(Enum(DocumentVerificationStatus), default=DocumentVerificationStatus.pending, nullable=False)
    verified_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_date = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    employee = relationship("Employee", backref="documents")
    verified_by = relationship("User")
