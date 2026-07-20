import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in the browser.
 * Uses @supabase/ssr's createBrowserClient which automatically syncs
 * the session to cookies — making it readable by server-side middleware.
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
