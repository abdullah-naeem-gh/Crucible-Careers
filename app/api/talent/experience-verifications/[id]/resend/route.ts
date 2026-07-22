import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import { createSupabaseAdminClient } from '@/lib/shared/supabase/admin'
import { snapshotOf, snapshotsEqual, type ExperienceSnapshot } from '@/lib/talent/services/experienceSnapshot'

const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: existing, error: fetchError } = await supabase
    .from('talent_experience_verifications')
    .select('*')
    .eq('id', id)
    .eq('talent_id', user.id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Verification request not found' }, { status: 404 })
  }

  if (existing.status !== 'pending' && existing.status !== 'rejected') {
    return NextResponse.json({ error: 'This request cannot be resent.' }, { status: 400 })
  }

  // employer_talent_blacklist RLS only lets the employer read their own
  // rows, so this check must go through the admin client — the talent's own
  // session client would silently see zero rows and never actually block.
  const admin = createSupabaseAdminClient()
  const { data: blacklistRow } = await admin
    .from('employer_talent_blacklist')
    .select('id')
    .eq('employer_id', existing.employer_id)
    .eq('talent_id', user.id)
    .maybeSingle()

  if (blacklistRow) {
    return NextResponse.json({ error: 'This employer is no longer accepting verification requests from you.' }, { status: 403 })
  }

  if (existing.status === 'pending') {
    const elapsed = Date.now() - new Date(existing.requested_at).getTime()
    if (elapsed < COOLDOWN_MS) {
      return NextResponse.json({ error: 'This request was sent recently. Please wait for the cooldown to finish.' }, { status: 400 })
    }

    const { error: updateError } = await admin
      .from('talent_experience_verifications')
      .update({ requested_at: new Date().toISOString() })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  // status === 'rejected' — no cooldown, but at least one detail must have
  // changed since the rejection before we'll resend.
  const { data: liveExperience, error: expError } = await supabase
    .from('talent_experiences')
    .select('role, location, start_date, end_date, current, description')
    .eq('id', existing.experience_id)
    .single()

  if (expError || !liveExperience) {
    return NextResponse.json({ error: 'Experience entry not found' }, { status: 404 })
  }

  const currentSnapshot = snapshotOf({
    role: liveExperience.role,
    location: liveExperience.location,
    startDate: liveExperience.start_date,
    endDate: liveExperience.end_date,
    current: liveExperience.current,
    description: liveExperience.description,
  })

  if (snapshotsEqual(existing.snapshot as ExperienceSnapshot, currentSnapshot)) {
    return NextResponse.json({ error: 'Change at least one detail before resending.' }, { status: 400 })
  }

  const { error: updateError } = await admin
    .from('talent_experience_verifications')
    .update({
      status: 'pending',
      rejection_reason: null,
      snapshot: currentSnapshot,
      requested_at: new Date().toISOString(),
      responded_at: null,
      talent_acknowledged_at: null,
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
