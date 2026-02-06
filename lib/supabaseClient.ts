import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise fall back to the provided defaults
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://ypvwkynsfhdecccnljcd.supabase.co';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_lIaEG2N-NVetBIdwT_NsSg_LuxMoHRK';

export const supabase = createClient(supabaseUrl, supabaseKey);