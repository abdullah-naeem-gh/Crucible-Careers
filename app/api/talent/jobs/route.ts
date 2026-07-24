import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import { getTalentVector, scoreJobsForTalent } from '@/lib/shared/matching/matchScore'
import type { ScrapedJob } from '@/types/talent/job'

export async function GET() {
  const supabase = await createSupabaseServerClient()

  // Soft auth check — this listing stays public either way; an authenticated
  // talent additionally gets a real match score attached per job.
  const { data: { user } } = await supabase.auth.getUser()

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

  const { data: employerProfiles, error: profilesError } = await supabase
    .from('employer_profiles')
    .select('id, logo_url')
    .in('id', employerIds)

  if (profilesError) {
    console.error('Error fetching employer logos:', profilesError)
  }

  const jobIds = jobs.map((job) => job.id)

  const { data: apps, error: appsError } = await supabase
    .from('applications')
    .select('job_id')
    .in('job_id', jobIds)

  if (appsError) {
    console.error('Error fetching application counts:', appsError)
  }

  const companyById = new Map((companies ?? []).map((c) => [c.id, c.company]))
  const logoById = new Map((employerProfiles ?? []).map((p) => [p.id, p.logo_url]))
  const applicantCountByJob = new Map<string, number>()
  ;(apps ?? []).forEach((a) => {
    applicantCountByJob.set(a.job_id, (applicantCountByJob.get(a.job_id) ?? 0) + 1)
  })

  let matchScoreByJob = new Map<string, number>()
  if (user) {
    try {
      const talentVector = await getTalentVector(user.id)
      if (talentVector) {
        matchScoreByJob = await scoreJobsForTalent(talentVector, jobIds)
      }
    } catch (err) {
      console.error('Failed to compute job match scores:', err)
    }
  }

  const result: ScrapedJob[] = jobs.map((job) => ({
    _id: job.id,
    employerId: job.employer_id,
    title: job.title,
    company: companyById.get(job.employer_id) || 'Unknown Company',
    companyLogo: logoById.get(job.employer_id) || null,
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
    applicantCount: applicantCountByJob.get(job.id) ?? 0,
    matchScore: matchScoreByJob.get(job.id),
  }))

  return NextResponse.json(result)
}
