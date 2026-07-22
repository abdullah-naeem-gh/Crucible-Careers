import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import { createSupabaseAdminClient } from '@/lib/shared/supabase/admin'
import type { ExperienceVerificationRequest } from '@/types/employer/verification'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: rows, error } = await supabase
    .from('talent_experience_verifications')
    .select('id, experience_id, talent_id, status, rejection_reason, requested_at, responded_at')
    .eq('employer_id', user.id)
    .order('requested_at', { ascending: false })

  if (error) {
    console.error('Error fetching experience verifications:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const talentIds = Array.from(new Set((rows ?? []).map((r) => r.talent_id)))
  const experienceIds = Array.from(new Set((rows ?? []).map((r) => r.experience_id)))

  // talent_profiles/talent_experiences RLS only allows the owning talent to
  // read their own rows — there's no employer-read policy on them (unlike
  // the applicant pipeline, which reads a denormalized snapshot the employer
  // already owns via the job/application). We've already authorized access
  // above (rows scoped to employer_id = user.id), so the admin client here
  // only ever discloses exactly the talent/experience data behind requests
  // legitimately addressed to this employer.
  const admin = createSupabaseAdminClient()

  const { data: baseProfiles } = talentIds.length
    ? await admin.from('profiles').select('id, first_name, last_name').in('id', talentIds)
    : { data: [] as { id: string; first_name: string | null; last_name: string | null }[] }
  const nameByTalentId = new Map((baseProfiles ?? []).map((p) => [p.id, `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Talent']))

  const { data: talentProfiles } = talentIds.length
    ? await admin.from('talent_profiles').select('user_id, email, headline, location').in('user_id', talentIds)
    : { data: [] as { user_id: string; email: string | null; headline: string | null; location: string | null }[] }
  const talentInfoById = new Map((talentProfiles ?? []).map((p) => [p.user_id, p]))

  const { data: experiences } = experienceIds.length
    ? await admin.from('talent_experiences').select('id, company, role, location, start_date, end_date, current, description, previous_salary').in('id', experienceIds)
    : { data: [] as { id: string; company: string; role: string; location: string | null; start_date: string | null; end_date: string | null; current: boolean; description: string | null; previous_salary: string | null }[] }
  const experienceById = new Map((experiences ?? []).map((e) => [e.id, e]))

  const requests: ExperienceVerificationRequest[] = (rows ?? [])
    .filter((r) => experienceById.has(r.experience_id))
    .map((r) => {
      const exp = experienceById.get(r.experience_id)!
      const talentInfo = talentInfoById.get(r.talent_id)
      return {
        id: r.id,
        experienceId: r.experience_id,
        talentId: r.talent_id,
        status: r.status,
        rejectionReason: r.rejection_reason,
        requestedAt: r.requested_at,
        respondedAt: r.responded_at,
        talent: {
          name: nameByTalentId.get(r.talent_id) || 'Talent',
          email: talentInfo?.email || '',
          headline: talentInfo?.headline || '',
          location: talentInfo?.location || '',
        },
        experience: {
          company: exp.company,
          role: exp.role,
          location: exp.location || '',
          startDate: exp.start_date || '',
          endDate: exp.end_date || '',
          current: exp.current || false,
          description: exp.description || '',
          previousSalary: exp.previous_salary || '',
        },
      }
    })

  return NextResponse.json({ requests })
}
