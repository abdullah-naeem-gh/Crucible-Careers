import { TalentSettings } from '@/types/talent/settings'

export const TALENT_SETTINGS_STORAGE_KEY = 'talent_settings'

export function createDefaultTalentSettings(): TalentSettings {
  return {
    notifications: {
      email: true,
      browserPush: true,
      jobMatches: true,
      savedSearchAlerts: true,
      applicationStatus: true,
      employerMessages: true,
      interviewReminders: true,
      productAnnouncements: false,
      digestCadence: 'weekly',
    },
    jobDiscovery: {
      jobTypes: ['Full-time', 'Contract'],
      workModes: ['Remote', 'Hybrid'],
      preferredLocations: ['Remote', 'San Francisco'],
      industries: ['SaaS', 'AI'],
      seniorityLevels: ['Mid-level', 'Senior'],
      salaryRange: '$100k - $150k',
      remotePreference: 'hybrid',
      visaSupportNeeded: false,
      openToRelocation: true,
      willingToTravel: false,
      alertFrequency: 'daily',
    },
    profileVisibility: {
      visibility: 'employers-only',
      showEmail: false,
      showLocation: true,
      showResume: true,
      allowRecruiterContact: true,
      discoverableByRecruiters: true,
      openToWorkBadge: true,
    },
    communications: {
      preferredContactMethod: 'either',
      contactWindow: 'business-hours',
      messagePreviewInEmail: true,
      responseReminders: true,
      newsletterSubscribed: false,
    },
    applicationWorkflow: {
      defaultResume: 'latest',
      autofillApplications: true,
      saveDraftAnswers: true,
      quickApplyDefaults: true,
      trackApplicationsAutomatically: true,
      autoApplyComfort: 'assisted',
    },
    experience: {
      theme: 'system',
      dashboardDensity: 'comfortable',
      reducedMotion: false,
      highContrastCards: false,
      timezone: 'Pacific Time (PT)',
      weekStartsOn: 'monday',
    },
    account: {
      accountEmail: 'alex.johnson@email.com',
      twoFactorReady: false,
      sessionAlerts: true,
      dataExportReady: true,
    },
  }
}

export function loadTalentSettings(): TalentSettings {
  if (typeof window === 'undefined') return createDefaultTalentSettings()

  try {
    const saved = window.localStorage.getItem(TALENT_SETTINGS_STORAGE_KEY)
    if (!saved) return createDefaultTalentSettings()

    return {
      ...createDefaultTalentSettings(),
      ...JSON.parse(saved),
    }
  } catch {
    return createDefaultTalentSettings()
  }
}

export function saveTalentSettings(settings: TalentSettings) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TALENT_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}
