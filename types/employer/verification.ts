export interface ExperienceVerificationRequest {
  id: string
  experienceId: string
  talentId: string
  status: 'pending' | 'verified' | 'rejected'
  rejectionReason: string | null
  requestedAt: string
  respondedAt: string | null
  talent: {
    name: string
    email: string
    headline: string
    location: string
  }
  experience: {
    company: string
    role: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    description: string
    previousSalary: string
  }
}

export interface BlacklistedTalent {
  id: string
  talentId: string
  name: string
  email: string
  reason: string | null
  createdAt: string
}
