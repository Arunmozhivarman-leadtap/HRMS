
export interface Employee {
    id: number;
    employee_code?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    date_of_birth?: string;
    date_of_joining?: string;
    employment_status: string;
    department_id?: number;
    designation_id?: number;
    manager_id?: number;
    employment_type: string;
    role: string;
    is_active: boolean;
    gender?: string;
    blood_group?: string;
    marital_status?: string;
    personal_email?: string;

    // Emergency Contact
    emergency_contact_name?: string;
    emergency_contact_relation?: string;
    emergency_contact_phone?: string;

    // Banking Information
    bank_account_holder_name?: string;
    bank_name?: string;
    branch_name?: string;
    account_number?: string;
    ifsc_code?: string;
    account_type?: string;

    // Statutory Information
    pan_number?: string;
    aadhaar_number?: string;
    uan_number?: string;
    esic_number?: string;

    profile_photo?: string;
    archived_at?: string;
    created_at: string;
    updated_at?: string;
    full_name: string;
}

export interface EmployeeListResponse {
    items: Employee[];
    total: number;
    page: number;
    size: number;
}
