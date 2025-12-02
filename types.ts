export type Feature = 'home' | 'outline' | 'preview' | 'generate' | 'consultant' | 'gallery' | 'calendar' | 'clients';

export interface Client {
    id: number;
    name: string;
    contact: string; // Puede ser email o teléfono
    notes: string;
    createdAt: string; // ISO string date
}

export interface Appointment {
    id: number;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    name: string;
    contact: string;
    idea: string;
    reminderMethod: 'email' | 'sms';
    status: 'scheduled' | 'completed';
}
