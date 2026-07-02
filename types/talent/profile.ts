export interface TalentExperience {
  id: string
  company: string
  role: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

export interface TalentEducation {
  id: string
  school: string
  degree: string
  field: string
  startYear: string
  endYear: string
  description: string
}

export interface TalentProject {
  id: string
  title: string
  description: string
  link: string
  imageDataUrl: string | null
  videoUrl: string
}

export interface TalentProfile {
  id: string
  profileName: string
  isPrimary: boolean
  name: string
  headline: string
  email: string
  location: string
  photoDataUrl: string | null
  overview: string
  availability: string
  workPreference: string
  preferredRoles: string[]
  skills: string[]
  languages: string[]
  hourlyRate: string
  linkedin: string
  github: string
  portfolio: string
  introVideoUrl: string
  resumeFilename: string
  experience: TalentExperience[]
  education: TalentEducation[]
  projects: TalentProject[]
  createdAt: string
  updatedAt: string
}

export type TalentProfileDraft = Omit<TalentProfile, 'id' | 'createdAt' | 'updatedAt'>
