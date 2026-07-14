import { TalentProfile, TalentProfileDraft } from '@/types/talent/profile'

export const TALENT_PROFILE_STORAGE_KEY = 'talent_profiles'

const now = () => new Date().toISOString()

export function createBlankTalentProfile(overrides: Partial<TalentProfileDraft> = {}): TalentProfile {
  const timestamp = now()

  return {
    id: `profile-${Date.now()}`,
    firstName: '',
    lastName: '',
    headline: '',
    email: '',
    location: '',
    photoUrl: null,
    overview: '',
    availability: 'Open to work',
    workPreference: 'Remote or hybrid',
    preferredRoles: [],
    skills: [],
    languages: ['English'],
    hourlyRate: '',
    linkedin: '',
    github: '',
    portfolio: '',
    introVideoUrl: '',
    resumeFilename: '',
    resumeUrl: '',
    experience: [],
    education: [],
    projects: [],
    ...overrides,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export interface TalentProfileLoadResult {
  profile: TalentProfile | null
  /** Real first/last name captured at signup — populated even before the talent has set up a profile. */
  firstName: string
  lastName: string
}

export async function loadTalentProfile(): Promise<TalentProfileLoadResult> {
  try {
    const res = await fetch('/api/talent/profile')
    if (!res.ok) throw new Error('Failed to fetch profile')
    const data = await res.json()
    return {
      profile: data.profile || null,
      firstName: data.firstName || data.profile?.firstName || '',
      lastName: data.lastName || data.profile?.lastName || '',
    }
  } catch (err) {
    console.error('loadTalentProfile error:', err)
    return { profile: null, firstName: '', lastName: '' }
  }
}

export async function saveTalentProfile(profile: TalentProfile): Promise<void> {
  if (!profile) return
  try {
    const res = await fetch('/api/talent/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
    if (!res.ok) throw new Error('Failed to save profile')
  } catch (err) {
    console.error('saveTalentProfile error:', err)
  }
}

export function calculateCompletionPercentage(profile: TalentProfile | null): number {
  if (!profile) return 0
  let score = 0
  if (profile.firstName && profile.firstName.trim() !== '') score += 5
  if (profile.lastName && profile.lastName.trim() !== '') score += 5
  if (profile.headline && profile.headline.trim() !== '') score += 10
  if (profile.email && profile.email.trim() !== '') score += 10
  if (profile.location && profile.location.trim() !== '') score += 5
  if (profile.photoUrl) score += 10
  if (profile.overview && profile.overview.trim() !== '') score += 15
  if (profile.availability && profile.availability.trim() !== '') score += 5
  if (profile.workPreference && profile.workPreference.trim() !== '') score += 5
  if (Array.isArray(profile.skills) && profile.skills.length > 0) score += 10
  
  // check experience
  const hasValidExp = Array.isArray(profile.experience) && 
    profile.experience.length > 0 && 
    profile.experience.some(exp => (exp.company && exp.company.trim() !== '') || (exp.role && exp.role.trim() !== ''))
  if (hasValidExp) score += 10
  
  // check education
  const hasValidEdu = Array.isArray(profile.education) && 
    profile.education.length > 0 && 
    profile.education.some(edu => (edu.school && edu.school.trim() !== '') || (edu.degree && edu.degree.trim() !== ''))
  if (hasValidEdu) score += 10

  return Math.min(score, 100)
}

