import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import { getTalentVector, scoreJobsForTalent } from '@/lib/shared/matching/matchScore'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('saved_jobs')
    .select('saved_at, jobs(id, employer_id, title, location, type, salary_range, tags, description, created_at)')
    .eq('talent_id', user.id)
    .order('saved_at', { ascending: false })

  if (error) {
    console.error('Error fetching saved jobs:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const employerIds = Array.from(new Set(data.map((s: any) => s.jobs?.employer_id).filter(Boolean)))
  const { data: companies } = await supabase
    .from('employer_company_names')
    .select('id, company')
    .in('id', employerIds)
  const companyById = new Map((companies ?? []).map((c) => [c.id, c.company]))

  const savedJobIds = data.filter((s: any) => s.jobs).map((s: any) => s.jobs.id)
  let matchScoreByJob = new Map<string, number>()
  try {
    const talentVector = await getTalentVector(user.id)
    if (talentVector) {
      matchScoreByJob = await scoreJobsForTalent(talentVector, savedJobIds)
    }
  } catch (err) {
    console.error('Failed to compute saved-job match scores:', err)
  }

  const result = data
    .filter((s: any) => s.jobs)
    .map((s: any) => ({
      id: s.jobs.id,
      title: s.jobs.title,
      company: companyById.get(s.jobs.employer_id) || 'Unknown Company',
      location: s.jobs.location || 'Remote',
      type: s.jobs.type || 'Full-time',
      salary: s.jobs.salary_range || undefined,
      tags: s.jobs.tags || [],
      postedAt: s.jobs.created_at ? new Date(s.jobs.created_at).toLocaleDateString() : 'Recently',
      description: s.jobs.description || '',
      matchScore: matchScoreByJob.get(s.jobs.id) ?? 0,
      savedAt: s.saved_at,
    }))

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId } = await request.json()
  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('saved_jobs')
    .insert({ job_id: jobId, talent_id: user.id })
    .select('id, saved_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ success: true, alreadySaved: true })
    }
    console.error('Error saving job:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data.id, savedAt: data.saved_at }, { status: 201 })
}
