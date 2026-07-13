import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import { pickCompanyGradient } from '@/lib/shared/companyGradient'

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data: employerProfiles, error } = await supabase
    .from('employer_profiles')
    .select('*')

  if (error) {
    console.error('Error fetching employer profiles:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const employerIds = employerProfiles.map((p) => p.id)

  const { data: names } = await supabase
    .from('employer_company_names')
    .select('id, company')
    .in('id', employerIds)
  const nameById = new Map((names ?? []).map((n) => [n.id, n.company]))

  const { data: activeJobs } = await supabase
    .from('jobs')
    .select('id, employer_id, title, type, location, salary_range')
    .eq('status', 'Active')
    .in('employer_id', employerIds)

  const jobsByEmployer = new Map<string, typeof activeJobs>()
  ;(activeJobs ?? []).forEach((job) => {
    const list = jobsByEmployer.get(job.employer_id) ?? []
    list.push(job)
    jobsByEmployer.set(job.employer_id, list)
  })

  const companies = employerProfiles
    .map((p) => {
      const jobs = jobsByEmployer.get(p.id) ?? []
      const name = nameById.get(p.id) || 'Unknown Company'
      return {
        id: p.id,
        name,
        location: p.headquarters || 'Remote',
        openRoles: jobs.length,
        logo: name.charAt(0).toUpperCase(),
        color: pickCompanyGradient(p.id),
        about: p.overview || '',
        culture: p.culture || '',
        website: p.website || '',
        tagline: p.tagline || undefined,
        industry: p.industry || undefined,
        companySize: p.company_size || undefined,
        founded: p.founded || undefined,
        benefits: p.benefits || undefined,
        techStack: p.tech_stack || undefined,
        linkedin: p.linkedin || undefined,
        twitter: p.twitter || undefined,
        logoDataUrl: p.logo_url || null,
        openRolesList: jobs.map((job) => ({
          id: job.id,
          title: job.title,
          type: job.type || 'Full-time',
          location: job.location || 'Remote',
          salary: job.salary_range || '—',
        })),
      }
    })
    .filter((c) => c.openRoles > 0)

  return NextResponse.json(companies)
}
