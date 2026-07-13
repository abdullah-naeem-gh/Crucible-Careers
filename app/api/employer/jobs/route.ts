import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import type { EmployerJob } from '@/types/employer/job'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch jobs for this employer
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('employer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Format data to match EmployerJob interface
  const jobs: EmployerJob[] = data.map((job) => ({
    id: job.id,
    title: job.title,
    location: job.location,
    locationType: job.location_type,
    type: job.type,
    status: job.status,
    salary: job.salary_range || undefined,
    tags: job.tags || [],
    description: job.description || '',
    responsibilities: job.responsibilities || [],
    requirements: job.requirements || [],
    postedAt: new Date(job.created_at).toLocaleDateString(),
    applications: 0,
    views: 0,
    matchScore: 0,
    formConfig: job.form_config,
  }))

  return NextResponse.json(jobs)
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await request.json()

    const { data, error } = await supabase
      .from('jobs')
      .insert({
        employer_id: user.id,
        title: payload.title,
        location: payload.location,
        location_type: payload.locationType,
        type: payload.type,
        status: payload.status,
        salary_range: payload.salary,
        tags: payload.tags,
        description: payload.description,
        responsibilities: payload.responsibilities,
        requirements: payload.requirements,
        form_config: payload.formConfig,
      })
      .select()
      .single()

    if (error) throw error

    // Return the inserted job formatted properly
    const newJob: EmployerJob = {
      id: data.id,
      title: data.title,
      location: data.location,
      locationType: data.location_type,
      type: data.type,
      status: data.status,
      salary: data.salary_range || undefined,
      tags: data.tags || [],
      description: data.description || '',
      responsibilities: data.responsibilities || [],
      requirements: data.requirements || [],
      postedAt: 'Just now',
      applications: 0,
      views: 0,
      matchScore: 0,
      formConfig: data.form_config,
    }

    return NextResponse.json(newJob, { status: 201 })
  } catch (error: any) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
