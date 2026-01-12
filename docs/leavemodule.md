# Leave Management Module – Complete Implementation Plan (Frontend + Backend)

**Version:** 1.0  
**Date:** 9 January 2026  
**Module:** Leave Management  
**Status:** Backend almost complete (95% done). Frontend partially done (Employee role implemented, others pending).

This single document covers **both backend verification/fixes** and **frontend phased implementation** in a clear, orderly sequence.

The main goal is to:
- Verify and complete any missing backend features.
- Refactor employee frontend if needed.
- Implement full frontend for all roles with perfect UI consistency.

## Core References
- `permissions.json`: Defines role-based access (apply_leave, approve_leave_team, approve_leave, manage_system_config)
- `dbschema.md`: Full schema with leave_types, leave_balances, leave_applications, public_holidays, get_team_employee_ids()
- `hr-system-specification-Version_2.0.md`: Section 4.3 – Detailed leave policy, workflow, UI examples

## Overall Execution Rule
**Always work in phases.**  
After completing **any phase**, end your response with:  
**"Phase [X] completed. Have you reviewed and tested the generated/fixed code? Shall I proceed to the next phase?"**

## Phase 0: Backend Verification & Completion

**Assumption**: Backend is "almost completed" — we must confirm and fix only what's missing.

### Required Backend Features Checklist

| Feature | Expected Endpoint | Status (Assumed) | Action Needed |
|-------|-------------------|------------------|---------------|
| Get all leave types | `GET /api/leave-types` | Done | Verify |
| Create/Edit/Delete leave type | `POST/PUT/DELETE /api/leave-types` | Likely missing full fields | Add missing config fields (carry_forward, accrual_method, pro_rata_settings, etc.) |
| Get my leave balances | `GET /api/my/leave-balances` | Done | Verify pro-rata & current year |
| Get team leave balances | `GET /api/team/leave-balances` | Possibly missing | Implement using get_team_employee_ids() |
| Apply leave | `POST /api/leave-applications` | Done | Verify: holiday exclusion, balance check, attachment, advance notice |
| Get my leave history | `GET /api/my/leave-applications` | Done | Add filters |
| Get team pending leaves | `GET /api/team/leave-applications/pending` | Likely missing | Implement |
| Get all pending leaves | `GET /api/leave-applications/pending` | Likely missing | Implement |
| Approve/Reject leave | `PATCH /api/leave-applications/:id/approve` or `/reject` | Done | Verify balance update & permissions |
| Cancel pending leave | `PATCH /api/leave-applications/:id/cancel` | Done | Verify balance restore |
| Public holidays by date range & location | `GET /api/public-holidays?from=&to=&location_id=` | Critical for day calc | Ensure implemented |

### Phase 0 Tasks (Backend Fixes)
1. Ask for current list of leave-related controllers/routes.
2. Identify gaps from the table above.
3. Implement/fix:
   - Full leave_types CRUD with **all schema fields** (especially JSONB pro_rata_settings)
   - Team endpoints using `get_team_employee_ids()`
   - Proper holiday-aware day calculation in apply leave
   - Strict role-based middleware (manager only team, super_admin config)


## Phase 1: Refactor Employee Role Frontend

**Goal**: Ensure existing employee leave pages fully match spec.

**Features to Verify & Refactor**:
- Leave balance cards/table (show available, pending, taken per type)
- Apply Leave form:
  - Leave type dropdown
  - Date range picker (react-datepicker)
  - Auto day count (exclude holidays & weekends)
  - Half-day support
  - Reason + optional attachment upload
  - Real-time balance validation feedback
  - Contact details during leave
- Leave history table with status badges, approver comments, attachment link
- Cancel button for pending leaves

**UI Consistency**:
- Match dashboard header, sidebar
- Use same table style as `/dashboard/leaves/employees`
- Card layout for balances
- Toast notifications

## Phase 2: Manager Role – Team Leave Approvals

**Goal**: Build manager-specific views.

**Features**:
- Navigation tab: "Team Leaves"
- Pending approvals table (direct + indirect reports)
- Columns: Employee, Photo, Leave Type, Dates, Days, Reason (truncated), Applied On, Attachment
- Filters: Status, Date range, Employee search
- Action: Approve / Reject with comment modal
- History tab for past team approvals
- Bulk approve/reject (optional)

**Permission**: Only if user.role === 'manager' && approve_leave_team

## Phase 3: HR Admin / Super Admin – Global Leave Dashboard

**Goal**: Company-wide leave management.

**Features**:
- "All Leaves" table with advanced filters (department, location, status, year)
- Pending approvals queue (company-wide)
- View any employee's leave history & balances
- Detail modal: Full reason, attachment preview, approval history
- Approve/Reject actions (same as manager)

**Permission**: hr_admin & super_admin (approve_leave)

## Phase 4: Leave Policy Configuration (Super Admin Only)

**Goal**: Full leave type management.

**Features**:
- Page: Settings → Leave Policies
- Table of all leave types
- Add/Edit modal with all fields:
  - Name, Abbreviation
  - Annual entitlement
  - Carry forward (yes/no + max)
  - Encashment options
  - Accrual method (monthly/annual/etc.)
  - Pro-rata settings (JSON editor or form)
  - Negative balance allowed
  - Requires approval
  - Min days in advance
  - Max consecutive days
- Delete with confirmation

**Permission**: Only super_admin (manage_system_config)

## Phase 5: Leave Reports & Analytics

**Goal**: Reporting for Manager (team), HR/Admin (company)

**Features**:
- Leave Balance Report
- Leave Utilization Summary
- Monthly/Yearly trends
- Export to Excel/PDF
- Filters: Department, Location, Year

**UI**: Consistent with other reports section

## Phase 6: Final Integration & Polish

**Tasks**:
- Ensure holidays are highlighted/disabled in date picker
- Real-time notifications (in-app toast + badge)
- Mobile responsiveness
- Accessibility (ARIA labels, keyboard nav)
- Loading states, error handling
- Documentation in code
