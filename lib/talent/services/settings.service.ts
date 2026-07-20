import { TalentSettings } from '@/types/talent/settings'

export const TALENT_SETTINGS_STORAGE_KEY = 'talent_settings'

// These 3 sections are persisted server-side (Supabase, `talent_settings` table).
// The remaining sections (jobDiscovery, applicationWorkflow, experience) stay
// local-only for now — see plan notes on why each was left unwired. Account &
// Security is handled entirely separately (lib/shared/auth/actions.ts +
// app/api/talent/account/**) since it's real account actions, not preferences.
const PERSISTED_KEYS = ['notifications', 'profileVisibility', 'communications'] as const

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
  }
}

function loadLocalSettings(): TalentSettings {
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

export async function loadTalentSettings(): Promise<TalentSettings> {
  const defaults = createDefaultTalentSettings()
  const local = loadLocalSettings()

  const merged: TalentSettings = { ...defaults, ...local }

  try {
    const res = await fetch('/api/talent/settings')
    if (res.ok) {
      const remote = await res.json()
      for (const key of PERSISTED_KEYS) {
        if (remote[key]) {
          merged[key] = { ...defaults[key], ...remote[key] } as never
        }
      }
    }
  } catch {
    // Fall back to whatever local/default values are already in `merged`.
  }

  return merged
}

export async function saveTalentSettings(settings: TalentSettings): Promise<void> {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TALENT_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  }

  await fetch('/api/talent/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      notifications: settings.notifications,
      profileVisibility: settings.profileVisibility,
      communications: settings.communications,
    }),
  }).catch(() => {
    // Local copy already saved above — a failed remote sync isn't fatal here.
  })
}
