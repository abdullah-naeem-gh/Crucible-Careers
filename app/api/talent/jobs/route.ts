import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import type { ScrapedJob } from '@/types/talent/job'

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, employer_id, title, location, location_type, type, salary_range, tags, description, responsibilities, requirements, created_at')
    .eq('status', 'Active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching talent jobs:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const employerIds = Array.from(new Set(jobs.map((job) => job.employer_id)))

  const { data: companies, error: companiesError } = await supabase
    .from('employer_company_names')
    .select('id, company')
    .in('id', employerIds)

  if (companiesError) {
    console.error('Error fetching employer company names:', companiesError)
  }

  const companyById = new Map((companies ?? []).map((c) => [c.id, c.company]))

  const result: ScrapedJob[] = jobs.map((job) => ({
    _id: job.id,
    employerId: job.employer_id,
    title: job.title,
    company: companyById.get(job.employer_id) || 'Unknown Company',
    location: job.location,
    locationType: job.location_type ? (job.location_type.toLowerCase() as ScrapedJob['locationType']) : null,
    type: job.type ? (job.type.toLowerCase() as ScrapedJob['type']) : null,
    salary: job.salary_range,
    url: `/apply/${job.id}`,
    source: 'Crucible',
    description: job.description,
    responsibilities: job.responsibilities || [],
    requirements: job.requirements || [],
    tags: job.tags || [],
    posted_at: job.created_at,
  }))

  return NextResponse.json(result)
}
