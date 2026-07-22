import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data: names, error } = await supabase
    .from('employer_company_names')
    .select('id, company')

  if (error) {
    console.error('Error fetching company names:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const employerIds = (names ?? []).map((row) => row.id)

  const { data: profiles, error: profilesError } = await supabase
    .from('employer_profiles')
    .select('id, logo_url')
    .in('id', employerIds)

  if (profilesError) {
    console.error('Error fetching company logos:', profilesError)
  }

  const logoById = new Map((profiles ?? []).map((p) => [p.id, p.logo_url]))
  const seen = new Set<string>()
  const companies: { name: string; logo: string | null }[] = []

  for (const row of names ?? []) {
    const name = row.company?.trim()
    if (!name || seen.has(name)) continue
    seen.add(name)
    companies.push({ name, logo: logoById.get(row.id) || null })
  }

  companies.sort((a, b) => a.name.localeCompare(b.name))

  return NextResponse.json({ companies })
}
