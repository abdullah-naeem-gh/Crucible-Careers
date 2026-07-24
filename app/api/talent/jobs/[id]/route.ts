import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import type { EmployerJob } from '@/types/employer/job'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient()
  const { id } = await params

  const { data: job, error } = await supabase
    .from('jobs')
    .select('id, employer_id, title, location, location_type, type, status, salary_range, tags, description, responsibilities, requirements, form_config, created_at')
    .eq('id', id)
    .single()

  if (error || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  const { data: company } = await supabase
    .from('employer_company_names')
    .select('company')
    .eq('id', job.employer_id)
    .single()

  const result: EmployerJob = {
    id: job.id,
    company: company?.company || 'Unknown Company',
    title: job.title,
    location: job.location,
    locationType: job.location_type,
    type: job.type,
    status: job.status,
    salary: job.salary_range || undefined,
    tags: job.tags || [],
    postedAt: new Date(job.created_at).toLocaleDateString(),
    description: job.description || '',
    responsibilities: job.responsibilities || [],
    requirements: job.requirements || [],
    applications: 0,
    views: 0,
    hires: 0,
    formConfig: job.form_config,
  }

  return NextResponse.json(result)
}
