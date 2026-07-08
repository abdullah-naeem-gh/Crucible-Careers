export interface TalentExperience {
  id: string // UUID
  company: string
  role: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  previousSalary?: string
  payslipVerified?: boolean
}

export interface TalentEducation {
  id: string // UUID
  school: string
  degree: string
  field: string
  startYear: string
  endYear: string
  description: string
}

export interface TalentProject {
  id: string // UUID
  title: string
  description: string
  link: string
  imageUrl: string | null
  videoUrl: string
}

export interface TalentProfile {
  id: string // UUID
  firstName: string
  lastName: string
  headline: string
  email: string
  location: string
  photoUrl: string | null
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
  resumeUrl: string
  experience: TalentExperience[]
  education: TalentEducation[]
  projects: TalentProject[]
  createdAt: string
  updatedAt: string
}

export type TalentProfileDraft = Omit<TalentProfile, 'id' | 'createdAt' | 'updatedAt'>
