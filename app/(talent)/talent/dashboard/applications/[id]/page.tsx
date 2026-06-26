'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import TalentSidebar from '@/components/talent/sidebar/TalentSidebar'
import { StatusBadge } from "@/components/ui/StatusBadge";

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

      <section className="relative z-10 min-h-screen px-2 py-5 sm:px-4 lg:px-4 lg:h-screen lg:py-0">
        <div className="mx-auto grid min-h-full max-w-[1720px] grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-7">
          <div className="lg:col-span-3 lg:self-center">
            <TalentSidebar applicationCount={0} />
          </div>

          <div className="min-h-[70vh] lg:col-span-9 lg:h-[92vh] lg:self-center">
            <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-9 lg:gap-7">
              {/* Left Column: Details & Insights (col-span-5) */}
              <section className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-[24px] shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] flex flex-col overflow-hidden lg:col-span-5">
                <div className="border-b border-gray-100 px-5 py-5">
                  <Link href="/talent/dashboard/applications" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#FF6B00] mb-3 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Applications
                  </Link>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#FF6B00]">{DEMO_APP_DETAIL.company}</p>
                      <h1 className="mt-1 text-2xl font-semibold leading-tight">{DEMO_APP_DETAIL.jobTitle}</h1>
                    </div>
                    <StatusBadge status={DEMO_APP_DETAIL.status} />
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-5 space-y-6">
                  {/* Competitive Positioning */}
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Competitive Positioning</h3>
                    <div className="grid grid-cols-3 gap-2 text-center mb-4">
                      <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                        <div className="text-[10px] text-gray-500">Your Match</div>
                        <div className="text-base font-bold text-[#FF6B00]">{DEMO_APP_DETAIL.matchScore}%</div>
                      </div>
                      <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                        <div className="text-[10px] text-gray-500">Avg Match</div>
                        <div className="text-base font-bold text-gray-600">{DEMO_APP_DETAIL.averageApplicantScore}%</div>
                      </div>
                      <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                        <div className="text-[10px] text-gray-500">Rank</div>
                        <div className="text-base font-bold text-green-600">{DEMO_APP_DETAIL.rank}</div>
                      </div>
                    </div>
                    <div className="relative pt-4 pb-2">
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex relative">
                        <div 
                          className="h-full bg-gray-300 rounded-full"
                          style={{ width: `${DEMO_APP_DETAIL.averageApplicantScore}%` }}
                        />
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FF6B00] to-[#FF914D] rounded-full"
                          style={{ width: `${DEMO_APP_DETAIL.matchScore}%`, opacity: 0.85 }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2">
                        <span>Average: {DEMO_APP_DETAIL.averageApplicantScore}%</span>
                        <span className="text-[#FF6B00] font-semibold">You: {DEMO_APP_DETAIL.matchScore}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-3">
                      You are in the <strong className="text-gray-800">{DEMO_APP_DETAIL.rank}</strong> out of {DEMO_APP_DETAIL.totalApplicants} total applicants.
                    </p>
                  </div>

                  {/* AI Insights */}
                  <div className="border-t border-gray-100 pt-5 space-y-4">
                    <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Crucible AI Insights</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-green-50/30 border border-green-100/50 rounded-xl p-4">
                        <h4 className="text-xs font-semibold text-green-800 flex items-center gap-1.5 mb-2.5">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Profile Strengths
                        </h4>
                        <ul className="space-y-1.5 text-xs text-green-700">
                          {DEMO_APP_DETAIL.insights.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span>•</span> <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-orange-50/30 border border-orange-100/50 rounded-xl p-4">
                        <h4 className="text-xs font-semibold text-orange-800 flex items-center gap-1.5 mb-2.5">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" /> Identified Gaps
                        </h4>
                        <ul className="space-y-1.5 text-xs text-orange-700">
                          {DEMO_APP_DETAIL.insights.gaps.map((g, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span>•</span> <span>{g}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Right Column: Timeline (col-span-4) */}
              <section className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-[24px] shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] overflow-auto p-6 lg:col-span-4">
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Tracking</p>
                  <h2 className="mt-1 text-xl font-semibold">Application Timeline</h2>
                </div>
                
                <div className="relative border-l border-gray-200 ml-2 pl-4 space-y-6">
                  {DEMO_APP_DETAIL.timeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      <span className={`absolute -left-[21px] top-1 rounded-full w-2.5 h-2.5 border-2 border-white flex items-center justify-center ${
                        item.completed 
                          ? 'bg-green-500' 
                          : item.current
                            ? 'bg-[#FF6B00] ring-2 ring-orange-100'
                            : 'bg-gray-200'
                      }`} />
                      <div className={`text-xs font-semibold ${item.current ? 'text-gray-900' : item.completed ? 'text-gray-700' : 'text-gray-400'}`}>
                        {item.step}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {item.date}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
