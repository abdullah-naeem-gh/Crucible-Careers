import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'

function buildTimeline(status: string, appliedAt: string) {
  const appliedDate = new Date(appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return [
    { step: 'Application Submitted', date: appliedDate, completed: true, current: status === 'Applied' },
    { step: 'Under Review', date: status !== 'Applied' ? 'Completed' : 'Pending', completed: status !== 'Applied', current: status === 'Under Review' },
    { step: 'Initial Interview', date: (status === 'Interview' || status === 'Offer') ? 'Scheduled' : 'Pending', completed: status === 'Interview' || status === 'Offer', current: status === 'Interview' },
    { step: 'Technical Assessment', date: status === 'Offer' ? 'Passed' : 'Pending', completed: status === 'Offer', current: false },
    {
      step: status === 'Rejected' ? 'Application Rejected' : 'Final Offer',
      date: status === 'Offer' ? 'Sent' : status === 'Rejected' ? 'Processed' : 'Pending',
      completed: status === 'Offer' || status === 'Rejected',
      current: status === 'Offer' || status === 'Rejected',
    },
  ]
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

  const { id } = await params

  const { data: application, error } = await supabase
    .from('applications')
    .select('id, status, applied_at, ats_score, custom_answers, profile_snapshot, jobs(id, title, employer_id, tags)')
    .eq('id', id)
    .eq('talent_id', user.id)
    .single()

  if (error || !application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  const job = (application as any).jobs
  const skills: string[] = (application as any).profile_snapshot?.skills || []
  const jobTags: string[] = job?.tags || []

  const { data: company } = await supabase
    .from('employer_company_names')
    .select('company')
    .eq('id', job?.employer_id)
    .single()

  const { data: siblings } = await supabase
    .from('applications')
    .select('ats_score')
    .eq('job_id', job?.id)

  const scores = (siblings ?? []).map((s) => s.ats_score ?? 0)
  const totalApplicants = scores.length || 1
  const averageApplicantScore = scores.length
    ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
    : 0
  const myScore = application.ats_score ?? 0
  const better = scores.filter((s) => s > myScore).length
  const rank = `Top ${Math.max(1, Math.ceil(((better + 1) / totalApplicants) * 100))}%`

  const normalizedTags = jobTags.map((t) => t.toLowerCase())
  const matchedSkills = skills.filter((s) => normalizedTags.includes(s.toLowerCase()))
  const missingTags = jobTags.filter((t) => !skills.some((s) => s.toLowerCase() === t.toLowerCase()))

  const insights = {
    strengths: matchedSkills.length > 0
      ? matchedSkills.slice(0, 4).map((s) => `${s} matches job requirement`)
      : ['Applied with profile credentials'],
    gaps: missingTags.length > 0
      ? missingTags.slice(0, 4).map((t) => `Missing ${t} experience`)
      : [],
  }

  return NextResponse.json({
    id: application.id,
    jobTitle: job?.title || 'Unknown Role',
    company: company?.company || 'Unknown Company',
    status: application.status,
    appliedAt: new Date(application.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    matchScore: myScore,
    averageApplicantScore,
    totalApplicants,
    rank,
    timeline: buildTimeline(application.status, application.applied_at),
    insights,
    customAnswers: (application as any).custom_answers || [],
  })
}
