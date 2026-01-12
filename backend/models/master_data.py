from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from backend.core.database import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    state = Column(String(255), nullable=False)
    address = Column(Text, nullable=True)

    employees = relationship("Employee", back_populates="location")
    holidays = relationship("PublicHoliday", back_populates="location")

class Designation(Base):
    __tablename__ = "designations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)

    employees = relationship("Employee", back_populates="designation_rel")
