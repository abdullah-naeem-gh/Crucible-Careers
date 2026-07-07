// Add new user types here as the product grows (e.g. 'company')
export type UserRole = 'talent' | 'employer'

export interface UserProfile {
  id: string
  role: UserRole
  firstName: string
  lastName: string
  company?: string
  email: string
}
