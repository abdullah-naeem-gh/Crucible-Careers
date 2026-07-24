import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import { buildJobEmbeddingText } from '@/lib/employer/services/jobEmbeddingText'
import { embedText } from '@/lib/shared/embeddings/embed'
import { getQdrantClient, COLLECTIONS } from '@/lib/shared/qdrant/client'
import type { EmployerJob } from '@/types/employer/job'

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const pageParam = searchParams.get('page')
  const statusFilter = searchParams.get('status')
  const isPaginated = pageParam !== null

  // Fetch jobs for this employer
  let query = supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .eq('employer_id', user.id)
    .order('created_at', { ascending: false })

  if (statusFilter === 'active') {
    query = query.eq('status', 'Active')
  } else if (statusFilter === 'inactive') {
    query = query.in('status', ['Paused', 'Closed', 'Draft'])
  }

  let page = 1
  let limit = 10

  if (isPaginated) {
    page = Math.max(1, parseInt(pageParam, 10) || 1)
    limit = Math.max(1, parseInt(searchParams.get('limit') ?? '10', 10) || 10)
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Count real applications per job
  const jobIds = data.map((job) => job.id)
  const countByJob = new Map<string, number>()
  const hiresByJob = new Map<string, number>()
  if (jobIds.length > 0) {
    const { data: apps } = await supabase
      .from('applications')
      .select('job_id, status')
      .in('job_id', jobIds)
    ;(apps ?? []).forEach((a) => {
      countByJob.set(a.job_id, (countByJob.get(a.job_id) ?? 0) + 1)
      if (a.status === 'hired') hiresByJob.set(a.job_id, (hiresByJob.get(a.job_id) ?? 0) + 1)
    })
  }

  // Count real views per job (deduped per talent at the job_views table level)
  const viewsByJob = new Map<string, number>()
  if (jobIds.length > 0) {
    const { data: views } = await supabase
      .from('job_views')
      .select('job_id')
      .in('job_id', jobIds)
    ;(views ?? []).forEach((v) => viewsByJob.set(v.job_id, (viewsByJob.get(v.job_id) ?? 0) + 1))
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
    applications: countByJob.get(job.id) ?? 0,
    views: viewsByJob.get(job.id) ?? 0,
    hires: hiresByJob.get(job.id) ?? 0,
    formConfig: job.form_config,
  }))

  if (!isPaginated) {
    return NextResponse.json(jobs)
  }

  const total = count ?? jobs.length
  return NextResponse.json({
    jobs,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  })
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
      hires: 0,
      formConfig: data.form_config,
    }

    // Best-effort sync to the vector store — a Qdrant/model hiccup must never
    // block or fail the actual job creation, since Postgres already has it.
    try {
      const text = buildJobEmbeddingText(newJob)
      const vector = await embedText(text)
      const qdrant = await getQdrantClient()
      await qdrant.upsert(COLLECTIONS.jobs, {
        points: [{ id: newJob.id, vector, payload: { employer_id: user.id, status: newJob.status, updated_at: new Date().toISOString() } }],
      })
    } catch (err) {
      console.error('Failed to update job embedding:', err)
    }

    return NextResponse.json(newJob, { status: 201 })
  } catch (error: any) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
