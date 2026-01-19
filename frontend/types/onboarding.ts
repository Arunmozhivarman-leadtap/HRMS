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
    ctc?: number;
    salary_structure?: any;
    status: CandidateStatus;
    created_at: string;
    updated_at?: string;
    offer_token_expiry?: string;
    onboarding_progress: number;
    missing_required_items: string[];
}

export interface PortalAccessResponse {
    candidate: CandidateResponse;
    checklist: OnboardingTask[];
    offer_valid: boolean;
    company_name: string;
    logo_url?: string | null;
}

export interface OnboardingTask {
    id: number;
    name: string;
    category: string;
    required: boolean;
    status: "pending" | "completed";
    uploaded_file?: string | null;
}

export interface OnboardingChecklistItem {
    id: number;
    name: string;
    category: string;
    required: boolean;
}

export interface OnboardingTaskDetail {
    id: number;
    // candidate_id and checklist_item_id might still be relevant internally but purely for display we rely on flattened fields
    candidate_id: number;
    checklist_item_id: number;
    status: string;
    uploaded_file?: string;
    name: string;
    category: string;
    required: boolean;
}
