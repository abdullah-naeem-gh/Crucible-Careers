'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ScrapedJob } from '@/types/talent/job'
import useDebounce from '@/hooks/shared/useDebounce'
import Link from 'next/link'

interface Props {
  jobs: ScrapedJob[]
}

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'remote']
const PAGE_SIZE = 20

function relativeDate(iso: string | null): string {
  if (!iso) return ''
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1d ago'
  return `${days}d ago`
}

function getMatchScore(jobId: string): number {
  let hash = 0
  for (let i = 0; i < jobId.length; i++) hash = jobId.charCodeAt(i) + ((hash << 5) - hash)
  return 65 + (Math.abs(hash) % 34)
}

export default function JobBrowser({ jobs }: Props) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(jobs[0]?._id ?? null)
  const selectedJob = jobs.find(j => j._id === selectedJobId) ?? jobs[0] ?? null
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [activeType, setActiveType] = useState('')
  const [page, setPage] = useState(1)

  const query = useDebounce(searchInput, 300)

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      const q = query.toLowerCase()
      const matchesQuery = !q || (
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        (j.location ?? '').toLowerCase().includes(q) ||
        j.tags.some(t => t.toLowerCase().includes(q))
      )
      const matchesType = !activeType || j.type === activeType
      return matchesQuery && matchesType
    })
  }, [jobs, query, activeType])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSearch = (value: string) => {
    setSearchInput(value)
    setPage(1)
  }

  const handleTypeToggle = (t: string) => {
    setActiveType(prev => (prev === t ? '' : t))
    setPage(1)
  }

  const clearFilters = () => {
    setSearchInput('')
    setActiveType('')
    setPage(1)
  }

  const hasFilters = !!(query || activeType)

  return (
    <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-9 lg:gap-7">
      <section className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-[24px] shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] flex flex-col overflow-hidden lg:col-span-5">
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <div className="px-5 pt-4 pb-3 flex items-center gap-3">
            <div className="relative flex-1">
              <input
                value={searchInput}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search roles, companies, or skills"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white text-sm"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={() => setFiltersOpen(o => !o)}
              className={`px-3 py-3 rounded-lg border text-sm transition-colors ${
                filtersOpen || hasFilters
                  ? 'border-[#FF6B00] text-[#FF6B00] bg-orange-50'
                  : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Filters{activeType ? ' (1)' : ''}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {filtersOpen && (
              <motion.div
                key="filters"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="px-5 pb-4 overflow-hidden border-t border-gray-100"
              >
                <div className="mt-3 flex flex-wrap gap-2">
                  {JOB_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => handleTypeToggle(t)}
                      className={`px-3 py-1.5 rounded-full text-sm border capitalize transition-colors ${
                        activeType === t
                          ? 'bg-[#FF6B00] text-white border-[#FF6B00]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-auto px-5 py-4">
          {paginated.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              No jobs match your search
            </div>
          ) : (
            <ul className="space-y-3">
              {paginated.map(job => {
                const visibleTags = job.tags.slice(0, 4)
                const overflow = job.tags.length - visibleTags.length
                return (
                  <li key={job._id}>
                    <motion.button
                      whileHover={{ scale: 1.005 }}
                      onClick={() => setSelectedJobId(job._id)}
                      className={`w-full text-left p-4 rounded-xl border transition-shadow ${
                        selectedJob?._id === job._id
                          ? 'border-[#FF6B00]/60 ring-2 ring-[#FF6B00]/20 bg-white shadow-md'
                          : 'border-gray-100 bg-white hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-100 flex items-center justify-center text-[#FF6B00] font-bold text-xl shadow-sm">
                            {job.company.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex flex-col justify-center">
                            <div className="text-base font-semibold text-gray-900 leading-tight truncate">
                              {job.title}
                            </div>
                            <div className="mt-1 text-sm font-medium text-[#FF6B00] truncate">
                              {job.company}
                            </div>
                            <div className="mt-0.5 text-xs text-gray-500 truncate flex items-center gap-2">
                              <span>{[job.location, job.type].filter(Boolean).join(' • ')}</span>
                            </div>
                            {visibleTags.length > 0 && (
                              <div className="mt-2.5 flex flex-wrap gap-1.5">
                                {visibleTags.map(tag => (
                                  <span key={tag} className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-[11px] text-gray-600 font-medium">
                                    {tag}
                                  </span>
                                ))}
                                {overflow > 0 && (
                                  <span className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-[11px] text-gray-400 font-medium">
                                    +{overflow}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-right flex flex-col items-end gap-2">
                          <div className="text-xs text-gray-400">{relativeDate(job.posted_at)}</div>
                          <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] leading-tight shadow-sm">
                            {getMatchScore(job._id)}% Match
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {totalPages > 1 && (
          <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-white/60">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <span className="text-xs text-gray-400">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </section>

      <section className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-[24px] shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] overflow-auto p-6 lg:col-span-4">
        {!selectedJob ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            <div className="text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-orange-50 text-[#FF914D]">◎</div>
              <h2 className="font-semibold text-gray-900">Select a job to view details</h2>
              <p className="mt-2 text-sm text-gray-500">Choose a job from the list to see more information.</p>
            </div>
          </div>
        ) : (
          <motion.div key={selectedJob._id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Link href={`/talent/dashboard/company/${selectedJob.company.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-100 flex items-center justify-center text-[#FF6B00] font-bold text-lg shadow-sm hover:shadow-md transition-shadow">
                      {selectedJob.company.charAt(0).toUpperCase()}
                    </div>
                  </Link>
                  <Link href={`/talent/dashboard/company/${selectedJob.company.toLowerCase().replace(/\s+/g, '-')}`} className="text-base font-semibold text-gray-900 hover:text-[#FF6B00] transition-colors">
                    {selectedJob.company}
                  </Link>
                </div>
                <div>
                  <h1 className="text-2xl font-bold leading-tight text-gray-900">{selectedJob.title}</h1>
                  <div className="mt-1.5 text-sm text-gray-500 flex flex-wrap items-center gap-1.5">
                    <span>{[selectedJob.location, selectedJob.type].filter(Boolean).join(', ')}</span>
                    <span>•</span>
                    <span className="font-medium text-emerald-900 dark:text-emerald-300">{relativeDate(selectedJob.posted_at)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                {selectedJob.salary && (
                  <div className="text-sm font-semibold text-[#FF914D] mb-2">{selectedJob.salary}</div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                Actively Hiring
              </span>
              <div className="flex gap-2">
                <Link
                  href={`/apply/${selectedJob._id}`}
                  className="rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-5 py-2 text-sm font-medium text-white shadow-[0_4px_12px_rgba(255,107,0,0.15)] hover:opacity-90 transition-opacity"
                >
                  Apply Now
                </Link>
              </div>
            </div>

            <div className="my-6 grid grid-cols-2 gap-3">
              <MiniMetric label="Match Score" value={`${getMatchScore(selectedJob._id)}%`} accent="text-[#FF914D]" />
              <MiniMetric label="Applicants" value={getMatchScore(selectedJob._id) - 40} accent="text-sky-500" />
            </div>

            {selectedJob.description && (
              <div className="mb-6">
                <h2 className="mb-3 text-sm font-semibold text-gray-900">Job Description</h2>
                <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{selectedJob.description}</p>
              </div>
            )}

            {selectedJob.tags.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 text-sm font-semibold text-gray-900">Skills & Technologies</h2>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.tags.map(tag => (
                    <span key={tag} className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </section>
    </div>
  )
}

function MiniMetric({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white/50 p-3 text-center shadow-[inset_1px_1px_4px_rgba(0,0,0,0.02)]">
      <div className={`text-lg font-semibold ${accent}`}>{value}</div>
      <div className="mt-1 text-[11px] text-gray-500">{label}</div>
    </div>
  )
}
