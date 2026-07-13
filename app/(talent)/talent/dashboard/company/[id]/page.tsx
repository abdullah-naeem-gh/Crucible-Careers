'use client'

import { use, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import TalentSidebar from '@/components/talent/sidebar/TalentSidebar'
import { JOBS } from '@/lib/talent/data/jobs'
import { IconBookmark, IconBookmarkFilled, IconCheck } from '@tabler/icons-react'
import { useAppliedJobIds } from '@/lib/talent/hooks/useAppliedJobIds'

export default function CompanyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const companyId = resolvedParams?.id || ''

  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [jobCount, setJobCount] = useState(JOBS.length)
  const [appCount, setAppCount] = useState(0)
  const [savedCount, setSavedCount] = useState(0)
  const [savedJobIds, setSavedJobIds] = useState<string[]>([])
  const { appliedJobIds } = useAppliedJobIds()

  useEffect(() => {
    fetch(`/api/talent/companies/${companyId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => setCompany(data))
      .catch(err => console.error('Failed to load company details', err))
      .finally(() => setLoading(false))

    // Load counts for sidebar
    try {
      const savedRecruiterJobs = localStorage.getItem('recruiter_jobs')
      const recruiterJobs = savedRecruiterJobs ? JSON.parse(savedRecruiterJobs) : []
      const activeRecruiterJobs = recruiterJobs.filter((j: any) => j.status === 'Active')
      setJobCount(JOBS.length + activeRecruiterJobs.length)
    } catch (e) {
      console.error(e)
    }

    fetch('/api/talent/applications')
      .then(res => res.ok ? res.json() : [])
      .then((list: any[]) => setAppCount(list.length))
      .catch(err => console.error('Failed to load talent applications count', err))

    try {
      const savedBookmarked = localStorage.getItem('talent_saved_jobs')
      const bookmarked = savedBookmarked ? JSON.parse(savedBookmarked) : []
      setSavedCount(bookmarked.length)
      setSavedJobIds(bookmarked.map((j: any) => j.id))
    } catch (e) {
      console.error(e)
    }
  }, [companyId])

  const isRoleSaved = (id: string) => savedJobIds.includes(id)

  const toggleSaveRole = (role: { id: string; title: string; type: string; location: string; salary: string }) => {
    try {
      const stored = localStorage.getItem('talent_saved_jobs')
      const parsed = stored ? JSON.parse(stored) : []
      let updated
      if (parsed.some((j: any) => j.id === role.id)) {
        updated = parsed.filter((j: any) => j.id !== role.id)
      } else {
        const savedItem = {
          id: role.id,
          title: role.title,
          company: company?.name || 'Unknown Company',
          location: role.location || 'Remote',
          type: role.type || 'Full-time',
          salary: role.salary || undefined,
          tags: [],
          postedAt: 'Recently',
          description: '',
          matchScore: 0,
          savedAt: new Date().toISOString().split('T')[0],
        }
        updated = [...parsed, savedItem]
      }
      localStorage.setItem('talent_saved_jobs', JSON.stringify(updated))
      setSavedJobIds(updated.map((j: any) => j.id))
      setSavedCount(updated.length)
      window.dispatchEvent(new Event('talent_saved_jobs_changed'))
    } catch (e) {
      console.error(e)
    }
  }

  if (loading || !company) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#101010] text-white/45">
        Loading...
      </div>
    )
  }

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
            <TalentSidebar jobCount={jobCount} applicationCount={appCount} savedCount={savedCount} />
          </div>

          <div className="min-h-[70vh] lg:col-span-9 lg:h-[92vh] lg:self-center">
            <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-9 lg:gap-7">
              {/* Left Column: Details & Culture (col-span-5) */}
              <section className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-[24px] shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] flex flex-col overflow-hidden lg:col-span-5">
                <div className="border-b border-gray-100 px-5 py-5">
                  <Link href="/talent/dashboard/companies" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#FF6B00] mb-3 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Companies
                  </Link>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${company.color} flex items-center justify-center shadow-inner shrink-0 overflow-hidden`}>
                      {company.logoDataUrl ? (
                        <img src={company.logoDataUrl} alt={company.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-white">{company.logo}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#FF6B00]">Profile</p>
                      <h1 className="text-xl font-bold text-gray-900 leading-tight">{company.name}</h1>
                      {company.tagline && (
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{company.tagline}</p>
                      )}
                      <div className="text-[10px] text-gray-400 mt-1">📍 {company.location}</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-5 space-y-6">
                  {/* About */}
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2.5">About Us</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{company.about || 'No description provided.'}</p>
                  </div>

                  {/* Culture */}
                  {company.culture && (
                    <div className="border-t border-gray-100 pt-5">
                      <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2.5">Culture & Values</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">{company.culture}</p>
                    </div>
                  )}

                  {/* Quick Facts Grid */}
                  {(company.industry || company.companySize || company.founded || company.website || company.linkedin || company.twitter) && (
                    <div className="border-t border-gray-100 pt-5">
                      <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Company Details</h3>
                      <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs">
                        {company.industry && (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Industry</span>
                            <span className="text-gray-700 font-medium">{company.industry}</span>
                          </div>
                        )}
                        {company.companySize && (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Company Size</span>
                            <span className="text-gray-700 font-medium">{company.companySize}</span>
                          </div>
                        )}
                        {company.founded && (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Founded</span>
                            <span className="text-gray-700 font-medium">Est. {company.founded}</span>
                          </div>
                        )}
                        {company.website && (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Website</span>
                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-[#FF6B00] font-semibold hover:underline truncate">
                              {company.website.replace(/^https?:\/\//, '')} ↗
                            </a>
                          </div>
                        )}
                        {company.linkedin && (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">LinkedIn</span>
                            <a href={company.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#FF6B00] font-semibold hover:underline truncate">
                              View Profile ↗
                            </a>
                          </div>
                        )}
                        {company.twitter && (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Twitter / X</span>
                            <a href={company.twitter} target="_blank" rel="noopener noreferrer" className="text-[#FF6B00] font-semibold hover:underline truncate">
                              View Profile ↗
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tech Stack */}
                  {company.techStack && (
                    <div className="border-t border-gray-100 pt-5">
                      <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2.5">Tech Stack</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {company.techStack.split(',').map((tag: string) => tag.trim()).filter(Boolean).map((tag: string) => (
                          <span key={tag} className="px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-50/50 text-[11px] text-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Perks & Benefits */}
                  {company.benefits && (
                    <div className="border-t border-gray-100 pt-5">
                      <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2.5">Perks & Benefits</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {company.benefits.split(',').map((b: string) => b.trim()).filter(Boolean).map((b: string) => (
                          <span key={b} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-green-100 bg-green-50/50 text-[11px] text-green-700 font-medium">
                            ✓ {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Right Column: Open Roles (col-span-4) */}
              <section className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-[24px] shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] flex flex-col overflow-hidden lg:col-span-4">
                <div className="border-b border-gray-100 px-5 py-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Careers</p>
                    <h2 className="mt-1 text-xl font-semibold leading-tight">Open Roles</h2>
                  </div>
                  <button className="px-3.5 py-1.5 rounded-xl border border-orange-200 text-[#FF6B00] bg-orange-50 text-[10px] font-bold hover:bg-orange-100 transition-colors">
                    Follow Company
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-5 space-y-3.5">
                  {company.openRoles.map((role: any, idx: number) => (
                    <motion.div 
                      key={role.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white/50 border border-gray-100 rounded-2xl p-4 flex flex-col justify-between gap-3.5 hover:border-orange-200 transition-colors hover:bg-white"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 leading-snug">{role.title}</h4>
                        <div className="flex flex-wrap gap-2 text-[10px] text-gray-500 mt-2 font-medium">
                          <span>📍 {role.location}</span>
                          <span>•</span>
                          <span>💼 {role.type}</span>
                          <span>•</span>
                          <span className="text-green-700 font-semibold">{role.salary}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSaveRole(role)}
                          className="shrink-0 p-2 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-400 hover:text-[#FF6B00] transition-colors cursor-pointer bg-white"
                          title={isRoleSaved(role.id) ? 'Saved' : 'Save Job'}
                        >
                          {isRoleSaved(role.id) ? (
                            <IconBookmarkFilled className="h-3.5 w-3.5 text-[#FF6B00]" />
                          ) : (
                            <IconBookmark className="h-3.5 w-3.5" />
                          )}
                        </button>
                        {appliedJobIds.has(role.id) ? (
                          <span className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                            <IconCheck size={14} /> Applied
                          </span>
                        ) : (
                          <Link
                            href={`/apply/${role.id}`}
                            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white text-xs font-semibold hover:opacity-95 shadow-sm transition-all text-center"
                          >
                            Apply Now
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {company.openRoles.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">
                      No open roles at the moment.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
