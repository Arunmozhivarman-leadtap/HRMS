# PostgreSQL Database Schema for LeadTap HRMS  
**Version:** 2.0  
**Date:** 8 January 2026  
**Company:** LeadTap Digi Solutions (Internal HRMS – Single Tenant)

```sql
-- Extensions (optional)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================
-- Enums
-- ======================

CREATE TYPE user_role AS ENUM ('super_admin', 'hr_admin', 'manager', 'employee', 'candidate');

CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'intern');

CREATE TYPE employee_status AS ENUM ('active', 'on_notice', 'exited');

CREATE TYPE candidate_status AS ENUM ('created', 'offer_ready', 'sent', 'accepted', 'rejected', 'negotiating', 'onboarding');

CREATE TYPE document_type AS ENUM (
    'aadhaar_card', 'pan_card', 'passport', 'voter_id', 'driving_licence',
    'bank_details', 'cancelled_cheque',
    '10th_marksheet', '12th_marksheet', 'degree_certificate', 'provisional_certificate',
    'post_graduate_degree', 'professional_certifications',
    'previous_offer_letters', 'relieving_letter', 'experience_letter',
    'last_3_payslips', 'form_16', 'appointment_letter',
    'passport_size_photo', 'address_proof', 'marriage_certificate', 'medical_fitness_certificate'
);

CREATE TYPE document_verification_status AS ENUM ('pending', 'verified', 'rejected', 'reupload_required', 'expired');

CREATE TYPE leave_type_enum AS ENUM (
    'earned_leave', 'casual_leave', 'sick_leave', 'compensatory_off', 'loss_of_pay',
    'maternity_leave', 'paternity_leave', 'bereavement_leave', 'marriage_leave',
    'adoption_leave', 'restricted_holiday'
);

CREATE TYPE leave_application_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

CREATE TYPE holiday_type AS ENUM ('national', 'festival', 'state', 'declared');

CREATE TYPE review_cycle_period AS ENUM ('annual', 'semi_annual', 'quarterly');

CREATE TYPE review_status AS ENUM (
    'self_review_pending', 'self_review_complete',
    'manager_review_pending', 'manager_review_complete',
    'calibration', 'feedback_released'
);

CREATE TYPE exit_type AS ENUM ('resignation', 'termination', 'retirement', 'contract_end', 'absconding');

CREATE TYPE clearance_department AS ENUM ('it', 'finance', 'admin', 'hr', 'manager', 'library');

CREATE TYPE clearance_status AS ENUM ('pending', 'in_progress', 'complete', 'na');

CREATE TYPE fnf_status AS ENUM ('draft', 'approved', 'processed');

CREATE TYPE certificate_status AS ENUM ('requested', 'generated', 'issued');

CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'whatsapp', 'in_app');

-- ======================
-- Tables
-- ======================

-- Authentication & Authorization
CREATE TABLE users (
    id               SERIAL PRIMARY KEY,
    username         VARCHAR(255) UNIQUE NOT NULL,
    email            VARCHAR(255) UNIQUE NOT NULL,
    password_hash    VARCHAR(255) NOT NULL,
    role             user_role NOT NULL,
    employee_id      INTEGER NULL UNIQUE REFERENCES employees(id) ON DELETE SET NULL,  -- Critical link
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_employee_id ON users(employee_id);

-- Master Data
CREATE TABLE departments (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE designations (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE locations (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(255) NOT NULL,
    state   VARCHAR(255) NOT NULL,        -- For state-specific compliance
    address TEXT
);

-- Core Entities
CREATE TABLE employees (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER REFERENCES users(id) ON DELETE SET NULL,  -- Optional reverse link
    full_name           VARCHAR(255) NOT NULL,
    personal_email      VARCHAR(255),
    mobile_number       VARCHAR(10) NOT NULL,
    designation_id      INTEGER REFERENCES designations(id),
    department_id       INTEGER REFERENCES departments(id),
    reporting_manager_id INTEGER REFERENCES employees(id),
    location_id         INTEGER REFERENCES locations(id),
    employment_type     employment_type NOT NULL,
    joining_date        DATE NOT NULL,
    status              employee_status NOT NULL DEFAULT 'active',
    date_of_birth       DATE,
    gender              VARCHAR(50),
    pan_number          VARCHAR(10),
    aadhaar_number      VARCHAR(12),
    pf_number           VARCHAR(50),
    bank_account_holder_name VARCHAR(255),
    bank_name           VARCHAR(255),
    branch_name         VARCHAR(255),
    account_number      VARCHAR(255),
    ifsc_code           VARCHAR(11),
    account_type        VARCHAR(50),
    current_ctc         DECIMAL(15, 2),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_location    ON employees(location_id);
CREATE INDEX idx_employees_manager    ON employees(reporting_manager_id);
CREATE INDEX idx_employees_status     ON employees(status);

-- Candidates (pre-join)
CREATE TABLE candidates (
    id                   SERIAL PRIMARY KEY,
    full_name            VARCHAR(255) NOT NULL,
    personal_email       VARCHAR(255) NOT NULL,
    mobile_number        VARCHAR(10) NOT NULL,
    designation_id       INTEGER REFERENCES designations(id),
    department_id        INTEGER REFERENCES departments(id),
    reporting_manager_id INTEGER REFERENCES employees(id),
    location_id          INTEGER REFERENCES locations(id),
    employment_type      employment_type NOT NULL,
    expected_joining_date DATE NOT NULL,
    alternate_email      VARCHAR(255),
    linkedin_profile     VARCHAR(255),
    referral_source      VARCHAR(255),
    referred_by_id       INTEGER REFERENCES employees(id),
    notes                TEXT,
    status               candidate_status NOT NULL DEFAULT 'created',
    created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Salary Structures
CREATE TABLE salary_structures (
    id                SERIAL PRIMARY KEY,
    entity_id         INTEGER NOT NULL,
    entity_type       VARCHAR(50) NOT NULL CHECK (entity_type IN ('candidate', 'employee')),
    basic_salary      DECIMAL(15,2),
    hra               DECIMAL(15,2),
    conveyance_allowance DECIMAL(15,2),
    medical_allowance DECIMAL(15,2),
    special_allowance DECIMAL(15,2),
    other_allowances  DECIMAL(15,2),
    pf                DECIMAL(15,2),
    esi               DECIMAL(15,2),
    prof_tax          DECIMAL(15,2),
    performance_bonus DECIMAL(15,2),
    other_benefits    DECIMAL(15,2),
    annual_ctc        DECIMAL(15,2) NOT NULL,
    monthly_gross     DECIMAL(15,2) NOT NULL,
    monthly_net       DECIMAL(15,2) NOT NULL,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Offer Letters
CREATE TABLE offer_letters (
    id                  SERIAL PRIMARY KEY,
    candidate_id        INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    salary_structure_id INTEGER REFERENCES salary_structures(id),
    offer_letter_file   VARCHAR(255),
    expiry_date         DATE,
    sent_date           TIMESTAMP WITH TIME ZONE,
    viewed_date         TIMESTAMP WITH TIME ZONE,
    accepted_date       TIMESTAMP WITH TIME ZONE,
    rejected_date       TIMESTAMP WITH TIME ZONE,
    e_signature         TEXT,
    status              VARCHAR(50),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Onboarding Checklist (configurable)
CREATE TABLE onboarding_checklist_items (
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(255) NOT NULL,
    category  VARCHAR(255) NOT NULL,
    required  BOOLEAN DEFAULT TRUE,
    due_relative VARCHAR(50)
);

CREATE TABLE candidate_onboarding_tasks (
    id                  SERIAL PRIMARY KEY,
    candidate_id        INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    checklist_item_id   INTEGER REFERENCES onboarding_checklist_items(id),
    status              VARCHAR(50) NOT NULL DEFAULT 'pending',
    due_date            DATE,
    uploaded_file       VARCHAR(255),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documents
CREATE TABLE employee_documents (
    id                     SERIAL PRIMARY KEY,
    employee_id            INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    document_type          document_type NOT NULL,
    file_path              VARCHAR(255) NOT NULL,
    expiry_date            DATE,
    verification_status    document_verification_status NOT NULL DEFAULT 'pending',
    verified_by_id         INTEGER REFERENCES users(id),
    verified_date          TIMESTAMP WITH TIME ZONE,
    notes                  TEXT,
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leave Management
CREATE TABLE leave_types (
    id                        SERIAL PRIMARY KEY,
    name                      leave_type_enum NOT NULL,
    abbr                      VARCHAR(10) NOT NULL,
    annual_entitlement        INTEGER NOT NULL,
    carry_forward             BOOLEAN DEFAULT FALSE,
    max_carry_forward         INTEGER,
    encashment                BOOLEAN DEFAULT FALSE,
    max_encashment_per_year   INTEGER,
    min_balance_to_encash     INTEGER,
    accrual_method            VARCHAR(50) NOT NULL,
    pro_rata_settings         JSONB,
    negative_balance_allowed  BOOLEAN DEFAULT FALSE,
    requires_approval         BOOLEAN DEFAULT TRUE,
    min_days_in_advance       INTEGER,
    max_consecutive_days      INTEGER,
    created_at                TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leave_balances (
    id              SERIAL PRIMARY KEY,
    employee_id     INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id   INTEGER REFERENCES leave_types(id),
    leave_year      INTEGER NOT NULL,
    opening_balance DECIMAL(5,2) DEFAULT 0,
    accrued         DECIMAL(5,2) DEFAULT 0,
    carry_forward   DECIMAL(5,2) DEFAULT 0,
    taken           DECIMAL(5,2) DEFAULT 0,
    pending_approval DECIMAL(5,2) DEFAULT 0,
    available       DECIMAL(5,2) NOT NULL,
    encashed        DECIMAL(5,2) DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leave_applications (
    id               SERIAL PRIMARY KEY,
    employee_id      INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id    INTEGER REFERENCES leave_types(id),
    duration_type    VARCHAR(50),
    from_date        DATE NOT NULL,
    to_date          DATE,
    number_of_days   DECIMAL(5,2) NOT NULL,
    reason           TEXT NOT NULL,
    attachment       VARCHAR(255),
    status           leave_application_status NOT NULL DEFAULT 'pending',
    approver_id      INTEGER REFERENCES employees(id),
    approved_date    TIMESTAMP WITH TIME ZONE,
    contact_email    VARCHAR(255),
    contact_phone    VARCHAR(10),
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leave_applications_employee ON leave_applications(employee_id);
CREATE INDEX idx_leave_applications_status   ON leave_applications(status);

-- Holidays
CREATE TABLE public_holidays (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    holiday_date   DATE NOT NULL,
    holiday_type   holiday_type NOT NULL,
    location_id    INTEGER REFERENCES locations(id),  -- NULL = all locations
    is_restricted  BOOLEAN DEFAULT FALSE,
    description    TEXT,
    recurring      BOOLEAN DEFAULT FALSE,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_public_holidays_date ON public_holidays(holiday_date);

-- Performance & Salary Revision
CREATE TABLE performance_reviews (
    id                       SERIAL PRIMARY KEY,
    employee_id              INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    review_period            VARCHAR(50) NOT NULL,
    cycle_period             review_cycle_period NOT NULL,
    self_review_window_days  INTEGER,
    manager_review_window_days INTEGER,
    calibration_period_days  INTEGER,
    google_doc_id            VARCHAR(255),
    overall_rating           DECIMAL(3,1),
    status                   review_status NOT NULL DEFAULT 'self_review_pending',
    feedback_release_date    DATE,
    created_at               TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE salary_revisions (
    id                     SERIAL PRIMARY KEY,
    employee_id            INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    performance_review_id  INTEGER REFERENCES performance_reviews(id),
    effective_date         DATE NOT NULL,
    previous_ctc           DECIMAL(15,2) NOT NULL,
    revised_ctc            DECIMAL(15,2) NOT NULL,
    increment_amount       DECIMAL(15,2),
    increment_percent      DECIMAL(5,2),
    revised_structure      JSONB,
    justification          TEXT,
    revision_letter_file   VARCHAR(255),
    acknowledged           BOOLEAN DEFAULT FALSE,
    acknowledged_date      TIMESTAMP WITH TIME ZONE,
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Offboarding
CREATE TABLE offboardings (
    id                  SERIAL PRIMARY KEY,
    employee_id         INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    exit_type           exit_type NOT NULL,
    notice_period_days  INTEGER,
    resignation_date    DATE,
    requested_lwd       DATE,
    confirmed_lwd       DATE,
    early_release_requested BOOLEAN DEFAULT FALSE,
    reason              VARCHAR(255),
    additional_comments TEXT,
    resignation_letter_file VARCHAR(255),
    status              VARCHAR(50) NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exit_clearances (
    id           SERIAL PRIMARY KEY,
    offboarding_id INTEGER REFERENCES offboardings(id) ON DELETE CASCADE,
    department   clearance_department NOT NULL,
    status       clearance_status NOT NULL DEFAULT 'pending',
    completed_by_id INTEGER REFERENCES users(id),
    completed_date  TIMESTAMP WITH TIME ZONE,
    notes        TEXT,
    deductions   DECIMAL(15,2) DEFAULT 0,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exit_interviews (
    id              SERIAL PRIMARY KEY,
    offboarding_id  INTEGER REFERENCES offboardings(id) ON DELETE CASCADE,
    interview_date  DATE,
    conducted_by_id INTEGER REFERENCES users(id),
    mode            VARCHAR(50),
    responses       JSONB NOT NULL,
    overall_rating  INTEGER,
    recommend_company BOOLEAN,
    consider_returning BOOLEAN,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fnf_settlements (
    id           SERIAL PRIMARY KEY,
    offboarding_id INTEGER REFERENCES offboardings(id) ON DELETE CASCADE,
    earnings     JSONB NOT NULL,
    deductions   JSONB NOT NULL,
    net_payable  DECIMAL(15,2) NOT NULL,
    payment_mode VARCHAR(50),
    status       fnf_status NOT NULL DEFAULT 'draft',
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Experience Certificates
CREATE TABLE experience_certificates (
    id               SERIAL PRIMARY KEY,
    employee_id      INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    issue_date       DATE NOT NULL,
    certificate_file VARCHAR(255) NOT NULL,
    performance_note TEXT,
    signatory_id     INTEGER REFERENCES users(id),
    status           certificate_status NOT NULL DEFAULT 'requested',
    unique_number    VARCHAR(50) UNIQUE,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit & Settings
CREATE TABLE audit_logs (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id),
    action      VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255) NOT NULL,
    entity_id   INTEGER NOT NULL,
    details     JSONB,
    ip_address  VARCHAR(45),
    timestamp   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_user      ON audit_logs(user_id);

CREATE TABLE company_settings (
    id                  SERIAL PRIMARY KEY,
    company_name        VARCHAR(255) NOT NULL,
    trading_name        VARCHAR(255),
    registration_number VARCHAR(50),
    gst_number          VARCHAR(15),
    pan_number          VARCHAR(10),
    pf_registration     VARCHAR(50),
    esi_registration    VARCHAR(50),
    registered_address  TEXT,
    logo_path           VARCHAR(255),
    letterhead_path     VARCHAR(255),
    leave_year_start_month INTEGER DEFAULT 4,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Helper View: Manager Team Hierarchy
CREATE OR REPLACE VIEW employee_hierarchy AS
WITH RECURSIVE reports AS (
    SELECT id AS employee_id, reporting_manager_id AS manager_id
    FROM employees
    WHERE reporting_manager_id IS NOT NULL

    UNION ALL

    SELECT e.id AS employee_id, r.manager_id
    FROM employees e
    JOIN reports r ON e.reporting_manager_id = r.employee_id
)
SELECT * FROM reports;

-- Helper Function: Get all employee IDs in a manager's team (including self)
CREATE OR REPLACE FUNCTION get_team_employee_ids(manager_employee_id INTEGER)
RETURNS SETOF INTEGER AS $$  
    WITH RECURSIVE team AS (
        SELECT id FROM employees WHERE id = manager_employee_id
        UNION
        SELECT e.id FROM employees e JOIN team t ON e.reporting_manager_id = t.id
    )
    SELECT id FROM team;
  $$ LANGUAGE sql STABLE;