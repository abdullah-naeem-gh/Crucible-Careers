'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import TalentSidebar from '@/components/talent/sidebar/TalentSidebar'

interface Settings {
  notifications: {
    email: boolean
    push: boolean
    jobMatches: boolean
    applicationUpdates: boolean
    weeklyDigest: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'employers-only'
    showEmail: boolean
    showLocation: boolean
    allowContact: boolean
  }
  preferences: {
    jobTypes: string[]
    locations: string[]
    salaryRange: string
    remotePreference: 'remote' | 'hybrid' | 'onsite' | 'any'
  }
}

const DEMO_SETTINGS: Settings = {
  notifications: {
    email: true,
    push: true,
    jobMatches: true,
    applicationUpdates: true,
    weeklyDigest: false
  },
  privacy: {
    profileVisibility: 'employers-only',
    showEmail: false,
    showLocation: true,
    allowContact: true
  },
  preferences: {
    jobTypes: ['Full-time', 'Contract'],
    locations: ['San Francisco', 'Remote'],
    salaryRange: '$100k - $150k',
    remotePreference: 'hybrid'
  }
}

export default function TalentSettings() {
  const [settings, setSettings] = useState<Settings>(DEMO_SETTINGS)
  const [activeTab, setActiveTab] = useState<'notifications' | 'privacy' | 'preferences' | 'account'>('notifications')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    alert('Settings saved successfully!')
  }

  const updateNotification = (key: keyof Settings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
  }

  const updatePrivacy = (key: keyof Settings['privacy'], value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }))
  }

  const updatePreferences = (key: keyof Settings['preferences'], value: any) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }))
  }

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'account', label: 'Account Settings', icon: '👤' }
  ] as const

  const getTabLabel = (id: typeof activeTab) => {
    switch (id) {
      case 'notifications': return 'Notification Preferences'
      case 'privacy': return 'Privacy Settings'
      case 'preferences': return 'Job Preferences'
      case 'account': return 'Account Settings'
    }
  }

  const selectClass = 'w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white/50 cursor-pointer text-gray-800 font-medium'
  const inputClass = 'w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white/50 text-gray-800 font-medium'

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-white to-gray-50 text-gray-900">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <section className="relative z-10 min-h-screen px-4 py-5 sm:px-6 lg:h-screen lg:py-0">
        <div className="mx-auto grid min-h-full max-w-[1500px] grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-7">
          <div className="lg:col-span-3 lg:self-center">
            <TalentSidebar />
          </div>

          <div className="min-h-[70vh] lg:col-span-9 lg:h-[92vh] lg:self-center">
            <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-9 lg:gap-7">
              {/* Left Column: Settings Tabs (col-span-4) */}
              <section className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-[24px] shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] flex flex-col overflow-hidden lg:col-span-4">
                <div className="border-b border-gray-100 px-5 py-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#FF6B00]">Settings</p>
                  <h1 className="mt-1 text-2xl font-semibold">Account Preferences</h1>
                </div>

                <div className="flex-1 overflow-auto p-5">
                  <nav className="space-y-1.5">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs font-semibold transition-all ${
                          activeTab === tab.id
                            ? 'border-orange-500/20 bg-orange-500/10 text-[#FF6B00] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                            : 'border-transparent text-gray-600 hover:border-gray-250 hover:bg-gray-100/50 hover:text-gray-900'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{tab.icon}</span>
                          <span>{tab.label}</span>
                        </span>
                        <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </nav>
                </div>
              </section>

              {/* Right Column: Settings Details Form (col-span-5) */}
              <section className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-[24px] shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] flex flex-col overflow-hidden lg:col-span-5">
                <div className="border-b border-gray-100 px-5 py-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-450">Preferences</p>
                    <h2 className="mt-1 text-xl font-semibold leading-tight">{getTabLabel(activeTab)}</h2>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#FF6B00] to-[#FF914D] disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-5">
                  {activeTab === 'notifications' && (
                    <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div className="flex items-center justify-between p-3.5 border border-gray-100 bg-white/40 rounded-xl">
                        <div>
                          <h3 className="text-xs font-semibold text-gray-900">Email Notifications</h3>
                          <p className="text-[10px] text-gray-500">Receive notifications via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.email}
                            onChange={(e) => updateNotification('email', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF6B00]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3.5 border border-gray-100 bg-white/40 rounded-xl">
                        <div>
                          <h3 className="text-xs font-semibold text-gray-900">Push Notifications</h3>
                          <p className="text-[10px] text-gray-500">Receive notifications in your browser</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.push}
                            onChange={(e) => updateNotification('push', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF6B00]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3.5 border border-gray-100 bg-white/40 rounded-xl">
                        <div>
                          <h3 className="text-xs font-semibold text-gray-900">Job Matches</h3>
                          <p className="text-[10px] text-gray-500">Get notified about new job matches</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.jobMatches}
                            onChange={(e) => updateNotification('jobMatches', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF6B00]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3.5 border border-gray-100 bg-white/40 rounded-xl">
                        <div>
                          <h3 className="text-xs font-semibold text-gray-900">Application Updates</h3>
                          <p className="text-[10px] text-gray-500">Get notified about status changes</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.applicationUpdates}
                            onChange={(e) => updateNotification('applicationUpdates', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF6B00]"></div>
                        </label>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'privacy' && (
                    <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">Profile Visibility</label>
                        <select
                          value={settings.privacy.profileVisibility}
                          onChange={(e) => updatePrivacy('profileVisibility', e.target.value)}
                          className={selectClass}
                        >
                          <option value="public">Public - Anyone can view</option>
                          <option value="employers-only">Employers Only - Only employers can view</option>
                          <option value="private">Private - Only you can view</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-3.5 border border-gray-100 bg-white/40 rounded-xl">
                        <div>
                          <h3 className="text-xs font-semibold text-gray-900">Show Email Address</h3>
                          <p className="text-[10px] text-gray-500">Allow employers to see your email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.privacy.showEmail}
                            onChange={(e) => updatePrivacy('showEmail', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF6B00]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3.5 border border-gray-100 bg-white/40 rounded-xl">
                        <div>
                          <h3 className="text-xs font-semibold text-gray-900">Show Location</h3>
                          <p className="text-[10px] text-gray-500">Display location on your profile</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.privacy.showLocation}
                            onChange={(e) => updatePrivacy('showLocation', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF6B00]"></div>
                        </label>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'preferences' && (
                    <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">Preferred Job Types</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Full-time', 'Part-time', 'Contract', 'Internship'].map(type => (
                            <label key={type} className="flex items-center gap-2 bg-white/40 border border-gray-100 rounded-lg p-2.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.preferences.jobTypes.includes(type)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    updatePreferences('jobTypes', [...settings.preferences.jobTypes, type])
                                  } else {
                                    updatePreferences('jobTypes', settings.preferences.jobTypes.filter(t => t !== type))
                                  }
                                }}
                                className="rounded border-gray-305 text-[#FF6B00] focus:ring-[#FF6B00] w-3.5 h-3.5"
                              />
                              <span className="text-xs text-gray-700 font-semibold">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">Salary Range</label>
                        <select
                          value={settings.preferences.salaryRange}
                          onChange={(e) => updatePreferences('salaryRange', e.target.value)}
                          className={selectClass}
                        >
                          <option value="$50k - $75k">$50k - $75k</option>
                          <option value="$75k - $100k">$75k - $100k</option>
                          <option value="$100k - $150k">$100k - $150k</option>
                          <option value="$150k - $200k">$150k - $200k</option>
                          <option value="$200k+">$200k+</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">Remote Preference</label>
                        <select
                          value={settings.preferences.remotePreference}
                          onChange={(e) => updatePreferences('remotePreference', e.target.value)}
                          className={selectClass}
                        >
                          <option value="remote">Remote Only</option>
                          <option value="hybrid">Hybrid</option>
                          <option value="onsite">Onsite Only</option>
                          <option value="any">Any</option>
                        </select>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'account' && (
                    <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">Email Address</label>
                        <input
                          type="email"
                          value="alex.johnson@email.com"
                          className={inputClass}
                          readOnly
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">Current Password</label>
                        <input
                          type="password"
                          placeholder="Enter current password"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">New Password</label>
                        <input
                          type="password"
                          placeholder="Enter new password"
                          className={inputClass}
                        />
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-[10px] text-gray-400">Permanently close account</span>
                        <button className="px-3.5 py-2 text-xs font-semibold text-red-600 border border-red-200 bg-white rounded-xl hover:bg-red-50 transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
