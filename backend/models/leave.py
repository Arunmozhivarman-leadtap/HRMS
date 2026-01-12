from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Date, Numeric, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from backend.core.database import Base
import enum

class LeaveTypeEnum(str, enum.Enum):
    earned_leave = 'earned_leave'
    casual_leave = 'casual_leave'
    sick_leave = 'sick_leave'
    compensatory_off = 'compensatory_off'
    loss_of_pay = 'loss_of_pay'
    maternity_leave = 'maternity_leave'
    paternity_leave = 'paternity_leave'
    bereavement_leave = 'bereavement_leave'
    marriage_leave = 'marriage_leave'
    adoption_leave = 'adoption_leave'
    restricted_holiday = 'restricted_holiday'

class LeaveApplicationStatus(str, enum.Enum):
    pending = 'pending'
    approved = 'approved'
    rejected = 'rejected'
    cancelled = 'cancelled'

class HolidayType(str, enum.Enum):
    national = 'national'
    festival = 'festival'
    state = 'state'
    declared = 'declared'

class LeaveType(Base):
    __tablename__ = "leave_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Enum(LeaveTypeEnum), nullable=False)
    abbr = Column(String(10), nullable=False)
    annual_entitlement = Column(Integer, nullable=False)
    carry_forward = Column(Boolean, default=False)
    max_carry_forward = Column(Integer, nullable=True)
    encashment = Column(Boolean, default=False)
    max_encashment_per_year = Column(Integer, nullable=True)
    min_balance_to_encash = Column(Integer, nullable=True)
    accrual_method = Column(String(50), nullable=False)
    pro_rata_settings = Column(JSONB, nullable=True)
    negative_balance_allowed = Column(Boolean, default=False)
    requires_approval = Column(Boolean, default=True)
    min_days_in_advance = Column(Integer, nullable=True)
    max_consecutive_days = Column(Integer, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class LeaveBalance(Base):
    __tablename__ = "leave_balances"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"))
    leave_type_id = Column(Integer, ForeignKey("leave_types.id"))
    leave_year = Column(Integer, nullable=False)
    opening_balance = Column(Numeric(5, 2), default=0)
    accrued = Column(Numeric(5, 2), default=0)
    carry_forward = Column(Numeric(5, 2), default=0)
    taken = Column(Numeric(5, 2), default=0)
    pending_approval = Column(Numeric(5, 2), default=0)
    available = Column(Numeric(5, 2), nullable=False)
    encashed = Column(Numeric(5, 2), default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    employee = relationship("Employee", backref="leave_balances")
    leave_type = relationship("LeaveType")

class LeaveApplication(Base):
    __tablename__ = "leave_applications"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"))
    leave_type_id = Column(Integer, ForeignKey("leave_types.id"))
    duration_type = Column(String(50)) # Full Day, Half Day, etc.
    from_date = Column(Date, nullable=False)
    to_date = Column(Date, nullable=True)
    number_of_days = Column(Numeric(5, 2), nullable=False)
    reason = Column(Text, nullable=False)
    attachment = Column(Text, nullable=True)
    status = Column(Enum(LeaveApplicationStatus), default=LeaveApplicationStatus.pending, nullable=False)
    approver_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    approved_date = Column(DateTime(timezone=True), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(10), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    employee = relationship("Employee", foreign_keys=[employee_id], backref="leave_applications")
    leave_type = relationship("LeaveType")
    approver = relationship("Employee", foreign_keys=[approver_id])

class PublicHoliday(Base):
    __tablename__ = "public_holidays"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    holiday_date = Column(Date, nullable=False, index=True)
    holiday_type = Column(Enum(HolidayType), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    is_restricted = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    recurring = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    location = relationship("Location", back_populates="holidays")
