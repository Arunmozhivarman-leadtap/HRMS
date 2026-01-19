from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import date
from models.leave import LeaveApplicationStatus

class Celebration(BaseModel):
    employee_id: int
    name: str
    type: str  # birthday, anniversary
    date: str  # Today, 15 Jan, etc.
    actual_date: date
    years: Optional[int] = None
    avatar: Optional[str] = None
    initials: str

class DashboardStat(BaseModel):
    title: str
    value: str
    description: Optional[str] = None
    trend: Optional[str] = None
    trendUp: Optional[bool] = None
    accentColor: str

class LeaveBalanceItem(BaseModel):
    type: str
    balance: float
    total: float
    color: str
    bg: str

class UpcomingLeave(BaseModel):
    type: str
    start_date: date
    days: float
    status: str

class DashboardResponse(BaseModel):
    greeting: str
    stats: List[DashboardStat]
    celebrations: List[Celebration]
    leave_balances: Optional[List[LeaveBalanceItem]] = None
    upcoming_leave: Optional[UpcomingLeave] = None
    quick_actions: List[Dict]
