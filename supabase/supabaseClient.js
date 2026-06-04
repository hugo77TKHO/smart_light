import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbyrffmyignbhikgoaov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieXJmZm15aWduYmhpa2dvYW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNDc3NjEsImV4cCI6MjA4MTcyMzc2MX0.PD8CtM97wjHpIUpNEP5I6IcxPLl3VfOt58c5MRcknCo';

export const supabase = createClient(supabaseUrl, supabaseKey);