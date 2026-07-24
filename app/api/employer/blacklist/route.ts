import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/shared/supabase/admin'
import { companyErrorResponse, getEmployerContext } from '@/lib/employer/server/company-context'
import type { BlacklistedTalent } from '@/types/employer/verification'

export async function GET() {
  try {
  const context = await getEmployerContext({ requireAdmin: true })
  const supabase = createSupabaseAdminClient()

  const { data: rows, error } = await supabase
    .from('employer_talent_blacklist')
    .select('id, talent_id, reason, created_at')
    .eq('company_id', context.companyId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching blacklist:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const talentIds = Array.from(new Set((rows ?? []).map((r) => r.talent_id)))

  // profiles RLS only allows self-read — same cross-role read as the
  // experience-verifications route, scoped to exactly the talent ids this
  // employer has already legitimately blacklisted.
  const admin = supabase
  const { data: baseProfiles } = talentIds.length
    ? await admin.from('profiles').select('id, first_name, last_name').in('id', talentIds)
    : { data: [] as { id: string; first_name: string | null; last_name: string | null }[] }
  const nameByTalentId = new Map((baseProfiles ?? []).map((p) => [p.id, `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Talent']))

  const { data: talentProfiles } = talentIds.length
    ? await admin.from('talent_profiles').select('user_id, email').in('user_id', talentIds)
    : { data: [] as { user_id: string; email: string | null }[] }
  const emailByTalentId = new Map((talentProfiles ?? []).map((p) => [p.user_id, p.email || '']))

  const blacklist: BlacklistedTalent[] = (rows ?? []).map((r) => ({
    id: r.id,
    talentId: r.talent_id,
    name: nameByTalentId.get(r.talent_id) || 'Talent',
    email: emailByTalentId.get(r.talent_id) || '',
    reason: r.reason,
    createdAt: r.created_at,
  }))

  return NextResponse.json({ blacklist })
  } catch (error) {
    return companyErrorResponse(error)
  }
}
