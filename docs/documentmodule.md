# documentmodule.md - Document Upload Module Gemini CLI Guide

**Version:** 2.0  
**Date:** January 09, 2026  
**Module:** Employee Document Management (specs.md Section 4.2)  
**Storage:** Local filesystem (`/uploads/documents/`) – relative path stored in DB  
**Future:** Refactor to S3/DigitalOcean Spaces later (keep utilities abstracted)

## Project Context (Read This File in Every Gemini CLI Session)
- Core specification: specs.md Section 4.2 (full features: document categories, upload rules, file formats & size limits, verification workflow, expiry tracking & alerts, multi-file upload, candidate onboarding integration, notifications, reports, audit logging)  
- Database: dbschema.md (`employee_documents.file_path`, `candidate_onboarding_tasks.uploaded_file`, `document_type` enum, `document_verification_status` enum)  
- Permissions: permissions.json (employee: upload_document_self; manager: upload_document_team; hr_admin/super_admin: upload_document_any + verify)  
- Roles: super_admin, hr_admin, manager, employee, candidate  
- Current storage: Local disk in `/uploads/documents/` with structured folders (e.g., `employees/{id}/`, `candidates/{id}/`)  
- Design requirement: All file operations must go through separate utility functions (easy future cloud storage swap)  
- UI rule: No shared/common components – completely separate pages and components per role  

## Development Rules for Gemini CLI
- Start every session with `/clear` then paste this entire file  
- Proceed **one phase at a time** – wait for my confirmation before next phase  
- Output **only code** in ``` blocks unless a summary/table is explicitly requested  
- Local storage utilities: create directories automatically, generate unique filenames, stream files for download  

## Phases & Prompts

### Phase 1: Preparation
1. **Prompt 1 – Feature Summary**
Summarize all features of the Document Upload module from specs.md Section 4.2 using local filesystem storage. Output detailed bullet points.
text2. **Prompt 2 – Feature Table**
Create a table listing every feature from specs.md 4.2, corresponding DB fields (e.g., file_path for local path), and role permissions from permissions.json.
text3. **Prompt 3 – Phase Plan**
Output the complete phased plan for implementing the module with local storage first.
text### Phase 2: Backend – Local Storage Implementation
1. **Prompt 1 – File Utilities**
Generate local file utility functions: upload_file (create directories, unique filename, save file), get_file_stream (for download), delete_file. Return relative path.
text2. **Prompt 2 – Upload Endpoint**
Generate POST /documents/upload endpoint: handle multi-file upload, validate format (PDF/JPG/PNG/DOCX) and size (<10MB), save locally using utilities, store path in employee_documents, enforce role scoping.
text3. **Prompt 3 – List & Download Endpoints**
Generate GET /documents/list (role-scoped list with filters) and GET /documents/{id}/download (stream local file via backend).
text4. **Prompt 4 – Verification Endpoint**
Generate PATCH /documents/{id}/verify: update verification_status (HR/super_admin only), trigger notifications.
text5. **Prompt 5 – Expiry & Delete Endpoints**
Generate GET /documents/expiries (role-scoped upcoming expiry alerts) and DELETE /documents/{id} (delete local file + DB record, audit log).
text6. **Prompt 6 – Candidate Onboarding Upload**
Generate POST /onboarding/documents/upload: candidate-specific upload, save locally, link to candidate_onboarding_tasks table.
text7. **Prompt 7 – Reports Endpoint**
Generate GET /documents/reports: role-scoped compliance reports (verification percentage, expiry risks).
text8. **Prompt 8 – Notifications & Audit**
Integrate notification triggers (on upload, verification, reupload) and audit_logs for all document actions.
text9. **Prompt 9 – Backend Self-Review**
Self-review all backend code: confirm full coverage of specs.md 4.2, local storage secure, utilities designed for future S3 refactor.
text### Phase 3: Frontend – Role-Specific Pages
1. **Prompt 1 – Layout & Role Routing**
Generate app/dashboard/documents/layout.tsx: server-side role detection and routing to role-specific sub-pages.
text2. **Prompt 2 – Employee Page**
Generate app/dashboard/documents/employee/page.tsx: self document list and multi-file upload form.
text3. **Prompt 3 – Employee Components**
Generate DocumentListTable (with filters, download button) and UploadForm (dropzone, category selection).
text4. **Prompt 4 – Candidate Page**
Generate app/onboarding/documents/page.tsx: required document checklist and upload interface.
text5. **Prompt 5 – Candidate Components**
Generate OnboardingDocumentList and UploadForm for candidates.
text6. **Prompt 6 – Manager Page**
Generate app/dashboard/documents/manager/page.tsx: team document view and verification actions.
text7. **Prompt 7 – Manager Components**
Generate TeamDocumentTable and VerifyForm.
text8. **Prompt 8 – HR Admin Page**
Generate app/dashboard/documents/admin/page.tsx: full organization view, reports, verification queue.
text9. **Prompt 9 – Frontend Self-Review**
Self-review frontend: confirm strict role separation, mobile responsiveness, all required features implemented.
text### Phase 4: Integration & Testing

text1. **Prompt 1 – Notification Display**
Add toast/notification UI for upload and verification events.
text2. **Prompt 2 – Compliance Notes**
Add UI notes for data protection and compliance (Section 7).
text3. **Prompt 3 – Final Review**
Final module review: confirm 100% coverage of Section 4.2, local storage working, ready for future cloud storage refactor.
text**Start Development**: Run Phase 1 prompts in Gemini CLI.  
**Confirmation Required**: After each phase, reply "Phase X complete – ready for next?"  
