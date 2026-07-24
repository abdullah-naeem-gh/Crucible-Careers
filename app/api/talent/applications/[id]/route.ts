import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import { pipelineStageLabel } from '@/lib/shared/pipelineStage'

function buildTimeline(stage: string, appliedAt: string) {
  const appliedDate = new Date(appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const isAtLeast = (stages: string[]) => stages.includes(stage)
  return [
    { step: 'Application Submitted', date: appliedDate, completed: true, current: stage === 'applied' },
    { step: 'Shortlisted', date: stage !== 'applied' ? 'Completed' : 'Pending', completed: stage !== 'applied', current: stage === 'shortlisted' },
    { step: 'Interviewing', date: isAtLeast(['interviewing', 'offered', 'hired', 'feedback']) ? 'Scheduled' : 'Pending', completed: isAtLeast(['interviewing', 'offered', 'hired', 'feedback']), current: stage === 'interviewing' },
    { step: 'Feedback', date: stage === 'feedback' ? 'Requested' : isAtLeast(['offered', 'hired']) ? 'Completed' : 'Pending', completed: isAtLeast(['offered', 'hired']), current: stage === 'feedback' },
    {
      step: stage === 'rejected' ? 'Application Rejected' : stage === 'hired' ? 'Hired' : 'Offer',
      date: stage === 'offered' ? 'Sent' : stage === 'hired' ? 'Accepted' : stage === 'rejected' ? 'Processed' : 'Pending',
      completed: isAtLeast(['offered', 'hired', 'rejected']),
      current: isAtLeast(['offered', 'hired', 'rejected']),
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
    .select('id, status, applied_at, ats_score, custom_answers, profile_snapshot, jobs(id, title, company_id, tags)')
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
    .from('companies')
    .select('name, verification_status')
    .eq('id', job?.company_id)
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
    company: company?.name || 'Unknown Company',
    companyVerified: company?.verification_status === 'verified',
    status: pipelineStageLabel(application.status),
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
