import { createBrowserSupabaseClient } from '@/lib/shared/supabase/client'
import type { UserRole } from '@/types/shared/auth'

/**
 * Sign up a new user.
 * Passes role + name data as user_metadata — the DB trigger picks these up
 * and auto-creates the corresponding row in public.profiles.
 */
export async function signUp(data: {
  email: string
  password: string
  role: UserRole
  firstName: string
  lastName: string
  company?: string
}) {
  const supabase = createBrowserSupabaseClient()
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        role: data.role,
        first_name: data.firstName,
        last_name: data.lastName,
        company: data.company ?? null,
      },
      emailRedirectTo: `${window.location.origin}/api/auth/callback`,
    },
  })
  if (error) throw error
  
  if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
    throw new Error('An account with this email already exists.')
  }

  return authData
}

/**
 * Sign in an existing user with email + password.
 * Returns { user, session }.
 */
export async function login(email: string, password: string) {
  const supabase = createBrowserSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

/**
 * Start a Google OAuth sign-in/sign-up flow for the given portal.
 * Google never supplies a `role`, so we carry the intended role through
 * as `portal` on the callback redirect — /auth/verified reads it and
 * assigns the role (or catches a portal mismatch for existing accounts).
 */
export async function signInWithGoogle(portal: UserRole) {
  const supabase = createBrowserSupabaseClient()
  const next = encodeURIComponent(`/auth/verified?portal=${portal}`)
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback?next=${next}`,
    },
  })
  if (error) throw error
}

/**
 * Update the current user's email. Supabase sends a confirmation email(s)
 * before the change takes effect.
 */
export async function updateEmail(newEmail: string) {
  const supabase = createBrowserSupabaseClient()
  const { error } = await supabase.auth.updateUser({ email: newEmail })
  if (error) throw error
}

/**
 * Update the current user's password, re-authenticating with the current
 * password first as a safeguard before this sensitive mutation.
 */
export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = createBrowserSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) throw new Error('Not signed in.')

  const { error: reauthError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword })
  if (reauthError) throw new Error('Current password is incorrect.')

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

/**
 * Sign out the current user and clear their session.
 */
export async function logout() {
  const supabase = createBrowserSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Get the currently authenticated user along with their profile row.
 * Returns null if no active session.
 */
export async function getCurrentUser() {
  const supabase = createBrowserSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, first_name, last_name, company, avatar_url')
    .eq('id', user.id)
    .single()

  return { ...user, profile }
}
