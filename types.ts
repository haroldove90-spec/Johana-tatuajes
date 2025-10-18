export type Feature = 'home' | 'outline' | 'preview' | 'generate' | 'consultant' | 'gallery' | 'calendar' | 'clients';

export interface Client {
    id: number;
    name: string;
    contact: string; // Puede ser email o teléfono
    notes: string;
    createdAt: string; // ISO string date
}
