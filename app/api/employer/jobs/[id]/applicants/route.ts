import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import type { CandidateProfile, ScreeningStatus } from '@/types/employer/applicant'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: jobId } = await params

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, title')
    .eq('id', jobId)
    .eq('employer_id', user.id)
    .single()

  if (jobError || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  const { data: applications, error } = await supabase
    .from('applications')
    .select('*')
    .eq('job_id', jobId)
    .order('applied_at', { ascending: false })

  if (error) {
    console.error('Error fetching applicants:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const result: CandidateProfile[] = applications.map((a) => {
    const snap: any = a.profile_snapshot || {}

    let screeningStatus: ScreeningStatus | undefined
    if (a.status === 'Under Review') screeningStatus = 'shortlisted'
    else if (a.status === 'Rejected') screeningStatus = 'rejected'

    return {
      id: a.id,
      name: snap.name || 'Applicant',
      title: snap.headline || '',
      location: snap.location || '',
      appliedDate: new Date(a.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      email: snap.email || '',
      phone: snap.phone || '',
      bio: a.cover_letter || snap.overview || '',
      experienceYears: snap.experienceYears || 0,
      skills: snap.skills || [],
      education: snap.education || '',
      linkedin: snap.linkedin || undefined,
      github: snap.github || undefined,
      portfolio: snap.portfolio || undefined,
      screeningStatus,
      customAnswers: a.custom_answers || [],
      rating: a.rating ?? undefined,
      note: a.note ?? undefined,
      atsScore: a.ats_score ?? undefined,
      experience: snap.experience || [],
      educationList: snap.educationList || [],
      projects: snap.projects || [],
    }
  })

  return NextResponse.json(result)
}
