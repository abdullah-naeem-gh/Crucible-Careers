'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ScrapedJob } from '@/types/talent/job'
import useDebounce from '@/hooks/shared/useDebounce'

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

export default function JobBrowser({ jobs }: Props) {
  const [selectedJob, setSelectedJob] = useState<ScrapedJob | null>(jobs[0] ?? null)
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
    <div className="col-span-9 grid grid-cols-9 gap-8 h-[92vh] self-center">
      <section className="col-span-5 bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl overflow-hidden flex flex-col shadow-lg">
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
                      onClick={() => setSelectedJob(job)}
                      className={`w-full text-left p-4 rounded-xl border transition-shadow ${
                        selectedJob?._id === job._id
                          ? 'border-[#FF6B00]/60 ring-2 ring-[#FF6B00]/20 bg-white shadow-md'
                          : 'border-gray-100 bg-white hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-xs text-gray-400 truncate">
                            {[job.company, job.location, job.type].filter(Boolean).join(' · ')}
                          </div>
                          <div className="mt-0.5 text-base font-semibold text-gray-900 leading-tight">
                            {job.title}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 shrink-0">{relativeDate(job.posted_at)}</div>
                      </div>
                      {visibleTags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {visibleTags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-xs text-gray-600">
                              {tag}
                            </span>
                          ))}
                          {overflow > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-xs text-gray-400">
                              +{overflow}
                            </span>
                          )}
                        </div>
                      )}
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

      <section className="col-span-4 bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 overflow-auto shadow-lg">
        {!selectedJob ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Select a job to view details
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-gray-400">
                  {[selectedJob.company, selectedJob.location, selectedJob.type].filter(Boolean).join(' · ')}
                </div>
                <h2 className="mt-1 text-xl font-semibold text-gray-900 leading-tight">{selectedJob.title}</h2>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-gray-400">{relativeDate(selectedJob.posted_at)}</div>
                {selectedJob.salary && (
                  <div className="mt-1 text-sm font-medium text-gray-700">{selectedJob.salary}</div>
                )}
              </div>
            </div>

            {selectedJob.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {selectedJob.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-xs text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {selectedJob.description && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">About the role</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs text-gray-400">via {selectedJob.source}</span>
              <a
                href={selectedJob.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#FF6B00] to-[#FF914D] hover:opacity-90 transition-opacity"
              >
                Apply →
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
