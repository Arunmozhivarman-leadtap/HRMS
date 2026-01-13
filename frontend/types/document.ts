export enum DocumentType {
    aadhaar_card = "aadhaar_card",
    pan_card = "pan_card",
    passport = "passport",
    voter_id = "voter_id",
    driving_licence = "driving_licence",
    bank_details = "bank_details",
    cancelled_cheque = "cancelled_cheque",
    tenth_marksheet = "10th_marksheet",
    twelfth_marksheet = "12th_marksheet",
    degree_certificate = "degree_certificate",
    provisional_certificate = "provisional_certificate",
    post_graduate_degree = "post_graduate_degree",
    professional_certifications = "professional_certifications",
    previous_offer_letters = "previous_offer_letters",
    relieving_letter = "relieving_letter",
    experience_letter = "experience_letter",
    last_3_payslips = "last_3_payslips",
    form_16 = "form_16",
    appointment_letter = "appointment_letter",
    passport_size_photo = "passport_size_photo",
    address_proof = "address_proof",
    marriage_certificate = "marriage_certificate",
    medical_fitness_certificate = "medical_fitness_certificate"
}

export enum DocumentVerificationStatus {
    pending = "pending",
    verified = "verified",
    rejected = "rejected",
    reupload_required = "reupload_required",
    expired = "expired"
}

export interface Document {
    id: number;
    employee_id: number;
    document_type: DocumentType;
    file_path: string;
    expiry_date?: string;
    verification_status: DocumentVerificationStatus;
    employee?: {
        id: number;
        first_name: string;
        last_name: string;
        employee_code?: string;
    };
    verified_by_id?: number;
    verified_date?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface DocumentVerificationUpdate {
    status: DocumentVerificationStatus;
    notes?: string;
}
