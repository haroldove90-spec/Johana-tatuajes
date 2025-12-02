import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vtpbvgtcztxshdpmkyjm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cGJ2Z3RjenR4c2hkcG1reWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjcxMjAsImV4cCI6MjA4MDIwMzEyMH0.aVqUNSkJ2SgBsBsaskGeNOmLh013Nq6cqKO5Bh8gYdU';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be provided.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);