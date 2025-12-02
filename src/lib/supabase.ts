import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const SUPABASE_URL = 'https://vzroozdtvvppyvjhzbip.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6cm9vemR0dnZwcHl2amh6YmlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMTA2ODAsImV4cCI6MjA3OTc4NjY4MH0.JfacAHQu_S6FpyrBEIzFes-nycH2iTGRGMqPLvUXXng';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);
