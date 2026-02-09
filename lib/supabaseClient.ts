import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise fall back to the provided defaults
// CRITICAL: Must use the 'anon' JWT key for Edge Function authorization, NOT the publishable key.
// We are temporarily hardcoding this to FORCE the correct key, ignoring potential env var pollution.
const supabaseUrl = 'https://ypvwkynsfhdecccnljcd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdndreW5zZmhkZWNjY25samNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjQ5MTMsImV4cCI6MjA4NTkwMDkxM30.SfuTHXRgz8d23X9VnYmRaD-zQMym9xJ2shLg6RIXa94';

export const supabase = createClient(supabaseUrl, supabaseKey);