import { createClient } from '@supabase/supabase-js';

export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing public Supabase URL or anon key in environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
}
