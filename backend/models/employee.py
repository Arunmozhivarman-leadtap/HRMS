from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.core.database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_code = Column(String, unique=True, index=True, nullable=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    date_of_joining = Column(Date, nullable=True)
    employment_status = Column(String, default="active")  # active, exited, notice
    designation_id = Column(Integer, ForeignKey("designations.id"), nullable=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    employment_type = Column(String, default="full-time")  # full-time, contract, intern
    
    role = Column(String, default="employee")  # admin, hr, manager, employee
    is_active = Column(Boolean, default=True)
    
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    manager_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    
    # Banking Information
    bank_account_holder_name = Column(String(255), nullable=True)
    bank_name = Column(String(255), nullable=True)
    branch_name = Column(String(255), nullable=True)
    account_number = Column(String(255), nullable=True)
    ifsc_code = Column(String(11), nullable=True)
    account_type = Column(String(50), nullable=True) # Savings, Current
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    department = relationship("Department", back_populates="employees", foreign_keys=[department_id])
    designation_rel = relationship("Designation", back_populates="employees")
    location = relationship("Location", back_populates="employees")
    manager = relationship("Employee", remote_side=[id])
    roles = relationship("EmployeeRole", back_populates="employee")
    user = relationship("User", back_populates="employee", uselist=False)

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
