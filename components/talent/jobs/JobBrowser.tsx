'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ScrapedJob } from '@/types/talent/job'
import useDebounce from '@/hooks/shared/useDebounce'
import Link from 'next/link'
import { IconBookmark, IconBookmarkFilled, IconCheck } from '@tabler/icons-react'
import { useAppliedJobIds } from '@/lib/talent/hooks/useAppliedJobIds'
import { useSavedJobs } from '@/lib/talent/hooks/useSavedJobs'
import { Skeleton } from '@/components/ui/Skeleton'
import { getFeaturedEmployerIds } from '@/lib/employer/ranking/reviews'

interface Props {
  jobs: ScrapedJob[]
  isLoading?: boolean
  initialSelectedJobId?: string
}

function JobCardSkeleton() {
  return (
    <div className="w-full p-4 rounded-xl border border-white/[0.065] bg-white">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-3/5 rounded" />
          <Skeleton className="mt-2 h-3.5 w-2/5 rounded" />
          <Skeleton className="mt-2 h-3 w-1/3 rounded" />
          <div className="mt-2.5 flex gap-1.5">
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-12 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

type FilterOption = { value: string; label: string }
type SalaryRange = '' | '50-75' | '75-100' | '100-150' | '150-200' | '200-plus'
type FilterListKey = 'jobTypes' | 'workModes' | 'locations' | 'industries' | 'seniorityLevels'

interface JobFilters {
  jobTypes: string[]
  workModes: string[]
  locations: string[]
  industries: string[]
  seniorityLevels: string[]
  salaryRange: SalaryRange
}

const JOB_TYPES: FilterOption[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]
const WORK_MODES: FilterOption[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'on-site', label: 'On-site' },
]
const LOCATIONS: FilterOption[] = ['Remote', 'San Francisco', 'New York', 'London', 'Toronto', 'Dubai'].map(value => ({ value, label: value }))
const INDUSTRIES: FilterOption[] = ['SaaS', 'AI', 'Fintech', 'Healthtech', 'E-commerce', 'Gaming'].map(value => ({ value, label: value }))
const SENIORITY_LEVELS: FilterOption[] = ['Entry-level', 'Mid-level', 'Senior', 'Lead', 'Manager'].map(value => ({ value, label: value }))
const SALARY_RANGES: Array<{ value: Exclude<SalaryRange, ''>; label: string; min: number; max: number }> = [
  { value: '50-75', label: '$50k - $75k', min: 50000, max: 75000 },
  { value: '75-100', label: '$75k - $100k', min: 75000, max: 100000 },
  { value: '100-150', label: '$100k - $150k', min: 100000, max: 150000 },
  { value: '150-200', label: '$150k - $200k', min: 150000, max: 200000 },
  { value: '200-plus', label: '$200k+', min: 200000, max: Number.POSITIVE_INFINITY },
]
const EMPTY_FILTERS: JobFilters = {
  jobTypes: [],
  workModes: [],
  locations: [],
  industries: [],
  seniorityLevels: [],
  salaryRange: '',
}
const PAGE_SIZE = 20

function FilterChipGroup({
  label,
  options,
  values,
  onToggle,
}: {
  label: string
  options: FilterOption[]
  values: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-white/35">{label}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map(option => {
          const active = values.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(option.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? 'talent-job-filter-chip-active border-[#FF6B00] bg-[#FF6B00] text-white shadow-[0_5px_14px_rgba(255,107,0,0.18)]'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 dark:border-white/[0.09] dark:bg-white/[0.035] dark:text-white/60 dark:hover:border-orange-500/35 dark:hover:bg-orange-500/10 dark:hover:text-orange-300'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function matchesSalaryRange(salary: string | null, selectedRange: SalaryRange): boolean {
  if (!selectedRange) return true
  if (!salary) return false

  const values = salary.match(/\d[\d,]*(?:\.\d+)?\s*[kK]?/g)?.map(rawValue => {
    const normalized = rawValue.replace(/,/g, '').trim()
    const usesThousands = /k$/i.test(normalized)
    const value = Number.parseFloat(normalized.replace(/k$/i, ''))
    return usesThousands ? value * 1000 : value
  }).filter(Number.isFinite)

  if (!values?.length) return false

  const selected = SALARY_RANGES.find(range => range.value === selectedRange)
  if (!selected) return true

  const jobMin = Math.min(...values)
  const jobMax = Math.max(...values)
  return jobMax >= selected.min && jobMin <= selected.max
}

function matchesTagFilter(tags: string[], values: string[]): boolean {
  if (values.length === 0) return true

  const normalizedTags = tags.map(tag => tag.toLowerCase())
  return values.some(value => {
    const normalizedValue = value.toLowerCase()
    return normalizedTags.some(tag => normalizedValue.length <= 2 ? tag === normalizedValue : tag.includes(normalizedValue))
  })
}

function relativeDate(iso: string | null): string {
  if (!iso) return ''
  const ms = Date.now() - new Date(iso).getTime()
  if (isNaN(ms)) return ''
  const days = Math.floor(ms / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1d ago'
  return `${days}d ago`
}

function getMatchScore(jobId: string): number {
  let hash = 0
  for (let i = 0; i < jobId.length; i++) hash = jobId.charCodeAt(i) + ((hash << 5) - hash)
  return 65 + (Math.abs(hash) % 34)
}

function formatApplicantCount(count: number): { value: string; label: string } {
  if (count === 0) return { value: 'New', label: '' }
  if (count < 10) return { value: 'Less than 10', label: 'Applicants' }
  if (count < 25) return { value: '10+', label: 'Applicants' }
  if (count < 50) return { value: '25+', label: 'Applicants' }
  if (count < 100) return { value: '50+', label: 'Applicants' }
  if (count < 500) return { value: '100+', label: 'Applicants' }
  return { value: '500+', label: 'Applicants' }
}

export default function JobBrowser({ jobs, isLoading = false, initialSelectedJobId }: Props) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(jobs[0]?._id ?? null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState<JobFilters>(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const listRef = useRef<HTMLDivElement>(null)
  const detailPanelRef = useRef<HTMLDivElement>(null)
  const [showFloatingApply, setShowFloatingApply] = useState(false)
  const { appliedJobIds } = useAppliedJobIds()
  const { isSaved: isJobSaved, isPending: isSavePending, toggleSave } = useSavedJobs()
  const [featuredCompanies, setFeaturedCompanies] = useState<Set<string>>(new Set())

  useEffect(() => {
    getFeaturedEmployerIds().then(setFeaturedCompanies)
  }, [])

  const toggleSaveJob = (job: ScrapedJob) => toggleSave(job._id)

  useEffect(() => {
    if (detailPanelRef.current) {
      detailPanelRef.current.scrollTop = 0
    }
    setShowFloatingApply(false)
  }, [selectedJobId])

  useEffect(() => {
    if (!selectedJobId) return
    fetch(`/api/talent/jobs/${selectedJobId}/view`, { method: 'POST' }).catch(() => {})
  }, [selectedJobId])

  useEffect(() => {
    const el = detailPanelRef.current
    if (!el) return
    const handleScroll = () => {
      setShowFloatingApply(el.scrollTop > 100)
    }
    el.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => el.removeEventListener('scroll', handleScroll)
  }, [selectedJobId])

  const query = useDebounce(searchInput, 300)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()

    const isFeatured = (j: ScrapedJob) => !!j.employerId && featuredCompanies.has(j.employerId)

    return jobs
      .filter(j => {
        const matchesQuery = !q || (
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          (j.location ?? '').toLowerCase().includes(q) ||
          j.tags.some(t => t.toLowerCase().includes(q))
        )
        const matchesType = filters.jobTypes.length === 0 || (!!j.type && filters.jobTypes.includes(j.type))
        const matchesWorkMode = filters.workModes.length === 0 || (!!j.locationType && filters.workModes.includes(j.locationType))
        const normalizedLocation = (j.location ?? '').toLowerCase()
        const matchesLocation = filters.locations.length === 0 || filters.locations.some(location => normalizedLocation.includes(location.toLowerCase()))
        const matchesIndustry = matchesTagFilter(j.tags, filters.industries)
        const matchesSeniority = matchesTagFilter(j.tags, filters.seniorityLevels)
        const matchesSalary = matchesSalaryRange(j.salary, filters.salaryRange)

        return matchesQuery && matchesType && matchesWorkMode && matchesLocation && matchesIndustry && matchesSeniority && matchesSalary
      })
      // Featured jobs surface first; stable sort preserves the existing
      // newest-first order within each group.
      .sort((a, b) => Number(isFeatured(b)) - Number(isFeatured(a)))
  }, [jobs, query, filters, featuredCompanies])

  const selectedJob = filtered.find(j => j._id === selectedJobId) ?? filtered[0] ?? null

  // Tracks the last `initialSelectedJobId` we've already acted on, so a
  // *new* deep-link target (e.g. clicking another "Apply Now" card from the
  // AI chat while already on this tab) always wins, without fighting the
  // user's own manual clicks on other jobs in between.
  const appliedDeepLinkRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (
      initialSelectedJobId &&
      initialSelectedJobId !== appliedDeepLinkRef.current &&
      filtered.some(job => job._id === initialSelectedJobId)
    ) {
      appliedDeepLinkRef.current = initialSelectedJobId
      setSelectedJobId(initialSelectedJobId)
      return
    }

    if (selectedJobId && filtered.some(job => job._id === selectedJobId)) return
    setSelectedJobId(filtered[0]?._id ?? null)
  }, [filtered, selectedJobId, initialSelectedJobId])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSearch = (value: string) => {
    setSearchInput(value)
    setPage(1)
  }

  const toggleListFilter = (key: FilterListKey, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(item => item !== value) : [...prev[key], value],
    }))
    setPage(1)
  }

  const changePage = (next: number) => {
    setPage(next)
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setSearchInput('')
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }

  const activeFilterCount =
    filters.jobTypes.length +
    filters.workModes.length +
    filters.locations.length +
    filters.industries.length +
    filters.seniorityLevels.length +
    (filters.salaryRange ? 1 : 0)
  const hasFilters = !!(query || activeFilterCount)

  return (
    <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-9 lg:gap-7">
      <section className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-[24px] shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] flex flex-col overflow-hidden lg:col-span-5">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
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
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
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
                className="px-5 pb-4 overflow-hidden border-t border-gray-200"
              >
                <div className="custom-scrollbar mt-3 max-h-[52vh] overflow-y-auto pr-1">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FilterChipGroup label="Job types" options={JOB_TYPES} values={filters.jobTypes} onToggle={value => toggleListFilter('jobTypes', value)} />
                    <FilterChipGroup label="Work modes" options={WORK_MODES} values={filters.workModes} onToggle={value => toggleListFilter('workModes', value)} />
                    <FilterChipGroup label="Locations" options={LOCATIONS} values={filters.locations} onToggle={value => toggleListFilter('locations', value)} />
                    <FilterChipGroup label="Industries" options={INDUSTRIES} values={filters.industries} onToggle={value => toggleListFilter('industries', value)} />
                    <FilterChipGroup label="Seniority levels" options={SENIORITY_LEVELS} values={filters.seniorityLevels} onToggle={value => toggleListFilter('seniorityLevels', value)} />
                    <div>
                      <label htmlFor="talent-job-salary-filter" className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-white/35">
                        Salary range
                      </label>
                      <select
                        id="talent-job-salary-filter"
                        value={filters.salaryRange}
                        onChange={event => {
                          setFilters(prev => ({ ...prev, salaryRange: event.target.value as SalaryRange }))
                          setPage(1)
                        }}
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 dark:border-white/[0.09] dark:bg-[#141414] dark:text-white/70"
                      >
                        <option value="">Any salary</option>
                        {SALARY_RANGES.map(range => (
                          <option key={range.value} value={range.value}>{range.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-white/[0.07]">
                    <span className="text-xs text-gray-400 dark:text-white/35">
                      {filtered.length} matching job{filtered.length === 1 ? '' : 's'}
                    </span>
                    {hasFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-sm font-medium text-gray-500 transition-colors hover:text-[#FF6B00] dark:text-white/45 dark:hover:text-[#FF914D]"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div ref={listRef} className="flex-1 overflow-auto px-5 py-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          ) : paginated.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              No jobs match your search and filters
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.ul
                key={page}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="space-y-3"
              >
                {paginated.map(job => {
                  const visibleTags = job.tags.slice(0, 4)
                  const overflow = job.tags.length - visibleTags.length
                  return (
                    <li key={job._id}>
                      <motion.div
                        role="button"
                        tabIndex={0}
                        whileHover={{ scale: 1.005 }}
                        onClick={() => setSelectedJobId(job._id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelectedJobId(job._id)
                          }
                        }}
                        className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                          selectedJob?._id === job._id
                            ? 'border-orange-500/50 bg-orange-500/[0.055] shadow-[0_0_0_2px_rgba(255,107,0,0.1),8px_8px_18px_rgba(0,0,0,0.22)]'
                            : 'border-white/[0.065] bg-white hover:shadow-sm hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-stretch justify-between gap-4">
                          <div className="flex items-start gap-4 min-w-0">
                            <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-100 flex items-center justify-center text-[#FF6B00] font-bold text-xl shadow-sm overflow-hidden">
                              {job.companyLogo ? (
                                <img src={job.companyLogo} alt={job.company} className="h-full w-full object-cover" />
                              ) : (
                                job.company.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0 flex flex-col justify-center">
                              <div className="text-base font-semibold text-gray-900 leading-tight truncate">
                                {job.title}
                              </div>
                              <div className="mt-1 text-sm font-medium text-[#FF6B00] truncate">
                                {job.company}
                                {job.companyVerified && <span title="Verified company" className="ml-1 text-sky-500">✓</span>}
                              </div>
                              <div className="mt-0.5 text-xs text-gray-500 truncate flex items-center gap-2">
                                <span>{[job.location, job.type].filter(Boolean).join(' • ')}</span>
                              </div>
                              {job.salary && (
                                <div className="mt-1 text-xs font-semibold text-[#FF914D]">{job.salary}</div>
                              )}
                              {visibleTags.length > 0 && (
                                <div className="mt-2.5 flex flex-wrap gap-1.5">
                                  {visibleTags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-[11px] text-gray-600 font-medium">
                                      {tag}
                                    </span>
                                  ))}
                                  {overflow > 0 && (
                                    <OverflowTagTooltip tags={job.tags.slice(4)} count={overflow} />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 flex flex-col justify-between items-end gap-4">
                            <div className="text-right flex flex-col items-end gap-1.5">
                              {relativeDate(job.posted_at) && (
                                <span className="text-xs text-gray-400">{relativeDate(job.posted_at)}</span>
                              )}
                              <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] leading-tight shadow-sm">
                                {getMatchScore(job._id)}% Match
                              </span>
                              {appliedJobIds.has(job._id) && (
                                <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-white bg-emerald-600 border border-transparent px-1.5 py-0.5 rounded font-bold">
                                  <IconCheck size={10} /> Applied
                                </span>
                              )}
                              {job.source === 'Crucible' && (
                                <span className="text-[9px] uppercase tracking-wider text-white bg-[#FF6B00] border border-transparent dark:text-orange-300 dark:bg-orange-500/10 dark:border-orange-500/20 px-1.5 py-0.5 rounded font-bold">
                                  Platform
                                </span>
                              )}
                              {!!job.employerId && featuredCompanies.has(job.employerId) && (
                                <span className="text-[9px] uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/20 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                                  ⭐ Featured
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                  e.stopPropagation()
                                  toggleSaveJob(job)
                              }}
                              disabled={isSavePending(job._id)}
                              aria-busy={isSavePending(job._id)}
                              className="p-1.5 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-400 hover:text-[#FF6B00] transition-colors cursor-pointer bg-white disabled:cursor-default disabled:opacity-50"
                              title={isJobSaved(job._id) ? "Saved" : "Save Job"}
                            >
                              {isJobSaved(job._id) ? (
                                <IconBookmarkFilled className="h-3.5 w-3.5 text-[#FF6B00]" />
                              ) : (
                                <IconBookmark className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </li>
                  )
                })}
              </motion.ul>
            </AnimatePresence>
          )}
        </div>

        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-5 py-3 flex items-center justify-between bg-white/60">
            <button
              disabled={page <= 1}
              onClick={() => changePage(page - 1)}
              className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              ← Previous
            </button>
            <span className="text-xs text-gray-400">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => changePage(page + 1)}
              className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Next →
            </button>
          </div>
        )}
      </section>

      <section ref={detailPanelRef} className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-[24px] shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] overflow-auto p-6 lg:col-span-4 relative">
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
            {/* Sticky Floating Apply Now Button */}
            <div className="pointer-events-none sticky top-0 z-30 flex justify-end h-0 overflow-visible">
              <AnimatePresence>
                {showFloatingApply && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: -10 }}
                    className="pointer-events-auto mr-1"
                  >
                    {appliedJobIds.has(selectedJob._id) ? (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-2 text-sm font-semibold text-emerald-800 shadow-lg dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300">
                        <IconCheck size={16} /> Applied
                      </span>
                    ) : (
                      <Link
                        href={`/apply/${selectedJob._id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-5 py-2 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-all cursor-pointer"
                      >
                        Apply Now
                      </Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Link href={`/talent/dashboard/company/${selectedJob.company.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-100 flex items-center justify-center text-[#FF6B00] font-bold text-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                      {selectedJob.companyLogo ? (
                        <img src={selectedJob.companyLogo} alt={selectedJob.company} className="h-full w-full object-cover" />
                      ) : (
                        selectedJob.company.charAt(0).toUpperCase()
                      )}
                    </div>
                  </Link>
                  <Link href={`/talent/dashboard/company/${selectedJob.company.toLowerCase().replace(/\s+/g, '-')}`} className="text-base font-semibold text-gray-900 hover:text-[#FF6B00] transition-colors">
                    {selectedJob.company}
                    {selectedJob.companyVerified && <span title="Verified company" className="ml-1 text-sky-500">✓</span>}
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
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Actively Hiring
                </span>
                {selectedJob.source === 'Crucible' && (
                  <span className="inline-flex rounded-full border border-transparent bg-[#FF6B00] px-2.5 py-1 text-[11px] font-semibold text-white dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300">
                    ★ Platform Verified
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleSaveJob(selectedJob)}
                  disabled={isSavePending(selectedJob._id)}
                  aria-busy={isSavePending(selectedJob._id)}
                  className="flex items-center justify-center p-2.5 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-500 hover:text-[#FF6B00] transition-colors cursor-pointer bg-white disabled:cursor-default disabled:opacity-50"
                  title={isJobSaved(selectedJob._id) ? "Saved" : "Save Job"}
                >
                  {isJobSaved(selectedJob._id) ? (
                    <IconBookmarkFilled className="h-5 w-5 text-[#FF6B00]" />
                  ) : (
                    <IconBookmark className="h-5 w-5" />
                  )}
                </button>
                {appliedJobIds.has(selectedJob._id) ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-2 text-sm font-medium text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300">
                    <IconCheck size={16} /> Applied
                  </span>
                ) : (
                  <Link
                    href={`/apply/${selectedJob._id}`}
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-5 py-2 text-sm font-medium text-white shadow-[0_4px_12px_rgba(255,107,0,0.15)] hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Apply Now
                  </Link>
                )}
              </div>
            </div>

            <div className="my-6 grid grid-cols-2 gap-3">
              <MiniMetric label="Match Score" value={`${getMatchScore(selectedJob._id)}%`} accent="text-[#FF914D]" />
              {(() => {
                const applicants = formatApplicantCount(selectedJob.applicantCount ?? 0)
                return <MiniMetric label={applicants.label} value={applicants.value} accent="text-sky-500" />
              })()}
            </div>

            {selectedJob.description && (
              <div className="mb-6">
                <h2 className="mb-3 text-sm font-semibold text-gray-900">Job Description</h2>
                <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{selectedJob.description}</p>
              </div>
            )}

            {!!selectedJob.responsibilities?.length && (
              <div className="mb-6">
                <h2 className="mb-3 text-sm font-semibold text-gray-900">Responsibilities</h2>
                <ul className="space-y-2.5">
                  {selectedJob.responsibilities.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF6B00]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!!selectedJob.requirements?.length && (
              <div className="mb-6">
                <h2 className="mb-3 text-sm font-semibold text-gray-900">Requirements</h2>
                <ul className="space-y-2.5">
                  {selectedJob.requirements.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF6B00]" />
                      {item}
                    </li>
                  ))}
                </ul>
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
  const isLong = typeof value === 'string' && value.length > 5
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white/50 p-3 text-center shadow-[inset_1px_1px_4px_rgba(0,0,0,0.02)]">
      <div className={`flex h-7 items-center justify-center font-semibold ${isLong ? 'text-sm' : 'text-lg'} ${accent}`}>{value}</div>
      {label && <div className="mt-1 text-[11px] text-gray-500">{label}</div>}
    </div>
  )
}

function OverflowTagTooltip({ tags, count }: { tags: string[]; count: number }) {
  const [open, setOpen] = useState(false)
  return (
    <span
      className="relative px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-[11px] text-gray-500 font-medium cursor-pointer select-none"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      +{count}
      {open && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 flex flex-col gap-1 min-w-max rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg pointer-events-none">
          {tags.map(tag => (
            <span key={tag} className="text-[11px] text-gray-700 font-medium whitespace-nowrap">{tag}</span>
          ))}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-200" />
        </span>
      )}
    </span>
  )
}
