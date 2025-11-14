import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface PageProps {
    auth: Auth;
    [key: string]: unknown;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    role: 'user' | 'admin'; // Now guaranteed to exist
    role_names?: string[]; // Array of role names from Spatie
    roles: Role[]; // Spatie roles array
    [key: string]: unknown; // This allows for additional properties...
}

interface IinNasionalApplication {
    id: number;
    application_number: string;
    status: string;
    notes?: string;
    iin_number?: string;
    issued_at?: string;
    created_at: string;
    updated_at: string;
    application_form_path?: string;
    requirements_archive_path?: string;
    payment_proof_path?: string;
    payment_proof_documents?: PaymentDocument[];
    payment_proof_uploaded_at?: string;
    payment_documents?: PaymentDocument[];
    payment_documents_uploaded_at?: string;
    field_verification_documents?: PaymentDocument[];
    field_verification_documents_uploaded_at?: string;
    additional_documents?: PaymentDocument;
    additional_documents_uploaded_at?: string;
    can_download_certificate?: boolean;
    expense_reimbursement?: ExpenseReimbursement;
    user: {
        id: number;
        name: string;
        email: string;
    };
    admin?: {
        id: number;
        name: string;
        email: string;
    };
}

interface ExpenseReimbursement {
    id: number;
    company_name: string;
    pic_name: string;
    pic_contact: string;
    verification_date: string;
    is_acknowledged: boolean;
    chief_verificator_amount: number;
    member_verificator_amount: number;
    payment_proof_path?: string;
}


interface PaymentDocument {
    original_name: string;
    file_path: string;
}

interface StatusLog {
    id: number;
    status_from?: string;
    status_to: string;
    notes?: string;
    created_at: string;
    changed_by: {
        id: number;
        name: string;
        email: string;
    };
}

interface IinSingleBlockholderApplication {
    id: number;
    application_number: string;
    status: string;
    created_at: string;
    updated_at: string;
    notes?: string;
    iin_number?: string;
    issued_at?: string;
    payment_verified_at?: string;
    payment_verified_at_stage_2?: string;
    field_verification_completed_at?: string;
    application_form_path?: string;
    requirements_archive_path?: string;
    payment_proof_path?: string;
    payment_proof_documents?: PaymentDocument[];
    payment_proof_documents_stage_2?: PaymentDocument[];
    payment_documents?: PaymentDocument[];
    payment_documents_stage_2?: PaymentDocument[];
    payment_documents_uploaded_at?: string;
    payment_documents_uploaded_at_stage_2?: string;
    payment_proof_uploaded_at?: string;
    payment_proof_uploaded_at_stage_2?: string;
    field_verification_documents?: PaymentDocument[];
    field_verification_documents_uploaded_at?: string;
    additional_documents?: PaymentDocument[];
    additional_documents_uploaded_at?: string;
    can_download_certificate?: boolean;
    expense_reimbursement?: ExpenseReimbursement;
    user: {
        id: number;
        name: string;
        email: string;
    };
    admin?: {
        id: number;
        name: string;
        email: string;
    };
}

interface PengawasanIinNasionalApplication {
    id: number;
    application_number: string;
    status: string;
    issued_at?: string;
    created_at: string;
    updated_at: string;
    payment_proof_path?: string;
    payment_proof_documents?: PaymentDocument[];
    payment_proof_uploaded_at?: string;
    payment_documents?: PaymentDocument[];
    payment_documents_uploaded_at?: string;
    field_verification_documents?: PaymentDocument[];
    field_verification_documents_uploaded_at?: string;
    issuance_documents?: PaymentDocument[];
    issuance_documents_uploaded_at?: string;
    additional_documents?: string;
    expense_reimbursement?: ExpenseReimbursement;
    user: {
        id: number;
        name: string;
        email: string;
        company_name?: string;
        company_phone?: string;
        company_email?: string;
    };
    admin?: {
        id: number;
        name: string;
        email: string;
    };
    iin_nasional_profile?: {
        id: number;
        institution_name?: string;
        brand?: string;
        iin_national_assignment?: string;
        assignment_year?: number;
        regional?: string;
        aspi_recommendation_letter?: string;
        usage_purpose?: string;
        address?: string;
        phone_fax?: string;
        email_office?: string;
        contact_person_name?: string;
        contact_person_email?: string;
        contact_person_phone?: string;
        remarks_status?: string;
        card_issued?: boolean;
    };
}

interface PengawasanSingleIinApplication {
    id: number;
    application_number: string;
    status: string;
    issued_at?: string;
    created_at: string;
    updated_at: string;
    submitted_at: string;
    company_name: string;
    company_address: string;
    can_upload_payment_proof: boolean;
    can_download_certificate: boolean;
    payment_proof_path?: string;
    payment_proof_documents?: PaymentDocument[];
    payment_proof_uploaded_at?: string;
    payment_documents?: PaymentDocument[];
    payment_documents_uploaded_at?: string;
    field_verification_documents?: PaymentDocument[];
    field_verification_documents_uploaded_at?: string;
    expense_reimbursement?: ExpenseReimbursement;
    user: {
        id: number;
        name: string;
        email: string;
        company_name?: string;
        company_phone?: string;
        company_email?: string;
    };
    admin?: {
        id: number;
        name: string;
        email: string;
    };
    single_iin_profile: {
        id: number;
        user_id: number;
        institution_name: string;
        institution_type: string;
        year: number;
        iin_assignment: string;
        assignment_date: string;
        regional: string;
        usage_purpose: string;
        address: string;
        address_updated: string;
        phone_fax: string;
        phone_fax_updated: string;
        email: string;
        contact_person: string;
        remarks_status: string;
        card_specimen: string;
        previous_name: string;
    };
}
