import { createBrowserSupabaseClient } from '@/lib/shared/supabase/client'
import type { CompanyProfile } from '@/types/employer/profile'

export function createBlankCompanyProfile(): CompanyProfile {
  return {
    name: '',
    tagline: '',
    industry: '',
    companySize: '',
    founded: '',
    website: '',
    headquarters: '',
    overview: '',
    culture: '',
    benefits: '',
    techStack: '',
    linkedin: '',
    twitter: '',
    logoUrl: null,
  }
}

export async function getEmployerProfile(): Promise<CompanyProfile | null> {
  const supabase = createBrowserSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const response = await fetch('/api/employer/profile')
  if (!response.ok) return null

  const data = await response.json()
  return data.profile
}

export async function saveEmployerProfile(profile: CompanyProfile): Promise<void> {
  const response = await fetch('/api/employer/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })
  if (!response.ok) {
    throw new Error('Failed to save employer profile')
  }
}
