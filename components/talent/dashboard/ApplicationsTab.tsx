import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { StatusBadge } from "@/components/ui/StatusBadge";
import StartChatModal from '@/components/shared/chat/StartChatModal'

type ApplicationStatus = 'Applied' | 'Shortlisted' | 'Interviewing' | 'Offered' | 'Hired' | 'Feedback' | 'Rejected'

interface Application {
  id: string
  jobTitle: string
  company: string
  appliedAt: string
  status: ApplicationStatus
  matchScore: number
  lastUpdated: string
}

interface ApplicationDetail {
  id: string
  jobTitle: string
  company: string
  status: ApplicationStatus
  appliedAt: string
  matchScore: number
  averageApplicantScore: number
  totalApplicants: number
  rank: string
  timeline: { step: string; date: string; completed: boolean; current: boolean }[]
  insights: { strengths: string[]; gaps: string[] }
  customAnswers?: any[]
}

export default function ApplicationsTab() {
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [applicationsList, setApplicationsList] = useState<Application[]>([])
  const [appDetailsMap, setAppDetailsMap] = useState<Record<string, ApplicationDetail>>({})
  const [selectedAppId, setSelectedAppId] = useState<string>('')
  const [chatModal, setChatModal] = useState<{ appId: string; jobTitle: string; company: string } | null>(null)

  const statuses = ['All', 'Applied', 'Shortlisted', 'Interviewing', 'Offered', 'Hired', 'Feedback', 'Rejected']

  useEffect(() => {
    fetch('/api/talent/applications')
      .then(res => res.ok ? res.json() : [])
      .then((dbList: Application[]) => {
        setApplicationsList(dbList)
        if (dbList.length > 0) {
          setSelectedAppId(prev => dbList.some(app => app.id === prev) ? prev : dbList[0].id)
        }
      })
      .catch(err => console.error('Failed to load applications', err))
  }, [])

  useEffect(() => {
    if (!selectedAppId || appDetailsMap[selectedAppId]) return
    fetch(`/api/talent/applications/${selectedAppId}`)
      .then(res => res.ok ? res.json() : null)
      .then((detail: ApplicationDetail | null) => {
        if (detail) {
          setAppDetailsMap(prev => ({ ...prev, [selectedAppId]: detail }))
        }
      })
      .catch(err => console.error('Failed to load application detail from DB', err))
  }, [selectedAppId, appDetailsMap])
  const filteredApplications = selectedStatus === 'All'
    ? applicationsList
    : applicationsList.filter(app => app.status === selectedStatus)

  const selectedAppDetail = appDetailsMap[selectedAppId] ?? null

  return (
    <>
    <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-9 lg:gap-7">
      {/* Left Column: Applications List (col-span-5) */}
      <section className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-[24px] shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] flex flex-col overflow-hidden lg:col-span-5">
        <div className="border-b border-gray-200 px-5 py-5 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#FF6B00]">Applications</p>
            <h1 className="mt-1 text-2xl font-semibold">My Applications</h1>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">{filteredApplications.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400">Total</div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="border-b border-gray-200/50 bg-gray-50/50 p-4">
          <div className="flex flex-wrap gap-1.5">
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedStatus === status
                    ? 'bg-[#FF6B00] text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-auto p-5 space-y-3">
          {filteredApplications.map(app => (
            <motion.button
              key={app.id}
              onClick={() => setSelectedAppId(app.id)}
              whileHover={{ scale: 1.005 }}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedAppId === app.id
                  ? 'border-[#FF6B00]/60 ring-2 ring-[#FF6B00]/20 bg-white shadow-md'
                  : 'border-gray-200 bg-white/50 hover:shadow-sm hover:bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-500 mb-1 truncate">{app.company} • Applied {new Date(app.appliedAt).toLocaleDateString()}</div>
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{app.jobTitle}</h3>
                </div>
                <StatusBadge status={app.status} className="text-[10px]" />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-gray-400">Match score: <strong className="text-gray-700 font-semibold">{app.matchScore}%</strong></span>
                <span className="text-gray-400">Updated {app.lastUpdated}</span>
              </div>
            </motion.button>
          ))}
          {filteredApplications.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              No applications found.
            </div>
          )}
        </div>
      </section>

      {/* Right Column: Application Details (col-span-4) */}
      <section className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-[24px] shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] overflow-auto p-6 lg:col-span-4">
        {!selectedAppDetail ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            {selectedAppId ? 'Loading application...' : 'Select an application to view details'}
          </div>
        ) : (
          <motion.div key={selectedAppDetail.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-xs uppercase tracking-[0.18em] text-[#FF6B00]">{selectedAppDetail.company}</p>
                <StatusBadge status={selectedAppDetail.status} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">{selectedAppDetail.jobTitle}</h2>
              <p className="text-xs text-gray-400 mt-1">Applied on {new Date(selectedAppDetail.appliedAt).toLocaleDateString()}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <Link href={`/talent/dashboard/applications/${selectedAppDetail.id}`} className="flex-1 text-center py-2.5 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-xs font-semibold transition-colors">
                Detailed Page
              </Link>
              <button
                onClick={() => setChatModal({ appId: selectedAppDetail.id, jobTitle: selectedAppDetail.jobTitle, company: selectedAppDetail.company })}
                className="flex-1 py-2.5 rounded-xl border border-[#FF6B00]/30 text-[#FF6B00] bg-[#FF6B00]/5 text-xs font-semibold hover:bg-[#FF6B00]/10 transition-colors"
              >
                Message Company
              </button>
              <button className="flex-1 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-xs font-semibold hover:opacity-95 transition-opacity">
                Follow Up
              </button>
            </div>

            {/* Competitive Positioning */}
            <div className="border-t border-gray-200 pt-5">
              <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Competitive Positioning</h3>
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-2">
                  <div className="text-[10px] text-gray-500">Your Match</div>
                  <div className="text-base font-bold text-[#FF6B00]">{selectedAppDetail.matchScore}%</div>
                </div>
                <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-2">
                  <div className="text-[10px] text-gray-500">Avg Match</div>
                  <div className="text-base font-bold text-gray-600">{selectedAppDetail.averageApplicantScore}%</div>
                </div>
                <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-2">
                  <div className="text-[10px] text-gray-500">Rank</div>
                  <div className="text-base font-bold text-green-600">{selectedAppDetail.rank}</div>
                </div>
              </div>
              <div className="relative pt-4 pb-2">
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex relative">
                  <div
                    className="h-full bg-gray-300 rounded-full"
                    style={{ width: `${selectedAppDetail.averageApplicantScore}%` }}
                  />
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FF6B00] to-[#FF914D] rounded-full"
                    style={{ width: `${selectedAppDetail.matchScore}%`, opacity: 0.85 }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2">
                  <span>Average: {selectedAppDetail.averageApplicantScore}%</span>
                  <span className="text-[#FF6B00] font-semibold">You: {selectedAppDetail.matchScore}%</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 text-center mt-2">
                You rank <strong className="text-gray-800">{selectedAppDetail.rank}</strong> out of {selectedAppDetail.totalApplicants} applicants.
              </div>
            </div>

            {/* AI Insights */}
            <div className="border-t border-gray-200 pt-5 space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Crucible AI Insights</h3>
              <div className="space-y-3">
                <div className="bg-green-50/30 border border-green-100/50 rounded-xl p-3.5">
                  <h4 className="text-xs font-semibold text-green-800 flex items-center gap-1.5 mb-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Strengths
                  </h4>
                  <ul className="space-y-1 text-xs text-green-700">
                    {selectedAppDetail.insights.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span>•</span> <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-orange-50/30 border border-orange-100/50 rounded-xl p-3.5">
                  <h4 className="text-xs font-semibold text-orange-800 flex items-center gap-1.5 mb-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" /> Gaps
                  </h4>
                  <ul className="space-y-1 text-xs text-orange-700">
                    {selectedAppDetail.insights.gaps.map((g, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span>•</span> <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Submitted Answers Recap */}
            {selectedAppDetail.customAnswers && selectedAppDetail.customAnswers.length > 0 && (
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Submitted Responses</h3>
                <div className="space-y-3 bg-gray-50/50 border border-gray-200 rounded-xl p-3.5">
                  {selectedAppDetail.customAnswers.map((ans: any, idx: number) => (
                    <div key={idx} className="text-xs">
                      <div className="text-gray-500 font-medium mb-1">{ans.label}</div>
                      <div className="text-gray-900 font-semibold leading-relaxed">
                        {Array.isArray(ans.value)
                          ? ans.value.join(', ')
                          : typeof ans.value === 'boolean'
                            ? (ans.value ? 'Yes' : 'No')
                            : String(ans.value || '—')
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="border-t border-gray-200 pt-5">
              <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-4">Application Timeline</h3>
              <div className="relative border-l border-gray-200 ml-2 pl-4 space-y-5">
                {selectedAppDetail.timeline.map((t, idx) => (
                  <div key={idx} className="relative">
                    <span className={`absolute -left-[21px] top-1 rounded-full w-2.5 h-2.5 border-2 border-white flex items-center justify-center ${
                      t.completed ? 'bg-green-500' : t.current ? 'bg-[#FF6B00] ring-2 ring-orange-100' : 'bg-gray-200'
                    }`} />
                    <div className={`text-xs font-semibold ${t.current ? 'text-gray-900' : t.completed ? 'text-gray-700' : 'text-gray-400'}`}>{t.step}</div>
                    <div className="text-[10px] text-gray-400">{t.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </section>
    </div>
    {chatModal && (
      <StartChatModal
        isOpen={true}
        onClose={() => setChatModal(null)}
        onSuccess={() => setChatModal(null)}
        applicationId={chatModal.appId}
        jobId={chatModal.appId}
        jobTitle={chatModal.jobTitle}
        companyName={chatModal.company}
        talentName="You"
        talentEmail=""
        initiatedBy="talent"
        isDark={false}
      />
    )}
    </>
  )
}
