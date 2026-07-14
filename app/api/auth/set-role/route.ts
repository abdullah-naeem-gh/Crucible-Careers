import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import type { UserRole } from '@/types/shared/auth'

const VALID_ROLES: UserRole[] = ['talent', 'employer']

/**
 * One-time role assignment for accounts created without a role (Google OAuth
 * sign-ups). Only succeeds while the caller's profile.role is still null, so
 * an existing account's role can never be overwritten through this route.
 */
export async function POST(request: NextRequest) {
  const { role } = await request.json()

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', user.id)
    .is('role', null)
    .select('role, first_name, last_name, company')
    .single()

  if (error || !profile) {
    // Either the role was already set, or the update failed — re-read the
    // current row so the caller can proceed with whatever role is on file.
    const { data: existing } = await supabase
      .from('profiles')
      .select('role, first_name, last_name, company')
      .eq('id', user.id)
      .single()

    return NextResponse.json({ profile: existing ?? null })
  }

  return NextResponse.json({ profile })
}
