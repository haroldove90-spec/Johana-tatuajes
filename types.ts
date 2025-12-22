
export type Feature = 'home' | 'outline' | 'preview' | 'generate' | 'consultant' | 'gallery' | 'calendar' | 'clients' | 'inventory' | 'flash' | 'consent' | 'budget' | 'aftercare' | 'dashboard';
export type UserRole = 'admin' | 'client';

export interface Client {
    id: number;
    name: string;
    contact: string;
    notes: string;
    allergies?: string;
    loyalty_points?: number;
    createdAt: string;
}

export interface Appointment {
    id: number;
    date: string;
    time: string;
    name: string;
    contact: string;
    idea: string;
    reminderMethod: 'email' | 'sms';
    status: 'scheduled' | 'completed';
    deposit_paid?: boolean;
    price_estimated?: number;
}

export interface FlashSet {
    id: number;
    title: string;
    image_url: string;
    price: number;
    size_cm: number;
    is_repeatable: boolean;
    is_available: boolean;
}

export interface InventoryItem {
    id: number;
    item_name: string;
    quantity: number;
    min_stock: number;
    category: 'Tintas' | 'Agujas' | 'Higiene' | 'Otros';
}
