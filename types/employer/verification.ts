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
