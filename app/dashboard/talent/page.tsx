'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TalentSidebar from '../../../components/TalentSidebar'

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  salary?: string
  tags: string[]
  postedAt: string
  description: string
  responsibilities: string[]
  requirements: string[]
  matchScore: number
}

const DEMO_JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'Salik Labs',
    location: 'Remote',
    type: 'Full-time',
    salary: '$130k - $160k',
    tags: ['React', 'TypeScript', 'Tailwind', 'Vite'],
    postedAt: '2 days ago',
    description:
      'Build delightful, high-performance web experiences used by thousands of professionals every day.',
    responsibilities: [
      'Own features end-to-end with product and design',
      'Ship accessible, performant UI with robust testing',
      'Mentor teammates and raise the technical bar'
    ],
    requirements: [
      '5+ years in modern frontend',
      'Expert in React and TypeScript',
      'Strong product/design collaboration'
    ],
    matchScore: 86
  },
  {
    id: '2',
    title: 'Machine Learning Engineer',
    company: 'Vyro',
    location: 'Hybrid — Dubai',
    type: 'Full-time',
    salary: '$100k - $140k',
    tags: ['Python', 'PyTorch', 'LLMs', 'Ops'],
    postedAt: '5 days ago',
    description: 'Productionize ML systems powering next-gen creator tools.',
    responsibilities: [
      'Train and evaluate foundation models',
      'Build robust data + experiment pipelines',
      'Deploy low-latency inference services'
    ],
    requirements: ['3+ years in ML', 'Experience with GPUs and model serving', 'MLOps fundamentals'],
    matchScore: 73
  },
  {
    id: '3',
    title: 'Backend Engineer',
    company: 'Systems Limited',
    location: 'Onsite — Lahore',
    type: 'Full-time',
    salary: 'PKR 600k - 900k/mo',
    tags: ['Node.js', 'PostgreSQL', 'Redis', 'Microservices'],
    postedAt: '1 day ago',
    description: 'Design resilient APIs and services for enterprise clients.',
    responsibilities: ['Own service domains', 'Improve reliability and observability', 'Collaborate cross-functionally'],
    requirements: ['4+ years backend experience', 'SQL mastery', 'Solid systems thinking'],
    matchScore: 64
  },
  {
    id: '4',
    title: 'Product Designer',
    company: 'Salik Labs',
    location: 'Remote',
    type: 'Contract',
    salary: '$70 - $110/hr',
    tags: ['Product Design', 'Figma', 'Design Systems'],
    postedAt: '8 days ago',
    description: 'Craft elegant experiences across the product surface area.',
    responsibilities: ['Own flows end-to-end', 'Partner with eng for quality', 'Run discovery with users'],
    requirements: ['Strong portfolio', 'Systems mindset', 'Excellent collaboration'],
    matchScore: 79
  }
]

export default function TalentDashboard() {
  const [query, setQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>('All')
  const [selectedJob, setSelectedJob] = useState<Job | null>(DEMO_JOBS[0])
  const [filtersOpen, setFiltersOpen] = useState(false)

  const companies = useMemo(() => ['All', ...Array.from(new Set(DEMO_JOBS.map(j => j.company)))], [])
  const allTags = useMemo(() => Array.from(new Set(DEMO_JOBS.flatMap(j => j.tags))).sort(), [])
  const allTypes = ['Full-time', 'Part-time', 'Contract', 'Internship']

  const filteredJobs = useMemo(() => {
    return DEMO_JOBS.filter(job => {
      const matchesQuery = query
        ? job.title.toLowerCase().includes(query.toLowerCase()) ||
          job.company.toLowerCase().includes(query.toLowerCase()) ||
          job.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
        : true

      const matchesCompany = selectedCompany === 'All' || job.company === selectedCompany
      const matchesTypes = selectedTypes.length ? selectedTypes.includes(job.type) : true
      const matchesTags = selectedTags.length ? selectedTags.every(t => job.tags.includes(t)) : true

      return matchesQuery && matchesCompany && matchesTypes && matchesTags
    })
  }, [query, selectedCompany, selectedTypes, selectedTags])

  const handleToggleType = (t: string) => {
    setSelectedTypes(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]))
  }
  const handleToggleTag = (t: string) => {
    setSelectedTags(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]))
  }

  const hasActiveFilters = selectedTypes.length > 0 || selectedTags.length > 0 || selectedCompany !== 'All'

  return (
    <main className="min-h-screen w-full relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-gray-50" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <section className="relative z-10 h-screen">
        <div className="h-full max-w-7xl mx-auto grid grid-cols-12 gap-8 px-6">
          <TalentSidebar jobCount={DEMO_JOBS.length} />

          <div className="col-span-9 grid grid-cols-9 gap-8 h-[92vh] self-center">
            <section className="col-span-5 bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-0 overflow-hidden flex flex-col shadow-lg">
              <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
                <div className="px-5 pt-4 pb-3 flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search roles, companies, or skills"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </div>
                  <div className="relative">
                    <select
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      className="appearance-none px-4 py-3 pr-10 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm font-medium text-gray-900 hover:border-gray-300 transition-colors"
                    >
                      {companies.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <button
                    onClick={() => setFiltersOpen(o => !o)}
                    className="px-3 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                    aria-expanded={filtersOpen}
                  >
                    Filters {hasActiveFilters ? `(${selectedTypes.length + selectedTags.length + (selectedCompany !== 'All' ? 1 : 0)})` : ''}
                  </button>
                </div>

                {hasActiveFilters && (
                  <div className="px-5 pb-3 -mt-1 flex flex-wrap items-center gap-2">
                    {selectedCompany !== 'All' && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-700">
                        Company: {selectedCompany}
                        <button className="text-gray-500 hover:text-gray-700" onClick={() => setSelectedCompany('All')}>×</button>
                      </span>
                    )}
                    {selectedTypes.map(t => (
                      <span key={`t-${t}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-700">
                        {t}
                        <button className="text-gray-500 hover:text-gray-700" onClick={() => handleToggleType(t)}>×</button>
                      </span>
                    ))}
                    {selectedTags.map(t => (
                      <span key={`tag-${t}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-700">
                        {t}
                        <button className="text-gray-500 hover:text-gray-700" onClick={() => handleToggleTag(t)}>×</button>
                      </span>
                    ))}
                    <button className="ml-auto text-sm text-gray-500 hover:text-gray-700" onClick={() => { setSelectedCompany('All'); setSelectedTypes([]); setSelectedTags([]) }}>Clear all</button>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {filtersOpen && (
                    <motion.div
                      key="filters"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-5 pb-4 overflow-hidden"
                    >
                      <div className="mt-1 flex flex-wrap gap-2">
                        {allTypes.map(t => (
                          <button key={t} onClick={() => handleToggleType(t)}
                            className={`px-3 py-1.5 rounded-full text-sm border ${selectedTypes.includes(t) ? 'bg-[#FF6B00] text-white border-[#FF6B00]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {allTags.map(t => (
                          <button key={t} onClick={() => handleToggleTag(t)}
                            className={`px-2.5 py-1 rounded-full text-xs border ${selectedTags.includes(t) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 overflow-auto px-5 py-4">
                <ul className="space-y-3">
                  {filteredJobs.map(job => {
                    const visibleTags = job.tags.slice(0, 4)
                    const extra = job.tags.length - visibleTags.length
                    return (
                      <li key={job.id}>
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          onClick={() => setSelectedJob(job)}
                          className={`w-full text-left p-4 rounded-xl border transition ${selectedJob?.id === job.id ? 'border-[#FF6B00]/60 ring-2 ring-[#FF6B00]/30 bg-white shadow-md' : 'border-gray-100 bg-white hover:shadow-sm'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-sm text-gray-500">{job.company} • {job.location} • {job.type}</div>
                              <div className="text-lg font-semibold text-gray-900">{job.title}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">{job.postedAt}</div>
                              <div className="mt-2 flex flex-col items-end gap-1">
                                <div className="text-sm font-medium text-gray-900">{job.matchScore}% match</div>
                                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF914D] transition-all duration-300" style={{ width: `${job.matchScore}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {visibleTags.map(tag => (
                              <span key={tag} className="px-2 py-1 rounded-md bg-white border border-gray-200 text-xs text-gray-700">{tag}</span>
                            ))}
                            {extra > 0 && (
                              <span className="px-2 py-1 rounded-md bg-white border border-gray-200 text-xs text-gray-500">+{extra}</span>
                            )}
                          </div>
                        </motion.button>
                      </li>
                    )
                  })}
                  {filteredJobs.length === 0 && (
                    <li className="text-center text-gray-500 py-8">No jobs match your filters</li>
                  )}
                </ul>
              </div>
            </section>

            <section className="col-span-4 bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 overflow-auto shadow-lg">
              {!selectedJob ? (
                <div className="h-full flex items-center justify-center text-gray-500">Select a job to view details</div>
              ) : (
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-gray-500">{selectedJob.company} • {selectedJob.location} • {selectedJob.type}</div>
                      <h2 className="text-2xl font-semibold text-gray-900">{selectedJob.title}</h2>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-2">{selectedJob.postedAt}</div>
                      <div className="font-semibold text-gray-900">{selectedJob.salary}</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm text-gray-600 leading-relaxed">{selectedJob.description}</div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Responsibilities</h3>
                      <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                        {selectedJob.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Requirements</h3>
                      <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                        {selectedJob.requirements.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                      <div className="text-sm font-medium text-gray-900">{selectedJob.matchScore}% match</div>
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF914D] transition-all duration-300" style={{ width: `${selectedJob.matchScore}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50">Save</button>
                      <button className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-[#FF6B00] to-[#FF914D]">Apply</button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}
