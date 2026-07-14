import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import type { CompanyProfile } from '@/types/employer/profile'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('employer_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch company name from profiles table (source of truth) — populated at
  // signup, so it must be available even before employer_profiles exists.
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('company')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Error fetching company from profiles:', profileError)
  }

  if (!data) {
    return NextResponse.json({ profile: null, name: profileData?.company || '' })
  }

  // Avoid verbose logging of profile data in server logs

  const profile: CompanyProfile = {
    name: profileData?.company || '',
    tagline: data.tagline || '',
    industry: data.industry || '',
    companySize: data.company_size || '',
    founded: data.founded || '',
    website: data.website || '',
    headquarters: data.headquarters || '',
    overview: data.overview || '',
    culture: data.culture || '',
    benefits: data.benefits || '',
    techStack: data.tech_stack || '',
    linkedin: data.linkedin || '',
    twitter: data.twitter || '',
    logoUrl: data.logo_url,
  }

  return NextResponse.json({ profile })
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: CompanyProfile = await req.json()

    // 1. Update the company name in the profiles table (source of truth)
    if (body.name) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ company: body.name })
        .eq('id', user.id)
        
      if (profileError) {
        console.error('Error updating company name in profiles:', profileError)
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }
    }

    // 2. Upsert the rest of the profile data in employer_profiles
    const { error } = await supabase
      .from('employer_profiles')
      .upsert({
        id: user.id,
        tagline: body.tagline,
        industry: body.industry,
        company_size: body.companySize,
        founded: body.founded,
        website: body.website,
        headquarters: body.headquarters,
        overview: body.overview,
        culture: body.culture,
        benefits: body.benefits,
        tech_stack: body.techStack,
        linkedin: body.linkedin,
        twitter: body.twitter,
        logo_url: body.logoUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    if (error) {
      console.error('Error saving employer profile:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Failed to parse request:', err)
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}
