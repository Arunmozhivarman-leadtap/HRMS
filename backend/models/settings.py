from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from backend.core.database import Base

class CompanySettings(Base):
    __tablename__ = "company_settings"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False)
    trading_name = Column(String(255), nullable=True)
    registration_number = Column(String(100), nullable=True) # CIN/LLP
    gst_number = Column(String(15), nullable=True)
    pan_number = Column(String(10), nullable=True)
    pf_registration = Column(String(100), nullable=True)
    esi_registration = Column(String(100), nullable=True)
    registered_address = Column(Text, nullable=True)
    logo_url = Column(String(255), nullable=True)
    letterhead_url = Column(String(255), nullable=True)
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class EmploymentType(Base):
    __tablename__ = "employment_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False) # Full-time, Part-time, etc.
    description = Column(String(255), nullable=True)
