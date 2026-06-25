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

      <section className="relative z-10 min-h-screen px-4 py-5 sm:px-6 lg:h-screen lg:py-0">
        <div className="mx-auto grid min-h-full max-w-[1500px] grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-7">
          <div className="lg:col-span-3 lg:self-center">
            <TalentSidebar jobCount={JOBS.length} />
          </div>
          <div className="min-h-[70vh] lg:col-span-9 lg:h-[92vh] lg:self-center">
            <JobBrowser jobs={JOBS} />
          </div>
        </div>
      </section>
    </main>
  )
}
