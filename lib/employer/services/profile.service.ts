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

export interface EmployerProfileLoadResult {
  profile: CompanyProfile | null
  /** Real company name captured at signup — populated even before the employer has completed onboarding. */
  name: string
}

export async function getEmployerProfile(): Promise<EmployerProfileLoadResult> {
  const supabase = createBrowserSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { profile: null, name: '' }

  const response = await fetch('/api/employer/profile')
  if (!response.ok) return { profile: null, name: '' }

  const data = await response.json()
  return { profile: data.profile ?? null, name: data.name || data.profile?.name || '' }
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
