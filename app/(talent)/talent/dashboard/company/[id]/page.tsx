'use client'

import { use } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import TalentSidebar from '@/components/talent/sidebar/TalentSidebar'

const DEMO_COMPANIES_DETAILS: Record<string, { id: string; name: string; about: string; culture: string; location: string; website: string; logo: string; color: string; openRoles: { id: string; title: string; type: string; location: string; salary: string }[] }> = {
  'salik-labs': {
    id: 'salik-labs',
    name: 'Salik Labs',
    about: 'Salik Labs is a premier AI research and product company focused on building the next generation of intelligent tools for developers and creators. We are a fast-paced, product-driven team that values deep work and high-quality engineering.',
    culture: 'We believe in shipping fast, staying lean, and working on hard problems. Our culture is built around autonomy, continuous learning, and a strong bias for action.',
    location: 'Islamabad, Pakistan',
    website: 'https://saliklabs.com',
    logo: 'S',
    color: 'from-[#FF6B00] to-[#FF914D]',
    openRoles: [
      { id: '1', title: 'Senior Frontend Engineer', type: 'Full-time', location: 'Remote', salary: '$120k - $150k' },
      { id: '2', title: 'Machine Learning Engineer', type: 'Full-time', location: 'Islamabad', salary: '$130k - $160k' },
      { id: '3', title: 'Product Designer', type: 'Contract', location: 'Remote', salary: '$80k - $100k' }
    ]
  },
  'vyro': {
    id: 'vyro',
    name: 'Vyro',
    about: 'Vyro is an AI-first company building creative mobile applications and tools. We reach millions of users globally with our state-of-the-art generative AI visual technologies.',
    culture: 'We value creativity, technical excellence, and user-centricity. We work in small, cross-functional teams to experiment, ship features, and scale fast.',
    location: 'Remote',
    website: 'https://vyro.ai',
    logo: 'V',
    color: 'from-blue-500 to-blue-400',
    openRoles: [
      { id: '4', title: 'Generative AI Engineer', type: 'Full-time', location: 'Remote', salary: '$140k - $180k' },
      { id: '5', title: 'React Native Developer', type: 'Full-time', location: 'Remote', salary: '$90k - $120k' }
    ]
  },
  'systems-limited': {
    id: 'systems-limited',
    name: 'Systems Limited',
    about: 'Systems Limited is a leading global technology company, providing IT consulting and services across multiple domains for over four decades.',
    culture: 'We value professional growth, diversity, and delivering excellence at scale. We provide deep learning resources and mentorship.',
    location: 'Lahore, Pakistan',
    website: 'https://systemsltd.com',
    logo: 'SL',
    color: 'from-purple-600 to-purple-500',
    openRoles: [
      { id: '6', title: 'Senior Backend Engineer', type: 'Full-time', location: 'Lahore', salary: 'PKR 250k - 350k' }
    ]
  },
  'devsinc': {
    id: 'devsinc',
    name: 'Devsinc',
    about: 'Devsinc is a rapidly growing software development agency partnering with startups and enterprises globally to deliver custom technical solutions.',
    culture: 'We believe in collaborative growth, high energy, and providing young talent with accelerated learning opportunities.',
    location: 'Lahore, Pakistan',
    website: 'https://devsinc.com',
    logo: 'D',
    color: 'from-green-500 to-green-400',
    openRoles: [
      { id: '7', title: 'Fullstack Rails Developer', type: 'Full-time', location: 'Lahore', salary: 'PKR 150k - 250k' }
    ]
  },
  'arbisoft': {
    id: 'arbisoft',
    name: 'Arbisoft',
    about: 'Arbisoft is a software development and consulting services firm known for its engineering quality, transparency, and long-term client relationships.',
    culture: 'We have a strong emphasis on clean code, test-driven development, work-life balance, and continuous education.',
    location: 'Lahore, Pakistan',
    website: 'https://arbisoft.com',
    logo: 'A',
    color: 'from-red-500 to-red-400',
    openRoles: [
      { id: '8', title: 'Python Web Engineer', type: 'Full-time', location: 'Lahore', salary: 'PKR 180k - 280k' }
    ]
  },
  '10pearls': {
    id: '10pearls',
    name: '10Pearls',
    about: '10Pearls is an award-winning end-to-end digital technology agency helping companies design, build, and secure digital products.',
    culture: 'We value social responsibility, security-first mindsets, and a friendly learning-rich work environment.',
    location: 'Karachi, Pakistan',
    website: 'https://10pearls.com',
    logo: '10',
    color: 'from-teal-500 to-teal-400',
    openRoles: [
      { id: '9', title: 'Lead QA Engineer', type: 'Full-time', location: 'Karachi', salary: 'PKR 220k - 320k' }
    ]
  }
}

export default function CompanyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const companyId = resolvedParams?.id || 'salik-labs'
  const company = DEMO_COMPANIES_DETAILS[companyId] || DEMO_COMPANIES_DETAILS['salik-labs']

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
            <TalentSidebar />
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
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${company.color} flex items-center justify-center shadow-inner shrink-0`}>
                      <span className="text-xl font-bold text-white">{company.logo}</span>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#FF6B00]">Profile</p>
                      <h1 className="text-xl font-bold text-gray-900 leading-tight">{company.name}</h1>
                      <div className="text-[10px] text-gray-500 mt-0.5">{company.location}</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-5 space-y-6">
                  {/* About */}
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2.5">About Us</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{company.about}</p>
                  </div>

                  {/* Culture */}
                  <div className="border-t border-gray-100 pt-5">
                    <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2.5">Culture & Values</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{company.culture}</p>
                  </div>

                  {/* Links */}
                  <div className="border-t border-gray-100 pt-5">
                    <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2.5">Links</h3>
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[#FF6B00] font-semibold hover:underline flex items-center gap-1">
                      🔗 Official Website ↗
                    </a>
                  </div>
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
                  {company.openRoles.map((role, idx) => (
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
                      <Link 
                        href={`/apply/${role.id}`}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white text-xs font-semibold hover:opacity-95 shadow-sm transition-all text-center"
                      >
                        Apply Now
                      </Link>
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
