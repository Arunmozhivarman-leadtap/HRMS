from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.core.database import Base
import enum

class UserRole(str, enum.Enum):
    super_admin = "super_admin"
    hr_admin = "hr_admin"
    manager = "manager"
    employee = "employee"
    candidate = "candidate"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    
    employee_id = Column(Integer, ForeignKey("employees.id"), unique=True, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship to Employee
    employee = relationship("Employee", back_populates="user")
