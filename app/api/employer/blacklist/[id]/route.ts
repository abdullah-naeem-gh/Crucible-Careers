import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/shared/supabase/admin'
import { companyErrorResponse, getEmployerContext } from '@/lib/employer/server/company-context'
import { recordCompanyAudit } from '@/lib/employer/server/company-admin'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
  const context = await getEmployerContext({ requireAdmin: true })
  const supabase = createSupabaseAdminClient()

  const { data: existing, error: fetchError } = await supabase
    .from('employer_talent_blacklist')
    .select('id')
    .eq('id', id)
    .eq('company_id', context.companyId)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Blacklist entry not found' }, { status: 404 })
  }

  const admin = supabase
  const { error } = await admin.from('employer_talent_blacklist').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await recordCompanyAudit({ companyId: context.companyId, actorUserId: context.userId, action: 'blacklist.removed', entityType: 'blacklist', entityId: id })
  return NextResponse.json({ success: true })
  } catch (error) {
    return companyErrorResponse(error)
  }
}
