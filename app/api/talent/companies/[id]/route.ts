import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import { pickCompanyGradient } from '@/lib/shared/companyGradient'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient()
  const { id } = await params

  const { data: p, error } = await supabase
    .from('employer_profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !p) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const { data: nameRow } = await supabase
    .from('employer_company_names')
    .select('company')
    .eq('id', id)
    .single()
  const name = nameRow?.company || 'Unknown Company'

  const { data: activeJobs } = await supabase
    .from('jobs')
    .select('id, title, type, location, salary_range')
    .eq('status', 'Active')
    .eq('employer_id', id)

  const openRoles = (activeJobs ?? []).map((job) => ({
    id: job.id,
    title: job.title,
    type: job.type || 'Full-time',
    location: job.location || 'Remote',
    salary: job.salary_range || '—',
  }))

  return NextResponse.json({
    id: p.id,
    name,
    location: p.headquarters || 'Remote',
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
    openRoles,
  })
}
