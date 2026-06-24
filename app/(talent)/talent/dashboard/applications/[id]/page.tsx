'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import TalentSidebar from '@/components/talent/sidebar/TalentSidebar'

const DEMO_APP_DETAIL = {
  id: '1',
  jobTitle: 'Senior Frontend Engineer',
  company: 'Salik Labs',
  status: 'Under Review',
  appliedAt: '2024-01-15',
  matchScore: 86,
  averageApplicantScore: 72,
  totalApplicants: 145,
  rank: 'Top 10%',
  timeline: [
    { step: 'Application Submitted', date: 'Jan 15, 2024', completed: true, current: false },
    { step: 'Under Review', date: 'Jan 18, 2024', completed: true, current: true },
    { step: 'Initial Interview', date: 'Pending', completed: false, current: false },
    { step: 'Technical Assessment', date: 'Pending', completed: false, current: false },
    { step: 'Final Offer', date: 'Pending', completed: false, current: false },
  ],
  insights: {
    strengths: ['React.js Expertise', '5+ years experience matching requirement', 'Strong GitHub contribution graph'],
    gaps: ['No explicit Next.js certification badge', 'Missing direct experience with WebGL (preferred)']
  }
}

export default function ApplicationDetailPage() {
  return (
    <main className="min-h-screen w-full relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-gray-50" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <section className="relative z-10 h-screen">
        <div className="h-full max-w-7xl mx-auto grid grid-cols-12 gap-8 px-6">
          <TalentSidebar applicationCount={0} />

          <div className="col-span-9 grid grid-cols-1 gap-8 h-[92vh] self-center overflow-y-auto pr-4 pb-12 pt-8">
            {/* Header */}
            <div>
              <Link href="/talent/dashboard/applications" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#FF6B00] mb-4 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Applications
              </Link>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">{DEMO_APP_DETAIL.jobTitle}</h1>
                  <p className="text-lg text-gray-600 flex items-center gap-2">
                    {DEMO_APP_DETAIL.company}
                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                    Applied {DEMO_APP_DETAIL.appliedAt}
                  </p>
                </div>
                <div className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 font-semibold border border-yellow-200">
                  {DEMO_APP_DETAIL.status}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Positioning & Insights */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Competitive Positioning */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 shadow-lg relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF6B00]/10 to-transparent rounded-bl-full" />
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-[#FF6B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    Competitive Positioning
                  </h2>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                      <div className="text-sm text-gray-500 mb-1">Your Match</div>
                      <div className="text-3xl font-bold text-[#FF6B00]">{DEMO_APP_DETAIL.matchScore}%</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                      <div className="text-sm text-gray-500 mb-1">Avg Applicant</div>
                      <div className="text-3xl font-bold text-gray-700">{DEMO_APP_DETAIL.averageApplicantScore}%</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                      <div className="text-sm text-gray-500 mb-1">Your Rank</div>
                      <div className="text-3xl font-bold text-green-600">{DEMO_APP_DETAIL.rank}</div>
                    </div>
                  </div>

                  <div className="relative pt-4 pb-2">
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-gradient-to-r from-gray-300 to-gray-400 rounded-full relative z-10"
                        style={{ width: `${DEMO_APP_DETAIL.averageApplicantScore}%` }}
                      >
                        <div className="absolute right-0 -top-6 text-xs font-semibold text-gray-500 w-full text-right pr-2">Avg</div>
                      </div>
                    </div>
                    <div 
                      className="absolute top-4 left-0 h-4 bg-gradient-to-r from-[#FF6B00] to-[#FF914D] rounded-full z-20 transition-all duration-1000"
                      style={{ width: `${DEMO_APP_DETAIL.matchScore}%`, opacity: 0.8 }}
                    >
                      <div className="absolute right-0 -top-6 text-xs font-bold text-[#FF6B00] w-full text-right pr-1">You</div>
                      <div className="absolute right-0 top-1 w-2 h-2 bg-white rounded-full mr-1 shadow-sm" />
                    </div>
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      You are in the <strong className="text-gray-800">{DEMO_APP_DETAIL.rank}</strong> out of {DEMO_APP_DETAIL.totalApplicants} total applicants.
                    </p>
                  </div>
                </motion.div>

                {/* AI Insights */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 shadow-lg"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    Crucible AI Insights
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50/50 border border-green-100 rounded-2xl p-5">
                      <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Profile Strengths
                      </h3>
                      <ul className="space-y-2">
                        {DEMO_APP_DETAIL.insights.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5">
                      <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Identified Gaps
                      </h3>
                      <ul className="space-y-2">
                        {DEMO_APP_DETAIL.insights.gaps.map((g, i) => (
                          <li key={i} className="text-sm text-orange-700 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Timeline */}
              <div className="lg:col-span-1">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 shadow-lg sticky top-0"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-8">Application Timeline</h2>
                  
                  <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:to-transparent">
                    {DEMO_APP_DETAIL.timeline.map((item, idx) => (
                      <div key={idx} className="relative flex items-start gap-6">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${
                          item.completed 
                            ? 'bg-green-100 text-green-600 border-2 border-white shadow-sm' 
                            : item.current
                              ? 'bg-orange-100 text-[#FF6B00] border-2 border-white shadow-sm ring-4 ring-orange-50'
                              : 'bg-gray-100 text-gray-400 border-2 border-white'
                        }`}>
                          {item.completed ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          ) : item.current ? (
                            <div className="w-3 h-3 bg-[#FF6B00] rounded-full animate-pulse" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-300 rounded-full" />
                          )}
                        </div>
                        <div className="pt-2">
                          <h3 className={`font-semibold ${item.current ? 'text-gray-900' : item.completed ? 'text-gray-700' : 'text-gray-400'}`}>
                            {item.step}
                          </h3>
                          <p className={`text-sm mt-1 ${item.completed || item.current ? 'text-gray-500' : 'text-gray-300'}`}>
                            {item.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
