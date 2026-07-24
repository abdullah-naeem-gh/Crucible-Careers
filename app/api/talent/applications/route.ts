import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import { getTalentVector, getJobVector, cosineSimilarity, toMatchPercent } from '@/lib/shared/matching/matchScore'
import { pipelineStageLabel } from '@/lib/shared/pipelineStage'

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  if (isNaN(ms)) return ''
  const hours = Math.floor(ms / 3600000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('applications')
    .select('id, status, applied_at, updated_at, ats_score, jobs(id, title, employer_id)')
    .eq('talent_id', user.id)
    .order('applied_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const employerIds = Array.from(new Set(data.map((a: any) => a.jobs?.employer_id).filter(Boolean)))
  const { data: companies } = await supabase
    .from('employer_company_names')
    .select('id, company')
    .in('id', employerIds)
  const companyById = new Map((companies ?? []).map((c) => [c.id, c.company]))

  const result = data.map((a: any) => ({
    id: a.id,
    jobId: a.jobs?.id,
    jobTitle: a.jobs?.title || 'Unknown Role',
    company: companyById.get(a.jobs?.employer_id) || 'Unknown Company',
    appliedAt: new Date(a.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: pipelineStageLabel(a.status),
    matchScore: a.ats_score ?? 0,
    lastUpdated: formatRelative(a.updated_at),
  }))

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { jobId, resumeUrl, resumeFilename, coverLetter, standardAnswers, customAnswers } = body

  if (!jobId || !standardAnswers) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, employer_id, tags, title')
    .eq('id', jobId)
    .single()

  if (jobError || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  const { data: profile } = await supabase
    .from('talent_profiles')
    .select('overview, resume_url, resume_filename, talent_experiences (*), talent_educations (*), talent_projects (*)')
    .eq('user_id', user.id)
    .single()

  const educationRows = (profile as any)?.talent_educations || []
  const experienceRows = (profile as any)?.talent_experiences || []
  const projectRows = (profile as any)?.talent_projects || []

  const educationList = educationRows.map((e: any) => ({
    id: e.id,
    school: e.school,
    degree: e.degree || '',
    field: e.field || '',
    startYear: e.start_year || '',
    endYear: e.end_year || '',
    description: e.description || '',
  }))

  const experience = experienceRows.map((e: any) => ({
    id: e.id,
    company: e.company,
    role: e.role,
    startDate: e.start_date || '',
    endDate: e.end_date || '',
    current: e.current || false,
    description: e.description || '',
  }))

  const projects = projectRows.map((p: any) => ({
    id: p.id,
    title: p.title,
    link: p.link || '',
    videoUrl: p.video_url || '',
    description: p.description || '',
  }))

  // If the talent has no recorded education, the apply form's Education
  // field stays editable and whatever they typed should actually be saved —
  // otherwise it's silently discarded in favor of an empty DB-derived summary.
  const educationSummary = educationList.length > 0
    ? `${educationList[0].degree} in ${educationList[0].field} from ${educationList[0].school}`
    : (standardAnswers.education || '')

  const skills: string[] = standardAnswers.skills || []

  const profileSnapshot = {
    name: standardAnswers.name || '',
    email: standardAnswers.email || '',
    phone: standardAnswers.phone || '',
    location: standardAnswers.location || '',
    experienceYears: standardAnswers.experienceYears || 0,
    skills,
    education: educationSummary,
    educationList,
    linkedin: standardAnswers.linkedin || '',
    github: standardAnswers.github || '',
    portfolio: standardAnswers.portfolio || '',
    overview: profile?.overview || '',
    experience,
    projects,
  }

  const resolvedResumeUrl = resumeUrl || profile?.resume_url || null
  const resolvedResumeFilename = resumeFilename || profile?.resume_filename || null

  let atsScore: number | null = null
  try {
    const [talentVector, jobVector] = await Promise.all([getTalentVector(user.id), getJobVector(jobId)])
    if (talentVector && jobVector) {
      atsScore = toMatchPercent(cosineSimilarity(talentVector, jobVector))
    }
  } catch (err) {
    console.error('Failed to compute application match score:', err)
  }

  const { data: application, error: insertError } = await supabase
    .from('applications')
    .insert({
      job_id: jobId,
      talent_id: user.id,
      resume_url: resolvedResumeUrl,
      resume_filename: resolvedResumeFilename,
      cover_letter: coverLetter || '',
      custom_answers: customAnswers || [],
      profile_snapshot: profileSnapshot,
      ats_score: atsScore,
    })
    .select('id, status, applied_at')
    .single()

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'You have already applied to this job.' }, { status: 409 })
    }
    console.error('Error creating application:', insertError)
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json(
    { id: application.id, jobId, status: application.status, appliedAt: application.applied_at },
    { status: 201 }
  )
}
