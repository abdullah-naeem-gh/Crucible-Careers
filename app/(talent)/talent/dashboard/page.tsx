'use client'

import { Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import TalentSidebar from '@/components/talent/sidebar/TalentSidebar'
import JobBrowser from '@/components/talent/jobs/JobBrowser'
import { JOBS } from '@/lib/talent/data/jobs'

// Import Modular Tab Components
import CompaniesTab from '@/components/talent/dashboard/CompaniesTab'
import ApplicationsTab, { DEMO_APPLICATIONS } from '@/components/talent/dashboard/ApplicationsTab'
import SavedTab, { DEMO_SAVED_JOBS } from '@/components/talent/dashboard/SavedTab'
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
  
  const initialTab: TalentTab = (
    requestedTab === 'companies' ||
    requestedTab === 'applications' ||
    requestedTab === 'saved' ||
    requestedTab === 'profile' ||
    requestedTab === 'exams' ||
    requestedTab === 'settings'
  ) ? (requestedTab as TalentTab) : 'jobs'

  const [activeTab, setActiveTab] = useState<TalentTab>(initialTab)

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
      setActiveTab('jobs')
    }
  }, [requestedTab])

  const changeTab = (tab: string) => {
    const validTab = tab as TalentTab
    setActiveTab(validTab)
    router.replace(
      validTab === 'jobs' ? '/talent/dashboard' : `/talent/dashboard?tab=${validTab}`,
      { scroll: false }
    )
  }

  return (
    <main className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-gray-50 text-gray-900">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-gray-50" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <section className="relative z-10 min-h-screen px-2 py-5 sm:px-4 lg:px-4 lg:h-screen lg:py-0">
        <div className="mx-auto grid min-h-full max-w-[1720px] grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-7">
          <div className="lg:col-span-3 lg:self-center">
            <TalentSidebar 
              activeTab={activeTab}
              onTabChange={changeTab}
              jobCount={JOBS.length}
              applicationCount={DEMO_APPLICATIONS.length}
              savedCount={DEMO_SAVED_JOBS.length}
            />
          </div>
          <div className="min-h-[70vh] lg:col-span-9 lg:h-[92vh] lg:self-center">
            <AnimatePresence mode="wait">
              {activeTab === 'jobs' && (
                <ViewMotion key="jobs">
                  <JobBrowser jobs={JOBS} />
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
                  <ProfileTab />
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
