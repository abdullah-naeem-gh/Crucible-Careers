'use client'

import { Suspense, useEffect, useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import TalentSidebar from '@/components/talent/sidebar/TalentSidebar'
import JobBrowser from '@/components/talent/jobs/JobBrowser'
import { JOBS } from '@/lib/talent/data/jobs'
import { TalentProfile } from '@/types/talent/profile'
import { loadTalentProfiles, saveTalentProfiles, calculateCompletionPercentage } from '@/lib/talent/services/profile.service'

// Import Modular Tab Components
import CompaniesTab from '@/components/talent/dashboard/CompaniesTab'
import ApplicationsTab, { DEMO_APPLICATIONS } from '@/components/talent/dashboard/ApplicationsTab'
import SavedTab from '@/components/talent/dashboard/SavedTab'
import ProfileTab from '@/components/talent/dashboard/ProfileTab'
import ExamsTab from '@/components/talent/dashboard/ExamsTab'
import SettingsTab from '@/components/talent/dashboard/SettingsTab'

type TalentTab = 'jobs' | 'companies' | 'applications' | 'saved' | 'profile' | 'exams' | 'settings'

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
  const onboardedName = searchParams.get('name') ?? ''
  
  const initialTab: TalentTab = (
    requestedTab === 'jobs' ||
    requestedTab === 'companies' ||
    requestedTab === 'applications' ||
    requestedTab === 'saved' ||
    requestedTab === 'exams' ||
    requestedTab === 'settings'
  ) ? (requestedTab as TalentTab) : 'profile'

  const [activeTab, setActiveTab] = useState<TalentTab>(initialTab)
  const [jobs, setJobs] = useState<any[]>(JOBS)
  const [appCount, setAppCount] = useState(DEMO_APPLICATIONS.length)
  const [savedCount, setSavedCount] = useState(0)
  const [profiles, setProfiles] = useState<TalentProfile[]>([])
  const [profileHydrated, setProfileHydrated] = useState(false)
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(isOnboarded)

  const profileCompletion = useMemo(() => {
    return profiles[0] ? calculateCompletionPercentage(profiles[0]) : 0
  }, [profiles])

  useEffect(() => {
    if (requestedTab) {
      if (
        requestedTab === 'jobs' ||
        requestedTab === 'companies' ||
        requestedTab === 'applications' ||
        requestedTab === 'saved' ||
        requestedTab === 'profile' ||
        requestedTab === 'exams' ||
        requestedTab === 'settings'
      ) {
        setActiveTab(requestedTab as TalentTab)
      }
    } else {
      setActiveTab('profile')
    }
  }, [requestedTab])

  useEffect(() => {
    // Load recruiter jobs
    try {
      const savedRecruiterJobs = localStorage.getItem('recruiter_jobs')
      const recruiterJobs = savedRecruiterJobs ? JSON.parse(savedRecruiterJobs) : []
      const activeRecruiterJobs = recruiterJobs.filter((j: any) => j.status === 'Active')
      
      const mappedRecruiter = activeRecruiterJobs.map((job: any) => ({
        _id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type ? job.type.toLowerCase() : 'full-time',
        salary: job.salary || null,
        url: `/apply/${job.id}`,
        source: 'Crucible',
        description: job.description,
        tags: job.tags || [],
        posted_at: job.postedAt === 'Just now' ? new Date().toISOString() : job.postedAt || new Date().toISOString(),
        isRecruiterJob: true
      }))
      
      setJobs([...mappedRecruiter, ...JOBS])
    } catch (e) {
      console.error('Failed to load recruiter jobs', e)
    }

    // Load applications count
    try {
      const savedApps = localStorage.getItem('talent_applications')
      const talentApps = savedApps ? JSON.parse(savedApps) : []
      setAppCount(DEMO_APPLICATIONS.length + talentApps.length)
    } catch (e) {
      console.error('Failed to load talent applications count', e)
    }

    // Load profiles
    setProfiles(loadTalentProfiles())
    setProfileHydrated(true)

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
    if (profileHydrated) saveTalentProfiles(profiles)
  }, [profileHydrated, profiles])

  const changeTab = (tab: string) => {
    const validTab = tab as TalentTab
    setActiveTab(validTab)
    router.replace(
      validTab === 'jobs' ? '/talent/dashboard' : `/talent/dashboard?tab=${validTab}`,
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
            <div className="flex items-center gap-3 rounded-2xl border border-orange-500/30 bg-[#1a1a1a]/95 backdrop-blur px-4 py-3 shadow-xl shadow-black/40">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF914D] flex items-center justify-center text-base">
                🎉
              </div>
              <p className="flex-1 text-sm text-white/90 leading-snug">
                {onboardedName ? (
                  <><span className="font-semibold text-white">Welcome, {onboardedName}!</span> Here are jobs picked for you based on your profile.</>  
                ) : (
                  <><span className="font-semibold text-white">Welcome to Crucible!</span> Here are jobs curated based on your profile.</>
                )}
              </p>
              <button
                onClick={() => setShowWelcomeBanner(false)}
                className="flex-shrink-0 text-white/40 hover:text-white/80 transition-colors text-lg leading-none"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative z-10 min-h-screen px-2 py-5 sm:px-4 lg:px-4 lg:h-screen lg:py-0">
        <div className="mx-auto grid min-h-full max-w-[1720px] grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-7">
          <div className="lg:col-span-3 lg:self-center">
            <TalentSidebar 
              activeTab={activeTab}
              onTabChange={changeTab}
              jobCount={jobs.length}
              applicationCount={appCount}
              savedCount={savedCount}
              profileNeedsSetup={profileHydrated && profiles.length === 0}
              profileCompletion={profileCompletion}
            />
          </div>
          <div className="min-h-[70vh] lg:col-span-9 lg:h-[92vh] lg:self-center">
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
                  <ProfileTab profiles={profiles} onProfilesChange={setProfiles} />
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
            </AnimatePresence>
          </div>
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

