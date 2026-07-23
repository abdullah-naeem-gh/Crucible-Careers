import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import { computeAtsScore } from '@/lib/shared/atsScore'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('saved_jobs')
    .select('saved_at, jobs(id, company_id, title, location, type, salary_range, tags, description, created_at)')
    .eq('talent_id', user.id)
    .order('saved_at', { ascending: false })

  if (error) {
    console.error('Error fetching saved jobs:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const employerIds = Array.from(new Set(data.map((s: any) => s.jobs?.company_id).filter(Boolean)))
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, verification_status')
    .in('id', employerIds)
  const companyById = new Map((companies ?? []).map((c) => [c.id, c]))

  const { data: profile } = await supabase
    .from('talent_profiles')
    .select('skills')
    .eq('user_id', user.id)
    .single()
  const skills: string[] = profile?.skills || []

  const result = data
    .filter((s: any) => s.jobs)
    .map((s: any) => ({
      id: s.jobs.id,
      title: s.jobs.title,
      company: companyById.get(s.jobs.company_id)?.name || 'Unknown Company',
      companyVerified: companyById.get(s.jobs.company_id)?.verification_status === 'verified',
      location: s.jobs.location || 'Remote',
      type: s.jobs.type || 'Full-time',
      salary: s.jobs.salary_range || undefined,
      tags: s.jobs.tags || [],
      postedAt: s.jobs.created_at ? new Date(s.jobs.created_at).toLocaleDateString() : 'Recently',
      description: s.jobs.description || '',
      matchScore: computeAtsScore(skills, s.jobs.tags || []),
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
