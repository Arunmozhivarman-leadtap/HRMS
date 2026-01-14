from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_, or_
from datetime import date, datetime, timedelta
from typing import List, Dict, Any, Optional
import calendar

from backend.models.employee import Employee
from backend.models.leave import LeaveApplication, LeaveType, LeaveBalance, LeaveApplicationStatus
from backend.models.document import EmployeeDocument, DocumentVerificationStatus
from backend.schemas.dashboard import DashboardResponse, DashboardStat, Celebration, LeaveBalanceItem, UpcomingLeave

class DashboardService:
    def get_dashboard_data(self, db: Session, current_user: Any) -> DashboardResponse:
        employee = db.query(Employee).filter(Employee.id == current_user.employee_id).first()
        if not employee:
            return None

        # 1. Greeting
        greeting = self._get_greeting(employee.first_name)

        # 2. Role-based Stats
        stats = []
        if current_user.role in ['super_admin', 'hr_admin']:
            stats = self._get_admin_stats(db)
        elif current_user.role == 'manager':
            stats = self._get_manager_stats(db, employee.id)
        else:
            stats = self._get_employee_stats(db, employee.id)

        # 3. Celebrations (Weekly)
        celebrations = self._get_celebrations(db, employee.id, current_user.role)

        # 4. Leave Balances & Upcoming Leave (Mainly for Employee/Manager)
        leave_balances = None
        upcoming_leave = None
        if current_user.role in ['employee', 'manager']:
            leave_balances = self._get_leave_balances(db, employee.id)
            upcoming_leave = self._get_upcoming_leave(db, employee.id)

        # 5. Quick Actions
        quick_actions = self._get_quick_actions(current_user.role)

        return DashboardResponse(
            greeting=greeting,
            stats=stats,
            celebrations=celebrations,
            leave_balances=leave_balances,
            upcoming_leave=upcoming_leave,
            quick_actions=quick_actions
        )

    def _get_greeting(self, first_name: str) -> str:
        hour = datetime.now().hour
        if 5 <= hour < 12:
            period = "morning"
        elif 12 <= hour < 17:
            period = "afternoon"
        else:
            period = "evening"
        return f"Good {period}, {first_name}"

    def _get_admin_stats(self, db: Session) -> List[DashboardStat]:
        total_employees = db.query(func.count(Employee.id)).filter(Employee.employment_status == 'active').scalar()
        
        today = date.today()
        on_leave_today = db.query(func.count(LeaveApplication.id)).filter(
            LeaveApplication.status == LeaveApplicationStatus.approved,
            LeaveApplication.from_date <= today,
            LeaveApplication.to_date >= today
        ).scalar()

        pending_leaves = db.query(func.count(LeaveApplication.id)).filter(
            LeaveApplication.status == LeaveApplicationStatus.pending
        ).scalar()

        pending_docs = db.query(func.count(EmployeeDocument.id)).filter(
            EmployeeDocument.verification_status == DocumentVerificationStatus.pending
        ).scalar()

        return [
            DashboardStat(title="Total Employees", value=str(total_employees), description="Active members", icon="Users", accentColor="bg-blue-500"),
            DashboardStat(title="On Leave Today", value=str(on_leave_today), description="Approved leaves", icon="CalendarClock", accentColor="bg-orange-500"),
            DashboardStat(title="Pending Leaves", value=str(pending_leaves), description="Awaiting approval", icon="Clock", trend="Action needed" if pending_leaves > 0 else None, accentColor="bg-red-500"),
            DashboardStat(title="Pending Documents", value=str(pending_docs), description="Verification required", icon="FileCheck", trend="Check now" if pending_docs > 0 else None, accentColor="bg-purple-500")
        ]

    def _get_manager_stats(self, db: Session, manager_id: int) -> List[DashboardStat]:
        team_members = db.query(Employee).filter(Employee.manager_id == manager_id, Employee.employment_status == 'active').all()
        team_ids = [e.id for e in team_members]
        team_count = len(team_members)

        today = date.today()
        on_leave_today = db.query(func.count(LeaveApplication.id)).filter(
            LeaveApplication.employee_id.in_(team_ids) if team_ids else False,
            LeaveApplication.status == LeaveApplicationStatus.approved,
            LeaveApplication.from_date <= today,
            LeaveApplication.to_date >= today
        ).scalar()

        pending_approvals = db.query(func.count(LeaveApplication.id)).filter(
            LeaveApplication.employee_id.in_(team_ids) if team_ids else False,
            LeaveApplication.status == LeaveApplicationStatus.pending
        ).scalar()

        # Just to fill the 4th card, maybe "Team Attendance" or "Total Tasks"
        # Let's go with "Team Celebrations" count this month
        month = today.month
        team_celebrations = db.query(func.count(Employee.id)).filter(
            Employee.id.in_(team_ids) if team_ids else False,
            or_(
                extract('month', Employee.date_of_birth) == month,
                extract('month', Employee.date_of_joining) == month
            )
        ).scalar()

        return [
            DashboardStat(title="My Team", value=str(team_count), description="Direct reports", icon="Users", accentColor="bg-blue-500"),
            DashboardStat(title="Team On Leave", value=str(on_leave_today), description="Out today", icon="CalendarClock", accentColor="bg-orange-500"),
            DashboardStat(title="Pending Approvals", value=str(pending_approvals), description="Leaves to review", icon="Clock", trend="Action needed" if pending_approvals > 0 else None, accentColor="bg-red-500"),
            DashboardStat(title="Monthly Celebrations", value=str(team_celebrations), description="Birthdays & Work Anniv.", icon="PartyPopper", accentColor="bg-purple-500")
        ]

    def _get_employee_stats(self, db: Session, employee_id: int) -> List[DashboardStat]:
        # Leave Balance
        balances = db.query(LeaveBalance).filter(LeaveBalance.employee_id == employee_id, LeaveBalance.leave_year == date.today().year).all()
        total_balance = sum(float(b.available) for b in balances)
        
        # Pending Docs
        pending_docs = db.query(func.count(EmployeeDocument.id)).filter(
            EmployeeDocument.employee_id == employee_id,
            EmployeeDocument.verification_status == DocumentVerificationStatus.pending
        ).scalar()

        # Approved Leaves (Upcoming)
        today = date.today()
        upcoming_leaves = db.query(func.count(LeaveApplication.id)).filter(
            LeaveApplication.employee_id == employee_id,
            LeaveApplication.status == LeaveApplicationStatus.approved,
            LeaveApplication.from_date > today
        ).scalar()

        # Leaves Used
        leaves_used = sum(float(b.taken) for b in balances)

        return [
            DashboardStat(title="Available Balance", value=str(total_balance), description="Total across all types", icon="Calendar", accentColor="bg-blue-500"),
            DashboardStat(title="Leaves Used", value=str(leaves_used), description="This year so far", icon="CalendarCheck", accentColor="bg-orange-500"),
            DashboardStat(title="Upcoming Leaves", value=str(upcoming_leaves), description="Approved requests", icon="Plane", accentColor="bg-red-500"),
            DashboardStat(title="Docs to Verify", value=str(pending_docs), description="Pending HR check", icon="FileText", trend="Check status" if pending_docs > 0 else None, accentColor="bg-purple-500")
        ]

    def _get_celebrations(self, db: Session, employee_id: int, role: str) -> List[Celebration]:
        today = date.today()
        end_date = today + timedelta(days=7)
        
        celebrations = []
        
        # We need a custom logic to filter by month/day ignoring year
        # Fetch all employees for birthdays/anniversaries (or just team for manager)
        if role == 'manager':
            # Only direct reports
            employees = db.query(Employee).filter(Employee.manager_id == employee_id, Employee.employment_status == 'active').all()
        else:
            # Everyone (or filter by department? Let's go everyone for now)
            employees = db.query(Employee).filter(Employee.employment_status == 'active').all()

        for emp in employees:
            # Check Birthday
            if emp.date_of_birth:
                b_date = emp.date_of_birth
                # Check if this year birthday is in range
                try:
                    this_year_b = date(today.year, b_date.month, b_date.day) if not (b_date.month == 2 and b_date.day == 29 and not calendar.isleap(today.year)) else date(today.year, 3, 1)
                except ValueError:
                     continue
                
                if today <= this_year_b <= end_date:
                    celebrations.append(Celebration(
                        employee_id=emp.id,
                        name=emp.full_name,
                        type="birthday",
                        date="Today" if this_year_b == today else this_year_b.strftime("%d %b"),
                        actual_date=this_year_b,
                        initials=f"{emp.first_name[0]}{emp.last_name[0]}"
                    ))

            # Check Work Anniversary
            if emp.date_of_joining:
                j_date = emp.date_of_joining
                try:
                    this_year_j = date(today.year, j_date.month, j_date.day) if not (j_date.month == 2 and j_date.day == 29 and not calendar.isleap(today.year)) else date(today.year, 3, 1)
                except ValueError:
                     continue
                
                if today <= this_year_j <= end_date and this_year_j > j_date:
                    celebrations.append(Celebration(
                        employee_id=emp.id,
                        name=emp.full_name,
                        type="anniversary",
                        date="Today" if this_year_j == today else this_year_j.strftime("%d %b"),
                        actual_date=this_year_j,
                        years=today.year - j_date.year,
                        initials=f"{emp.first_name[0]}{emp.last_name[0]}"
                    ))

        # Sort by actual date
        celebrations.sort(key=lambda x: x.actual_date)
        return celebrations[:5] # Limit to 5

    def _get_leave_balances(self, db: Session, employee_id: int) -> List[LeaveBalanceItem]:
        balances = db.query(LeaveBalance, LeaveType).join(LeaveType, LeaveBalance.leave_type_id == LeaveType.id)\
            .filter(LeaveBalance.employee_id == employee_id, LeaveBalance.leave_year == date.today().year).all()
        
        items = []
        colors = {
            "earned_holiday": ("bg-blue-500", "bg-blue-100"),
            "sick_leave": ("bg-red-500", "bg-red-100"),
            "casual_leave": ("bg-orange-500", "bg-orange-100"),
            "restricted_holiday": ("bg-zinc-500", "bg-zinc-100"),
        }
        
        for bal, lt in balances:
            color_pair = colors.get(lt.name.value, ("bg-primary", "bg-secondary"))
            # Total for the bar is opening_balance + accrued + carry_forward
            total = float(bal.opening_balance + bal.accrued + bal.carry_forward)
            items.append(LeaveBalanceItem(
                type=lt.name.value.replace('_', ' ').title(),
                balance=float(bal.available),
                total=total if total > 0 else float(lt.annual_entitlement),
                color=color_pair[0],
                bg=color_pair[1]
            ))
        return items

    def _get_upcoming_leave(self, db: Session, employee_id: int) -> Optional[UpcomingLeave]:
        today = date.today()
        upcoming = db.query(LeaveApplication, LeaveType).join(LeaveType, LeaveApplication.leave_type_id == LeaveType.id)\
            .filter(LeaveApplication.employee_id == employee_id, LeaveApplication.status == LeaveApplicationStatus.approved, LeaveApplication.from_date >= today)\
            .order_by(LeaveApplication.from_date.asc()).first()
        
        if upcoming:
            app, lt = upcoming
            return UpcomingLeave(
                type=lt.name.value.replace('_', ' ').title(),
                start_date=app.from_date,
                days=float(app.number_of_days),
                status=app.status.value
            )
        return None

    def _get_quick_actions(self, role: str) -> List[Dict]:
        actions = []
        if role in ['super_admin', 'hr_admin']:
            actions = [
                {"title": "Add Employee", "icon": "Plus", "link": "/dashboard/employees/admin"},
                {"title": "Review Leaves", "icon": "CheckSquare", "link": "/dashboard/leaves/admin"},
                {"title": "Company Settings", "icon": "Settings", "link": "/dashboard/settings/admin/company"},
                {"title": "Document Pool", "icon": "FileStack", "link": "/dashboard/documents/admin"},
            ]
        elif role == 'manager':
            actions = [
                {"title": "My Team", "icon": "Users", "link": "/dashboard/employees/team"},
                {"title": "Approve Leaves", "icon": "CheckCircle", "link": "/dashboard/leaves/manager"},
                {"title": "Apply Leave", "icon": "CalendarPlus", "action": "apply_leave"},
                {"title": "Team Calendar", "icon": "CalendarDays", "link": "/dashboard/leaves"},
            ]
        else:
            actions = [
                {"title": "Apply Leave", "icon": "CalendarPlus", "action": "apply_leave"},
                {"title": "My Documents", "icon": "FileUp", "link": "/dashboard/documents/employee"},
                {"title": "Holiday List", "icon": "Palmtree", "link": "/dashboard/leaves/employee"},
                {"title": "My Profile", "icon": "User", "link": "/dashboard/employees/me"},
            ]
        return actions

dashboard_service = DashboardService()
