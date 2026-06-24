'use client'

import TalentSidebar from '@/components/talent/sidebar/TalentSidebar'
import JobBrowser from '@/components/talent/jobs/JobBrowser'
import { JOBS } from '@/lib/talent/data/jobs'

export default function TalentDashboard() {
  return (
    <main className="min-h-screen w-full relative overflow-hidden">
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

      <section className="relative z-10 h-screen">
        <div className="h-full max-w-7xl mx-auto grid grid-cols-12 gap-8 px-6">
          <TalentSidebar jobCount={JOBS.length} />
          <JobBrowser jobs={JOBS} />
        </div>
      </section>
    </main>
  )
}
