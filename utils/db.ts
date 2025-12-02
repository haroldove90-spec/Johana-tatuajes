import { supabase } from './supabase';
import { Client, Appointment } from '../types';

export const getAll = async <T>(tableName: string): Promise<T[]> => {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
        console.error(`Error fetching from ${tableName}:`, error);
        throw error;
    }
    return data as T[];
};

export const add = async <T>(tableName: string, item: Omit<T, 'id'>): Promise<any> => {
    const { data, error } = await supabase.from(tableName).insert([item]).select();
    if (error) {
        console.error(`Error adding to ${tableName}:`, error);
        throw error;
    }
    return data?.[0]; // Supabase returns an array with the new item
};

export const put = async <T extends {id: number}>(tableName: string, item: T): Promise<any> => {
    const { data, error } = await supabase.from(tableName).update(item).eq('id', item.id).select();
    if (error) {
        console.error(`Error updating in ${tableName}:`, error);
        throw error;
    }
    return data?.[0];
};

export const deleteItem = async (tableName: string, id: number): Promise<void> => {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) {
        console.error(`Error deleting from ${tableName}:`, error);
        throw error;
    }
};

export const findOrAddClient = async (name: string, contact: string): Promise<Client> => {
    // Check if client exists
    let { data: existingClient, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('contact', contact)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: no rows found
        console.error("Error finding client:", fetchError);
        throw fetchError;
    }

    if (existingClient) {
        return existingClient as Client;
    }

    // Add new client if not found
    const newClientData: Omit<Client, 'id'> = {
        name,
        contact,
        notes: '',
        createdAt: new Date().toISOString()
    };
    
    const { data: newClient, error: addError } = await supabase
        .from('clients')
        .insert([newClientData])
        .select()
        .single();

    if (addError) {
        console.error("Error adding client:", addError);
        throw addError;
    }

    return newClient as Client;
};
