"use client";
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { IconCheck } from '@tabler/icons-react'
import { useAppliedJobIds } from '@/lib/talent/hooks/useAppliedJobIds'

interface SavedJob {
  id: string
  title: string
  company: string
  location: string
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  salary?: string
  tags: string[]
  postedAt: string
  description: string
  matchScore: number
  savedAt: string
}



export default function SavedTab() {
  const [selectedCompany, setSelectedCompany] = useState<string>('All')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const { appliedJobIds } = useAppliedJobIds()

  useEffect(() => {
    const loadJobs = () => {
      try {
        const stored = localStorage.getItem('talent_saved_jobs')
        const parsed = stored ? JSON.parse(stored) : []
        setSavedJobs(parsed)
        if (parsed.length > 0 && !selectedJobId) {
          setSelectedJobId(parsed[0].id)
        }
      } catch (e) {
        setSavedJobs([])
      }
    }
    loadJobs()
    window.addEventListener('talent_saved_jobs_changed', loadJobs)
    return () => window.removeEventListener('talent_saved_jobs_changed', loadJobs)
  }, [selectedJobId])

  const companies = ['All', ...Array.from(new Set(savedJobs.map(j => j.company)))]
  const types = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship']

  const filteredJobs = savedJobs.filter(job => {
    const matchesCompany = selectedCompany === 'All' || job.company === selectedCompany
    const matchesType = selectedType === 'All' || job.type === selectedType
    return matchesCompany && matchesType
  })

  const selectedJob = savedJobs.find(j => j.id === selectedJobId) ?? filteredJobs[0] ?? null

  const handleRemove = (id: string) => {
    try {
      const stored = localStorage.getItem('talent_saved_jobs')
      const parsed = stored ? JSON.parse(stored) : []
      const updated = parsed.filter((j: any) => j.id !== id)
      localStorage.setItem('talent_saved_jobs', JSON.stringify(updated))
      window.dispatchEvent(new Event('talent_saved_jobs_changed'))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-9 lg:gap-7">
      {/* Left Column: Saved Jobs list (col-span-5) */}
      <section className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-[24px] shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] flex flex-col overflow-hidden lg:col-span-5">
        <div className="border-b border-gray-200 px-5 py-5 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#FF6B00]">Bookmarks</p>
            <h1 className="mt-1 text-2xl font-semibold">Saved Jobs</h1>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">{savedJobs.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400">Saved</div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-200/50 bg-gray-50/50 p-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1.5">Company</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 cursor-pointer text-gray-700"
            >
              {companies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1.5">Job Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 cursor-pointer text-gray-700"
            >
              {types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-auto p-5 space-y-3">
          {filteredJobs.map(job => (
            <motion.button
              key={job.id}
              onClick={() => setSelectedJobId(job.id)}
              whileHover={{ scale: 1.005 }}
              className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                selectedJob?.id === job.id
                  ? 'border-orange-500/50 bg-orange-500/[0.055] shadow-[0_0_0_2px_rgba(255,107,0,0.1),8px_8px_18px_rgba(0,0,0,0.22)]'
                  : 'border-white/[0.065] bg-white/50 hover:shadow-sm hover:bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-500 mb-1 truncate">{job.company} • {job.location}</div>
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{job.title}</h3>
                  <div className="text-[11px] text-gray-600 font-medium mt-1">{job.type} • {job.salary}</div>
                </div>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20 px-2 py-0.5 rounded shrink-0 shadow-sm">
                  {job.matchScore}% Match
                </span>
              </div>
            </motion.button>
          ))}
          {filteredJobs.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              No saved jobs match these filters.
            </div>
          )}
        </div>
      </section>

      {/* Right Column: Job details (col-span-4) */}
      <section className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-[24px] shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] overflow-auto p-6 lg:col-span-4">
        {!selectedJob ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Select a job to view details
          </div>
        ) : (
          <motion.div key={selectedJob.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-xs uppercase tracking-[0.18em] text-[#FF6B00]">{selectedJob.company}</p>
                <button 
                  onClick={() => handleRemove(selectedJob.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">{selectedJob.title}</h2>
              <div className="mt-2 text-xs text-gray-500 flex flex-wrap items-center gap-1.5">
                <span>{selectedJob.location}</span>
                <span>•</span>
                <span>{selectedJob.type}</span>
                <span>•</span>
                <span className="text-green-700 font-semibold">{selectedJob.salary}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {appliedJobIds.has(selectedJob.id) ? (
                <span className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <IconCheck size={14} /> Applied
                </span>
              ) : (
                <Link
                  href={`/apply/${selectedJob.id}`}
                  className="flex-1 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-xs font-semibold hover:opacity-95 transition-opacity cursor-pointer text-center"
                >
                  Apply Now
                </Link>
              )}
            </div>

            {/* Match Metric */}
            <div className="border-t border-gray-200 pt-5">
              <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Crucible AI Alignment</h3>
              <div className="flex items-center gap-4 bg-gray-50/50 border border-gray-200 rounded-xl p-3.5">
                <div className="text-2xl font-bold text-[#FF6B00]">{selectedJob.matchScore}%</div>
                <div className="flex-1">
                  <div className="h-2.5 bg-gray-200/70 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF914D] rounded-full"
                      style={{ width: `${selectedJob.matchScore}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1.5">Your profile matches {selectedJob.matchScore}% of requirements</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-gray-200 pt-5">
              <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2.5">Job Description</h3>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
            </div>

            {/* Skills & Technologies */}
            <div className="border-t border-gray-200 pt-5">
              <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2.5">Skills & Technologies</h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-50/50 text-xs text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-gray-400 text-center border-t border-gray-200 pt-4">
              Job posted {selectedJob.postedAt} • Bookmarked on {new Date(selectedJob.savedAt).toLocaleDateString()}
            </div>
          </motion.div>
        )}
      </section>
    </div>
  )
}
