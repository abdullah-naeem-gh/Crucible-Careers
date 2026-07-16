export type TalentDigestCadence = 'daily' | 'weekly' | 'biweekly' | 'monthly'
export type TalentProfileVisibility = 'public' | 'private' | 'employers-only'
export type TalentRemotePreference = 'remote' | 'hybrid' | 'onsite' | 'any'
export type TalentContactWindow = 'anytime' | 'business-hours' | 'evenings'
export type TalentAutoApplyComfort = 'manual' | 'assisted' | 'fast-track'
export type TalentThemePreference = 'system' | 'light' | 'dark'
export type TalentDashboardDensity = 'comfortable' | 'compact'

export interface TalentSettings {
  notifications: {
    email: boolean
    browserPush: boolean
    jobMatches: boolean
    savedSearchAlerts: boolean
    applicationStatus: boolean
    employerMessages: boolean
    interviewReminders: boolean
    productAnnouncements: boolean
    digestCadence: TalentDigestCadence
  }
  jobDiscovery: {
    jobTypes: string[]
    workModes: string[]
    preferredLocations: string[]
    industries: string[]
    seniorityLevels: string[]
    salaryRange: string
    remotePreference: TalentRemotePreference
    visaSupportNeeded: boolean
    openToRelocation: boolean
    willingToTravel: boolean
    alertFrequency: 'instant' | 'daily' | 'weekly'
  }
  profileVisibility: {
    visibility: TalentProfileVisibility
    showEmail: boolean
    showLocation: boolean
    showResume: boolean
    allowRecruiterContact: boolean
    discoverableByRecruiters: boolean
    openToWorkBadge: boolean
  }
  communications: {
    preferredContactMethod: 'email' | 'platform' | 'either'
    contactWindow: TalentContactWindow
    messagePreviewInEmail: boolean
    responseReminders: boolean
    newsletterSubscribed: boolean
  }
  applicationWorkflow: {
    defaultResume: 'latest' | 'tailored' | 'manual'
    autofillApplications: boolean
    saveDraftAnswers: boolean
    quickApplyDefaults: boolean
    trackApplicationsAutomatically: boolean
    autoApplyComfort: TalentAutoApplyComfort
  }
  experience: {
    theme: TalentThemePreference
    dashboardDensity: TalentDashboardDensity
    reducedMotion: boolean
    highContrastCards: boolean
    timezone: string
    weekStartsOn: 'monday' | 'sunday'
  }
}
