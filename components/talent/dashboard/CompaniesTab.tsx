"use client";
import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Company {
  id: string
  name: string
  location: string
  openRoles: number
  logo: string
  color: string
  about: string
  culture: string
  website: string
  openRolesList: { id: string; title: string; type: string; location: string; salary: string }[]
  tagline?: string
  industry?: string
  companySize?: string
  founded?: string
  benefits?: string
  techStack?: string
  linkedin?: string
  twitter?: string
  logoDataUrl?: string | null
}

export const DEMO_COMPANIES: Company[] = [
  {
    id: 'salik-labs',
    name: 'Salik Labs',
    location: 'Islamabad, Pakistan',
    openRoles: 3,
    logo: 'S',
    color: 'from-[#FF6B00] to-[#FF914D]',
    about: 'Salik Labs is a premier AI research and product company focused on building the next generation of intelligent tools for developers and creators. We are a fast-paced, product-driven team that values deep work and high-quality engineering.',
    culture: 'We believe in shipping fast, staying lean, and working on hard problems. Our culture is built around autonomy, continuous learning, and a strong bias for action.',
    website: 'https://saliklabs.com',
    openRolesList: [
      { id: '1', title: 'Senior Frontend Engineer', type: 'Full-time', location: 'Remote', salary: '$120k - $150k' },
      { id: '2', title: 'Machine Learning Engineer', type: 'Full-time', location: 'Islamabad', salary: '$130k - $160k' },
      { id: '3', title: 'Product Designer', type: 'Contract', location: 'Remote', salary: '$80k - $100k' }
    ]
  },
  {
    id: 'vyro',
    name: 'Vyro',
    location: 'Remote',
    openRoles: 2,
    logo: 'V',
    color: 'from-blue-500 to-blue-400',
    about: 'Vyro is an AI-first company building creative mobile applications and tools. We reach millions of users globally with our state-of-the-art generative AI visual technologies.',
    culture: 'We value creativity, technical excellence, and user-centricity. We work in small, cross-functional teams to experiment, ship features, and scale fast.',
    website: 'https://vyro.ai',
    openRolesList: [
      { id: '4', title: 'Generative AI Engineer', type: 'Full-time', location: 'Remote', salary: '$140k - $180k' },
      { id: '5', title: 'React Native Developer', type: 'Full-time', location: 'Remote', salary: '$90k - $120k' }
    ]
  },
  {
    id: 'systems-limited',
    name: 'Systems Limited',
    location: 'Lahore, Pakistan',
    openRoles: 1,
    logo: 'SL',
    color: 'from-purple-600 to-purple-500',
    about: 'Systems Limited is a leading global technology company, providing IT consulting and services across multiple domains for over four decades.',
    culture: 'We value professional growth, diversity, and delivering excellence at scale. We provide deep learning resources and mentorship.',
    website: 'https://systemsltd.com',
    openRolesList: [
      { id: '6', title: 'Senior Backend Engineer', type: 'Full-time', location: 'Lahore', salary: 'PKR 250k - 350k' }
    ]
  },
  {
    id: 'devsinc',
    name: 'Devsinc',
    location: 'Lahore, Pakistan',
    openRoles: 1,
    logo: 'D',
    color: 'from-green-500 to-green-400',
    about: 'Devsinc is a rapidly growing software development agency partnering with startups and enterprises globally to deliver custom technical solutions.',
    culture: 'We believe in collaborative growth, high energy, and providing young talent with accelerated learning opportunities.',
    website: 'https://devsinc.com',
    openRolesList: [
      { id: '7', title: 'Fullstack Rails Developer', type: 'Full-time', location: 'Lahore', salary: 'PKR 150k - 250k' }
    ]
  },
  {
    id: 'arbisoft',
    name: 'Arbisoft',
    location: 'Lahore, Pakistan',
    openRoles: 1,
    logo: 'A',
    color: 'from-red-500 to-red-400',
    about: 'Arbisoft is a software development and consulting services firm known for its engineering quality, transparency, and long-term client relationships.',
    culture: 'We have a strong emphasis on clean code, test-driven development, work-life balance, and continuous education.',
    website: 'https://arbisoft.com',
    openRolesList: [
      { id: '8', title: 'Python Web Engineer', type: 'Full-time', location: 'Lahore', salary: 'PKR 180k - 280k' }
    ]
  },
  {
    id: '10pearls',
    name: '10Pearls',
    location: 'Karachi, Pakistan',
    openRoles: 1,
    logo: '10',
    color: 'from-teal-500 to-teal-400',
    about: '10Pearls is an award-winning end-to-end digital technology agency helping companies design, build, and secure digital products.',
    culture: 'We value social responsibility, security-first mindsets, and a friendly learning-rich work environment.',
    website: 'https://10pearls.com',
    openRolesList: [
      { id: '9', title: 'Lead QA Engineer', type: 'Full-time', location: 'Karachi', salary: 'PKR 220k - 320k' }
    ]
  }
]

export default function CompaniesTab() {
  const [companiesList, setCompaniesList] = useState<Company[]>(DEMO_COMPANIES)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(DEMO_COMPANIES[0].id)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('recruiter_profile')
      if (savedProfile) {
        const profile = JSON.parse(savedProfile)
        
        // Load recruiter jobs to map open roles
        const savedJobs = localStorage.getItem('recruiter_jobs')
        const recruiterJobs = savedJobs ? JSON.parse(savedJobs) : []
        const activeJobs = recruiterJobs.filter((j: any) => j.status === 'Active')
        
        const openRolesList = activeJobs.map((j: any) => ({
          id: j.id,
          title: j.title,
          type: j.type,
          location: j.location,
          salary: j.salary || '—'
        }))

        const recruiterCompanyId = profile.name.toLowerCase().replace(/\s+/g, '-')

        const recruiterCompany: Company = {
          id: recruiterCompanyId,
          name: profile.name,
          location: profile.headquarters || 'Remote',
          openRoles: openRolesList.length,
          logo: profile.name.charAt(0).toUpperCase(),
          color: 'from-[#FF6B00] to-[#FF914D]',
          about: profile.overview || '',
          culture: profile.culture || '',
          website: profile.website || '',
          openRolesList,
          tagline: profile.tagline,
          industry: profile.industry,
          companySize: profile.companySize,
          founded: profile.founded,
          benefits: profile.benefits,
          techStack: profile.techStack,
          linkedin: profile.linkedin,
          twitter: profile.twitter,
          logoDataUrl: profile.logoDataUrl
        }

        setCompaniesList(prev => {
          const filtered = prev.filter(c => c.id !== recruiterCompanyId)
          return [recruiterCompany, ...filtered]
        })
        
        setSelectedCompanyId(recruiterCompanyId)
      }
    } catch (e) {
      console.error('Failed to load recruiter company profile', e)
    }
  }, [])

  const filteredCompanies = useMemo(() => {
    return companiesList.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [companiesList, searchQuery])

  const selectedCompany = companiesList.find(c => c.id === selectedCompanyId) ?? filteredCompanies[0] ?? null

  return (
    <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-9 lg:gap-7">
      {/* Left Column: Companies List (col-span-5) */}
      <section className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-[24px] shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] flex flex-col overflow-hidden lg:col-span-5">
        <div className="border-b border-gray-200 px-5 py-5 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#FF6B00]">Directory</p>
            <h1 className="mt-1 text-2xl font-semibold">Hiring Companies</h1>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">{companiesList.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400">Total</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="border-b border-gray-200/50 bg-gray-50/50 p-4">
          <div className="relative">
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search companies by name or city"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white text-xs"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-auto p-5 space-y-3">
          {filteredCompanies.map(c => (
            <motion.button
              key={c.id}
              onClick={() => setSelectedCompanyId(c.id)}
              whileHover={{ scale: 1.005 }}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedCompany?.id === c.id
                  ? 'border-[#FF6B00]/60 ring-2 ring-[#FF6B00]/20 bg-white shadow-md'
                  : 'border-gray-200 bg-white/50 hover:shadow-sm hover:bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-inner shrink-0 overflow-hidden`}>
                  {c.logoDataUrl ? (
                    <img src={c.logoDataUrl} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-base font-bold text-white">{c.logo}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{c.name}</h3>
                  <div className="text-[11px] text-gray-500 truncate mt-0.5">{c.location}</div>
                </div>
                <span className="bg-orange-50 text-[#FF6B00] border border-orange-100 px-2 py-0.5 rounded text-[10px] font-bold shrink-0">
                  {c.openRoles} Roles
                </span>
              </div>
            </motion.button>
          ))}
          {filteredCompanies.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              No companies match your search.
            </div>
          )}
        </div>
      </section>

      {/* Right Column: Company Details Profile (col-span-4) */}
      <section className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-[24px] shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] overflow-auto p-6 lg:col-span-4">
        {!selectedCompany ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Select a company to view profile
          </div>
        ) : (
          <motion.div key={selectedCompany.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedCompany.color} flex items-center justify-center shadow-inner shrink-0 overflow-hidden`}>
                {selectedCompany.logoDataUrl ? (
                  <img src={selectedCompany.logoDataUrl} alt={selectedCompany.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-white">{selectedCompany.logo}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-gray-900 leading-tight truncate">{selectedCompany.name}</h2>
                {selectedCompany.tagline && (
                  <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">{selectedCompany.tagline}</p>
                )}
                <div className="mt-1 text-xs text-gray-500 flex items-center gap-1.5">
                  <span>📍 {selectedCompany.location}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link href={`/talent/dashboard/company/${selectedCompany.id}`} className="flex-1 text-center py-2.5 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-xs font-semibold transition-colors">
                Full Profile Page
              </Link>
              <button className="flex-1 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-xs font-semibold hover:opacity-95 transition-opacity">
                Follow
              </button>
            </div>

            {/* Quick Facts Section */}
            {(selectedCompany.industry || selectedCompany.companySize || selectedCompany.founded || selectedCompany.website) && (
              <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-[11px] border-t border-b border-gray-200 py-3.5 my-4">
                {selectedCompany.industry && (
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold uppercase tracking-wider text-[9px] mb-0.5">Industry</span>
                    <span className="text-gray-700 font-medium truncate">{selectedCompany.industry}</span>
                  </div>
                )}
                {selectedCompany.companySize && (
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold uppercase tracking-wider text-[9px] mb-0.5">Company Size</span>
                    <span className="text-gray-700 font-medium truncate">{selectedCompany.companySize}</span>
                  </div>
                )}
                {selectedCompany.founded && (
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold uppercase tracking-wider text-[9px] mb-0.5">Founded</span>
                    <span className="text-gray-700 font-medium truncate">Est. {selectedCompany.founded}</span>
                  </div>
                )}
                {selectedCompany.website && (
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold uppercase tracking-wider text-[9px] mb-0.5">Website</span>
                    <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-[#FF6B00] font-semibold hover:underline truncate">
                      {selectedCompany.website.replace(/^https?:\/\//, '')} ↗
                    </a>
                  </div>
                )}
                {selectedCompany.linkedin && (
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold uppercase tracking-wider text-[9px] mb-0.5">LinkedIn</span>
                    <a href={selectedCompany.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#FF6B00] font-semibold hover:underline truncate">
                      View Profile ↗
                    </a>
                  </div>
                )}
                {selectedCompany.twitter && (
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-semibold uppercase tracking-wider text-[9px] mb-0.5">Twitter / X</span>
                    <a href={selectedCompany.twitter} target="_blank" rel="noopener noreferrer" className="text-[#FF6B00] font-semibold hover:underline truncate">
                      View Profile ↗
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Tech Stack */}
            {selectedCompany.techStack && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2.5">Tech Stack</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCompany.techStack.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-50/50 text-[11px] text-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Perks & Benefits */}
            {selectedCompany.benefits && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2.5">Perks & Benefits</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCompany.benefits.split(',').map(b => b.trim()).filter(Boolean).map(b => (
                    <span key={b} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-green-100 bg-green-50/50 text-[11px] text-green-700 font-medium">
                      ✓ {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* About */}
            <div className="border-t border-gray-200 pt-5">
              <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2.5">About Company</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{selectedCompany.about || 'No description provided.'}</p>
            </div>

            {/* Culture */}
            {selectedCompany.culture && (
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2.5">Culture & Worklife</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{selectedCompany.culture}</p>
              </div>
            )}

            {/* Open Roles */}
            <div className="border-t border-gray-200 pt-5">
              <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3.5">Open Roles</h3>
              <div className="space-y-3">
                {selectedCompany.openRolesList.map(role => (
                  <div key={role.id} className="bg-gray-50/50 border border-gray-200 rounded-xl p-3.5 hover:border-orange-200 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-semibold text-gray-900 leading-snug">{role.title}</h4>
                      <Link 
                        href={`/apply/${role.id}`}
                        className="px-2.5 py-1 text-[9px] font-bold text-white bg-gradient-to-r from-[#FF6B00] to-[#FF914D] rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                      >
                        Apply
                      </Link>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] text-gray-500 mt-2 font-medium">
                      <span>📍 {role.location}</span>
                      <span>•</span>
                      <span>💼 {role.type}</span>
                      <span>•</span>
                      <span className="text-green-700 font-semibold">{role.salary}</span>
                    </div>
                  </div>
                ))}
                {selectedCompany.openRolesList.length === 0 && (
                  <div className="text-center py-6 text-gray-400 text-xs">
                    No open roles at the moment.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </section>
    </div>
  )
}
