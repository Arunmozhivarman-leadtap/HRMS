from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Enum, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.core.database import Base
import enum

class CandidateStatus(str, enum.Enum):
    created = "created"
    offer_ready = "offer_ready"
    sent = "sent"
    accepted = "accepted"
    rejected = "rejected"
    negotiating = "negotiating"
    onboarding = "onboarding"

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    personal_email = Column(String(255), nullable=False)
    mobile_number = Column(String(10), nullable=False)
    designation_id = Column(Integer, ForeignKey("designations.id"))
    department_id = Column(Integer, ForeignKey("departments.id"))
    reporting_manager_id = Column(Integer, ForeignKey("employees.id"))
    location_id = Column(Integer, ForeignKey("locations.id"))
    employment_type = Column(String(50), nullable=False) # Enum in schema, but string for flexibility here or matching employment_type enum
    expected_joining_date = Column(Date, nullable=False)
    alternate_email = Column(String(255))
    linkedin_profile = Column(String(255))
    referral_source = Column(String(255))
    referred_by_id = Column(Integer, ForeignKey("employees.id"))
    notes = Column(Text)
    status = Column(Enum(CandidateStatus), default=CandidateStatus.created, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class OnboardingChecklistItem(Base):
    __tablename__ = "onboarding_checklist_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(255), nullable=False)
    required = Column(Boolean, default=True)
    due_relative = Column(String(50))

class CandidateOnboardingTask(Base):
    __tablename__ = "candidate_onboarding_tasks"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"))
    checklist_item_id = Column(Integer, ForeignKey("onboarding_checklist_items.id"))
    status = Column(String(50), default="pending", nullable=False)
    due_date = Column(Date)
    uploaded_file = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    candidate = relationship("Candidate", backref="onboarding_tasks")
    checklist_item = relationship("OnboardingChecklistItem")
