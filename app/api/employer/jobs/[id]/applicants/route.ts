import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import type { ApplicantPipelineStage, CandidateExperience, CandidateProfile, ScreeningStatus } from '@/types/employer/applicant'

function toScreeningStatus(stage: ApplicantPipelineStage): ScreeningStatus | undefined {
  if (stage === 'applied') return undefined
  if (stage === 'rejected') return 'rejected'
  return 'shortlisted'
}

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
    const pipelineStage = a.status as ApplicantPipelineStage

    return {
      id: a.id,
      name: snap.name || 'Applicant',
      title: snap.headline || '',
      location: snap.location || '',
      appliedDate: new Date(a.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      email: snap.email || '',
      phone: snap.phone || '',
      bio: snap.overview || '',
      coverLetter: a.cover_letter || undefined,
      experienceYears: snap.experienceYears || 0,
      skills: snap.skills || [],
      education: snap.education || '',
      linkedin: snap.linkedin || undefined,
      github: snap.github || undefined,
      portfolio: snap.portfolio || undefined,
      resumeUrl: a.resume_url || undefined,
      resumeFilename: a.resume_filename || undefined,
      screeningStatus: toScreeningStatus(pipelineStage),
      pipelineStage,
      customAnswers: a.custom_answers || [],
      rating: a.rating ?? undefined,
      note: a.note ?? undefined,
      atsScore: a.ats_score ?? undefined,
      experience: (snap.experience || []) as CandidateExperience[],
      educationList: snap.educationList || [],
      projects: snap.projects || [],
    }
  })

  // Attach verification status to each candidate's work-history entries, and
  // drop rejected ones entirely — they must not reach the employer at all,
  // not just be hidden client-side.
  const allExperienceIds = Array.from(new Set(result.flatMap((c) => c.experience?.map((e) => e.id) ?? [])))

  if (allExperienceIds.length > 0) {
    const { data: verifications } = await supabase
      .from('talent_experience_verifications')
      .select('experience_id, status')
      .eq('employer_id', user.id)
      .in('experience_id', allExperienceIds)

    const statusByExperienceId = new Map((verifications ?? []).map((v) => [v.experience_id, v.status]))

    for (const candidate of result) {
      candidate.experience = (candidate.experience ?? [])
        .map((exp) => ({ ...exp, verificationStatus: statusByExperienceId.get(exp.id) as CandidateExperience['verificationStatus'] }))
        .filter((exp) => exp.verificationStatus !== 'rejected')
    }
  }

  return NextResponse.json(result)
}
