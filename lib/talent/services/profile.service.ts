import { TalentProfile, TalentProfileDraft } from '@/types/talent/profile'

export const TALENT_PROFILE_STORAGE_KEY = 'talent_profiles'

const now = () => new Date().toISOString()

export function createBlankTalentProfile(overrides: Partial<TalentProfileDraft> = {}): TalentProfile {
  const timestamp = now()

  return {
    id: `profile-${Date.now()}`,
    profileName: 'Profile 1',
    isPrimary: false,
    name: '',
    headline: '',
    email: '',
    location: '',
    photoDataUrl: null,
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
    experience: [],
    education: [],
    projects: [],
    ...overrides,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function loadTalentProfiles(): TalentProfile[] {
  if (typeof window === 'undefined') return []

  try {
    const saved = window.localStorage.getItem(TALENT_PROFILE_STORAGE_KEY)
    const parsed = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveTalentProfiles(profiles: TalentProfile[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TALENT_PROFILE_STORAGE_KEY, JSON.stringify(profiles))
}

export function upsertTalentProfile(profiles: TalentProfile[], profile: TalentProfile) {
  const updatedProfile = { ...profile, isPrimary: true, updatedAt: now() }
  return [updatedProfile]
}

export function calculateCompletionPercentage(profile: TalentProfile | null): number {
  if (!profile) return 0
  let score = 0
  if (profile.name && profile.name.trim() !== '') score += 10
  if (profile.headline && profile.headline.trim() !== '') score += 10
  if (profile.email && profile.email.trim() !== '') score += 10
  if (profile.location && profile.location.trim() !== '') score += 5
  if (profile.photoDataUrl) score += 10
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

