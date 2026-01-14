# HRMS - Comprehensive Test Plan

**Version:** 1.0
**Date:** 2026-01-14
**Scope:** Backend API & Frontend UI
**Roles:** Super Admin, HR Admin, Manager, Employee

---

## 1. Authentication & Security (AUTH)

| ID | Title | Preconditions | Steps | Expected Result | Priority | Auto |
|----|-------|---------------|-------|-----------------|----------|------|
| **AUTH-001** | Employee Login (Email/Password) | User exists with valid credentials | 1. Navigate to Login Page<br>2. Enter valid Email & Password<br>3. Click "Sign In" | 1. User redirected to Dashboard<br>2. JWT Tokens (access, refresh) set in HttpOnly cookies | P0 | Yes |
| **AUTH-002** | Login Failure (Invalid Credentials) | User exists | 1. Navigate to Login Page<br>2. Enter invalid Password<br>3. Click "Sign In" | 1. Error message "Incorrect email or password" displayed<br>2. User remains on Login Page | P1 | Yes |
| **AUTH-003** | Google SSO Login | None | 1. Navigate to Login Page<br>2. Click "Sign in with Google" | 1. Mock SSO flow succeeds (Proto: specific mock token)<br>2. User redirected to Dashboard | P1 | Yes |
| **AUTH-004** | Session Logout | User is logged in | 1. Click User Avatar in Sidebar<br>2. Click "Sign Out" | 1. Cookies cleared<br>2. Redirected to Login Page | P1 | Yes |
| **AUTH-005** | RBAC - Admin Routes Protection | User logged in as "Employee" | 1. Attempt to access `/dashboard/settings/admin/company` directly via URL | 1. User redirected to Dashboard or 403 Forbidden page displayed | P0 | Yes |
| **AUTH-006** | Token Refresh | Access token expired, Refresh token valid | 1. Perform any API action (e.g., fetch profile) | 1. Backend refreshes token transparently<br>2. Action succeeds without logout | P2 | Yes |
| **AUTH-007** | Password Complexity Enforce | User (Any) | 1. Sign up/Reset Password<br>2. Enter "123" | 1. Validation Error: "Min 8 chars, 1 special char" | P2 | Yes |
| **AUTH-008** | Brute Force Lockout | Malicious Actor | 1. Attempt login 5 times with wrong password | 1. Account locked for X minutes<br>2. Email notification sent | P1 | Yes |
| **AUTH-009** | Deactivated User Login | Archived Employee | 1. Attempt login with valid credentials | 1. Login denied: "Account Deactivated" | P0 | Yes |

---

## 2. Employee Management (EMP)

| ID | Title | Preconditions | Steps | Expected Result | Priority | Auto |
|----|-------|---------------|-------|-----------------|----------|------|
| **EMP-001** | Create New Employee (Admin) | Logged in as HR Admin/Super Admin | 1. Go to Employees > Admin Control<br>2. Click "New Employee"<br>3. Fill Steps 1-4 (Basic, Employment, Personal, Statutory)<br>4. Submit | 1. "Employee Created" toast appears<br>2. Employee listed in Directory<br>3. User account created automatically | P0 | Yes |
| **EMP-002** | View Employee Profile (Self) | Logged in as Employee | 1. Navigate to "My Profile" | 1. Profile card shows correct details<br>2. Personal/Banking tabs are editable<br>3. Employment tab is Read-Only | P1 | Yes |
| **EMP-003** | Update Banking Info | Logged in as Employee | 1. Go to My Profile > Banking<br>2. Change Account Number<br>3. Click Save | 1. Success toast appears<br>2. Data persists on reload | P1 | Yes |
| **EMP-004** | Manager Team View | Logged in as Manager | 1. Navigate to Employees > Team Desk | 1. List of direct reports is displayed<br>2. Cannot see employees from other depts | P1 | Yes |
| **EMP-005** | Archive Employee | Logged in as Admin | 1. Go to Admin Employee Table<br>2. Select active employee -> Archive | 1. Employee status changes to "Archived"<br>2. User login disabled (Backend check) | P2 | Yes |
| **EMP-006** | Profile Photo Upload | Logged in as Employee | 1. Click Camera icon on Profile Card<br>2. Upload JPG < 2MB | 1. Image uploads successfully<br>2. Avatar updates immediately | P2 | Yes |
| **EMP-007** | Manager Editing Other Dept | Manager (Sales) | 1. Attempt to edit Employee (Engineering) via API/URL | 1. 403 Forbidden<br>2. UI redirects to error page | P1 | Yes |
| **EMP-008** | Duplicate Employee Code | HR Admin | 1. Create Employee<br>2. Enter existing "EMP001" | 1. Validation Error: "Employee Code already exists" | P2 | Yes |
| **EMP-009** | PII Masking (Bank Details) | Manager | 1. View Direct Report Profile > Banking | 1. Account Number masked (e.g. ****1234)<br>2. Full view restricted | P2 | Yes |

---

## 3. Leave Management (LEAVE)

### Configuration
| ID | Title | Preconditions | Steps | Expected Result | Priority | Auto |
|----|-------|---------------|-------|-----------------|----------|------|
| **LEAVE-CFG-01** | Create Leave Type | Logged in as Super Admin | 1. Settings > Leave Policies > "New Leave Category"<br>2. Name: "Remote Work", Abbr: "WFH", Quota: 10<br>3. Save | 1. New type appears in list<br>2. Available for employees to apply | P2 | Yes |
| **LEAVE-CFG-02** | Add Public Holiday | Logged in as HR Admin | 1. Settings > Leave Policies > "Add Holiday"<br>2. Set Date, Name, Type<br>3. Save | 1. Holiday appears in calendar<br>2. Affects working day calculations | P2 | Yes |
| **LEAVE-CFG-03** | Manager Access Config | Manager | 1. Navigate to `/dashboard/settings/leaves` | 1. 403 Forbidden / Redirect to Dashboard | P1 | Yes |

### Application Flow
| ID | Title | Preconditions | Steps | Expected Result | Priority | Auto |
|----|-------|---------------|-------|-----------------|----------|------|
| **LEAVE-APP-01** | Apply Leave (Happy Path) | Employee has balance | 1. Dashboard > Apply Leave<br>2. Select "Earned Leave", Dates (Mon-Tue)<br>3. Reason: "Personal"<br>4. Submit | 1. Application created (Status: Pending)<br>2. Balance reserved (Available decreases) | P0 | Yes |
| **LEAVE-APP-02** | Insufficient Balance Check | Employee has 0 CL | 1. Apply for 1 day Casual Leave | 1. System blocks request OR<br>2. Warns & converts to "Loss of Pay" (if logic enabled) | P1 | Yes |
| **LEAVE-APP-03** | Overlap Validation | Existing leave on Jan 10 | 1. Apply for new leave including Jan 10 | 1. Error: "Request overlaps with existing application" | P1 | Yes |
| **LEAVE-APP-04** | Holiday Exclusion | Jan 26 is Holiday | 1. Apply leave Jan 25 to Jan 27 (3 days range) | 1. Calculated days = 2 (Jan 26 excluded)<br>2. User notified of deduction count | P2 | Yes |
| **LEAVE-APP-05** | Mandatory Document Check | "Sick Leave" requires doc | 1. Apply Sick Leave > 2 days<br>2. Leave attachment empty<br>3. Submit | 1. Validation Error: "Supporting document is required" | P2 | Yes |
| **LEAVE-APP-06** | Backdated Leave (Policy) | Employee | 1. Apply for date 30 days ago | 1. Error: "Cannot apply for past dates > 3 days" (Config dependent) | P2 | Yes |
| **LEAVE-APP-07** | Gender Specific Leave | Male Employee | 1. Try to apply "Maternity Leave" | 1. Option hidden OR Error on submission | P2 | Yes |

### Approval Workflow
| ID | Title | Preconditions | Steps | Expected Result | Priority | Auto |
|----|-------|---------------|-------|-----------------|----------|------|
| **LEAVE-WF-01** | Manager Approval | Pending Request exists | 1. Manager logs in > Leave > Team Desk<br>2. Finds request > Click "Approve" | 1. Status -> Approved<br>2. Balance deduction finalized<br>3. Employee sees "Approved" | P0 | Yes |
| **LEAVE-WF-02** | Rejection Reversal | Pending Request exists | 1. Manager logs in > Click "Reject" with Reason | 1. Status -> Rejected<br>2. Reserved balance credited back to Employee | P1 | Yes |
| **LEAVE-WF-03** | Cancellation (Employee) | Pending Request exists | 1. Employee > Leave History<br>2. Click "Cancel" (Trash icon) | 1. Application deleted/cancelled<br>2. Balance restored | P2 | Yes |
| **LEAVE-WF-04** | Approve Own Leave | Manager | 1. Apply Leave as Manager<br>2. Try to Approve self | 1. Self-approval blocked<br>2. Escalates to Next Level/HR | P1 | Yes |

### Credit (Comp Off)
| ID | Title | Preconditions | Steps | Expected Result | Priority | Auto |
|----|-------|---------------|-------|-----------------|----------|------|
| **LEAVE-CR-01** | Request Leave Credit | Worked on Holiday | 1. Employee > Request Credit<br>2. Select Date Worked, Reason<br>3. Submit | 1. Credit Request created (Status: Pending) | P2 | Yes |
| **LEAVE-CR-02** | Approve Credit | Pending Credit Request | 1. Manager > Team Desk > Credits<br>2. Approve | 1. CO Balance increases by 1 | P2 | Yes |
| **LEAVE-CR-03** | Future Credit Request | Employee | 1. Request Credit for tomorrow | 1. Validation Error: "Cannot claim credit for future dates" | P2 | Yes |

---

## 4. Document Management (DOC)

| ID | Title | Preconditions | Steps | Expected Result | Priority | Auto |
|----|-------|---------------|-------|-----------------|----------|------|
| **DOC-001** | Upload Document | Logged in as Employee | 1. Documents > My Documents<br>2. PAN Card > Click Upload<br>3. Select File | 1. File uploaded<br>2. Status: "Pending Review" | P0 | Yes |
| **DOC-002** | Verify Document | Logged in as HR Admin | 1. Documents > Verification Queue<br>2. Open Pending Doc > Click "Approve" | 1. Status -> Verified<br>2. Employee sees "Verified" badge | P1 | Yes |
| **DOC-003** | Reject Document | Logged in as HR Admin | 1. Documents > Verification Queue<br>2. Click "Reject" > Enter Note | 1. Status -> Rejected<br>2. Note visible to Employee | P1 | Yes |
| **DOC-004** | Role Access (Manager) | Logged in as Manager | 1. Documents > Team Documents | 1. View ONLY Verified documents of direct reports<br>2. Cannot see pending/rejected docs of team | P2 | Yes |
| **DOC-005** | Invalid File Type | Employee | 1. Upload `.exe` or `.sh` file | 1. Upload rejected "Invalid file type"<br>2. Security alert logged | P1 | Yes |
| **DOC-006** | File Size Limit | Employee | 1. Upload PDF > 10MB | 1. Upload rejected "File too large" | P2 | Yes |
| **DOC-007** | Delete Verified Doc | Employee | 1. My Documents > Verified Doc<br>2. Click Delete | 1. Action Blocked "Cannot delete verified documents" | P2 | Yes |

---

## 5. Settings & Master Data (SET)

| ID | Title | Preconditions | Steps | Expected Result | Priority | Auto |
|----|-------|---------------|-------|-----------------|----------|------|
| **SET-001** | Update Company Info | Logged in as Super Admin | 1. Settings > Company Profile<br>2. Update Address/GST<br>3. Save | 1. Changes saved<br>2. Audit log entry created | P2 | Yes |
| **SET-002** | Add Designation | Logged in as HR Admin | 1. Settings > Master Data > Designations<br>2. Add "Principal Engineer" | 1. Available in Employee Creation dropdown | P2 | Yes |
| **SET-003** | Duplicate Department | HR Admin | 1. Create Dept "Sales"<br>2. Create "Sales" again | 1. Error: "Department name must be unique" | P2 | Yes |
| **SET-004** | Empty Master Data | HR Admin | 1. Create Designation with empty name | 1. Client-side validation blocks submit | P2 | Yes |

---

## 6. Audit & Compliance (AUDIT)

| ID | Title | Preconditions | Steps | Expected Result | Priority | Auto |
|----|-------|---------------|-------|-----------------|----------|------|
| **AUD-001** | Audit Log Creation | None | 1. Perform critical action (Update Employee / Change Settings) | 1. Entry added to `audit_logs` table with User ID, Action, and Timestamp | P1 | Yes |
| **AUD-002** | Sensitive Data Change | HR Admin | 1. Update Employee Salary/Bank Info | 1. Audit Log captures: User, IP, Old Value, New Value | P1 | Yes |

---

## Automation Feasibility Summary

- **Frontend Tests (Playwright/Cypress):** High. All UI flows (Login, Apply Leave, Upload) are standard and selector-friendly.
- **Backend Tests (Pytest):** High. Service layer logic (Leave calculations, Balance updates, RBAC) is isolated and testable.
- **Integration:** End-to-end flows like "Apply -> Approve -> Check Balance" are prime candidates for automation.