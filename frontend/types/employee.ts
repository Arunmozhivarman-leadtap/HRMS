
export interface Employee {
    id: number;
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    date_of_birth?: string;
    date_of_joining?: string;
    employment_status: string;
    department_id?: number;
    designation_id?: number;
    location_id?: number;
    manager_id?: number;
    employment_type: string;
    role: string;
    is_active: boolean;
    gender?: string;

    // Banking Info
    bank_account_holder_name?: string;
    bank_name?: string;
    branch_name?: string;
    account_number?: string;
    ifsc_code?: string;
    account_type?: string;

    created_at: string;
    updated_at?: string;
}
