# Employee Management Module

**Module Purpose**  
This module allows authorized users to **directly create, view, update, and manage employee records** in the system — bypassing the standard onboarding workflow from candidates. It is primarily intended for HR/Admin use cases such as bulk imports, emergency hires, contractor conversions, data corrections, or legacy employee migrations.

**Important Constraints**  
- This is **not** the onboarding module (4.1).  
- Employee creation here does **not** trigger offer letter workflows, candidate portals, or pre-joining checklists.  
- All actions must maintain full audit trail, India-specific compliance (PII encryption, masking, retention rules), and respect the role hierarchy defined in Section 3 of the specification.

## 1. Module Scope & Features

### Core CRUD Operations

| Action          | Description                                                                 | UI Location                  | Export / Bulk Support |
|-----------------|-----------------------------------------------------------------------------|------------------------------|------------------------|
| Create Employee | Add a new employee record with  required fields                      | Admin → Employees → + New    | Yes (CSV/Excel import) |
| View List       | Paginated, searchable, filterable list of employees                         | Admin → Employees            | Yes                    |
| View Detail     | Full employee profile (personal, employment, statutory, banking) | Click on employee row        | —                      |
| Edit Employee   | Update any field (subject to role restrictions)                             | Detail page → Edit           | Limited bulk edit      |
| Archive         | Soft-delete / archive record (no hard delete allowed)                       | Detail page → Archive        | Bulk archive           |
| Export          | Export filtered list or single record (PDF/Excel)                           | List & Detail pages          | Yes                    |

**No hard deletion** is allowed — records must be archived to comply with 8-year retention for employment/salary records (Section 7.3).

### Required Fields for New Employee Creation

Check employee schema for required fields.


## 2. Role-Based Access Control (RBAC)

Strictly follows Section 3.1 & 3.2 of the specification.

| Action / Visibility          | Super Admin | HR Admin          | Manager            | Employee          | Candidate |
|------------------------------|-------------|-------------------|--------------------|-------------------|-----------|
| View All Employees           | ✓ Full      | ✓ Full            | ✗ (Team only)      | ✗                 | ✗         |
| View Team Employees Only     | ✓           | ✓                 | ✓                  | ✗                 | ✗         |
| View Own Record Only         | ✓           | ✓                 | ✓                  | ✓                 | ✗         |
| Create New Employee          | ✓           | ✓                 | ✗                  | ✗                 | ✗         |
| Edit Any Employee            | ✓           | ✓ (most fields)   | ✗                  | ✗                 | ✗         |
| Edit Own Record (limited)    | ✓           | ✓                 | ✓ (if allowed)     | ✓ (personal only) | ✗         |
| Archive Employee             | ✓           | ✓                 | ✗                  | ✗                 | ✗         |
| Export Full Employee Data    | ✓           | ✓                 | ✗                  | ✗                 | ✗         |
| Export Own Data              | ✓           | ✓                 | ✓ (team summary)   | ✓                 | ✗         |

**Manager limitations**  
- Can only see/edit/view employees who report directly or indirectly to them (hierarchy enforced via reporting manager field).  
- Cannot create, archive, or access banking/statutory fields.

**Employee self-service limitations**  
- Only personal/contact details, profile photo, emergency contact
- Changes to personal info usually require HR approval (audit trail).

## 3. Security & Compliance Rules

- Every view/edit/export/action must be **logged** with user, timestamp, IP, before/after values.
- No bulk operations allowed without confirmation step.
- Role/permission checks enforced at API and UI level (403 Forbidden on violation).
- Follow gemini.md guidelines: input validation, no magic numbers, secure queries, prevent over-fetching.

## 4. UI/UX Guidelines

- **List View** — Data table with filters (department, location, status, employment type, joining date range), search by name/ID/email, pagination, column visibility toggle.
- **Detail View** — Tabs: Personal, Employment, Statutory, Banking, Audit Trail.
- **Create/Edit Form** — Stepper or grouped sections, auto-save drafts, validation feedback.
- **Mobile Responsive** — Full functionality on mobile (employee self-service priority).

## Development Rules for Gemini CLI
- Start every session with `/clear` then paste this entire file  
- Proceed **one phase at a time** – wait for my confirmation before next phase  
- Output **only code** in ``` blocks unless a summary/table is explicitly requested  
- Local storage utilities: create directories automatically, generate unique filenames, stream files for download 
- Check for exixting components and features to avoid duplication of code. utilize existing code as much as possible. 

## Phases & Prompts

### Phase 1: Preparation
1. **Prompt 1 – Feature Summary**  
   Summarize all features of the Employee Management Module. Output detailed bullet points covering CRUD operations, required fields, role-based visibility & actions, security rules, and UI/UX guidelines.

2. **Prompt 2 – Feature Table**  
   Create a table listing every major feature/action, corresponding DB fields (refer to employee schema if exists)

3. **Prompt 3 – Phase Plan**  
   Output the complete phased plan for implementing the Employee Management Module with local file handling for profile photos/documents. Include checks for existing employee schema/models before creating anything new.

### Phase 2: Backend – Core Implementation
1. **Prompt 1 – Schema Check & Model Extension**  
   First, scan codebase for existing employee model/schema (models/Employee.*, employee table, migrations). Report findings. If exists, propose extension fields only.

2. **Prompt 2 – List & Detail Endpoints**  
   Generate GET /employees (paginated, searchable, filtered list – enforce role scoping: full for admin, team for manager, own for employee) and GET /employees/:id (detail view with role-based field visibility).

3. **Prompt 3 – Create Employee Endpoint**  
   Generate POST /employees: validate required fields, generate unique Employee ID if needed, enforce Super Admin + HR Admin only, create audit log entry, return new employee object.

4. **Prompt 4 – Update Employee Endpoint**  
   Generate PATCH /employees/:id: role-restricted field updates (full for admin, limited personal for employee/self), prevent changes to critical fields by non-admins, audit before/after.

5. **Prompt 5 – Archive Endpoint**  
   Generate POST /employees/:id/archive: soft-delete (set archived_at), Super/HR Admin only, audit log, prevent access in future queries.

6. **Prompt 6 – Export Endpoint**  
   Generate GET /employees/export: filtered export (CSV/Excel), role-scoped (full org for admin, team summary for manager, own for employee).

7. **Prompt 7 – Profile Photo Upload**  
   Generate POST /employees/:id/photo: single image upload (JPG/PNG, <2MB), save locally using file utilities, store relative path in employee record, role-restricted (self + admin).

8. **Prompt 8 – Backend Self-Review**  
   Self-review all backend code: confirm full coverage of  features, correct RBAC enforcement, audit logging everywhere, secure handling of PII fields, readiness for future S3 migration.

### Phase 3: Frontend – Role-Specific Pages
1. **Prompt 1 – Layout & Role Routing**  
   Generate app/dashboard/employees/layout.tsx: server-side role detection and routing to role-specific sub-pages (employee self-view, manager team view, admin full view).

2. **Prompt 2 – Employee Self Page**  
   Generate app/dashboard/employees/me/page.tsx: personal profile view + limited edit form (personal/contact fields only) + profile photo upload.

3. **Prompt 3 – Employee Components**  
   Generate EmployeeProfileCard, PersonalEditForm, ProfilePhotoUploader (with preview & dropzone).

4. **Prompt 4 – Manager Team Page**  
   Generate app/dashboard/employees/manager/page.tsx: team employee list (reporting hierarchy), summary cards, limited view (no edit/create).

5. **Prompt 5 – Manager Components**  
   Generate TeamEmployeeTable (with filters, hierarchy indicators), TeamSummaryCards.

6. **Prompt 6 – Admin Full Page**  
   Generate app/dashboard/employees/admin/page.tsx: full organization employee list, advanced filters, bulk actions (export/archive), + New Employee button.

7. **Prompt 7 – Admin Components**  
   Generate EmployeeDataTable (sortable, filterable, pagination), EmployeeCreateForm (stepper with all required fields), EmployeeDetailModal/Tabs.

8. **Prompt 8 – Frontend Self-Review**  
   Self-review frontend: confirm strict role separation, mobile responsiveness, all required UI/UX guidelines from employee-module.md implemented, no unauthorized actions visible.

### Phase 4: Integration & Testing
1. **Prompt 1 – Notification Display**  
   Add toast/notification UI for employee create/update/archive/photo upload events.

2. **Prompt 2 – Compliance Notes**  
   Add UI notes/disclaimers for data protection, audit trail, and India compliance (Section 7 of specs).

3. **Prompt 3 – Final Review**  
   Final module review: confirm 100% coverage of employee-module.md, RBAC working correctly, local photo handling secure, ready for future cloud storage refactor, no conflicts with existing employee schema.

**Start Development**: Run Phase 1 prompts in Gemini CLI.  
**Confirmation Required**: After each phase, reply "Phase X complete – ready for next?"


**Last Updated:** January 13, 2026  
**Related Documents:** hr-system-specification-Version_2.0.md, gemini.md