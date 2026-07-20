import { createClient } from '@supabase/supabase-js'

/**
 * Secret-key Supabase client — bypasses RLS entirely. Server-only, never
 * import this from a 'use client' file. Currently used only for account
 * deletion (auth.admin.deleteUser).
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}
