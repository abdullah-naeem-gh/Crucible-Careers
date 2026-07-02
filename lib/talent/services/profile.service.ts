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
  const updatedProfile = { ...profile, updatedAt: now() }
  const exists = profiles.some((item) => item.id === profile.id)
  const next = exists
    ? profiles.map((item) => (item.id === profile.id ? updatedProfile : item))
    : [updatedProfile, ...profiles]

  if (next.length === 1) return [{ ...next[0], isPrimary: true }]
  return next
}
