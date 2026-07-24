import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/shared/supabase/admin'
import { companyErrorResponse, getEmployerContext } from '@/lib/employer/server/company-context'
import { recordCompanyAudit } from '@/lib/employer/server/company-admin'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
  const context = await getEmployerContext({ requireAdmin: true })
  const supabase = createSupabaseAdminClient()

  const { data: existing, error: fetchError } = await supabase
    .from('talent_experience_verifications')
    .select('id, talent_id, company_id, status')
    .eq('id', id)
    .eq('company_id', context.companyId)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Verification request not found' }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  const action = body?.action

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const admin = supabase

  if (action === 'approve') {
    const { error } = await admin
      .from('talent_experience_verifications')
      .update({ status: 'verified', rejection_reason: null, responded_at: new Date().toISOString(), talent_acknowledged_at: null })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await recordCompanyAudit({ companyId: context.companyId, actorUserId: context.userId, action: 'experience_verification.approved', entityType: 'verification', entityId: id })
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
      .upsert({ company_id: context.companyId, acted_by_user_id: context.userId, talent_id: existing.talent_id, reason }, { onConflict: 'company_id,talent_id' })
    if (blacklistError) console.error('Error blacklisting talent:', blacklistError)
  }

  await recordCompanyAudit({ companyId: context.companyId, actorUserId: context.userId, action: 'experience_verification.rejected', entityType: 'verification', entityId: id, metadata: { blacklisted: Boolean(body?.blacklist) } })
  return NextResponse.json({ success: true })
  } catch (error) {
    return companyErrorResponse(error)
  }
}
