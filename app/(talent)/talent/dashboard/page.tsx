'use client'

import { Suspense, useEffect, useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import TalentSidebar from '@/components/talent/sidebar/TalentSidebar'
import JobBrowser from '@/components/talent/jobs/JobBrowser'
import type { ScrapedJob } from '@/types/talent/job'
import { TalentProfile } from '@/types/talent/profile'
import { loadTalentProfile, saveTalentProfile, calculateCompletionPercentage } from '@/lib/talent/services/profile.service'

import CompaniesTab from '@/components/talent/dashboard/CompaniesTab'
import ApplicationsTab from '@/components/talent/dashboard/ApplicationsTab'
import SavedTab from '@/components/talent/dashboard/SavedTab'
import ProfileTab from '@/components/talent/dashboard/ProfileTab'
import ExamsTab from '@/components/talent/dashboard/ExamsTab'
import SettingsTab from '@/components/talent/dashboard/SettingsTab'
import MessagesTab from '@/components/shared/chat/MessagesTab'

type TalentTab = 'jobs' | 'companies' | 'applications' | 'saved' | 'profile' | 'exams' | 'messages' | 'settings'

function ViewMotion({ children, className = "h-full" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function TalentDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const isOnboarded = searchParams.get('onboarded') === '1'
  


  const initialTab: TalentTab = (
    requestedTab === 'jobs' ||
    requestedTab === 'companies' ||
    requestedTab === 'applications' ||
    requestedTab === 'saved' ||
    requestedTab === 'exams' ||
    requestedTab === 'messages' ||
    requestedTab === 'settings'
  ) ? (requestedTab as TalentTab) : 'profile'

  const [activeTab, setActiveTab] = useState<TalentTab>(initialTab)
  const [jobs, setJobs] = useState<ScrapedJob[]>([])
  const [appCount, setAppCount] = useState(0)
  const [savedCount, setSavedCount] = useState(0)
  const [profile, setProfile] = useState<TalentProfile | null>(null)
  const [profileHydrated, setProfileHydrated] = useState(false)
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(isOnboarded)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isDesktopLayout, setIsDesktopLayout] = useState(false)
  const [expandedSidebarWidth, setExpandedSidebarWidth] = useState(360)

  useEffect(() => {
    const updateSidebarMetrics = () => {
      const desktop = window.innerWidth >= 1024
      const availableWidth = Math.min(window.innerWidth - 32, 1720)

      setIsDesktopLayout(desktop)
      setExpandedSidebarWidth(Math.min(430, Math.max(280, Math.round(availableWidth * 0.25))))
    }

    updateSidebarMetrics()
    window.addEventListener('resize', updateSidebarMetrics)
    return () => window.removeEventListener('resize', updateSidebarMetrics)
  }, [])

  const onboardedName = searchParams.get('name') || profile?.firstName || ''

  const profileCompletion = useMemo(() => {
    return profile ? calculateCompletionPercentage(profile) : 0
  }, [profile])

  useEffect(() => {
    if (requestedTab) {
      if (
        requestedTab === 'jobs' ||
        requestedTab === 'companies' ||
        requestedTab === 'applications' ||
        requestedTab === 'saved' ||
        requestedTab === 'profile' ||
        requestedTab === 'exams' ||
        requestedTab === 'messages' ||
        requestedTab === 'settings'
      ) {
        setActiveTab(requestedTab as TalentTab)
      }
    } else {
      setActiveTab('profile')
    }
  }, [requestedTab])

  useEffect(() => {
    // Load real jobs posted by employers, across all companies
    fetch('/api/talent/jobs')
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then((data: ScrapedJob[]) => setJobs(data))
      .catch(err => console.error('Failed to load jobs', err))

    // Load applications count
    fetch('/api/talent/applications')
      .then(res => res.ok ? res.json() : [])
      .then((list: any[]) => setAppCount(list.length))
      .catch(err => console.error('Failed to load talent applications count', err))

    // Load profile
    loadTalentProfile().then(loadedProfile => {
      setProfile(loadedProfile)
      setProfileHydrated(true)
    }).catch(err => {
      console.error('Failed to load profile:', err)
      setProfileHydrated(true)
    })

  }, [])

  useEffect(() => {
    const updateSavedCount = () => {
      try {
        const savedBookmarked = localStorage.getItem('talent_saved_jobs')
        const bookmarked = savedBookmarked ? JSON.parse(savedBookmarked) : []
        setSavedCount(bookmarked.length)
      } catch (e) {
        console.error('Failed to load saved jobs count', e)
      }
    }
    updateSavedCount()
    window.addEventListener('talent_saved_jobs_changed', updateSavedCount)
    return () => window.removeEventListener('talent_saved_jobs_changed', updateSavedCount)
  }, [])

  useEffect(() => {
    if (profileHydrated && profile) saveTalentProfile(profile)
  }, [profileHydrated, profile])

  const changeTab = (tab: string) => {
    const validTab = tab as TalentTab
    setActiveTab(validTab)
    router.replace(
      `/talent/dashboard?tab=${validTab}`,
      { scroll: false }
    )
  }

  // Auto-dismiss the welcome banner after 5 seconds
  useEffect(() => {
    if (!showWelcomeBanner) return
    const t = setTimeout(() => setShowWelcomeBanner(false), 5000)
    return () => clearTimeout(t)
  }, [showWelcomeBanner])

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#101010] text-white">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,107,0,0.095),transparent_30%),radial-gradient(circle_at_85%_90%,rgba(255,145,77,0.06),transparent_28%)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(to right, #6b7280 1px, transparent 1px), linear-gradient(to bottom, #6b7280 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
          />
      </div>

      {/* Welcome banner — shown once after onboarding */}
      <AnimatePresence>
        {showWelcomeBanner && (
          <motion.div
            key="welcome-banner"
            initial={{ opacity: 0, y: -48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -48 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-orange-500/30 bg-white/95 px-4 py-3 shadow-xl shadow-black/10 backdrop-blur dark:bg-[#1a1a1a]/95 dark:shadow-black/40">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF914D] flex items-center justify-center text-base">
                🎉
              </div>
              <p className="flex-1 text-sm leading-snug text-gray-700 dark:text-white/90">
                {onboardedName ? (
                  <><span className="font-semibold text-gray-900 dark:text-white">Welcome, {onboardedName}!</span> Here are jobs picked for you based on your profile.</>
                ) : (
                  <><span className="font-semibold text-gray-900 dark:text-white">Welcome to Crucible!</span> Here are jobs curated based on your profile.</>
                )}
              </p>
              <button
                onClick={() => setShowWelcomeBanner(false)}
                className="flex-shrink-0 text-lg leading-none text-gray-400 transition-colors hover:text-gray-700 dark:text-white/40 dark:hover:text-white/80"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative z-10 min-h-screen px-2 py-5 sm:px-4 lg:px-4 lg:h-screen lg:py-0">
        <div className="mx-auto flex min-h-full max-w-[1720px] flex-col gap-5 lg:flex-row lg:gap-7">
          <motion.div initial={false} animate={{ width: isDesktopLayout ? (isSidebarCollapsed ? 68 : expandedSidebarWidth) : "100%" }} transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }} className="min-w-0 shrink-0 overflow-visible lg:self-center">
            <TalentSidebar 
              activeTab={activeTab}
              onTabChange={changeTab}
              jobCount={jobs.length}
              applicationCount={appCount}
              savedCount={savedCount}
              profileNeedsSetup={profileHydrated && !profile}
              profileCompletion={profileCompletion}
              profileFirstName={profile?.firstName}
              profileLastName={profile?.lastName}
              profileEmail={profile?.email}
              profilePhotoUrl={profile?.photoUrl}
              collapsed={isSidebarCollapsed}
              onCollapsedChange={setIsSidebarCollapsed}
            />
          </motion.div>
          <motion.div initial={false} animate={{ opacity: 1 }} transition={{ duration: 0.18, ease: "easeOut" }} className="min-h-[70vh] min-w-0 flex-1 lg:h-[92vh] lg:self-center">
            <AnimatePresence initial={false} mode="wait">
              {activeTab === 'jobs' && (
                <ViewMotion key="jobs">
                  <JobBrowser jobs={jobs} />
                </ViewMotion>
              )}
              {activeTab === 'companies' && (
                <ViewMotion key="companies">
                  <CompaniesTab />
                </ViewMotion>
              )}
              {activeTab === 'applications' && (
                <ViewMotion key="applications">
                  <ApplicationsTab />
                </ViewMotion>
              )}
              {activeTab === 'saved' && (
                <ViewMotion key="saved">
                  <SavedTab />
                </ViewMotion>
              )}
              {activeTab === 'profile' && (
                <ViewMotion key="profile">
                  <ProfileTab profile={profile} onProfileChange={setProfile} />
                </ViewMotion>
              )}
              {activeTab === 'exams' && (
                <ViewMotion key="exams">
                  <ExamsTab />
                </ViewMotion>
              )}
              {activeTab === 'settings' && (
                <ViewMotion key="settings">
                  <SettingsTab />
                </ViewMotion>
              )}
              {activeTab === 'messages' && (
                <ViewMotion key="messages">
                  <MessagesTab
                    role="talent"
                    myDisplayName={profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : 'Alex Johnson'}
                    isDark={false}
                  />
                </ViewMotion>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

export default function TalentDashboard() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#101010] text-white/45">Loading...</div>}>
      <TalentDashboardContent />
    </Suspense>
  )
}

