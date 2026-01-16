
import { supabase } from './supabase';
import { Client } from '../types';

export const getAll = async <T>(tableName: string): Promise<T[]> => {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
        console.error(`Error fetching from ${tableName}:`, error.message);
        throw new Error(error.message);
    }
    return data as T[];
};

export const add = async <T>(tableName: string, item: Omit<T, 'id'>): Promise<any> => {
    const { data, error } = await supabase.from(tableName).insert([item]).select();
    if (error) {
        console.error(`Error adding to ${tableName}:`, error.message);
        throw new Error(error.message);
    }
    return data?.[0];
};

export const put = async <T extends {id: number}>(tableName: string, item: T): Promise<any> => {
    const { data, error } = await supabase.from(tableName).update(item).eq('id', item.id).select();
    if (error) {
        console.error(`Error updating in ${tableName}:`, error.message);
        throw new Error(error.message);
    }
    return data?.[0];
};

export const deleteItem = async (tableName: string, id: number): Promise<void> => {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) {
        console.error(`Error deleting from ${tableName}:`, error.message);
        throw new Error(error.message);
    }
};

export const findOrAddClient = async (name: string, contact: string): Promise<Client> => {
    let { data: existingClient, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('contact', contact)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error finding client:", fetchError.message);
        throw new Error(fetchError.message);
    }

    if (existingClient) {
        return existingClient as Client;
    }

    const newClientData: Omit<Client, 'id' | 'created_at'> = {
        name,
        contact,
        notes: ''
    };
    
    const { data: newClient, error: addError } = await supabase
        .from('clients')
        .insert([newClientData])
        .select()
        .single();

    if (addError) {
        console.error("Error adding client:", addError.message);
        throw new Error(addError.message);
    }

    return newClient as Client;
};
