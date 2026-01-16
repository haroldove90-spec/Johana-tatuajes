
export type Feature = 'home' | 'outline' | 'preview' | 'generate' | 'consultant' | 'gallery' | 'calendar' | 'clients' | 'inventory' | 'flash' | 'consent' | 'budget' | 'aftercare' | 'dashboard' | 'notifications' | 'profile' | 'reviews' | 'medical_history';
export type UserRole = 'admin' | 'client';

export interface Client {
    id: number;
    name: string;
    username?: string;
    contact: string;
    whatsapp?: string;
    notes: string;
    allergies?: string;
    password?: string;
    role?: UserRole;
    loyalty_points?: number;
    ink_history?: string[];
    created_at?: string;
}

export interface Appointment {
    id: number;
    name: string;
    contact: string;
    idea: string;
    time: string;
    date: string;
    reminderMethod: 'email' | 'sms';
    status: 'scheduled' | 'completed';
    deposit_amount?: number;
    deposit_paid?: boolean;
    price_total?: number;
    has_consent?: boolean;
}

export interface Consent {
    id: number;
    client_id?: number;
    client_username?: string;
    client_name: string;
    content: string;
    status: 'pending' | 'signed';
    signature?: string;
    signed_at?: string;
    created_at: string;
}

export interface MedicalHistory {
    id?: number;
    client_id?: number;
    client_username?: string;
    client_name: string;
    birth_date: string;
    age: string;
    sex: string;
    address: string;
    phone: string;
    occupation: string;
    residence: string;
    schooling: string;
    email: string;
    conditions: string[]; 
    allergies_detail: string;
    appointment_motive: string;
    signature_client?: string;
    signature_witness?: string;
    created_at?: string;
}

export interface InventoryItem {
    id: number;
    item_name: string;
    quantity: number;
    min_stock: number;
    category: string;
}

export interface FlashSet {
    id: number;
    title: string;
    price: number;
    size_cm: number;
    image_url: string;
    is_repeatable: boolean;
    is_available: boolean;
    created_at: string;
}

export interface Review {
    id: number;
    client_name: string;
    rating: number;
    comment: string;
    date: string;
}
