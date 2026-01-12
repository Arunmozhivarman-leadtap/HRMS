from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.core.database import Base
import enum

class LeaveCreditStatus(str, enum.Enum):
    pending = 'pending'
    approved = 'approved'
    rejected = 'rejected'

class LeaveCreditRequest(Base):
    __tablename__ = "leave_credit_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"))
    leave_type_id = Column(Integer, ForeignKey("leave_types.id")) # Usually defaults to CO, but flexible
    date_worked = Column(Date, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(Enum(LeaveCreditStatus), default=LeaveCreditStatus.pending, nullable=False)
    approver_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    approved_date = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    employee = relationship("Employee", foreign_keys=[employee_id], backref="credit_requests")
    leave_type = relationship("LeaveType")
    approver = relationship("Employee", foreign_keys=[approver_id])
