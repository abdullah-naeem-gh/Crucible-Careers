import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import { createSupabaseAdminClient } from '@/lib/shared/supabase/admin'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: existing, error: fetchError } = await supabase
    .from('talent_experience_verifications')
    .select('id, talent_id, employer_id, status')
    .eq('id', id)
    .eq('employer_id', user.id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Verification request not found' }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  const action = body?.action

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()

  if (action === 'approve') {
    const { error } = await admin
      .from('talent_experience_verifications')
      .update({ status: 'verified', rejection_reason: null, responded_at: new Date().toISOString(), talent_acknowledged_at: null })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // action === 'reject'
  const reason = typeof body?.reason === 'string' ? body.reason.trim() : ''
  if (!reason) {
    return NextResponse.json({ error: 'A rejection reason is required.' }, { status: 400 })
  }

  const { error: rejectError } = await admin
    .from('talent_experience_verifications')
    .update({ status: 'rejected', rejection_reason: reason, responded_at: new Date().toISOString(), talent_acknowledged_at: null })
    .eq('id', id)
  if (rejectError) return NextResponse.json({ error: rejectError.message }, { status: 500 })

  if (body?.blacklist) {
    const { error: blacklistError } = await admin
      .from('employer_talent_blacklist')
      .upsert({ employer_id: user.id, talent_id: existing.talent_id, reason }, { onConflict: 'employer_id,talent_id' })
    if (blacklistError) console.error('Error blacklisting talent:', blacklistError)
  }

  return NextResponse.json({ success: true })
}
