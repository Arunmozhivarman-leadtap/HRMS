# Onboarding Module

**Module Purpose**  
This module handles the complete **pre-joining lifecycle** for candidates turning into employees in the India-focused HRMS. It covers candidate creation, offer letter delivery & acceptance, self-service onboarding portal, document collection/verification, and final activation into an employee record — with full compliance to Indian labour laws and data protection.

**Important Constraints**  
- This is **Section 4.1** of the main specification — distinct from direct Employee Management (which bypasses onboarding).  
- All actions maintain **full audit trail**, PII encryption/masking, and role-based access per Section 3.  
- Integrates tightly with existing modules: Document, Leave, Settings.  
- No hard deletion — all records archived with retention per Section 7.3.

## 1. Module Scope & Features

### Core Workflow Stages

| Stage                     | Description                                                                 | Who Performs          | Triggers / Integrations                     |
|---------------------------|-----------------------------------------------------------------------------|-----------------------|---------------------------------------------|
| Candidate Creation        | Create candidate profile with required fields                               | HR Admin / Super Admin| Settings (dropdowns)                        |
| Compensation Structure    | Define / apply salary template, calculate CTC & breakdown                   | HR Admin              | Settings (templates)                        |
| Offer Letter Handling     | Upload PDF/DOCX, send with expiry & secure link, track acceptance           | HR Admin              | Notification, Document (storage)            |
| Offer Acceptance          | Candidate views & accepts (click-to-sign), triggers onboarding portal       | Candidate             | Notification, E-signature (basic)           |
| Onboarding Portal         | Self-service checklist + document uploads                                   | Candidate             | Document (upload/verification)              |
| Document Verification     | HR reviews & approves/rejects uploaded documents                            | HR Admin              | Document module workflow                    |
| Onboarding Completion     | All items done → create Employee record, set leave balances, welcome email  | System + HR           | Leave (balance init), Notification, Audit   |

### Required Fields for Candidate Creation

**Required**  
- fullName (min 2 chars)  
- personalEmail (valid)  
- mobileNumber (10-digit Indian)  
- position (from Settings)  
- department (from Settings)  
- reportingManager (Employee ref)  
- workLocation (from Settings)  
- employmentType (Full-time / Part-time / Contract / Intern)  
- expectedJoiningDate (future date)

**Optional**  
- alternateEmail, linkedInProfile, referralSource, referredBy, notes

### Checklist Items (Default – Configurable via Settings)

1. Accept Offer Letter  
2. Upload Aadhaar Card  
3. Upload PAN Card  
4. Upload Educational Certificates  
5. Upload Experience / Relieving Letters (conditional)  
6. Submit Bank Details + Cancelled Cheque  
7. Emergency Contact Details  
8. Upload Passport Size Photo  
9. Read & Accept Company Policies

## 2. Role-Based Access Control (RBAC)

Follows Section 3 of main specification.

| Action / Visibility               | Super Admin | HR Admin     | Manager      | Employee     | Candidate    |
|-----------------------------------|-------------|--------------|--------------|--------------|--------------|
| Create Candidate                  | ✓           | ✓            | ✗            | ✗            | ✗            |
| Upload / Send Offer Letter        | ✓           | ✓            | ✗            | ✗            | ✗            |
| View / Accept Offer (portal)      | —           | —            | —            | —            | ✓            |
| Access Onboarding Portal          | —           | —            | —            | —            | ✓ (token)    |
| Upload Documents in Portal        | —           | —            | —            | —            | ✓            |
| Verify Documents                  | ✓           | ✓            | ✗            | ✗            | ✗            |
| View Onboarding Progress (own)    | —           | —            | —            | —            | ✓            |
| View Pending Onboardings (all)    | ✓           | ✓            | ✗            | ✗            | ✗            |
| Complete Onboarding → Create Emp  | ✓           | ✓            | ✗            | ✗            | ✗ (system)   |

## 3. Security & Compliance Rules

- Full audit trail on every action (create, send, accept, upload, verify, complete)  
- PII fields masked in logs (Aadhaar, PAN, bank account)  
- Token-based magic link for candidate portal — no credentials required  
- All files encrypted at rest (via Document module)  
- Role checks at API + UI level  
- No bulk send/accept without confirmation  
- Retention: candidate records kept 1 year post-joining or rejection (configurable)

## 4. UI/UX Guidelines

- **HR View** — Dashboard with pending onboardings table (progress %, blockers, joining date)  
- **Candidate Portal** — Mobile-first, progress bar, clear checklist with conditional logic, file dropzone  
- **Offer Acceptance Page** — Clean view of offer PDF, Accept/Reject buttons, basic e-signature capture  
- **Notifications** — Toast + email reminders (7/3/1 day before joining)  
- Responsive design, accessibility (ARIA labels), validation feedback

## Development Rules for Gemini CLI

- Start every session with `/clear` then paste this entire file  
- Proceed **one phase at a time** — wait for my confirmation before next phase  
- Output **only code** in ``` blocks unless summary/table requested  
- Use existing utilities for file handling (profile photos, documents)  
- Check for existing components/models to avoid duplication (candidate, onboardingChecklist, etc.)  
- Local file storage for MVP — plan for S3 migration later

## Phases & Prompts

### Phase 1: Preparation
1. Summarize features, integrations, and constraints in bullet points  
2. Create table of stages + responsible roles + integrations  
3. Output detailed phased implementation plan (including file handling for documents/photos)

### Phase 2: Backend – Core Implementation
1. Check for existing Candidate / Onboarding models — report & propose schema if needed  
2. Generate POST /candidates + salary structure calculation endpoint  
3. Generate offer letter upload/send/accept endpoints (with token generation)  
4. Generate onboarding portal endpoints (GET /onboarding/:token, PATCH complete-item)  
5. Generate completion endpoint (POST /onboarding/:id/complete → create Employee + leave balances)  
6. Add audit logging & RBAC middleware for all endpoints  
7. Backend self-review: coverage, security, compliance

### Phase 3: Frontend – Role-Specific Interfaces
1. Candidate portal layout (token-based, progress + checklist + uploads)  
2. Offer acceptance page (view PDF, accept/reject buttons)  
3. HR pending onboardings dashboard (table with progress, filters, reminders)  
4. Components: ChecklistItem, DocumentUploader (integrate Document module), ProgressBar  
5. Frontend self-review: mobile-first, role isolation, UX guidelines met

### Phase 4: Integration & Finalization
1. Integrate notifications (offer sent/accepted/reminders/joining day)  
2. Add UI disclaimers for data protection & compliance  
3. Final module review: 100% coverage of spec, no conflicts with existing modules, ready for testing

**Start Development**: Begin with Phase 1 in Gemini CLI.  
**Confirmation Required**: After each phase, reply "Phase X complete – ready for next?"

**Last Updated:** January 14, 2026  
**Related Documents:** hr-system-specification-Version_2.0.md, gemini.md