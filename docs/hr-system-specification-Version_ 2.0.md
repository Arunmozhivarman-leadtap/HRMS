# HR Management System - Product Specification

## India-Focused HRMS for LeadTap

**Version:** 2.0\
**Date:** 1 Jan 2026

**Author:** LeadTap Product Team

## Table of Contents

1. [Executive Summary](#a1ct21cvx8dj)

2. [System Overview](#yl2k81r45ysh)

3. [User Roles & Permissions](#cf1flcbziooa)

4. [Module Specifications](#maegojeqa2oo)

    - 4.1 [Onboarding & Offer Letters](#ed8k6fsu2kok)

    - 4.2 [Employee Document Management](#k1siienlaytn)

    - 4.3 [Leave Management System](#fq2ihbm8gfbb)

    - 4.4 [Public Holiday Calendar](#ve5vo5cap6iy)

    - 4.5 [Birthday & Work Anniversary](#sf58ymlilip8)

    - 4.6 [Performance Reviews & Salary Revision](#qghaalodzrab)

    - 4.7 [Offboarding & Exit Management](#pkw49wpdao6j)

    - 4.8 [Experience Certificate Generation](#1aa6nqb3d9se)

5. [Reports & Analytics](#5v4c3jq7g3ih)

6. [Configuration & Settings](#kicamerj40ba)

7. [Compliance & Legal Considerations](#wewnhlpfwy7v)

8. [Technical Architecture](#770di0fh4q2a)

9. [Future Roadmap](#eqsvm47xba6a)

## 1. Executive Summary

### 1.1 Purpose

This document outlines the complete specification for an India-focused
Human Resource Management System (HRMS) designed to streamline employee
lifecycle management from hiring through exit. The system prioritises
Indian labour law compliance, statutory requirements, and local business
practices.

### 1.2 Scope

The initial release covers: - Employee onboarding with digital offer
letters - Document and banking information collection - Configurable
leave management with pro-rata calculations - Leave application and
approval workflows - Public holiday calendar management - Annual
performance review integration (Google Docs) - Experience certificate
generation

### 1.3 Target Users

- **Primary:** Small to medium enterprises (10-500 employees)
    > operating in India

- **Secondary:** Companies with distributed teams including remote
    > workers

## 2. System Overview

### 2.1 High-Level Architecture

┌─────────────────────────────────────────────────────────────────┐\
│ HRMS DASHBOARD │\
├─────────────┬─────────────┬─────────────┬─────────────┬─────────┤\
│ Onboarding │ Documents │ Leave │ Reviews │ Exit │\
│ Module │ Module │ Module │ Module │ Module │\
├─────────────┴─────────────┴─────────────┴─────────────┴─────────┤\
│ CONFIGURATION ENGINE │\
├─────────────────────────────────────────────────────────────────┤\
│ NOTIFICATION SERVICE (Email/SMS/WhatsApp) │\
├─────────────────────────────────────────────────────────────────┤\
│ INTEGRATIONS LAYER │\
│ (Google Docs, Email, WhatsApp, Banking APIs) │\
└─────────────────────────────────────────────────────────────────┘

### 2.2 Key Design Principles

1. **India-First:** All defaults, calculations, and compliance features
    > follow Indian standards

2. **Configurable:** Administrators can customise rules, policies, and
    > workflows

3. **Mobile-Responsive:** Full functionality on mobile devices for
    > employee self-service

4. **Audit Trail:** Complete logging of all actions for compliance

5. **Multi-Location:** Support for offices across different Indian
    > states with varying rules

## 3. User Roles & Permissions

### 3.1 Role Hierarchy

  --------------------------------------------------------------------------
  Role            Description                 Access Level
  --------------- --------------------------- ------------------------------
  **Super Admin** System owner, full          Full system access
                  configuration access

  **HR Admin**    HR team members managing    All HR modules, limited
                  day-to-day operations       settings

  **Manager**     Team leads and department   View team, approve leaves,
                  heads                       conduct reviews

  **Employee**    Regular staff members       Self-service portal only

**Candidate**   Pre-joining individuals     Onboarding portal only
                  completing onboarding
  --------------------------------------------------------------------------

### 3.2 Permission Matrix

  ---------------------------------------------------------------------------------------
  Feature                   Super Admin HR Admin    Manager     Employee      Candidate
  ------------------------- ----------- ----------- ----------- ------------- -----------
  System Configuration      ✓           ✗           ✗           ✗             ✗

  Create Offer Letters      ✓           ✓           ✗           ✗             ✗

  View All Employees        ✓           ✓           Team Only   Self Only     ✗

  Approve Leaves            ✓           ✓           Team Only   ✗             ✗

  Apply for Leave           ✓           ✓           ✓           ✓             ✗

  Upload Documents          ✓           ✓           ✓           ✓             ✓

  Generate Experience Cert  ✓           ✓           ✗           ✗             ✗

  View Public Holidays      ✓           ✓           ✓           ✓             ✓

  Conduct Reviews           ✓           ✓           ✓           ✗             ✗

  View Own Review           ✓           ✓           ✓           ✓             ✗

  Process Salary Revision   ✓           ✓           Recommend   View Own      ✗

  Process Offboarding       ✓           ✓           Clearance   Submit        ✗
                                                                Resignation

  Approve FNF               ✓           ✓           ✗           ✗             ✗

  View Reports              ✓           ✓           Team Only   Self Only     ✗

View                      ✓           ✓           ✓           ✓             ✗
  Birthdays/Anniversaries
  ---------------------------------------------------------------------------------------

## 4. Module Specifications

### 4.1 Onboarding & Offer Letters

#### 4.1.1 Overview

The onboarding module handles the pre-joining process from offer
generation through Day 1 completion. It creates a seamless experience
for candidates whilst collecting all required information and
documentation.

#### 4.1.2 Offer Letter Generation

##### 4.1.2.1 Candidate Creation

**Required Fields:** \| Field \| Type \| Validation \| Required \|
\|-------\|------\|------------\|----------\| \| Full Name \| Text \|
Min 2 characters \| Yes \| \| Personal Email \| Email \| Valid email
format \| Yes \| \| Mobile Number \| Phone \| Indian mobile (10 digits)
\| Yes \| \| Position/Designation \| Dropdown \| From master list \| Yes
\| \| Department \| Dropdown \| From master list \| Yes \| \| Reporting
Manager \| Dropdown \| From employee list \| Yes \| \| Work Location \|
Dropdown \| From office locations \| Yes \| \| Employment Type \|
Dropdown \| Full-time/Part-time/Contract/Intern \| Yes \| \| Expected
Joining Date \| Date \| Cannot be in past \| Yes \|

**Optional Fields:** \| Field \| Type \| Notes \|
\|-------\|------\|-------\| \| Alternate Email \| Email \| For backup
communication \| \| LinkedIn Profile \| URL \| For reference \| \|
Referral Source \| Dropdown \| Job portal/Referral/Direct/Agency \| \|
Referred By \| Dropdown \| Employee list (if referral) \| \| Notes \|
Text Area \| Internal HR notes \|

##### 4.1.2.2 Compensation Structure

**Salary Configuration:**

┌─────────────────────────────────────────────────────────────┐\
│ SALARY STRUCTURE (CTC) │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ FIXED COMPONENTS │\
│ ├── Basic Salary \[\_\_\_\_\_\_\_\_\] (% of CTC or fixed) │\
│ ├── House Rent Allowance \[\_\_\_\_\_\_\_\_\] (% of Basic) │\
│ ├── Conveyance Allowance \[\_\_\_\_\_\_\_\_\] │\
│ ├── Medical Allowance \[\_\_\_\_\_\_\_\_\] │\
│ ├── Special Allowance \[\_\_\_\_\_\_\_\_\] (Balancing figure) │\
│ └── Other Allowances \[\_\_\_\_\_\_\_\_\] │\
│ │\
│ STATUTORY DEDUCTIONS (Auto-calculated) │\
│ ├── Provident Fund (PF) \[Auto\] (12% of Basic, max ₹15K)│\
│ ├── ESI \[Auto\] (if gross ≤ ₹21,000) │\
│ └── Professional Tax \[Auto\] (State-wise) │\
│ │\
│ VARIABLE COMPONENTS │\
│ ├── Performance Bonus \[\_\_\_\_\_\_\_\_\] (% or fixed) │\
│ └── Other Benefits \[\_\_\_\_\_\_\_\_\] │\
│ │\
│ ───────────────────────────────────────────────────────── │\
│ Annual CTC: ₹ \[Calculated\] │\
│ Monthly Gross: ₹ \[Calculated\] │\
│ Monthly Net (Estimated): ₹ \[Calculated\] │\
└─────────────────────────────────────────────────────────────┘

**Salary Structure Templates:** - Administrators can create reusable
salary structure templates - Templates can be linked to grades/bands -
Quick apply with override option

##### 4.1.2.3 Offer Letter Upload & Sending

**Process:** - HR creates offer letter externally (Word/PDF) - Uploads
completed offer letter to the system - System sends to candidate via
email with tracking

**Upload Interface:**

┌─────────────────────────────────────────────────────────────┐\
│ Upload Offer Letter │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ Candidate: Rahul Sharma │\
│ Position: Software Engineer │\
│ │\
│ Upload Offer Letter: │\
│ ┌─────────────────────────────────────────────────────┐ │\
│ │ │ │\
│ │ Drag and drop file here │ │\
│ │ or \[Browse Files\] │ │\
│ │ │ │\
│ │ Supported: PDF, DOCX (Max 10MB) │ │\
│ └─────────────────────────────────────────────────────┘ │\
│ │\
│ Offer Expiry Date: \[\_\_\_\_\_\_\_\_\_ 📅\] │\
│ │\
│ Email Subject: \[Offer of Employment - Software Engineer\] │\
│ │\
│ Email Message: │\
│ \[Dear Rahul, \] │\
│ \[ \] │\
│ \[Please find attached your offer letter\... \] │\
│ │\
│ \[Preview Email\] \[Send to Candidate\] │\
└─────────────────────────────────────────────────────────────┘

**Tracking:** - Email delivery status - Document open/view timestamp -
Acceptance/rejection status

##### 4.1.2.4 Offer Letter Workflow

┌──────────────┐ ┌──────────────┐ ┌──────────────┐\
│ Create │────▶│ Upload │────▶│ Send │\
│ Candidate │ │ Offer Doc │ │ to Email │\
└──────────────┘ └──────────────┘ └──────────────┘\
│\
▼\
┌──────────────┐ ┌──────────────┐ ┌──────────────┐\
│ Onboarding │◀────│ Accepted │◀────│ Candidate │\
│ Begins │ │ │ │ Opens │\
└──────────────┘ └──────────────┘ └──────────────┘\
│\
│ (If rejected/expired)\
▼\
┌──────────────┐\
│ Archive │\
│ Offer │\
└──────────────┘

**Workflow Steps:**

1. **Create Candidate Record**

    - HR enters candidate details

    - System creates candidate profile

    - Status: Candidate Created

2. **Upload Offer Letter**

    - HR prepares offer letter externally

    - Uploads PDF/DOCX to system

    - Sets offer expiry date

    - Status: Offer Ready

3. **Send Offer**

    - Email to candidate with document attachment

    - Secure link for online viewing

    - Status: Sent

    - Track: Open/View timestamps

4. **Candidate Action**

    - View offer letter online or download

    - Accept or Request Call (to negotiate)

    - E-signature capture on acceptance

    - Status: Accepted / Rejected / Negotiating

5. **Post-Acceptance**

    - Trigger onboarding checklist

    - Create provisional employee record

    - Send welcome email with onboarding portal link

    - Status: Onboarding

##### 4.1.2.5 Offer Letter Email

**Subject:** Offer of Employment - {{position}} at {{company_name}}

**Body:**

Dear {{candidate_name}},\
\
We are pleased to inform you that you have been selected for the
position\
of {{position}} at {{company_name}}.\
\
Please find attached your offer letter with complete details of your\
compensation and terms of employment.\
\
To view and accept your offer, please click the link below:\
\[View Offer Letter\]\
\
This offer is valid until {{offer_expiry_date}}.\
\
If you have any questions, please don\'t hesitate to contact
{{hr_name}}\
at {{hr_email}}.\
\
We look forward to welcoming you to the team!\
\
Best regards,\
{{hr_name}}\
Human Resources\
{{company_name}}

#### 4.1.3 Onboarding Portal (Candidate View)

##### 4.1.3.1 Onboarding Checklist

Once offer is accepted, candidate accesses a portal to complete
pre-joining formalities.

**Default Checklist Items:**

  ---------------------------------------------------------------------------
  \#     Task           Category             Required             Due
  ------ -------------- -------------------- -------------------- -----------
  1      Accept Offer   Documents            Yes                  Immediate
         Letter

  2      Upload Aadhaar KYC Documents        Yes                  Before
         Card                                                     Joining

  3      Upload PAN     KYC Documents        Yes                  Before
         Card                                                     Joining

  4      Upload         KYC Documents        No                   Before
         Passport (if                                             Joining
         available)

  5      Upload         Qualification        Yes                  Before
         Educational                                              Joining
         Certificates

  6      Upload         Experience           Conditional          Before
         Previous                                                 Joining
         Employment
         Letters

  7      Upload         Experience           Conditional          Before
         Relieving                                                Joining
         Letter

  8      Upload Last 3  Salary Proof         Conditional          Before
         Months                                                   Joining
         Payslips

  9      Submit Bank    Banking              Yes                  Before
         Account                                                  Joining
         Details

  10     Submit         Personal             Yes                  Before
         Emergency                                                Joining
         Contact

  11     Complete       Personal             Yes                  Before
         Personal                                                 Joining
         Details Form

  12     Upload         Personal             Yes                  Before
         Passport Photo                                           Joining

  13     Read & Accept  Compliance           Yes                  Day 1
         Company
         Policies

14     Complete IT    Admin                No                   Day 1
         Asset Request
  ---------------------------------------------------------------------------

**Checklist Customisation:** - Add/remove items from admin panel - Set
conditional requirements (e.g., relieving letter only if experienced) -
Custom due dates relative to joining - Assign to categories for
organisation

##### 4.1.3.2 Progress Tracking

**Candidate Dashboard:**

┌─────────────────────────────────────────────────────────────┐\
│ Welcome, Rahul! Your joining date: 15 Jan 2025 │\
│ │\
│ Onboarding Progress: ████████░░░░ 65% Complete │\
│ │\
│ ┌─────────────────────────────────────────────────────┐ │\
│ │ ✓ Offer Letter Accepted │ │\
│ │ ✓ Aadhaar Card Uploaded │ │\
│ │ ✓ PAN Card Uploaded │ │\
│ │ ○ Bank Details - Pending │ │\
│ │ ○ Educational Certificates - Pending │ │\
│ │ ○ Previous Employment Proof - Pending │ │\
│ │ ○ Personal Details Form - Pending │ │\
│ └─────────────────────────────────────────────────────┘ │\
│ │\
│ \[Continue Onboarding\] │\
└─────────────────────────────────────────────────────────────┘

**HR Dashboard View:**

┌─────────────────────────────────────────────────────────────┐\
│ Pending Onboardings │\
├─────────────────────────────────────────────────────────────┤\
│ Name │ Joining │ Progress │ Blockers │ Action │\
│ ───────────────────────────────────────────────────────── │\
│ Rahul Sharma │ 15 Jan │ 65% │ Bank │ \[View\] │\
│ Priya Gupta │ 20 Jan │ 90% │ None │ \[View\] │\
│ Amit Kumar │ 01 Feb │ 30% │ Multiple │ \[View\] │\
└─────────────────────────────────────────────────────────────┘

##### 4.1.3.3 Notifications & Reminders

**Automated Notifications:**

  -------------------------------------------------------------------------
  Trigger           Recipient             Channel           Timing
  ----------------- --------------------- ----------------- ---------------
  Offer Sent        Candidate             Email             Immediate

  Offer Accepted    HR                    Email + Dashboard Immediate

  Onboarding        Candidate             Email             On acceptance
  Started

  Document Uploaded HR                    Dashboard         Real-time

  Incomplete Items  Candidate             Email             7 days, 3 days,
                                                            1 day before
                                                            joining

  All Complete      HR + Candidate        Email             Immediate

Joining Day       Candidate + Manager   Email             Morning of
                                                            joining
  -------------------------------------------------------------------------

### 4.2 Employee Document Management

#### 4.2.1 Overview

Secure storage and management of all employee documents with
verification workflows, expiry tracking, and compliance reporting.

#### 4.2.2 Document Categories

##### 4.2.2.1 KYC Documents (Government ID)

  ------------------------------------------------------------------------
  Document         Fields to Capture               Verification
  ---------------- ------------------------------- -----------------------
  Aadhaar Card     Number, Name as on Aadhaar, DOB Aadhaar API (optional)

  PAN Card         Number, Name as on PAN          PAN verification API
                                                   (optional)

  Passport         Number, Expiry Date, Place of   Manual
                   Issue

  Voter ID         Number, Constituency            Manual

Driving Licence  Number, Expiry Date, RTO        Manual
  ------------------------------------------------------------------------

##### 4.2.2.2 Banking Information

**Required Fields:**

  -----------------------------------------------------------------------
  Field                   Type                    Validation
  ----------------------- ----------------------- -----------------------
  Account Holder Name     Text                    As per bank records

  Bank Name               Dropdown                From bank master

  Branch Name             Text                    Branch location

  Account Number          Text                    9-18 digits

  Confirm Account Number  Text                    Must match

  IFSC Code               Text                    11 characters,
                                                  auto-fetch bank/branch

  Account Type            Dropdown                Savings/Current

Cancelled Cheque        File Upload             Image/PDF
  -----------------------------------------------------------------------

**Verification:** - IFSC lookup to validate bank/branch - Penny drop
verification (optional integration) - Cancelled cheque mandatory for
verification

##### 4.2.2.3 Educational Documents

  -----------------------------------------------------------------------
  Document                Required For            Verification
  ----------------------- ----------------------- -----------------------
  10th Marksheet          All                     Manual

  12th Marksheet          All                     Manual

  Degree Certificate      Graduates               Manual/DigiLocker

  Provisional Certificate Recent Graduates        Manual

  Post-Graduate Degree    If applicable           Manual

Professional            If applicable           Manual
  Certifications
  -----------------------------------------------------------------------

##### 4.2.2.4 Employment Documents

  -----------------------------------------------------------------------
  Document                Required For            Notes
  ----------------------- ----------------------- -----------------------
  Previous Offer Letters  Experienced             All previous employers

  Relieving Letter        Experienced             Last employer mandatory

  Experience Letter       Experienced             All previous employers

  Last 3 Payslips         Experienced             For salary verification

  Form 16                 Experienced             Last financial year

Appointment Letter      Experienced             From previous employers
  -----------------------------------------------------------------------

##### 4.2.2.5 Personal Documents

  -----------------------------------------------------------------------
  Document                            Purpose
  ----------------------------------- -----------------------------------
  Passport Size Photos                ID card, records

  Address Proof                       Verification

  Marriage Certificate                If applicable

Medical Fitness Certificate         If required by policy
  -----------------------------------------------------------------------

#### 4.2.3 Document Upload Interface

**Employee Upload Screen:**

┌─────────────────────────────────────────────────────────────┐\
│ My Documents │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ KYC Documents │\
│ ┌─────────────────────────────────────────────────────┐ │\
│ │ Aadhaar Card \[✓ Verified\]│ │\
│ │ Uploaded: 10 Jan 2025 │ aadhaar.pdf \[View\] │ │\
│ └─────────────────────────────────────────────────────┘ │\
│ ┌─────────────────────────────────────────────────────┐ │\
│ │ PAN Card \[✓ Verified\]│ │\
│ │ Uploaded: 10 Jan 2025 │ pan.pdf \[View\] │ │\
│ └─────────────────────────────────────────────────────┘ │\
│ ┌─────────────────────────────────────────────────────┐ │\
│ │ Passport \[⏳ Pending\] │ │\
│ │ Not uploaded \[Upload\] │ │\
│ └─────────────────────────────────────────────────────┘ │\
│ │\
│ Banking Information │\
│ ┌─────────────────────────────────────────────────────┐ │\
│ │ Bank Account Details \[✓ Verified\]│ │\
│ │ HDFC Bank - XXXX1234 \[Edit\] │ │\
│ └─────────────────────────────────────────────────────┘ │\
│ │\
└─────────────────────────────────────────────────────────────┘

#### 4.2.4 Document Verification Workflow

┌──────────────┐ ┌──────────────┐ ┌──────────────┐\
│ Employee │────▶│ Pending │────▶│ HR Reviews │\
│ Uploads │ │ Review │ │ Document │\
└──────────────┘ └──────────────┘ └──────────────┘\
│\
┌───────────────────────────┼───────────────────────────┐\
│ │ │\
▼ ▼ ▼\
┌──────────────┐ ┌──────────────┐ ┌──────────────┐\
│ Approved │ │ Rejected │ │ Reupload │\
│ ✓ │ │ ✗ │ │ Requested │\
└──────────────┘ └──────────────┘ └──────────────┘\
│ │\
│ │\
└───────────────────────────┘\
│\
▼\
┌──────────────┐\
│ Notification │\
│ to Employee │\
└──────────────┘

**Verification Statuses:** - Pending - Uploaded, awaiting review -
Verified - Approved by HR - Rejected - Document not acceptable (with
reason) - Reupload Required - Quality/clarity issues - Expired -
Document past validity (for passports, etc.)

#### 4.2.5 Document Expiry Tracking

**For documents with validity:** - System tracks expiry dates (Passport,
Driving Licence, Certifications) - Automated alerts at 90, 60, 30 days
before expiry - Dashboard widget for HR showing upcoming expirations -
Employee notification to upload renewed document

#### 4.2.6 Security & Compliance

**Data Protection:** - All documents encrypted at rest (AES-256) -
Access logged with timestamp and IP - Role-based access control -
Automatic PII masking in logs - Right to deletion support (GDPR-aligned)

**Audit Trail:** - Who uploaded what, when - Who viewed/downloaded
documents - Version history for re-uploads - Approval/rejection history
with reasons

### 4.3 Leave Management System

#### 4.3.1 Overview

Comprehensive leave management with Indian statutory compliance,
pro-rata calculations, and configurable policies.

#### 4.3.2 Leave Types (India Defaults)

##### 4.3.2.1 Standard Leave Types

  --------------------------------------------------------------------------------
  Leave Type     Abbr    Annual Entitlement Carry Forward  Encashment   Accrual
  -------------- ------- ------------------ -------------- ------------ ----------
  Earned Leave / EL/PL   15 days            Yes (max 30)   Yes          Monthly
  Privilege
  Leave

  Casual Leave   CL      12 days            No             No           Monthly

  Sick Leave     SL      12 days            Yes (max 24)   No           Monthly

  Compensatory   CO      As earned          90 days        No           On
  Off                                       validity                    approval

Loss of Pay    LOP     Unlimited          N/A            N/A          N/A
  --------------------------------------------------------------------------------

##### 4.3.2.2 Special Leave Types

  -------------------------------------------------------------------------
  Leave Type      Entitlement      Conditions      Documents Required
  --------------- ---------------- --------------- ------------------------
  Maternity Leave 26 weeks         Female          Medical certificate
                                   employees with  
                                   \<2 children

  Paternity Leave 5 days           Male employees  Birth certificate

  Bereavement     3-5 days         Immediate       Death certificate
  Leave                            family death

  Marriage Leave  3 days           Own marriage    Marriage certificate
                                   (once)

Adoption Leave  12 weeks         Adopting child  Adoption papers
                                   \<3 months
  -------------------------------------------------------------------------

##### 4.3.2.3 Restricted Holidays (Optional)

  -----------------------------------------------------------------------
  Description             Annual Entitlement                 Notes
  ----------------------- ---------------------------------- ------------
  Restricted/Optional     2-3 days                           Employee
  Holidays                                                   choice from
                                                             approved
                                                             list

  -----------------------------------------------------------------------

#### 4.3.3 Pro-Rata Calculation Engine

##### 4.3.3.1 Calculation Formula

**Monthly Accrual:**

Monthly Accrual = (Annual Entitlement / 12) × Accrual Factor\
\
Where Accrual Factor depends on configuration:\

- Full Month Only: 1 if worked full month, 0 otherwise\
- Pro-rata by Days: (Days Worked / Total Working Days in Month)\
- Pro-rata by Calendar Days: (Calendar Days / Total Calendar Days)

**Joining Month Calculation:**

  -----------------------------------------------------------------------
  Joining Date            Calculation Method      Example (15 EL
                                                  annually)
  ----------------------- ----------------------- -----------------------
  1st - 10th              Full month credit       1.25 days

  11th - 20th             Half month credit       0.625 days

21st onwards            No credit for joining   0 days
                          month
  -----------------------------------------------------------------------

**Exit Month Calculation:**

  -----------------------------------------------------------------------
  Last Working Day        Calculation Method      Example
  ----------------------- ----------------------- -----------------------
  1st - 10th              No credit for exit      0 days
                          month

  11th - 20th             Half month credit       0.625 days

21st onwards            Full month credit       1.25 days
  -----------------------------------------------------------------------

##### 4.3.3.2 Leave Balance Calculation

Current Balance = Opening Balance\

- Accrued This Year\
- Carry Forward\

- Leaves Taken\
- Leaves Pending Approval\
- Encashed Leaves

**Leave Year Options:** - Calendar Year (Jan - Dec) - Financial Year
(Apr - Mar) - Custom Year (Configurable start month)

##### 4.3.3.3 Configuration Interface

┌─────────────────────────────────────────────────────────────┐\
│ Leave Policy Configuration │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ Leave Year: \[Financial Year (Apr-Mar) ▼\] │\
│ │\
│ ┌─────────────────────────────────────────────────────┐ │\
│ │ EARNED LEAVE (EL) │ │\
│ │ │ │\
│ │ Annual Entitlement: \[15\] days │ │\
│ │ Accrual Method: \[Monthly ▼\] │ │\
│ │ Carry Forward: \[✓\] Enabled │ │\
│ │ Max Carry Forward: \[30\] days │ │\
│ │ Encashment: \[✓\] Enabled │ │\
│ │ Max Encashment/Year: \[15\] days │ │\
│ │ Min Balance to Encash: \[10\] days │ │\
│ │ │ │\
│ │ Pro-Rata Settings: │ │\
│ │ ├─ Joining Month: \[15 days rule ▼\] │ │\
│ │ ├─ Exit Month: \[15 days rule ▼\] │ │\
│ │ └─ Round Off: \[Nearest 0.5 ▼\] │ │\
│ │ │ │\
│ │ Negative Balance: \[✗\] Not Allowed │ │\
│ │ Requires Approval: \[✓\] Yes │ │\
│ │ Min Days in Advance: \[7\] days │ │\
│ │ Max Consecutive Days: \[21\] days │ │\
│ └─────────────────────────────────────────────────────┘ │\
│ │\
│ \[Save Configuration\] │\
└─────────────────────────────────────────────────────────────┘

#### 4.3.4 Leave Application Workflow

##### 4.3.4.1 Application Interface (Employee)

┌─────────────────────────────────────────────────────────────┐\
│ Apply for Leave │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ Leave Type: \[Earned Leave ▼\] │\
│ │\
│ Duration Type: ○ Full Day ○ Half Day ○ Multiple Days │\
│ │\
│ From Date: \[15 Jan 2025 📅\] │\
│ To Date: \[17 Jan 2025 📅\] │\
│ │\
│ Number of Days: 3 days (Excludes: 1 weekend day) │\
│ │\
│ Reason:
\[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\]
│\
│ \[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\]
│\
│ │\
│ Attachment: \[Upload\] (Optional - for sick/special) │\
│ │\
│ ───────────────────────────────────────────────────────── │\
│ Leave Balance: │\
│ EL: 12.5 days │ CL: 8 days │ SL: 10 days │\
│ ───────────────────────────────────────────────────────── │\
│ │\
│ Contact During Leave: │\
│ Email: \[\_\_\_\_\_\_\_\_\_\_\] Phone: \[\_\_\_\_\_\_\_\_\_\_\] │\
│ │\
│ \[Cancel\] \[Submit Application\] │\
└─────────────────────────────────────────────────────────────┘

##### 4.3.4.2 Approval Workflow

┌────────────────┐\
│ Employee │\
│ Applies │\
└───────┬────────┘\
│\
▼\
┌────────────────┐ ┌────────────────┐\
│ Manager │────▶│ HR (Optional)│\
│ Review │ │ Review │\
└───────┬────────┘ └───────┬────────┘\
│ │\
┌────┴────┐ ┌────┴────┐\
│ │ │ │\
▼ ▼ ▼ ▼\
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐\
│Approve│ │Reject│ │Approve│ │Reject│\
└──────┘ └──────┘ └──────┘ └──────┘

**Approval Configuration:** - Single-level (Manager only) - Two-level
(Manager → HR) - Custom approval matrix based on leave type/duration -
Auto-approval rules (e.g., \<2 days, prior notice given)

##### 4.3.4.3 Approval Interface (Manager)

┌─────────────────────────────────────────────────────────────┐\
│ Pending Leave Requests │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ ┌─────────────────────────────────────────────────────┐ │\
│ │ Rahul Sharma │ │\
│ │ Earned Leave: 15-17 Jan 2025 (3 days) │ │\
│ │ Reason: Personal work │ │\
│ │ Balance: 12.5 days EL │ │\
│ │ │ │\
│ │ Team Impact: 2 others on leave during this period │ │\
│ │ Projects: Sprint 23 ends 16 Jan ⚠️ │ │\
│ │ │ │\
│ │ \[Approve\] \[Reject\] \[Discuss\] │ │\
│ └─────────────────────────────────────────────────────┘ │\
│ │\
└─────────────────────────────────────────────────────────────┘

##### 4.3.4.4 Leave Cancellation

**Employee-Initiated:** - Can cancel before leave starts - Partial
cancellation for multi-day leaves - Auto-reversal of balance -
Notification to approver

**Employer-Initiated:** - Can recall employee from leave (emergency) -
Unused days credited back - Documented with reason

#### 4.3.5 Leave Calendar & Visibility

##### 4.3.5.1 Team Calendar View

┌─────────────────────────────────────────────────────────────┐\
│ Team Leave Calendar - January 2025 │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ Name │ M T W T F │ M T W T F │ \... │\
│ │ 6 7 8 9 10 │ 13 14 15 16 17 │ │\
│ ──────────────────────────────────────────────────────────│\
│ Rahul S. │ . . . . . │ . . EL EL EL │ │\
│ Priya G. │ . . SL . . │ . . . . . │ │\
│ Amit K. │ . . . . CL│ . . . . . │ │\
│ Sneha P. │ . . . . . │ EL EL . . . │ │\
│ ──────────────────────────────────────────────────────────│\
│ │\
│ Legend: EL=Earned SL=Sick CL=Casual PH=Public Holiday │\
└─────────────────────────────────────────────────────────────┘

##### 4.3.5.2 Employee Dashboard

┌─────────────────────────────────────────────────────────────┐\
│ My Leave Summary - FY 2024-25 │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ │\
│ │ 12.5 │ │ 8 │ │ 10 │ │\
│ │ Earned │ │ Casual │ │ Sick │ │\
│ │ Leave │ │ Leave │ │ Leave │ │\
│ │ │ │ │ │ │ │\
│ │ ████████░░ │ │ ████████░░ │ │ ██████████ │ │\
│ │ 12.5/15 │ │ 8/12 │ │ 10/12 │ │\
│ └────────────┘ └────────────┘ └────────────┘ │\
│ │\
│ Upcoming Leaves: │\
│ • 15-17 Jan: Earned Leave (Approved) │\
│ │\
│ Recent Activity: │\
│ • 10 Dec: 1 CL taken │\
│ • 01 Dec: January accrual credited (+1.25 EL, +1 CL) │\
│ │\
│ \[Apply Leave\] \[View History\] \[Download Statement\] │\
└─────────────────────────────────────────────────────────────┘

#### 4.3.6 Reports & Analytics

**Standard Reports:** - Leave Balance Report (All employees) - Leave
Utilisation Report (By type, department, period) - Absenteeism Report -
Leave Liability Report (For encashment provisioning) - Trend Analysis
(Month-over-month, year-over-year)

### 4.4 Public Holiday Calendar

#### 4.4.1 Overview

Centralised management of public holidays with support for national,
state-specific, and company-declared holidays.

#### 4.4.2 Holiday Categories

##### 4.4.2.1 National Holidays (Gazetted)

  -----------------------------------------------------------------------
  Date                    Holiday                 Type
  ----------------------- ----------------------- -----------------------
  26 January              Republic Day            Fixed

  15 August               Independence Day        Fixed

2 October               Gandhi Jayanti          Fixed
  -----------------------------------------------------------------------

##### 4.4.2.2 Major Festivals (Common)

  -----------------------------------------------------------------------
  Holiday                 Typical Month           Type
  ----------------------- ----------------------- -----------------------
  Diwali                  October/November        Variable

  Holi                    March                   Variable

  Dussehra                October                 Variable

  Christmas               December                Fixed

  Eid ul-Fitr             Variable                Variable

Eid ul-Adha             Variable                Variable
  -----------------------------------------------------------------------

##### 4.4.2.3 State-Specific Holidays

  -----------------------------------------------------------------------
  State                               Sample Holidays
  ----------------------------------- -----------------------------------
  Tamil Nadu                          Pongal (4 days), Tamil New Year

  Maharashtra                         Maharashtra Day, Gudi Padwa

  Karnataka                           Kannada Rajyotsava

  Kerala                              Onam, Vishu

West Bengal                         Durga Puja (5 days)
  -----------------------------------------------------------------------

##### 4.4.2.4 Restricted Holidays

Optional holidays that employees can choose from (typically 2-3 per year
from a larger list).

#### 4.4.3 Holiday Configuration

##### 4.4.3.1 Admin Interface

┌─────────────────────────────────────────────────────────────┐\
│ Holiday Calendar Management - 2025 │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ \[+ Add Holiday\] \[Import from Template\] \[Copy from Year\] │\
│ │\
│ Filter: \[All Types ▼\] \[All Locations ▼\] │\
│ │\
│ ┌────────────────────────────────────────────────────────┐ │\
│ │ Date │ Holiday │ Type │ Location │ │\
│ │────────────────────────────────────────────────────────│ │\
│ │ 01 Jan │ New Year\'s Day │ Declared │ All │ │\
│ │ 14 Jan │ Pongal │ State │ TN Only │ │\
│ │ 26 Jan │ Republic Day │ National │ All │ │\
│ │ \... │ \... │ \... │ \... │ │\
│ └────────────────────────────────────────────────────────┘ │\
│ │\
│ Total Holidays: 15 (National: 3, Festival: 8, State: 4) │\
│ │\
└─────────────────────────────────────────────────────────────┘

##### 4.4.3.2 Add Holiday Form

  ----------------------------------------------------------------------------------
  Field                   Type                    Notes
  ----------------------- ----------------------- ----------------------------------
  Holiday Name            Text                    e.g., "Diwali"

  Date                    Date Picker             Select date

  Holiday Type            Dropdown                National/Festival/State/Declared

  Applicable To           Multi-select            All/Specific Offices/Departments

  Is Restricted           Toggle                  If yes, counts against RH quota

  Description             Text                    Optional notes

Recurring               Toggle                  Repeat annually (for fixed dates)
  ----------------------------------------------------------------------------------

#### 4.4.4 Employee Holiday View

##### 4.4.4.1 Calendar View

┌─────────────────────────────────────────────────────────────┐\
│ Public Holidays - 2025 \[List\] \[Calendar\]│\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ JANUARY 2025 │\
│ ┌───┬───┬───┬───┬───┬───┬───┐ │\
│ │ S │ M │ T │ W │ T │ F │ S │ │\
│ ├───┼───┼───┼───┼───┼───┼───┤ │\
│ │ │ │ │(1)│ 2 │ 3 │ 4 │ (1) New Year\'s Day │\
│ │ 5 │ 6 │ 7 │ 8 │ 9 │ 10│ 11│ │\
│ │ 12│ 13│(14)│ 15│ 16│ 17│ 18│ (14) Pongal │\
│ │ 19│ 20│ 21│ 22│ 23│ 24│ 25│ │\
│ │(26)│ 27│ 28│ 29│ 30│ 31│ │ (26) Republic Day │\
│ └───┴───┴───┴───┴───┴───┴───┘ │\
│ │\
│ FEBRUARY 2025 │\
│ \... │\
└─────────────────────────────────────────────────────────────┘

##### 4.4.4.2 List View

┌─────────────────────────────────────────────────────────────┐\
│ Upcoming Public Holidays │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ ✦ Wed, 01 Jan - New Year\'s Day │\
│ Company Declared Holiday │\
│ │\
│ ✦ Tue, 14 Jan - Pongal │\
│ Festival \| Applicable: Chennai Office │\
│ │\
│ ✦ Sun, 26 Jan - Republic Day │\
│ National Holiday \| All Offices (Falls on Weekend) │\
│ │\
│ ✦ Thu, 13 Mar - Holi │\
│ Festival \| All Offices │\
│ │\
│ \[Download Full Year Calendar\] │\
└─────────────────────────────────────────────────────────────┘

#### 4.4.5 Integration with Leave System

- Holidays excluded from leave day count

- Weekend + Holiday combinations handled

- Sandwich rule configuration (optional):

  - If leave taken before and after holiday, holiday counts as leave

  - Configurable per company policy

### 4.5 Birthday & Work Anniversary

#### 4.5.1 Overview

Automated celebration and recognition module that tracks employee
birthdays and work anniversaries, sending timely notifications and
enabling team celebrations.

#### 4.5.2 Data Sources

  -----------------------------------------------------------------------
  Event                   Source Field            Calculation
  ----------------------- ----------------------- -----------------------
  Birthday                Date of Birth (Employee Annual recurrence
                          Profile)

Work Anniversary        Joining Date (Employee  Years of service
                          Record)
  -----------------------------------------------------------------------

#### 4.5.3 Dashboard Views

##### 4.5.3.1 HR/Admin Dashboard

┌─────────────────────────────────────────────────────────────┐\
│ Birthdays & Work Anniversaries │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ TODAY - 2 January 2025 │\
│ ┌─────────────────────────────────────────────────────┐ │\
│ │ 🎂 Rahul Sharma - Birthday │ │\
│ │ Engineering │ Senior Developer │ │\
│ └─────────────────────────────────────────────────────┘ │\
│ ┌─────────────────────────────────────────────────────┐ │\
│ │ 🎉 Priya Gupta - 3 Years Work Anniversary │ │\
│ │ Sales │ Account Manager │ │\
│ └─────────────────────────────────────────────────────┘ │\
│ │\
│ THIS WEEK (3 Jan - 9 Jan) │\
│ ┌─────────────────────────────────────────────────────┐ │\
│ │ 5 Jan │ 🎂 Amit Kumar - Birthday │ │\
│ │ 7 Jan │ 🎉 Sneha Patel - 1 Year Anniversary │ │\
│ │ 8 Jan │ 🎂 Vijay Singh - Birthday │ │\
│ └─────────────────────────────────────────────────────┘ │\
│ │\
│ THIS MONTH │\
│ Birthdays: 8 │ Anniversaries: 5 │\
│ \[View Full Calendar\] │\
│ │\
└─────────────────────────────────────────────────────────────┘

##### 4.5.3.2 Employee Dashboard Widget

┌─────────────────────────────────────────────────────────────┐\
│ 🎂 Upcoming Celebrations │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ Today │\
│ • Rahul Sharma - Birthday 🎂 │\
│ • Priya Gupta - 3 Years at Company 🎉 │\
│ │\
│ This Week │\
│ • 5 Jan - Amit Kumar (Birthday) │\
│ • 7 Jan - Sneha Patel (1 Year) │\
│ │\
│ \[Send Wishes\] │\
└─────────────────────────────────────────────────────────────┘

#### 4.5.4 Calendar View

┌─────────────────────────────────────────────────────────────┐\
│ January 2025 - Celebrations Calendar │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ ┌───┬───┬───┬───┬───┬───┬───┐ │\
│ │ S │ M │ T │ W │ T │ F │ S │ │\
│ ├───┼───┼───┼───┼───┼───┼───┤ │\
│ │ │ │ │ 1 │🎂2│ 3 │ 4 │ │\
│ │ 5 │ 6 │ 7 │ 8 │ 9 │ 10│ 11│ │\
│ │🎂 │ │🎉 │🎂 │ │ │ │ │\
│ │ 12│ 13│ 14│ 15│ 16│ 17│ 18│ │\
│ │ │ │ │🎉 │ │ │🎂 │ │\
│ │ 19│ 20│ 21│ 22│ 23│ 24│ 25│ │\
│ │ │🎂 │ │ │ │ │ │ │\
│ │ 26│ 27│ 28│ 29│ 30│ 31│ │ │\
│ │🎉 │ │ │🎂 │ │ │ │ │\
│ └───┴───┴───┴───┴───┴───┴───┘ │\
│ │\
│ Legend: 🎂 Birthday 🎉 Work Anniversary │\
│ │\
└─────────────────────────────────────────────────────────────┘

#### 4.5.5 Notification System

##### 4.5.5.1 Notification Configuration

  ------------------------------------------------------------------------
  Notification            Recipients          Timing        Channel
  ----------------------- ------------------- ------------- --------------
  Birthday Reminder       HR, Manager, Team   Day before,   Email,
                                              Day of        Dashboard

  Birthday Wish           Employee            Day of        Email
                                              (morning)

  Anniversary Reminder    HR, Manager         Day before,   Email,
                                              Day of        Dashboard

  Anniversary Wish        Employee            Day of        Email
                                              (morning)

Monthly Summary         HR                  1st of month  Email
  ------------------------------------------------------------------------

##### 4.5.5.2 Email Templates

**Birthday Wish Email:**

Subject: Happy Birthday, {{employee_name}}! 🎂\
\
Dear {{employee_name}},\
\
Wishing you a very Happy Birthday from everyone at {{company_name}}!\
\
May this special day bring you joy, happiness, and success in the\
year ahead.\
\
Have a wonderful celebration!\
\
Warm regards,\
Team {{company_name}}

**Work Anniversary Email:**

Subject: Congratulations on {{years}} Years at {{company_name}}! 🎉\
\
Dear {{employee_name}},\
\
Congratulations on completing {{years}} year(s) with {{company_name}}!\
\
Your dedication, hard work, and contributions have been invaluable\
to our team. We truly appreciate everything you do.\
\
Here\'s to many more successful years together!\
\
With gratitude,\
Team {{company_name}}

##### 4.5.5.3 Team Notification

Subject: Team Celebration Today! 🎉\
\
Hi Team,\
\
Please join us in wishing:\
\
🎂 Rahul Sharma - Happy Birthday!\
🎉 Priya Gupta - Congratulations on 3 Years!\
\
Let\'s make their day special!\
\
Best,\
HR Team

#### 4.5.6 Configuration Settings

┌─────────────────────────────────────────────────────────────┐\
│ Birthday & Anniversary Settings │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ Birthday Notifications │\
│ ├─ Enable Birthday Wishes: \[✓\] │\
│ ├─ Send to Employee: \[✓\] Email │\
│ ├─ Notify Manager: \[✓\] Day before │\
│ ├─ Notify Team: \[✓\] Day of │\
│ └─ Wish Email Time: \[09:00 AM\] │\
│ │\
│ Work Anniversary Notifications │\
│ ├─ Enable Anniversary Wishes: \[✓\] │\
│ ├─ Send to Employee: \[✓\] Email │\
│ ├─ Notify Manager: \[✓\] Day before │\
│ ├─ Notify HR: \[✓\] Day of │\
│ └─ Milestone Alerts (5,10,15 yrs):\[✓\] │\
│ │\
│ Dashboard Display │\
│ ├─ Show on Employee Dashboard: \[✓\] │\
│ ├─ Days to Show Ahead: \[7\] days │\
│ └─ Show Department Filter: \[✓\] │\
│ │\
│ \[Save Settings\] │\
└─────────────────────────────────────────────────────────────┘

#### 4.5.7 Milestone Recognition

  -----------------------------------------------------------------------
  Milestone                           Recognition
  ----------------------------------- -----------------------------------
  1 Year                              Certificate + Acknowledgement

  3 Years                             Certificate + Small Gift

  5 Years                             Certificate + Gift + Recognition

  10 Years                            Certificate + Gift + Public
                                      Recognition

15+ Years                           Special Recognition + Bonus
                                      (Configurable)
  -----------------------------------------------------------------------

### 4.6 Performance Reviews & Salary Revision

#### 4.6.1 Overview

Annual performance review system integrated with Google Docs for form
creation and completion, with workflow management in the HRMS. Includes
salary revision process linked to performance outcomes.

#### 4.6.2 Review Cycle Configuration

##### 4.6.2.1 Cycle Settings

  ------------------------------------------------------------------------------
  Setting                 Options                        Default
  ----------------------- ------------------------------ -----------------------
  Review Period           Annual/Semi-Annual/Quarterly   Annual

  Cycle Start             Month selection                April

  Self-Review Window      Number of days                 7 days

  Manager Review Window   Number of days                 14 days

  Calibration Period      Number of days                 7 days

Feedback Release        Automatic/Manual               Manual
  ------------------------------------------------------------------------------

##### 4.6.2.2 Review Timeline Example (Annual)

┌─────────────────────────────────────────────────────────────┐\
│ FY 2024-25 Performance Review Timeline │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ 1 Apr ──────────────────────────────────────────▶ 31 Mar │\
│ │ REVIEW PERIOD (FY 2024-25) │ │\
│ │ │ │\
│ │ ┌────────────┘ │\
│ │ │ │\
│ │ ▼ │\
│ │ 1-7 Apr 2025 │\
│ │ Self Review │\
│ │ │ │\
│ │ ▼ │\
│ │ 8-21 Apr 2025 │\
│ │ Manager Review │\
│ │ │ │\
│ │ ▼ │\
│ │ 22-28 Apr 2025 │\
│ │ Calibration │\
│ │ │ │\
│ │ ▼ │\
│ │ 1 May 2025 │\
│ │ Feedback Release │\
│ └────────────────────────────────────────────────────── │\
└─────────────────────────────────────────────────────────────┘

#### 4.6.3 Google Docs Integration

##### 4.6.3.1 Review Form Template

**Template Structure (Google Doc):**

┌─────────────────────────────────────────────────────────────┐\
│ ANNUAL PERFORMANCE REVIEW │\
│ FY 2024-25 │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ EMPLOYEE INFORMATION │\
│ Name: {{employee_name}} │\
│ Employee ID: {{employee_id}} │\
│ Department: {{department}} │\
│ Designation: {{designation}} │\
│ Manager: {{manager_name}} │\
│ Review Period: {{review_period}} │\
│ │\
│ ───────────────────────────────────────────────────────── │\
│ │\
│ PART A: SELF ASSESSMENT (To be filled by Employee) │\
│ │\
│ 1. Key Achievements │\
│ List your top 3-5 achievements this year: │\
│
\[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\]
│\
│ │\
│ 2. Goals Review │\
│ │ Goal │ Target │ Achieved │ Self Rating │ │\
│ │──────────────────────────────────────│ │\
│ │ │ │ │ │ │\
│ │\
│ 3. Areas for Development │\
│
\[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\]
│\
│ │\
│ 4. Career Aspirations │\
│
\[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\]
│\
│ │\
│ 5. Training/Support Needed │\
│
\[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\]
│\
│ │\
│ Overall Self Rating: \[ \] 1-5 scale │\
│ │\
│ ───────────────────────────────────────────────────────── │\
│ │\
│ PART B: MANAGER ASSESSMENT (To be filled by Manager) │\
│ │\
│ 1. Performance Summary │\
│
\[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\]
│\
│ │\
│ 2. Competency Ratings │\
│ │ Competency │ Rating (1-5) │ Comments │ │\
│ │───────────────────────────────────────────│ │\
│ │ Technical Skills │ │ │ │\
│ │ Communication │ │ │ │\
│ │ Teamwork │ │ │ │\
│ │ Initiative │ │ │ │\
│ │ Reliability │ │ │ │\
│ │\
│ 3. Strengths │\
│
\[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\]
│\
│ │\
│ 4. Areas for Improvement │\
│
\[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\]
│\
│ │\
│ 5. Recommendations │\
│ □ Promotion Ready □ Needs Development □ On Track │\
│ │\
│ Overall Rating: \[ \] 1-5 scale │\
│ │\
│ ───────────────────────────────────────────────────────── │\
│ │\
│ PART C: GOALS FOR NEXT YEAR │\
│ │ Goal │ KPI │ Target │ Timeline │ │\
│ │────────────────────────────────│ │\
│ │ │ │ │ │ │\
│ │\
│ ───────────────────────────────────────────────────────── │\
│ │\
│ SIGNATURES │\
│ Employee: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_ │\
│ Manager: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_ │\
│ HR: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_ │\
│ │\
└─────────────────────────────────────────────────────────────┘

##### 4.6.3.2 Integration Workflow

┌────────────────────────────────────────────────────────────────────┐\
│ REVIEW CYCLE WORKFLOW │\
├────────────────────────────────────────────────────────────────────┤\
│ │\
│ 1. HR INITIATES CYCLE │\
│ │ │\
│ ▼ │\
│ ┌─────────────────────────────────────────────────────────────┐ │\
│ │ System creates Google Doc from template for each employee │ │\
│ │ Pre-fills: Name, ID, Department, Manager, Period │ │\
│ │ Sets permissions: Employee (Edit Part A), Manager (View) │ │\
│ │ Stores Doc ID in HRMS database │ │\
│ └─────────────────────────────────────────────────────────────┘ │\
│ │ │\
│ ▼ │\
│ 2. EMPLOYEE NOTIFICATION │\
│ Email with link to their review document │\
│ │ │\
│ ▼ │\
│ 3. EMPLOYEE COMPLETES SELF-REVIEW │\
│ Fills Part A in Google Doc │\
│ Marks complete in HRMS │\
│ │ │\
│ ▼ │\
│ ┌─────────────────────────────────────────────────────────────┐ │\
│ │ System updates Doc permissions: │ │\
│ │ Employee (View only), Manager (Edit Part B) │ │\
│ └─────────────────────────────────────────────────────────────┘ │\
│ │ │\
│ ▼ │\
│ 4. MANAGER NOTIFICATION │\
│ Email to complete manager assessment │\
│ │ │\
│ ▼ │\
│ 5. MANAGER COMPLETES REVIEW │\
│ Fills Part B and C in Google Doc │\
│ Marks complete in HRMS │\
│ │ │\
│ ▼ │\
│ 6. HR CALIBRATION (Optional) │\
│ HR reviews all ratings for consistency │\
│ │ │\
│ ▼ │\
│ 7. FEEDBACK MEETING │\
│ Manager schedules and conducts feedback discussion │\
│ │ │\
│ ▼ │\
│ 8. ACKNOWLEDGEMENT │\
│ Employee signs off on review │\
│ Final document locked │\
│ │\
└────────────────────────────────────────────────────────────────────┘

##### 4.6.3.3 Google Docs API Integration

**Required API Operations:**

  -----------------------------------------------------------------------
  Operation                           Purpose
  ----------------------------------- -----------------------------------
  Copy Document                       Create individual review from
                                      template

  Update Permissions                  Control edit access by stage

  Read Document                       Sync status and extract ratings

Export PDF                          Archive completed reviews
  -----------------------------------------------------------------------

**Authentication:** - OAuth 2.0 for Google Workspace - Service account
for automated operations - User consent for document access

#### 4.6.4 HRMS Review Dashboard

##### 4.6.4.1 HR Admin View

┌─────────────────────────────────────────────────────────────┐\
│ Performance Review Dashboard - FY 2024-25 │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ Cycle Status: Self-Review Phase (Day 5 of 7) │\
│ │\
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │\
│ │ 45 │ │ 32 │ │ 13 │ │\
│ │ Total │ │ Self-Review │ │ Pending │ │\
│ │ Employees │ │ Complete │ │ │ │\
│ └─────────────┘ └─────────────┘ └─────────────┘ │\
│ │\
│ Progress: ████████████████░░░░░░░░ 71% │\
│ │\
│ Pending Self-Reviews: │\
│ ┌────────────────────────────────────────────────────────┐│\
│ │ Employee │ Department │ Manager │ Reminder ││\
│ │───────────────────────────────────────────────────────││\
│ │ Rahul Sharma │ Engineering│ Priya P. │ \[Send\] ││\
│ │ Amit Kumar │ Sales │ Ravi M. │ \[Send\] ││\
│ │ \... │ \... │ \... │ \[Send All\] ││\
│ └────────────────────────────────────────────────────────┘│\
│ │\
│ \[View All Reviews\] \[Export Report\] \[Send Bulk Reminder\] │\
└─────────────────────────────────────────────────────────────┘

##### 4.6.4.2 Employee View

┌─────────────────────────────────────────────────────────────┐\
│ My Performance Review │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ FY 2024-25 Review │\
│ Status: Self-Review - In Progress │\
│ Due: 7 April 2025 (2 days remaining) │\
│ │\
│ \[Open Review Document\] │\
│ │\
│ ───────────────────────────────────────────────────────── │\
│ │\
│ Past Reviews: │\
│ • FY 2023-24 - Completed - Rating: 4.2/5 \[View PDF\] │\
│ • FY 2022-23 - Completed - Rating: 3.8/5 \[View PDF\] │\
│ │\
└─────────────────────────────────────────────────────────────┘

##### 4.6.4.3 Manager View

┌─────────────────────────────────────────────────────────────┐\
│ Team Performance Reviews │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ My Team: 8 members │\
│ │\
│ ┌────────────────────────────────────────────────────────┐│\
│ │ Employee │ Self-Review │ Manager Review │ Status ││\
│ │───────────────────────────────────────────────────────││\
│ │ Rahul Sharma │ Complete │ Not Started │ \[Start\] ││\
│ │ Sneha Patel │ Complete │ In Progress │ \[Resume\]││\
│ │ Vijay Kumar │ Pending │ - │ Waiting ││\
│ │ \... │ \... │ \... │ \... ││\
│ └────────────────────────────────────────────────────────┘│\
│ │\
│ Completed: 0/8 │ In Progress: 1/8 │ Waiting: 7/8 │\
│ │\
└─────────────────────────────────────────────────────────────┘

#### 4.6.5 Notifications

  -----------------------------------------------------------------------
  Event                   Recipient               Timing
  ----------------------- ----------------------- -----------------------
  Cycle Started           All Employees           Day 1

  Self-Review Due         Employee                Day 5, Day 7 (deadline)

  Self-Review Complete    Manager                 Immediate

  Manager Review Due      Manager                 Day 10, Day 14
                                                  (deadline)

  Review Complete         Employee                When released

  Feedback Meeting        Employee + Manager      When scheduled

Salary Revision Letter  Employee                After approval
  -----------------------------------------------------------------------

#### 4.6.6 Salary Revision

##### 4.6.6.1 Salary Revision Workflow

┌────────────────────────────────────────────────────────────────────┐\
│ SALARY REVISION PROCESS │\
├────────────────────────────────────────────────────────────────────┤\
│ │\
│ 1. PERFORMANCE REVIEW COMPLETE │\
│ │ │\
│ ▼ │\
│ ┌─────────────────────────────────────────────────────────────┐ │\
│ │ HR/Manager enters recommended salary revision │ │\
│ │ Based on: Performance Rating + Market Data + Budget │ │\
│ └─────────────────────────────────────────────────────────────┘ │\
│ │ │\
│ ▼ │\
│ 2. REVISION APPROVAL │\
│ ┌───────────────┐ ┌───────────────┐ │\
│ │ Manager │────▶│ HR/Finance │ │\
│ │ Recommends │ │ Approves │ │\
│ └───────────────┘ └───────────────┘ │\
│ │ │\
│ ▼ │\
│ 3. REVISION LETTER GENERATION │\
│ ┌─────────────────────────────────────────────────────────────┐│\
│ │ HR uploads signed salary revision letter (PDF/DOCX) ││\
│ │ System sends to employee via email ││\
│ └─────────────────────────────────────────────────────────────┘│\
│ │ │\
│ ▼ │\
│ 4. EMPLOYEE ACKNOWLEDGEMENT │\
│ Employee accepts/acknowledges revision │\
│ │ │\
│ ▼ │\
│ 5. EFFECTIVE DATE │\
│ New salary applied from effective date │\
│ │\
└────────────────────────────────────────────────────────────────────┘

##### 4.6.6.2 Salary Revision Data Entry

┌─────────────────────────────────────────────────────────────┐\
│ Salary Revision - Rahul Sharma (EMP001) │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ Performance Review: FY 2024-25 │\
│ Rating: 4.2 / 5.0 │\
│ Recommendation: On Track │\
│ │\
│ ───────────────────────────────────────────────────────── │\
│ │\
│ CURRENT COMPENSATION │\
│ ┌─────────────────────────────────────────────────────┐ │\
│ │ Annual CTC: ₹12,00,000 │ │\
│ │ Monthly Gross: ₹1,00,000 │ │\
│ │ Basic Salary: ₹50,000 │ │\
│ │ Last Revision: April 2024 │ │\
│ └─────────────────────────────────────────────────────┘ │\
│ │\
│ PROPOSED REVISION │\
│ ┌─────────────────────────────────────────────────────┐ │\
│ │ Revision Type: \[Annual Increment ▼\] │ │\
│ │ │ │\
│ │ New Annual CTC: ₹\[13,20,000\] │ │\
│ │ Increment Amount: ₹1,20,000 │ │\
│ │ Increment Percentage: 10% │ │\
│ │ │ │\
│ │ Effective Date: \[01 April 2025 📅\] │ │\
│ │ │ │\
│ │ New Salary Breakup: │ │\
│ │ ├─ Basic: ₹55,000 (+₹5,000) │ │\
│ │ ├─ HRA: ₹27,500 (+₹2,500) │ │\
│ │ ├─ Special Allowance: ₹27,500 (+₹2,500) │ │\
│ │ └─ Other Components: Auto-calculated │ │\
│ └─────────────────────────────────────────────────────┘ │\
│ │\
│ Justification/Notes: │\
│ \[Excellent performance, completed all goals, key \]│\
│ \[contributor to Project Alpha launch \]│\
│ │\
│ \[Save Draft\] \[Submit for Approval\] │\
│ │\
└─────────────────────────────────────────────────────────────┘

##### 4.6.6.3 Salary Revision Letter Upload & Sending

┌─────────────────────────────────────────────────────────────┐\
│ Send Salary Revision Letter │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ Employee: Rahul Sharma (EMP001) │\
│ Revision: ₹12,00,000 → ₹13,20,000 (10% increment) │\
│ Effective: 01 April 2025 │\
│ Status: Approved ✓ │\
│ │\
│ ───────────────────────────────────────────────────────── │\
│ │\
│ Upload Revision Letter: │\
│ ┌─────────────────────────────────────────────────────┐ │\
│ │ │ │\
│ │ Drag and drop file here │ │\
│ │ or \[Browse Files\] │ │\
│ │ │ │\
│ │ Supported: PDF, DOCX (Max 10MB) │ │\
│ └─────────────────────────────────────────────────────┘ │\
│ │\
│ Email Subject: │\
│ \[Salary Revision Letter - FY 2025-26\] │\
│ │\
│ Email Message: │\
│ \[Dear Rahul, \] │\
│ \[ \] │\
│ \[Please find attached your salary revision letter \] │\
│ \[effective 01 April 2025\... \] │\
│ │\
│ \[Preview Email\] \[Send to Employee\] │\
│ │\
└─────────────────────────────────────────────────────────────┘

##### 4.6.6.4 Salary Revision Email

**Subject:** Salary Revision Letter - FY {{financial_year}}

**Body:**

Dear {{employee_name}},\
\
We are pleased to inform you of your salary revision for the\
financial year {{financial_year}}.\
\
Please find attached your official salary revision letter with\
complete details of your revised compensation structure.\
\
Your revised salary will be effective from {{effective_date}}.\
\
To view and acknowledge your revision letter, please click the\
link below:\
\[View Revision Letter\]\
\
If you have any questions, please contact the HR team.\
\
Best regards,\
{{hr_name}}\
Human Resources\
{{company_name}}

##### 4.6.6.5 Employee Acknowledgement

┌─────────────────────────────────────────────────────────────┐\
│ Salary Revision Acknowledgement │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ Your Salary Revision Letter │\
│ │\
│ Financial Year: FY 2025-26 │\
│ Effective Date: 01 April 2025 │\
│ │\
│ Revision Summary: │\
│ ┌─────────────────────────────────────────────────────┐ │\
│ │ Previous CTC: ₹12,00,000 │ │\
│ │ Revised CTC: ₹13,20,000 │ │\
│ │ Increment: ₹1,20,000 (10%) │ │\
│ └─────────────────────────────────────────────────────┘ │\
│ │\
│ \[View Full Letter (PDF)\] │\
│ │\
│ ───────────────────────────────────────────────────────── │\
│ │\
│ ☐ I acknowledge receipt of my salary revision letter │\
│ and accept the revised compensation. │\
│ │\
│ \[Acknowledge & Accept\] │\
│ │\
└─────────────────────────────────────────────────────────────┘

##### 4.6.6.6 Revision History

┌─────────────────────────────────────────────────────────────┐\
│ Salary Revision History - Rahul Sharma │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ ┌────────────────────────────────────────────────────────┐│\
│ │ Effective │ Previous │ Revised │ % Change │ Status ││\
│ │───────────────────────────────────────────────────────││\
│ │ Apr 2025 │ 12,00,000 │ 13,20,000 │ +10% │ Active ││\
│ │ Apr 2024 │ 10,00,000 │ 12,00,000 │ +20% │ \[View\] ││\
│ │ Apr 2023 │ 8,00,000 │ 10,00,000 │ +25% │ \[View\] ││\
│ │ Mar 2022 │ - │ 8,00,000 │ Joining │ \[View\] ││\
│ └────────────────────────────────────────────────────────┘│\
│ │\
└─────────────────────────────────────────────────────────────┘

### 4.7 Offboarding & Exit Management

#### 4.7.1 Overview

Comprehensive offboarding module to manage employee exits including
resignation processing, exit interviews, clearance workflows, and full &
final settlement tracking.

#### 4.7.2 Exit Types

  ------------------------------------------------------------------------
  Exit Type         Notice Required    FNF Timeline      Documents
  ----------------- ------------------ ----------------- -----------------
  Resignation       As per contract    30-45 days        Resignation
                                                         letter

  Termination       Immediate/Notice   30 days           Termination
                                                         letter

  Retirement        Policy-based       30 days           \-

  Contract End      N/A                15 days           \-

Absconding        N/A                45 days           \-
  ------------------------------------------------------------------------

#### 4.7.3 Resignation Workflow

##### 4.7.3.1 Employee Resignation Submission

┌─────────────────────────────────────────────────────────────┐\
│ Submit Resignation │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ ⚠️ Please ensure you have discussed this with your │\
│ manager before submitting your resignation. │\
│ │\
│ ───────────────────────────────────────────────────────── │\
│ │\
│ Notice Period: 30 days (as per your contract) │\
│ Today\'s Date: 02 January 2025 │\
│ │\
│ Resignation Date: \[02 January 2025 📅\] │\
│ Requested Last Working Day: \[01 February 2025 📅\] │\
│ │\
│ Early Release Requested: ○ Yes ● No │\
│ (If yes, subject to manager/HR approval) │\
│ │\
│ Reason for Leaving: \[Personal reasons ▼\] │\
│ ├─ Personal reasons │\
│ ├─ Better opportunity │\
│ ├─ Higher studies │\
│ ├─ Relocation │\
│ ├─ Health reasons │\
│ ├─ Career change │\
│ └─ Other │\
│ │\
│ Additional Comments: │\
│
\[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\]
│\
│
\[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\]
│\
│ │\
│ Upload Resignation Letter: │\
│ \[Choose File\] resignation_letter.pdf │\
│ │\
│ ☐ I confirm that I wish to resign from my position │\
│ and understand the notice period requirements. │\
│ │\
│ \[Cancel\] \[Submit Resignation\] │\
│ │\
└─────────────────────────────────────────────────────────────┘

##### 4.7.3.2 Resignation Approval Workflow

┌────────────────┐ ┌────────────────┐ ┌────────────────┐\
│ Employee │────▶│ Manager │────▶│ HR │\
│ Submits │ │ Reviews │ │ Processes │\
└────────────────┘ └───────┬────────┘ └───────┬────────┘\
│ │\
┌──────────┴──────────┐ ┌──────┴──────┐\
│ │ │ │\
▼ ▼ ▼ ▼\
┌──────────┐ ┌──────────┐ ┌──────────┐\
│ Accept │ │ Negotiate│ │ Confirm │\
│ LWD │ │ LWD │ │ & Start │\
└──────────┘ └──────────┘ │ Clearance│\
└──────────┘

##### 4.7.3.3 Manager Resignation Review

┌─────────────────────────────────────────────────────────────┐\
│ Resignation Review - Rahul Sharma │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ Employee: Rahul Sharma (EMP001) │\
│ Department: Engineering │\
│ Tenure: 2 years 9 months │\
│ │\
│ Resignation Details: │\
│ ┌─────────────────────────────────────────────────────┐ │\
│ │ Submitted On: 02 January 2025 │ │\
│ │ Notice Period: 30 days │ │\
│ │ Requested LWD: 01 February 2025 │ │\
│ │ Reason: Better opportunity │ │\
│ │ Early Release: Not requested │ │\
│ └─────────────────────────────────────────────────────┘ │\
│ │\
│ \[View Resignation Letter\] │\
│ │\
│ Manager Decision: │\
│ ┌─────────────────────────────────────────────────────┐ │\
│ │ ○ Accept resignation with requested LWD │ │\
│ │ ○ Accept with different LWD: \[\_\_\_\_\_\_\_\_\_ 📅\] │ │\
│ │ ○ Request retention discussion │ │\
│ └─────────────────────────────────────────────────────┘ │\
│ │\
│ Comments: │\
│
\[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\]
│\
│ │\
│ \[Submit Decision\] │\
│ │\
└─────────────────────────────────────────────────────────────┘

#### 4.7.4 Exit Clearance Process

##### 4.7.4.1 Clearance Checklist

  -----------------------------------------------------------------------
  Department           Clearance Items              Responsible
  -------------------- ---------------------------- ---------------------
  **IT**               Laptop return, Email         IT Admin
                       deactivation, Access
                       revocation

  **Finance**          Advance settlement, Expense  Finance
                       claims, Loan recovery

  **Admin**            ID card, Access cards,       Admin
                       Parking, Keys

  **HR**               Exit interview, Document     HR
                       handover, PF nomination

  **Manager**          Knowledge transfer, Project  Manager
                       handover, Pending tasks

**Library**          Books/materials return       Library
  -----------------------------------------------------------------------

##### 4.7.4.2 Clearance Dashboard (HR View)

┌─────────────────────────────────────────────────────────────┐\
│ Exit Clearance - Rahul Sharma │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ LWD: 01 February 2025 │ Days Remaining: 30 │\
│ Clearance Progress: ████████░░░░░░ 45% │\
│ │\
│ ┌────────────────────────────────────────────────────────┐│\
│ │ Department │ Status │ Completed By │ Action ││\
│ │───────────────────────────────────────────────────────││\
│ │ IT │ ✓ Complete │ 05 Jan │ \[View\] ││\
│ │ Finance │ ⏳ Pending │ - │ \[Remind\] ││\
│ │ Admin │ ✓ Complete │ 03 Jan │ \[View\] ││\
│ │ HR │ ⏳ Pending │ - │ \[Start\] ││\
│ │ Manager │ 🔄 In Progress │ - │ \[View\] ││\
│ │ Library │ ○ N/A │ - │ - ││\
│ └────────────────────────────────────────────────────────┘│\
│ │\
│ \[Send Bulk Reminder\] \[Generate FNF\] │\
│ │\
└─────────────────────────────────────────────────────────────┘

##### 4.7.4.3 Department Clearance Form

┌─────────────────────────────────────────────────────────────┐\
│ IT Clearance - Rahul Sharma │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ Checklist: │\
│ ┌─────────────────────────────────────────────────────┐ │\
│ │ ☑ Laptop returned │ │\
│ │ Asset ID: LAP-2022-045 │ │\
│ │ Condition: Good │ │\
│ │ │ │\
│ │ ☑ Email account deactivated │ │\
│ │ Scheduled for: LWD + 1 day │ │\
│ │ │ │\
│ │ ☑ VPN access revoked │ │\
│ │ │ │\
│ │ ☑ Software licences reclaimed │ │\
│ │ │ │\
│ │ ☐ Data backup completed │ │\
│ │ │ │\
│ │ ☐ GitHub/GitLab access removed │ │\
│ └─────────────────────────────────────────────────────┘ │\
│ │\
│ Notes: │\
│ \[Laptop charger missing - deducted from FNF \] │\
│ │\
│ Deductions (if any): ₹\[2,500\] │\
│ │\
│ \[Save Progress\] \[Mark as Complete\] │\
│ │\
└─────────────────────────────────────────────────────────────┘

#### 4.7.5 Exit Interview

##### 4.7.5.1 Exit Interview Questions

  -----------------------------------------------------------------------
  Category                  Sample Questions
  ------------------------- ---------------------------------------------
  **Role &                  Was your role clearly defined? Were
  Responsibilities**        expectations reasonable?

  **Management**            How was your relationship with your manager?
                            Did you receive adequate feedback?

  **Growth**                Were there sufficient growth opportunities?
                            Did you receive adequate training?

  **Work Environment**      How would you describe the work culture? Were
                            you treated fairly?

  **Compensation**          Was your compensation competitive? Were
                            benefits adequate?

  **Reason for Leaving**    What is the primary reason for leaving? What
                            could have changed your decision?

**Recommendations**       Would you recommend this company to others?
                            Would you consider returning?
  -----------------------------------------------------------------------

##### 4.7.5.2 Exit Interview Form

┌─────────────────────────────────────────────────────────────┐\
│ Exit Interview - Rahul Sharma │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ Interview Date: \[15 January 2025 📅\] │\
│ Conducted By: \[Priya Patel - HR ▼\] │\
│ Mode: \[In-Person ▼\] │\
│ │\
│ ───────────────────────────────────────────────────────── │\
│ │\
│ 1. Primary reason for leaving: │\
│ \[Better compensation and growth opportunity \] │\
│ │\
│ 2. What did you enjoy most about working here? │\
│ \[Team collaboration, learning opportunities \] │\
│ │\
│ 3. What could we have done to retain you? │\
│ \[More competitive salary, clearer promotion path \] │\
│ │\
│ 4. Rate your overall experience (1-5): │\
│ ○ 1 ○ 2 ○ 3 ● 4 ○ 5 │\
│ │\
│ 5. Would you recommend this company to others? │\
│ ● Yes ○ No ○ Maybe │\
│ │\
│ 6. Would you consider returning in the future? │\
│ ● Yes ○ No ○ Maybe │\
│ │\
│ Additional Comments: │\
│ \[Great team and culture. Main concern was salary gap \] │\
│ \[compared to market rates. \] │\
│ │\
│ \[Save Draft\] \[Submit Interview\] │\
│ │\
└─────────────────────────────────────────────────────────────┘

#### 4.7.6 Full & Final Settlement

##### 4.7.6.1 FNF Calculation

┌─────────────────────────────────────────────────────────────┐\
│ Full & Final Settlement - Rahul Sharma │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ LWD: 01 February 2025 │\
│ Clearance Status: Complete ✓ │\
│ │\
│ ═══════════════════════════════════════════════════════ │\
│ EARNINGS │\
│ ─────────────────────────────────────────────────────── │\
│ Salary (01-31 Jan 2025) ₹1,00,000 │\
│ Salary (01 Feb - pro-rata) ₹3,333 │\
│ Leave Encashment (12.5 days EL) ₹41,667 │\
│ Bonus (Pro-rata) ₹25,000 │\
│ Gratuity (if applicable) ₹0 │\
│ Reimbursements pending ₹5,000 │\
│ ─────────────────────────────────────────────────────── │\
│ Total Earnings ₹1,75,000 │\
│ │\
│ ═══════════════════════════════════════════════════════ │\
│ DEDUCTIONS │\
│ ─────────────────────────────────────────────────────── │\
│ Notice period recovery (if early exit) ₹0 │\
│ Loan outstanding ₹0 │\
│ Advance recovery ₹10,000 │\
│ Asset damage/loss (laptop charger) ₹2,500 │\
│ TDS ₹8,500 │\
│ ─────────────────────────────────────────────────────── │\
│ Total Deductions ₹21,000 │\
│ │\
│ ═══════════════════════════════════════════════════════ │\
│ NET PAYABLE ₹1,54,000 │\
│ ═══════════════════════════════════════════════════════ │\
│ │\
│ Payment Mode: \[Bank Transfer ▼\] │\
│ Bank Account: HDFC Bank - XXXX1234 (Verified ✓) │\
│ │\
│ \[Save Draft\] \[Submit for Approval\] \[Generate Statement\] │\
│ │\
└─────────────────────────────────────────────────────────────┘

##### 4.7.6.2 FNF Approval Workflow

┌────────────────┐ ┌────────────────┐ ┌────────────────┐\
│ HR Prepares │────▶│ Finance │────▶│ Payment │\
│ FNF │ │ Approves │ │ Processed │\
└────────────────┘ └────────────────┘ └────────────────┘\
│\
▼\
┌────────────────┐\
│ Employee │\
│ Notified │\
└────────────────┘

#### 4.7.7 Exit Documents

  -----------------------------------------------------------------------
  Document                Generated By            Timing
  ----------------------- ----------------------- -----------------------
  Resignation Acceptance  System/HR               On acceptance
  Letter

  Relieving Letter        HR                      LWD

  Experience Certificate  HR                      On request / LWD

  FNF Statement           Finance                 Within 30 days of LWD

  Form 16 (if applicable) Finance                 End of FY

PF Transfer/Withdrawal  HR                      On request
  Form
  -----------------------------------------------------------------------

#### 4.7.8 Notifications

  -----------------------------------------------------------------------
  Event                   Recipient               Timing
  ----------------------- ----------------------- -----------------------
  Resignation Submitted   Manager, HR             Immediate

  Resignation Accepted    Employee                On acceptance

  Clearance Reminder      Department heads        Weekly until complete

  Exit Interview          Employee, HR            7 days before LWD
  Scheduled

  FNF Ready               Employee                When approved

Documents Ready         Employee                When generated
  -----------------------------------------------------------------------

#### 4.7.9 Offboarding Dashboard

┌─────────────────────────────────────────────────────────────┐\
│ Offboarding Dashboard │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ Active Exits: 3 │\
│ │\
│ ┌────────────────────────────────────────────────────────┐│\
│ │ Employee │ LWD │ Clearance │ FNF │ Action ││\
│ │───────────────────────────────────────────────────────││\
│ │ Rahul Sharma │ 01 Feb │ 75% │ Draft │ \[View\] ││\
│ │ Priya Gupta │ 15 Feb │ 30% │ - │ \[View\] ││\
│ │ Amit Kumar │ 28 Feb │ 10% │ - │ \[View\] ││\
│ └────────────────────────────────────────────────────────┘│\
│ │\
│ Pending Actions: │\
│ • 2 clearances awaiting IT department │\
│ • 1 exit interview to be scheduled │\
│ • 1 FNF pending finance approval │\
│ │\
│ \[Export Report\] \[Send Reminders\] │\
│ │\
└─────────────────────────────────────────────────────────────┘

### 4.8 Experience Certificate Generation

#### 4.8.1 Overview

Generate standardised experience certificates for departing employees
with customisable templates and digital signatures.

#### 4.8.2 Certificate Template

##### 4.8.2.1 Standard Template

┌─────────────────────────────────────────────────────────────┐\
│ │\
│ \[COMPANY LETTERHEAD\] │\
│ │\
│ Date: {{issue_date}} │\
│ │\
│ │\
│ EXPERIENCE CERTIFICATE │\
│ │\
│ │\
│ To Whom It May Concern, │\
│ │\
│ This is to certify that {{employee_name}} (Employee ID: │\
│ {{employee_id}}) was employed with {{company_name}} from │\
│ {{joining_date}} to {{last_working_date}}. │\
│ │\
│ During their tenure, they held the position of │\
│ {{designation}} in the {{department}} department. │\
│ │\
│ {{#if performance_note}} │\
│ During their employment, {{employee_name}} demonstrated │\
│ {{performance_note}}. │\
│ {{/if}} │\
│ │\
│ We wish them all the best in their future endeavours. │\
│ │\
│ │\
│ For {{company_name}}, │\
│ │\
│ │\
│ \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ │\
│ {{signatory_name}} │\
│ {{signatory_designation}} │\
│ │\
│ │\
│ \[Company Seal\] │\
│ │\
└─────────────────────────────────────────────────────────────┘

##### 4.8.2.2 Template Variables

  -------------------------------------------------------------------------
  Variable                    Source                Example
  --------------------------- --------------------- -----------------------
  {{company_name}}            Company Settings      LeadTap Digital Pvt Ltd

  {{company_address}}         Company Settings      Full registered address

  {{company_logo}}            Company Settings      Logo image

  {{employee_name}}           Employee Record       Rahul Sharma

  {{employee_id}}             Employee Record       EMP001

  {{designation}}             Employee Record       Senior Developer

  {{department}}              Employee Record       Engineering

  {{joining_date}}            Employee Record       15 March 2022

  {{last_working_date}}       Exit Record           31 December 2024

  {{tenure_duration}}         Calculated            2 years 9 months

  {{performance_note}}        Optional Manual Input "exceptional
                                                    dedication..."

  {{signatory_name}}          Configuration         HR Manager name

  {{signatory_designation}}   Configuration         HR Manager

{{issue_date}}              Generation Date       Current date
  -------------------------------------------------------------------------

#### 4.8.3 Generation Workflow

##### 4.8.3.1 Process Flow

┌────────────────┐ ┌────────────────┐ ┌────────────────┐\
│ Employee │────▶│ HR Verifies │────▶│ Generate │\
│ Requests │ │ Details │ │ Certificate │\
└────────────────┘ └────────────────┘ └────────────────┘\
│\
▼\
┌────────────────┐ ┌────────────────┐ ┌────────────────┐\
│ Employee │◀────│ HR Approves │◀────│ Preview & │\
│ Downloads │ │ & Signs │ │ Edit │\
└────────────────┘ └────────────────┘ └────────────────┘

##### 4.8.3.2 HR Interface

┌─────────────────────────────────────────────────────────────┐\
│ Generate Experience Certificate │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ Employee: Rahul Sharma (EMP001) │\
│ │\
│ ───────────────────────────────────────────────────────── │\
│ │\
│ Employment Details (Auto-populated): │\
│ ┌─────────────────────────────────────────────────────┐ │\
│ │ Designation: Senior Software Engineer │ │\
│ │ Department: Engineering │ │\
│ │ Joining Date: 15 March 2022 │ │\
│ │ Last Working Date: 31 December 2024 │ │\
│ │ Total Tenure: 2 years 9 months │ │\
│ └─────────────────────────────────────────────────────┘ │\
│ │\
│ Performance Note (Optional): │\
│ \[exceptional dedication and consistently delivered \] │\
│ \[high-quality work \] │\
│ │\
│ Template: \[Standard Template ▼\] │\
│ │\
│ Signatory: \[Priya Patel - HR Manager ▼\] │\
│ │\
│ \[Preview Certificate\] \[Generate & Download\] │\
│ │\
└─────────────────────────────────────────────────────────────┘

#### 4.8.4 Features

**Certificate Options:** - Multiple template designs - Configurable
signatories - Optional performance notes - Digital signature
integration - QR code for verification (optional) - Unique certificate
number for tracking

**Output Formats:** - PDF (primary) - Word document (for editing if
needed)

**Audit Trail:** - Certificate generation logged - Copy stored in
employee file - Verification portal for external parties (optional)

#### 4.8.5 Self-Service Request

Employees can request their experience certificate through the portal:

┌─────────────────────────────────────────────────────────────┐\
│ Request Experience Certificate │\
├─────────────────────────────────────────────────────────────┤\
│ │\
│ ⚠️ You can request an experience certificate after your │\
│ full and final settlement is complete. │\
│ │\
│ Current Status: Full & Final - Complete ✓ │\
│ │\
│ Purpose of Request: \[Job application ▼\] │\
│ │\
│ Additional Notes:
\[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\] │\
│ │\
│ \[Submit Request\] │\
│ │\
│ ───────────────────────────────────────────────────────── │\
│ Estimated Processing Time: 2-3 working days │\
│ You will be notified via email when ready. │\
└─────────────────────────────────────────────────────────────┘

## 5. Reports & Analytics

### 5.1 Overview

Comprehensive reporting module providing insights into workforce data,
leave patterns, attendance, and HR metrics. All reports can be exported
to Excel/PDF and scheduled for automatic generation.

### 5.2 Employee Details Report

#### 5.2.1 Report Description

Complete employee directory with all relevant details for HR
administration and compliance.

#### 5.2.2 Report Fields

  ------------------------------------------------------------------------------
  Field                   Category                Description
  ----------------------- ----------------------- ------------------------------
  Employee ID             Basic                   Unique identifier

  Full Name               Basic                   Employee name

  Email                   Basic                   Official email

  Mobile                  Basic                   Contact number

  Department              Organisation            Department name

  Designation             Organisation            Job title

  Reporting Manager       Organisation            Manager name

  Work Location           Organisation            Office location

  Employment Type         Employment              Full-time/Part-time/Contract

  Joining Date            Employment              Date of joining

  Tenure                  Employment              Calculated years/months

  Status                  Employment              Active/On Notice/Exited

  Date of Birth           Personal                DOB

  Gender                  Personal                Gender

  PAN Number              Statutory               PAN

  Aadhaar Number          Statutory               Aadhaar (masked)

  PF Number               Statutory               UAN/PF account

  Bank Account            Banking                 Account number (masked)

Current CTC             Compensation            Annual CTC
  ------------------------------------------------------------------------------

#### 5.2.3 Report Filters

  -------------------------------------------------------------------------------------
  Filter                  Type                    Options
  ----------------------- ----------------------- -------------------------------------
  Department              Multi-select            All departments

  Location                Multi-select            All locations

  Employment Type         Multi-select            Full-time/Part-time/Contract/Intern

  Status                  Multi-select            Active/On Notice/Exited

  Joining Date Range      Date range              From - To

Manager                 Dropdown                Manager list
  -------------------------------------------------------------------------------------

#### 5.2.4 Sample Report View

┌─────────────────────────────────────────────────────────────────────────────┐\
│ Employee Details Report │\
│ Generated: 02 January 2025 │\
├─────────────────────────────────────────────────────────────────────────────┤\
│ Filters Applied: Department: All │ Status: Active │ Location: All │\
├─────────────────────────────────────────────────────────────────────────────┤\
│ │\
│ Total Employees: 45 │\
│ │\
│
┌────────────────────────────────────────────────────────────────────────┐│\
│ │ ID │ Name │ Dept │ Designation │ Joining │ ││\
│
│───────────────────────────────────────────────────────────────────────││\
│ │ EMP001│ Rahul Sharma │ Engineering│ Senior Developer │ 15 Mar 2022│
││\
│ │ EMP002│ Priya Gupta │ Sales │ Account Manager │ 02 Jan 2022│ ││\
│ │ EMP003│ Amit Kumar │ Marketing │ Marketing Lead │ 10 Jun 2023│ ││\
│ │ \... │ \... │ \... │ \... │ \... │ ││\
│
└────────────────────────────────────────────────────────────────────────┘│\
│ │\
│ \[Export to Excel\] \[Export to PDF\] \[Schedule Report\] │\
│ │\
└─────────────────────────────────────────────────────────────────────────────┘

### 5.3 Leave Balance Report

#### 5.3.1 Report Description

Current leave balances for all employees across all leave types, showing
entitlements, taken, and remaining balances.

#### 5.3.2 Report Fields

  -----------------------------------------------------------------------
  Field                               Description
  ----------------------------------- -----------------------------------
  Employee ID                         Unique identifier

  Employee Name                       Full name

  Department                          Department name

  Leave Type                          EL/CL/SL/CO/RH

  Opening Balance                     Balance at start of leave year

  Accrued                             Leaves accrued in current year

  Carry Forward                       Carried from previous year

  Total Entitlement                   Opening + Accrued + Carry Forward

  Taken                               Leaves consumed

  Pending Approval                    Leaves applied but not approved

  Available Balance                   Remaining balance

Encashed                            Leaves encashed (if applicable)
  -----------------------------------------------------------------------

#### 5.3.3 Report Filters

  -----------------------------------------------------------------------
  Filter                              Options
  ----------------------------------- -----------------------------------
  Department                          All / Specific

  Leave Type                          All / EL / CL / SL / Others

  Balance Threshold                   Show employees with balance \< X
                                      days

  As On Date                          Point-in-time balance

Leave Year                          Current / Previous
  -----------------------------------------------------------------------

#### 5.3.4 Sample Report View

┌─────────────────────────────────────────────────────────────────────────────┐\
│ Leave Balance Report - FY 2024-25 │\
│ As on: 02 January 2025 │\
├─────────────────────────────────────────────────────────────────────────────┤\
│ │\
│ Summary: │\
│
┌──────────────────────────────────────────────────────────────────────┐
│\
│ │ Total Employees: 45 │ Total EL Balance: 520 days │ Avg: 11.5 days │
│\
│
└──────────────────────────────────────────────────────────────────────┘
│\
│ │\
│
┌────────────────────────────────────────────────────────────────────────┐│\
│ │ Employee │ Dept │ EL │ CL │ SL │ Total │ Status ││\
│ │ │ │ Bal │ Bal │ Bal │ Avail │ ││\
│
│───────────────────────────────────────────────────────────────────────││\
│ │ Rahul S. │ Engg │ 12.5 │ 8 │ 10 │ 30.5 │ Healthy ││\
│ │ Priya G. │ Sales │ 3.0 │ 2 │ 12 │ 17.0 │ Low EL ⚠️ ││\
│ │ Amit K. │ Mktg │ 8.0 │ 5 │ 8 │ 21.0 │ Normal ││\
│ │ \... │ \... │ \... │ \... │ \... │ \... │ \... ││\
│
└────────────────────────────────────────────────────────────────────────┘│\
│ │\
│ \[Export to Excel\] \[Export to PDF\] │\
│ │\
└─────────────────────────────────────────────────────────────────────────────┘

### 5.4 Leave Type-wise Summary Report

#### 5.4.1 Report Description

Aggregated leave consumption analysis by leave type, department, and
time period. Useful for policy review and workforce planning.

#### 5.4.2 Report Dimensions

  -----------------------------------------------------------------------
  Dimension                           Breakdown Options
  ----------------------------------- -----------------------------------
  Leave Type                          EL, CL, SL, CO, LOP, Maternity,
                                      Paternity, etc.

  Time Period                         Monthly, Quarterly, Yearly

  Department                          Department-wise breakdown

  Location                            Office location-wise

Employee Level                      Grade/band-wise
  -----------------------------------------------------------------------

#### 5.4.3 Report Metrics

  -----------------------------------------------------------------------
  Metric                              Description
  ----------------------------------- -----------------------------------
  Total Days Taken                    Sum of leaves taken

  Number of Instances                 Count of leave applications

  Average Duration                    Average days per application

  Employees Utilised                  Count of employees who took this
                                      leave type

Utilisation Rate                    (Taken / Entitled) × 100
  -----------------------------------------------------------------------

#### 5.4.4 Sample Report View

┌─────────────────────────────────────────────────────────────────────────────┐\
│ Leave Type-wise Summary - FY 2024-25 (Apr 2024 - Dec 2024) │\
├─────────────────────────────────────────────────────────────────────────────┤\
│ │\
│ ORGANISATION SUMMARY │\
│
┌────────────────────────────────────────────────────────────────────────┐│\
│ │ Leave Type │ Total Days │ Instances │ Avg Duration │ Utilisation ││\
│
│───────────────────────────────────────────────────────────────────────││\
│ │ Earned Leave│ 245 │ 89 │ 2.75 days │ 54% ││\
│ │ Casual Leave│ 180 │ 156 │ 1.15 days │ 50% ││\
│ │ Sick Leave │ 95 │ 72 │ 1.32 days │ 26% ││\
│ │ Comp Off │ 28 │ 28 │ 1.00 day │ N/A ││\
│ │ Loss of Pay │ 12 │ 8 │ 1.50 days │ N/A ││\
│
│───────────────────────────────────────────────────────────────────────││\
│ │ TOTAL │ 560 │ 353 │ 1.59 days │ - ││\
│
└────────────────────────────────────────────────────────────────────────┘│\
│ │\
│ DEPARTMENT BREAKDOWN │\
│
┌────────────────────────────────────────────────────────────────────────┐│\
│ │ Department │ EL │ CL │ SL │ LOP │ Total │ Headcount ││\
│
│───────────────────────────────────────────────────────────────────────││\
│ │ Engineering │ 98 │ 72 │ 35 │ 5 │ 210 │ 20 ││\
│ │ Sales │ 65 │ 48 │ 28 │ 3 │ 144 │ 12 ││\
│ │ Marketing │ 42 │ 32 │ 18 │ 2 │ 94 │ 8 ││\
│ │ Operations │ 40 │ 28 │ 14 │ 2 │ 84 │ 5 ││\
│
└────────────────────────────────────────────────────────────────────────┘│\
│ │\
│ MONTHLY TREND │\
│
┌────────────────────────────────────────────────────────────────────────┐│\
│ │ Apr May Jun Jul Aug Sep Oct Nov Dec ││\
│ │ EL 25 22 28 32 30 25 28 30 25 ││\
│ │ CL 18 20 22 25 18 20 22 20 15 ││\
│ │ SL 8 10 12 15 10 8 12 10 10 ││\
│
└────────────────────────────────────────────────────────────────────────┘│\
│ │\
│ \[Export to Excel\] \[Export to PDF\] \[View Charts\] │\
│ │\
└─────────────────────────────────────────────────────────────────────────────┘

### 5.5 Loss of Pay (LOP) Report

#### 5.5.1 Report Description

Tracks all Loss of Pay instances with reasons, helping identify
attendance issues and policy compliance.

#### 5.5.2 Report Fields

  -----------------------------------------------------------------------
  Field                               Description
  ----------------------------------- -----------------------------------
  Employee ID                         Unique identifier

  Employee Name                       Full name

  Department                          Department name

  Manager                             Reporting manager

  LOP Date(s)                         Specific dates marked as LOP

  Number of Days                      Total LOP days

  Reason                              Reason for LOP

  Leave Type Exhausted                Which leave balance was exhausted

  Salary Impact                       Amount deducted (optional)

Month                               Payroll month affected
  -----------------------------------------------------------------------

#### 5.5.3 LOP Categories

  -----------------------------------------------------------------------
  Category                            Description
  ----------------------------------- -----------------------------------
  Leave Exhausted                     All leave balances exhausted

  Unapproved Absence                  Absence without approval

  Late Joining                        Did not join on expected date

  Unauthorised Extension              Extended leave without approval

Disciplinary                        As part of disciplinary action
  -----------------------------------------------------------------------

#### 5.5.4 Report Filters

  -----------------------------------------------------------------------
  Filter                              Options
  ----------------------------------- -----------------------------------
  Date Range                          From - To dates

  Department                          All / Specific

  LOP Category                        All / Specific

  Minimum Days                        Show employees with LOP \>= X days

Manager                             Filter by manager
  -----------------------------------------------------------------------

#### 5.5.5 Sample Report View

┌─────────────────────────────────────────────────────────────────────────────┐\
│ Loss of Pay Report - January 2025 │\
├─────────────────────────────────────────────────────────────────────────────┤\
│ │\
│ Summary: │\
│
┌──────────────────────────────────────────────────────────────────────┐
│\
│ │ Total LOP Days: 12 │ Employees Affected: 8 │ Salary Impact: ₹48,000
│ │\
│
└──────────────────────────────────────────────────────────────────────┘
│\
│ │\
│
┌────────────────────────────────────────────────────────────────────────┐│\
│ │ Employee │ Dept │ Dates │ Days │ Reason │Impact ││\
│
│───────────────────────────────────────────────────────────────────────││\
│ │ Vijay S. │ Engg │ 15-16 Jan │ 2 │ Leave Exhausted│₹8,000 ││\
│ │ Neha R. │ Sales │ 10 Jan │ 1 │ Unapproved Abs │₹4,000 ││\
│ │ Kiran P. │ Ops │ 3-5 Jan │ 3 │ Late Joining │₹12,000││\
│ │ Sunita M. │ Mktg │ 20-21 Jan │ 2 │ Leave Exhausted│₹8,000 ││\
│ │ \... │ \... │ \... │ \... │ \... │ \... ││\
│
└────────────────────────────────────────────────────────────────────────┘│\
│ │\
│ By Category: │\
│ • Leave Exhausted: 7 days (4 employees) │\
│ • Unapproved Absence: 2 days (2 employees) │\
│ • Late Joining: 3 days (2 employees) │\
│ │\
│ \[Export to Excel\] \[Export to PDF\] │\
│ │\
└─────────────────────────────────────────────────────────────────────────────┘

### 5.6 Attendance Report

#### 5.6.1 Report Description

Daily attendance tracking with present, absent, leave, and
work-from-home status for all employees.

#### 5.6.2 Report Types

  -----------------------------------------------------------------------
  Report Type                         Description
  ----------------------------------- -----------------------------------
  Daily Attendance                    Single day attendance status

  Monthly Attendance                  Full month summary per employee

  Attendance Summary                  Aggregated metrics by
                                      department/team

  Late Coming Report                  Employees arriving after grace
                                      period

  Early Going Report                  Employees leaving before time

Overtime Report                     Employees working beyond regular
                                      hours
  -----------------------------------------------------------------------

#### 5.6.3 Attendance Status Codes

  -----------------------------------------------------------------------
  Code                    Status                  Description
  ----------------------- ----------------------- -----------------------
  P                       Present                 Regular attendance

  A                       Absent                  Absent without leave

  WO                      Weekly Off              Saturday/Sunday

  PH                      Public Holiday          Company holiday

  EL                      Earned Leave            On approved EL

  CL                      Casual Leave            On approved CL

  SL                      Sick Leave              On approved SL

  WFH                     Work From Home          Remote working

  HD                      Half Day                Half day present

  LOP                     Loss of Pay             Unpaid absence

  CO                      Comp Off                Compensatory off

OD                      On Duty                 Official duty outside
                                                  office
  -----------------------------------------------------------------------

#### 5.6.4 Monthly Attendance Report Fields

  -----------------------------------------------------------------------
  Field                               Description
  ----------------------------------- -----------------------------------
  Employee ID                         Unique identifier

  Employee Name                       Full name

  Department                          Department name

  Working Days                        Total working days in month

  Present Days                        Days marked present

  Leaves Taken                        Days on approved leave

  Absents                             Unapproved absences

  WFH Days                            Work from home days

  Holidays                            Public holidays in month

  Weekly Offs                         Saturdays/Sundays

  Late Coming                         Count of late arrivals

  Early Going                         Count of early departures

Overtime Hours                      Total OT hours
  -----------------------------------------------------------------------

#### 5.6.5 Sample Monthly Report View

┌─────────────────────────────────────────────────────────────────────────────┐\
│ Monthly Attendance Report - January 2025 │\
├─────────────────────────────────────────────────────────────────────────────┤\
│ │\
│ Month Summary: │\
│
┌──────────────────────────────────────────────────────────────────────┐
│\
│ │ Working Days: 23 │ Holidays: 2 │ Weekly Offs: 8 │ Total Days: 31 │
│\
│
└──────────────────────────────────────────────────────────────────────┘
│\
│ │\
│
┌────────────────────────────────────────────────────────────────────────┐│\
│ │ Employee │ Present│ Leave │ WFH │ Absent│ Late │ OT Hrs│ Status ││\
│
│───────────────────────────────────────────────────────────────────────││\
│ │ Rahul S. │ 20 │ 3 │ 5 │ 0 │ 2 │ 8 │ Good ││\
│ │ Priya G. │ 22 │ 1 │ 3 │ 0 │ 0 │ 0 │ Good ││\
│ │ Amit K. │ 18 │ 3 │ 2 │ 2 │ 5 │ 0 │ Review ││\
│ │ Sneha P. │ 21 │ 2 │ 4 │ 0 │ 1 │ 4 │ Good ││\
│ │ \... │ \... │ \... │ \... │ \... │ \... │ \... │ \... ││\
│
└────────────────────────────────────────────────────────────────────────┘│\
│ │\
│ Department Summary: │\
│
┌────────────────────────────────────────────────────────────────────────┐│\
│ │ Department │ Attendance % │ Avg WFH │ Late Coming │ Absenteeism %
││\
│
│───────────────────────────────────────────────────────────────────────││\
│ │ Engineering │ 94.5% │ 4.2 days│ 8 instances │ 1.2% ││\
│ │ Sales │ 96.2% │ 2.1 days│ 3 instances │ 0.8% ││\
│ │ Marketing │ 93.8% │ 3.5 days│ 5 instances │ 1.5% ││\
│
└────────────────────────────────────────────────────────────────────────┘│\
│ │\
│ \[Export to Excel\] \[Export to PDF\] \[View Calendar\] │\
│ │\
└─────────────────────────────────────────────────────────────────────────────┘

#### 5.6.6 Calendar View

┌─────────────────────────────────────────────────────────────────────────────┐\
│ Attendance Calendar - Rahul Sharma - January 2025 │\
├─────────────────────────────────────────────────────────────────────────────┤\
│ │\
│ ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐ │\
│ │ Sun │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ │\
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤ │\
│ │ │ │ │ 1 │ 2 │ 3 │ 4 │ │\
│ │ │ │ │ PH │ P │ P │ WO │ │\
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤ │\
│ │ 5 │ 6 │ 7 │ 8 │ 9 │ 10 │ 11 │ │\
│ │ WO │ P │ P │ WFH │ P │ P │ WO │ │\
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤ │\
│ │ 12 │ 13 │ 14 │ 15 │ 16 │ 17 │ 18 │ │\
│ │ WO │ P │ P │ EL │ EL │ EL │ WO │ │\
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤ │\
│ │ 19 │ 20 │ 21 │ 22 │ 23 │ 24 │ 25 │ │\
│ │ WO │ P │ P │ P │ WFH │ P │ WO │ │\
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤ │\
│ │ 26 │ 27 │ 28 │ 29 │ 30 │ 31 │ │ │\
│ │ PH │ P │ P │ WFH │ P │ P │ │ │\
│ └─────┴─────┴─────┴─────┴─────┴─────┴─────┘ │\
│ │\
│ Legend: P=Present WFH=Work From Home EL=Earned Leave │\
│ WO=Weekly Off PH=Public Holiday │\
│ │\
│ Summary: Present: 20 │ WFH: 3 │ Leave: 3 │ Holiday: 2 │ Weekly Off: 8
│\
│ │\
└─────────────────────────────────────────────────────────────────────────────┘

### 5.7 Report Scheduling & Distribution

#### 5.7.1 Schedule Configuration

┌─────────────────────────────────────────────────────────────────────────────┐\
│ Schedule Report │\
├─────────────────────────────────────────────────────────────────────────────┤\
│ │\
│ Report: \[Leave Balance Report ▼\] │\
│ │\
│ Frequency: │\
│ ○ Daily ○ Weekly ● Monthly ○ Quarterly │\
│ │\
│ Day/Date: \[1st of month ▼\] │\
│ Time: \[09:00 AM ▼\] │\
│ │\
│ Recipients: │\
│ \[✓\] HR Team │\
│ \[✓\] Department Heads │\
│ \[ \] All Managers │\
│ \[ \] Finance Team │\
│ │\
│ Additional Emails: \[<hr@company.com>, <cfo@company.com>\] │\
│ │\
│ Format: \[Excel ▼\] │\
│ │\
│ \[Cancel\] \[Save Schedule\] │\
│ │\
└─────────────────────────────────────────────────────────────────────────────┘

#### 5.7.2 Report Formats

  -----------------------------------------------------------------------
  Format                              Use Case
  ----------------------------------- -----------------------------------
  Excel (.xlsx)                       Data analysis, further processing

  PDF                                 Formal distribution, printing

  CSV                                 System integrations

On-screen                           Quick review
  -----------------------------------------------------------------------

## 6. Configuration & Settings

### 6.1 Company Settings

  -----------------------------------------------------------------------
  Setting                             Description
  ----------------------------------- -----------------------------------
  Company Name                        Legal entity name

  Trading Name                        Brand name if different

  Registration Number                 CIN/LLP Number

  GST Number                          GST registration

  PAN Number                          Company PAN

  PF Registration                     EPFO establishment code

  ESI Registration                    ESIC code

  Registered Address                  Legal address

  Office Locations                    Multiple office setup

  Logo                                Company logo for documents

Letterhead                          For official documents
  -----------------------------------------------------------------------

### 6.2 Leave Policy Settings

Detailed in Section 4.3.3.3

### 6.3 Approval Workflows

  -----------------------------------------------------------------------
  Process                 Approval Levels         Configuration
  ----------------------- ----------------------- -----------------------
  Leave Approval          1-3 levels              By leave type, duration

  Document Verification   1 level                 HR only

  Offer Letters           0-2 levels              Optional approvals

Experience Certificates 1 level                 HR/Director
  -----------------------------------------------------------------------

### 6.4 Notification Settings

  -----------------------------------------------------------------------
  Channel                 Supported               Configurable
  ----------------------- ----------------------- -----------------------
  Email                   Yes                     Templates, triggers

  SMS                     Optional                For critical alerts

  WhatsApp                Optional                Integration required

In-App                  Yes                     Always enabled
  -----------------------------------------------------------------------

### 6.5 Integration Settings

  -----------------------------------------------------------------------
  Integration             Purpose                 Status
  ----------------------- ----------------------- -----------------------
  Google Workspace        Docs, Calendar          Required

  SMTP/Email              Notifications           Required

  SMS Gateway             SMS alerts              Optional

  WhatsApp Business       Notifications           Optional

  EPFO Portal             PF compliance           Future

DigiLocker              Document verification   Future
  -----------------------------------------------------------------------

## 7. Compliance & Legal Considerations

### 7.1 Indian Labour Law Compliance

  ------------------------------------------------------------------------
  Regulation            Relevance            Implementation
  --------------------- -------------------- -----------------------------
  Shops &               Leave entitlements,  State-wise configuration
  Establishments Act    working hours

  Payment of Wages Act  Salary processing,   Payroll integration (future)
                        payslips

  Maternity Benefit Act Maternity leave      26 weeks leave configuration
                        rules

  EPF Act               PF deductions,       Document collection,
                        compliance           calculations

  ESI Act               Health insurance     Eligibility tracking

  Gratuity Act          Exit benefits        Tenure tracking

Sexual Harassment Act POSH compliance      Policy acknowledgement
  ------------------------------------------------------------------------

### 7.2 Data Protection

  -----------------------------------------------------------------------
  Requirement                         Implementation
  ----------------------------------- -----------------------------------
  Personal Data Storage               Encrypted, India servers

  Access Control                      Role-based, logged

  Data Retention                      Configurable, minimum statutory

  Right to Access                     Employee self-service portal

  Right to Deletion                   Process for departing employees

Consent Management                  Explicit consent for data
                                      collection
  -----------------------------------------------------------------------

### 7.3 Document Retention

  -----------------------------------------------------------------------
  Document Type           Retention Period        Post-Exit
  ----------------------- ----------------------- -----------------------
  Employment Records      8 years after exit      Archived

  Salary Records          8 years                 Archived

  Leave Records           3 years after exit      Archived

  KYC Documents           8 years after exit      Archived

Performance Reviews     5 years after exit      Archived
  -----------------------------------------------------------------------

## 8. Technical Architecture

### 8.1 Security Requirements

  -----------------------------------------------------------------------
  Requirement                         Implementation
  ----------------------------------- -----------------------------------
  Authentication                      OAuth 2.0, SSO support

  Authorisation                       RBAC with fine-grained permissions

  Encryption at Rest                  AES-256 for all sensitive data

  Encryption in Transit               TLS 1.3

  Password Policy                     Configurable complexity

  Session Management                  Secure tokens, timeout

  Audit Logging                       All actions logged

Penetration Testing                 Annual requirement
  -----------------------------------------------------------------------

### 8.2 Scalability Considerations

  -----------------------------------------------------------------------
  Aspect                              Approach
  ----------------------------------- -----------------------------------
  Users                               Horizontal scaling, CDN

  Documents                           Object storage with CDN

  Database                            Read replicas, partitioning

API                                 Rate limiting, caching
  -----------------------------------------------------------------------

### 8.3 Deployment Options

  -----------------------------------------------------------------------
  Option                              Best For
  ----------------------------------- -----------------------------------
  Cloud SaaS                          Most companies, quick start

  Private Cloud                       Data sovereignty requirements

On-Premise                          Large enterprises, strict
                                      compliance
  -----------------------------------------------------------------------

## 9. Future Roadmap

### 9.1 Phase 2 Features

  -----------------------------------------------------------------------
  Feature                 Description             Priority
  ----------------------- ----------------------- -----------------------
  Payroll Integration     Salary processing,      High
                          payslips

  Attendance & Time       Punch in/out,           High
  Tracking                timesheets

  Expense Management      Claims, reimbursements  Medium

  Asset Management        Laptop, ID card         Medium
                          tracking

Learning Management     Training tracking       Medium
  -----------------------------------------------------------------------

### 9.2 Phase 3 Features

  -----------------------------------------------------------------------
  Feature                             Description
  ----------------------------------- -----------------------------------
  Recruitment Module                  ATS integration

  Employee Self-Service App           Native mobile apps

  Analytics Dashboard                 Advanced reporting

  AI Chatbot                          HR query assistance

Integration Marketplace             Third-party connectors
  -----------------------------------------------------------------------

### 9.3 Compliance Roadmap

  -----------------------------------------------------------------------
  Feature                             Description
  ----------------------------------- -----------------------------------
  EPFO Integration                    Direct PF filing

  ESIC Integration                    ESI compliance

  Form 16 Generation                  Tax document automation

DigiLocker Integration              Document verification
  -----------------------------------------------------------------------

## Appendices

### Appendix A: Glossary

  -----------------------------------------------------------------------
  Term                                Definition
  ----------------------------------- -----------------------------------
  CTC                                 Cost to Company - Total annual
                                      compensation

  EL/PL                               Earned Leave / Privilege Leave

  CL                                  Casual Leave

  SL                                  Sick Leave

  LOP                                 Loss of Pay

  PF/EPF                              Provident Fund / Employee Provident
                                      Fund

  ESI                                 Employee State Insurance

  POSH                                Prevention of Sexual Harassment

FNF                                 Full and Final Settlement
  -----------------------------------------------------------------------

### Appendix B: State-Wise Variations

  -----------------------------------------------------------------------
  State                               Key Variations
  ----------------------------------- -----------------------------------
  Tamil Nadu                          Pongal holidays, Tamil Nadu S&E Act

  Maharashtra                         Maharashtra S&E Act, Marathi
                                      holidays

  Karnataka                           Karnataka S&E Act, Kannada holidays

  Delhi                               Delhi S&E Act, specific leave rules

West Bengal                         WB S&E Act, Durga Puja holidays
  -----------------------------------------------------------------------

### Appendix C: Sample Workflows

*Detailed workflow diagrams would be included here*

**Document Control**

  -----------------------------------------------------------------------
  Version           Date              Author            Changes
  ----------------- ----------------- ----------------- -----------------
  1.0               31 Dec 2025       LeadTap           Initial
                                                        specification

  -----------------------------------------------------------------------


## Commercialization Potential (Future Consideration)

This system is currently designed and implemented for **internal use only** by LeadTap Digi Solutions to manage its employees and HR operations.

While the architecture and specifications do not actively target commercial distribution or external adoption at this stage, they do not preclude future evaluation for broader use if business needs evolve.

Any decision to commercialize, generalize, or offer this system beyond internal use would require a separate assessment and specification update.

*End of Specification Document*
