export enum LeaveTypeEnum {
    earned_leave = 'earned_leave',
    casual_leave = 'casual_leave',
    sick_leave = 'sick_leave',
    compensatory_off = 'compensatory_off',
    loss_of_pay = 'loss_of_pay',
    maternity_leave = 'maternity_leave',
    paternity_leave = 'paternity_leave',
    bereavement_leave = 'bereavement_leave',
    marriage_leave = 'marriage_leave',
    adoption_leave = 'adoption_leave',
    restricted_holiday = 'restricted_holiday'
}

export enum LeaveApplicationStatus {
    pending = 'pending',
    approved = 'approved',
    rejected = 'rejected',
    cancelled = 'cancelled',
    recalled = 'recalled'
}

export enum HolidayType {
    national = 'national',
    festival = 'festival',
    state = 'state',
    declared = 'declared'
}

export interface LeaveType {
    id: number;
    name: LeaveTypeEnum;
    abbr: string;
    annual_entitlement: number;
    requires_approval: boolean;
    carry_forward: boolean;
    max_carry_forward?: number | null;
    encashment: boolean;
    max_encashment_per_year?: number | null;
    min_balance_to_encash?: number | null;
    accrual_method: string;
    pro_rata_settings?: Record<string, unknown>; // JSONB
    negative_balance_allowed: boolean;
    min_days_in_advance?: number | null;
    max_consecutive_days?: number | null;
    gender_eligibility?: string;
    requires_document?: boolean;
    approval_levels?: number;
    created_at: string;
    updated_at?: string;
}

export interface LeaveBalance {
    id: number;
    employee_id: number;
    leave_type_id: number;
    leave_year: number;
    opening_balance: number;
    accrued: number;
    carry_forward: number;
    taken: number;
    pending_approval: number;
    available: number;
    encashed: number;
    leave_type: LeaveType;
    employee?: {
        id: number;
        full_name: string;
        email: string;
        employee_code?: string;
        department_id?: number;
        gender?: string;
    };
}

export interface LeaveApplication {
    id: number;
    employee_id: number;
    leave_type_id: number;
    duration_type: string; // 'Full Day', 'Half Day', etc.
    from_date: string;
    to_date?: string;
    number_of_days: number;
    reason: string;
    attachment?: string;
    status: LeaveApplicationStatus;
    approver_id?: number;
    approved_date?: string;
    contact_email?: string;
    contact_phone?: string;
    employee_name?: string;
    leave_type_name?: string;
    approver_note?: string;
    created_at: string;
    updated_at?: string;
}

export interface LeaveApplicationCreate {
    leave_type_id: number;
    duration_type: string;
    from_date: string; // Date string YYYY-MM-DD
    to_date?: string; // Date string YYYY-MM-DD
    number_of_days: number;
    reason: string;
    attachment?: string;
    contact_email?: string;
    contact_phone?: string;
}

export interface PublicHoliday {
    id: number;
    name: string;
    holiday_date: string;
    holiday_type: HolidayType;
    is_restricted: boolean;
    description?: string;
    recurring: boolean;
    created_at: string;
}

export enum LeaveCreditStatus {
    pending = 'pending',
    approved = 'approved',
    rejected = 'rejected'
}

export interface LeaveCreditRequest {
    id: number;
    employee_id: number;
    leave_type_id: number;
    date_worked: string; // YYYY-MM-DD
    reason: string;
    status: LeaveCreditStatus;
    approver_id?: number;
    approved_date?: string;
    created_at: string;
    employee_name?: string;
    leave_type_name?: string;
}

export interface LeaveCreditRequestCreate {
    leave_type_id?: number;
    date_worked: string;
    reason: string;
}