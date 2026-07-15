"use client"

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IconBell,
  IconChevronRight,
  IconDownload,
  IconMessageCircle,
  IconPlayerTrackNext,
  IconShield,
  IconSparkles,
  IconUserCog,
} from '@tabler/icons-react'
import { createDefaultTalentSettings, loadTalentSettings, saveTalentSettings } from '@/lib/talent/services/settings.service'
import { TalentSettings } from '@/types/talent/settings'

type SettingsSection = 'notifications' | 'privacy' | 'communication' | 'workflow' | 'experience' | 'account'

const surface = 'rounded-[24px] border border-gray-200 bg-white/70 backdrop-blur-sm shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] dark:border-white/[0.07] dark:bg-[#171717]'
const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 dark:border-white/[0.08] dark:bg-[#121212] dark:text-white'
const mutedLabel = 'text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-white/30'

const sections: Array<{ id: SettingsSection; label: string; description: string; icon: React.ComponentType<any> }> = [
  { id: 'notifications', label: 'Notifications', description: 'Job alerts, application updates, and digest cadence.', icon: IconBell },
  { id: 'privacy', label: 'Privacy & Visibility', description: 'Profile discoverability and recruiter-facing visibility.', icon: IconShield },
  { id: 'communication', label: 'Communication', description: 'Employer contact preferences and reminder behavior.', icon: IconMessageCircle },
  { id: 'workflow', label: 'Application Workflow', description: 'Quick apply defaults, resume behavior, and tracking.', icon: IconPlayerTrackNext },
  { id: 'experience', label: 'Experience', description: 'Accessibility, density, and dashboard presentation.', icon: IconSparkles },
  { id: 'account', label: 'Account & Security', description: 'Security posture, account state, and data actions.', icon: IconUserCog },
]

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border border-gray-200 bg-white p-4 dark:border-white/[0.06] dark:bg-[#1b1b1b]">
      <div className="mb-4 border-b border-gray-200 pb-3 dark:border-white/[0.06]">
        <div className="text-sm font-semibold text-gray-950 dark:text-white">{title}</div>
        {description && <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-white/40">{description}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function ToggleRow({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-white/[0.06] dark:bg-[#121212]">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">{title}</div>
        <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-white/38">{description}</p>
      </div>
      <label className="relative inline-flex shrink-0 cursor-pointer items-center">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
        <span className="custom-toggle-track" />
        <span className="custom-toggle-knob" />
      </label>
    </div>
  )
}

function Segmented({ options, value, onChange }: { options: Array<{ value: string; label: string }>; value: string; onChange: (value: string) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${active ? 'border-gray-900/10 bg-gray-50 text-gray-900 dark:border-white/[0.10] dark:bg-white/[0.04] dark:text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-white/[0.06] dark:bg-[#121212] dark:text-white/68'}`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default function SettingsTab() {
  const [settings, setSettings] = useState<TalentSettings>(() => createDefaultTalentSettings())
  const [activeSection, setActiveSection] = useState<SettingsSection>('notifications')
  const [isSaving, setIsSaving] = useState(false)
  const [savedNotice, setSavedNotice] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setSettings(loadTalentSettings())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!savedNotice) return
    const timer = setTimeout(() => setSavedNotice(false), 1800)
    return () => clearTimeout(timer)
  }, [savedNotice])

  const updateSection = <K extends keyof TalentSettings>(section: K, value: TalentSettings[K]) => {
    setSettings((prev) => ({ ...prev, [section]: value }))
  }

  const sectionMeta = useMemo(() => sections.find((item) => item.id === activeSection), [activeSection])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 450))
    saveTalentSettings(settings)
    setIsSaving(false)
    setSavedNotice(true)
  }

  const notificationSummary = [
    settings.notifications.email && 'Email',
    settings.notifications.browserPush && 'Browser',
    settings.notifications.jobMatches && 'Matches',
    settings.notifications.applicationStatus && 'Status',
  ].filter(Boolean)

  return (
    <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-7">
      <section className={`${surface} flex flex-col overflow-hidden lg:col-span-4`}>
        <div className="border-b border-gray-200 px-5 py-5 dark:border-white/[0.07]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FF6B00]">Settings</p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-950 dark:text-white">Talent Control Center</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-white/40">Tune how employers discover you, how jobs are matched, and how your workflow behaves.</p>
        </div>

        <div className="flex-1 overflow-auto p-5">
          <div className="mb-5 rounded-[18px] border border-gray-200 bg-gray-50 p-4 dark:border-white/[0.06] dark:bg-[#121212]">
            <div className={mutedLabel}>Current alert stack</div>
            <div className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{notificationSummary.join(' · ') || 'Notifications muted'}</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-white/40">Digest cadence: {settings.notifications.digestCadence}</div>
          </div>

          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon
              const active = section.id === activeSection
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full rounded-[16px] border px-4 py-3 text-left transition ${active ? 'border-gray-900/10 bg-gray-50 dark:border-white/[0.10] dark:bg-white/[0.04]' : 'border-gray-200 bg-white hover:border-gray-300 dark:border-white/[0.06] dark:bg-[#171717] dark:hover:bg-[#1d1d1d]'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 inline-flex items-center justify-center ${active ? 'text-[#FF6B00] dark:text-[#FF914D]' : 'text-gray-500 dark:text-white/50'}`}>
                        <Icon size={18} stroke={1.8} />
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{section.label}</div>
                        <div className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-white/38">{section.description}</div>
                      </div>
                    </div>
                    <IconChevronRight size={16} className={`mt-1 shrink-0 ${active ? 'text-gray-500 dark:text-white/45' : 'text-gray-400 dark:text-white/30'}`} />
                  </div>
                </button>
              )
            })}
          </nav>
        </div>
      </section>

      <section className={`${surface} flex flex-col overflow-hidden lg:col-span-8`}>
        <div className="border-b border-gray-200 px-5 py-5 dark:border-white/[0.07]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-white/30">Talent preferences</p>
              <h2 className="mt-1 text-2xl font-semibold text-gray-950 dark:text-white">{sectionMeta?.label}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-white/40">{sectionMeta?.description}</p>
            </div>
            <div className="flex items-center gap-3">
              {hydrated && savedNotice && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">Saved</span>}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-xl bg-[#FF6B00] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E55F00] disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save settings'}
              </motion.button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-5">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-5"
            >
              {activeSection === 'notifications' && (
                <>
                  <SectionCard title="Core alerts" description="Control which recruiting and hiring events reach you first.">
                    <ToggleRow title="Email notifications" description="Receive key hiring activity and talent updates in your inbox." checked={settings.notifications.email} onChange={(value) => updateSection('notifications', { ...settings.notifications, email: value })} />
                    <ToggleRow title="Browser push" description="Show in-browser alerts for faster response on active applications." checked={settings.notifications.browserPush} onChange={(value) => updateSection('notifications', { ...settings.notifications, browserPush: value })} />
                    <ToggleRow title="Job matches" description="Send alerts when new roles fit your saved profile signals and search preferences." checked={settings.notifications.jobMatches} onChange={(value) => updateSection('notifications', { ...settings.notifications, jobMatches: value })} />
                    <ToggleRow title="Saved search alerts" description="Notify when saved search filters return new opportunities." checked={settings.notifications.savedSearchAlerts} onChange={(value) => updateSection('notifications', { ...settings.notifications, savedSearchAlerts: value })} />
                    <div>
                      <div className={mutedLabel}>Job alert frequency</div>
                      <div className="mt-2">
                        <Segmented
                          value={settings.jobDiscovery.alertFrequency}
                          onChange={(value) => updateSection('jobDiscovery', { ...settings.jobDiscovery, alertFrequency: value as TalentSettings['jobDiscovery']['alertFrequency'] })}
                          options={[
                            { value: 'instant', label: 'Instant' },
                            { value: 'daily', label: 'Daily' },
                            { value: 'weekly', label: 'Weekly' },
                          ]}
                        />
                      </div>
                    </div>
                  </SectionCard>
                  <SectionCard title="Application events" description="Keep your candidate workflow visible without checking every tab manually.">
                    <ToggleRow title="Application status changes" description="Alert on shortlisted, rejected, interview, and offer movement." checked={settings.notifications.applicationStatus} onChange={(value) => updateSection('notifications', { ...settings.notifications, applicationStatus: value })} />
                    <ToggleRow title="Employer messages" description="Notify as soon as recruiters message you in the platform." checked={settings.notifications.employerMessages} onChange={(value) => updateSection('notifications', { ...settings.notifications, employerMessages: value })} />
                    <ToggleRow title="Interview reminders" description="Get reminders before scheduled calls, tests, and interview windows." checked={settings.notifications.interviewReminders} onChange={(value) => updateSection('notifications', { ...settings.notifications, interviewReminders: value })} />
                    <ToggleRow title="Product announcements" description="Receive product updates, launches, and feature releases relevant to job seekers." checked={settings.notifications.productAnnouncements} onChange={(value) => updateSection('notifications', { ...settings.notifications, productAnnouncements: value })} />
                    <div>
                      <div className={mutedLabel}>Digest cadence</div>
                      <div className="mt-2">
                        <Segmented
                          value={settings.notifications.digestCadence}
                          onChange={(value) => updateSection('notifications', { ...settings.notifications, digestCadence: value as TalentSettings['notifications']['digestCadence'] })}
                          options={[
                            { value: 'daily', label: 'Daily' },
                            { value: 'weekly', label: 'Weekly' },
                            { value: 'biweekly', label: 'Biweekly' },
                            { value: 'monthly', label: 'Monthly' },
                          ]}
                        />
                      </div>
                    </div>
                  </SectionCard>
                </>
              )}

              {activeSection === 'privacy' && (
                <>
                  <SectionCard title="Profile visibility" description="Control who can discover and view your candidate profile.">
                    <div>
                      <div className={mutedLabel}>Visibility mode</div>
                      <select value={settings.profileVisibility.visibility} onChange={(e) => updateSection('profileVisibility', { ...settings.profileVisibility, visibility: e.target.value as TalentSettings['profileVisibility']['visibility'] })} className={`${inputClass} mt-2`}>
                        <option value="public">Public</option>
                        <option value="employers-only">Employers only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                    <ToggleRow title="Discoverable by recruiters" description="Allow recruiters to surface your profile in talent search." checked={settings.profileVisibility.discoverableByRecruiters} onChange={(value) => updateSection('profileVisibility', { ...settings.profileVisibility, discoverableByRecruiters: value })} />
                    <ToggleRow title="Open-to-work badge" description="Show a visible hiring signal on your profile and candidate card." checked={settings.profileVisibility.openToWorkBadge} onChange={(value) => updateSection('profileVisibility', { ...settings.profileVisibility, openToWorkBadge: value })} />
                  </SectionCard>
                  <SectionCard title="Employer-facing details" description="Choose which contact and profile elements are exposed to employers.">
                    <ToggleRow title="Show email" description="Let employers view your direct email address from the profile." checked={settings.profileVisibility.showEmail} onChange={(value) => updateSection('profileVisibility', { ...settings.profileVisibility, showEmail: value })} />
                    <ToggleRow title="Show location" description="Display your city or region in the public profile layout." checked={settings.profileVisibility.showLocation} onChange={(value) => updateSection('profileVisibility', { ...settings.profileVisibility, showLocation: value })} />
                    <ToggleRow title="Show resume" description="Expose your default resume as part of employer review." checked={settings.profileVisibility.showResume} onChange={(value) => updateSection('profileVisibility', { ...settings.profileVisibility, showResume: value })} />
                    <ToggleRow title="Allow recruiter contact" description="Let employers initiate conversations outside application threads." checked={settings.profileVisibility.allowRecruiterContact} onChange={(value) => updateSection('profileVisibility', { ...settings.profileVisibility, allowRecruiterContact: value })} />
                  </SectionCard>
                </>
              )}

              {activeSection === 'communication' && (
                <>
                  <SectionCard title="Contact preferences" description="Set expectations for how employers should reach you.">
                    <div>
                      <div className={mutedLabel}>Preferred contact method</div>
                      <div className="mt-2"><Segmented value={settings.communications.preferredContactMethod} onChange={(value) => updateSection('communications', { ...settings.communications, preferredContactMethod: value as TalentSettings['communications']['preferredContactMethod'] })} options={[{ value: 'email', label: 'Email' }, { value: 'platform', label: 'Platform' }, { value: 'either', label: 'Either' }]} /></div>
                    </div>
                    <div>
                      <div className={mutedLabel}>Contact window</div>
                      <div className="mt-2"><Segmented value={settings.communications.contactWindow} onChange={(value) => updateSection('communications', { ...settings.communications, contactWindow: value as TalentSettings['communications']['contactWindow'] })} options={[{ value: 'anytime', label: 'Anytime' }, { value: 'business-hours', label: 'Business hours' }, { value: 'evenings', label: 'Evenings' }]} /></div>
                    </div>
                  </SectionCard>
                  <SectionCard title="Communication automation" description="Reduce missed employer follow-ups and noisy outreach.">
                    <ToggleRow title="Email message previews" description="Include recruiter message snippets inside email notifications." checked={settings.communications.messagePreviewInEmail} onChange={(value) => updateSection('communications', { ...settings.communications, messagePreviewInEmail: value })} />
                    <ToggleRow title="Response reminders" description="Remind you when employer threads have been waiting too long for a reply." checked={settings.communications.responseReminders} onChange={(value) => updateSection('communications', { ...settings.communications, responseReminders: value })} />
                    <ToggleRow title="Newsletter subscription" description="Receive market updates, hiring trends, and career content." checked={settings.communications.newsletterSubscribed} onChange={(value) => updateSection('communications', { ...settings.communications, newsletterSubscribed: value })} />
                  </SectionCard>
                </>
              )}
              {activeSection === 'workflow' && (
                <>
                  <SectionCard title="Application defaults" description="Choose how fast-apply flows behave before every submission.">
                    <div>
                      <div className={mutedLabel}>Default resume behavior</div>
                      <div className="mt-2"><Segmented value={settings.applicationWorkflow.defaultResume} onChange={(value) => updateSection('applicationWorkflow', { ...settings.applicationWorkflow, defaultResume: value as TalentSettings['applicationWorkflow']['defaultResume'] })} options={[{ value: 'latest', label: 'Latest resume' }, { value: 'tailored', label: 'Tailored version' }, { value: 'manual', label: 'Choose each time' }]} /></div>
                    </div>
                    <ToggleRow title="Autofill applications" description="Prefill repeat candidate fields where the job form allows it." checked={settings.applicationWorkflow.autofillApplications} onChange={(value) => updateSection('applicationWorkflow', { ...settings.applicationWorkflow, autofillApplications: value })} />
                    <ToggleRow title="Save draft answers" description="Keep custom screening responses ready for reuse." checked={settings.applicationWorkflow.saveDraftAnswers} onChange={(value) => updateSection('applicationWorkflow', { ...settings.applicationWorkflow, saveDraftAnswers: value })} />
                    <ToggleRow title="Quick apply defaults" description="Use saved defaults for supporting documents and profile metadata." checked={settings.applicationWorkflow.quickApplyDefaults} onChange={(value) => updateSection('applicationWorkflow', { ...settings.applicationWorkflow, quickApplyDefaults: value })} />
                  </SectionCard>
                  <SectionCard title="Tracking and automation" description="Control how much of the workflow the dashboard handles for you.">
                    <ToggleRow title="Track applications automatically" description="Auto-create and update application records when you apply through supported flows." checked={settings.applicationWorkflow.trackApplicationsAutomatically} onChange={(value) => updateSection('applicationWorkflow', { ...settings.applicationWorkflow, trackApplicationsAutomatically: value })} />
                    <div>
                      <div className={mutedLabel}>Automation comfort</div>
                      <div className="mt-2"><Segmented value={settings.applicationWorkflow.autoApplyComfort} onChange={(value) => updateSection('applicationWorkflow', { ...settings.applicationWorkflow, autoApplyComfort: value as TalentSettings['applicationWorkflow']['autoApplyComfort'] })} options={[{ value: 'manual', label: 'Manual' }, { value: 'assisted', label: 'Assisted' }, { value: 'fast-track', label: 'Fast-track' }]} /></div>
                    </div>
                  </SectionCard>
                </>
              )}

              {activeSection === 'experience' && (
                <>
                  <SectionCard title="Dashboard presentation" description="Adjust the feel and readability of the talent workspace.">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <div className={mutedLabel}>Theme preference</div>
                        <select value={settings.experience.theme} onChange={(e) => updateSection('experience', { ...settings.experience, theme: e.target.value as TalentSettings['experience']['theme'] })} className={`${inputClass} mt-2`}>
                          <option value="system">System</option>
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </select>
                      </div>
                      <div>
                        <div className={mutedLabel}>Dashboard density</div>
                        <select value={settings.experience.dashboardDensity} onChange={(e) => updateSection('experience', { ...settings.experience, dashboardDensity: e.target.value as TalentSettings['experience']['dashboardDensity'] })} className={`${inputClass} mt-2`}>
                          <option value="comfortable">Comfortable</option>
                          <option value="compact">Compact</option>
                        </select>
                      </div>
                      <div>
                        <div className={mutedLabel}>Timezone</div>
                        <input value={settings.experience.timezone} onChange={(e) => updateSection('experience', { ...settings.experience, timezone: e.target.value })} className={`${inputClass} mt-2`} />
                      </div>
                      <div>
                        <div className={mutedLabel}>Week starts on</div>
                        <select value={settings.experience.weekStartsOn} onChange={(e) => updateSection('experience', { ...settings.experience, weekStartsOn: e.target.value as TalentSettings['experience']['weekStartsOn'] })} className={`${inputClass} mt-2`}>
                          <option value="monday">Monday</option>
                          <option value="sunday">Sunday</option>
                        </select>
                      </div>
                    </div>
                  </SectionCard>
                  <SectionCard title="Accessibility and motion" description="Reduce friction when you spend long sessions reviewing openings and applications.">
                    <ToggleRow title="Reduced motion" description="Tone down animation and transitional movement in the dashboard." checked={settings.experience.reducedMotion} onChange={(value) => updateSection('experience', { ...settings.experience, reducedMotion: value })} />
                    <ToggleRow title="High-contrast cards" description="Increase visual contrast across panel surfaces and controls." checked={settings.experience.highContrastCards} onChange={(value) => updateSection('experience', { ...settings.experience, highContrastCards: value })} />
                  </SectionCard>
                </>
              )}

              {activeSection === 'account' && (
                <>
                  <SectionCard title="Identity and security" description="Administrative account controls for your talent profile.">
                    <div className="sm:col-span-2">
                      <div className={mutedLabel}>Account email</div>
                      <input value={settings.account.accountEmail} onChange={(e) => updateSection('account', { ...settings.account, accountEmail: e.target.value })} className={`${inputClass} mt-2`} />
                    </div>
                    <ToggleRow title="Session alerts" description="Email when account access occurs from a new device or browser." checked={settings.account.sessionAlerts} onChange={(value) => updateSection('account', { ...settings.account, sessionAlerts: value })} />
                    <ToggleRow title="Two-factor ready" description="Mark this account as prepared for future 2FA enablement flows." checked={settings.account.twoFactorReady} onChange={(value) => updateSection('account', { ...settings.account, twoFactorReady: value })} />
                  </SectionCard>
                  <SectionCard title="Data actions" description="High-impact account actions remain clearly separated from everyday preferences.">
                    <div className="rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.025]">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">Export account data</div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-white/38">Prepare a downloadable snapshot of profile, applications, and preference history.</p>
                        </div>
                        <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 dark:border-white/[0.06] dark:bg-[#121212] dark:text-white/68">
                          <IconDownload size={16} /> Export
                        </button>
                      </div>
                    </div>
                    <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 dark:border-red-500/20 dark:bg-red-500/[0.06]">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-red-700 dark:text-red-300">Close account</div>
                          <p className="mt-1 text-xs text-red-600/80 dark:text-red-200/75">Remove your talent access and stop new employer discovery. This remains a deliberate manual action.</p>
                        </div>
                        <button type="button" className="rounded-xl border border-red-200 bg-white px-3.5 py-2 text-sm font-semibold text-red-600 dark:border-red-500/20 dark:bg-[#171717] dark:text-red-300">Delete account</button>
                      </div>
                    </div>
                  </SectionCard>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}

