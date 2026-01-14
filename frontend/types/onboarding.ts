export enum CandidateStatus {
    created = "created",
    offer_ready = "offer_ready",
    sent = "sent",
    accepted = "accepted",
    rejected = "rejected",
    negotiating = "negotiating",
    onboarding = "onboarding",
}

export interface CandidateResponse {
    id: number;
    full_name: string;
    personal_email: string;
    mobile_number: string;
    designation_id: number;
    department_id: number;
    reporting_manager_id: number;
    employment_type: string;
    expected_joining_date: string;
    work_location?: string;
    ctc?: number;
    salary_structure?: any;
    status: CandidateStatus;
    created_at: string;
    updated_at?: string;
    offer_token_expiry?: string;
}

export interface PortalAccessResponse {
    candidate: CandidateResponse;
    checklist: OnboardingTask[];
    offer_valid: bool;
}

export interface OnboardingTask {
    id: number;
    name: string;
    category: string;
    required: boolean;
    status: "pending" | "completed";
    uploaded_file?: string | null;
}
