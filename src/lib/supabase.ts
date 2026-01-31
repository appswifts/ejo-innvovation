import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xlagvfsvpdhxcmzmpgck.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsYWd2ZnN2cGRoeGNtem1wZ2NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NTUyOTAsImV4cCI6MjA4NTQzMTI5MH0.eB52YZkb8JgcLY9uQQP1fJ6l9GhI24kvLq2T5ik_ppk';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
