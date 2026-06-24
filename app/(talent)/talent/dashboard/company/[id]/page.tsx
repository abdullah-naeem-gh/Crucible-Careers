'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import TalentSidebar from '@/components/talent/sidebar/TalentSidebar'

const DEMO_COMPANY = {
  id: 'salik-labs',
  name: 'Salik Labs',
  about: 'Salik Labs is a premier AI research and product company focused on building the next generation of intelligent tools for developers and creators. We are a fast-paced, product-driven team that values deep work and high-quality engineering.',
  culture: 'We believe in shipping fast, staying lean, and working on hard problems. Our culture is built around autonomy, continuous learning, and a strong bias for action.',
  location: 'Islamabad, Pakistan',
  website: 'https://saliklabs.com',
  openRoles: [
    { id: '1', title: 'Senior Frontend Engineer', type: 'Full-time', location: 'Remote', salary: '$120k - $150k' },
    { id: '2', title: 'Machine Learning Engineer', type: 'Full-time', location: 'Islamabad', salary: '$130k - $160k' },
    { id: '3', title: 'Product Designer', type: 'Contract', location: 'Remote', salary: '$80k - $100k' }
  ]
}

export default function CompanyProfilePage() {
  return (
    <main className="min-h-screen w-full relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-gray-50" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <section className="relative z-10 h-screen">
        <div className="h-full max-w-7xl mx-auto grid grid-cols-12 gap-8 px-6">
          <TalentSidebar jobCount={0} />

          <div className="col-span-9 grid grid-cols-1 gap-8 h-[92vh] self-center overflow-y-auto pr-4 pb-12 pt-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 shadow-lg"
            >
              <div className="flex items-start gap-6 mb-8">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF914D] flex items-center justify-center shadow-inner">
                  <span className="text-3xl font-bold text-white">
                    {DEMO_COMPANY.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 pt-2">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{DEMO_COMPANY.name}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {DEMO_COMPANY.location}
                    </span>
                    <a href={DEMO_COMPANY.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#FF6B00] hover:underline">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                      Website
                    </a>
                  </div>
                </div>
                <button className="px-6 py-2.5 rounded-xl border-2 border-[#FF6B00] text-[#FF6B00] font-semibold hover:bg-[#FF6B00] hover:text-white transition-colors">
                  Follow Company
                </button>
              </div>

              <div className="grid grid-cols-2 gap-12 mb-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">About Us</h2>
                  <p className="text-gray-600 leading-relaxed">{DEMO_COMPANY.about}</p>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Culture</h2>
                  <p className="text-gray-600 leading-relaxed">{DEMO_COMPANY.culture}</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Roles at {DEMO_COMPANY.name}</h2>
                <div className="space-y-4">
                  {DEMO_COMPANY.openRoles.map((role, idx) => (
                    <motion.div 
                      key={role.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between hover:shadow-md transition-shadow group"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#FF6B00] transition-colors mb-1">{role.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="bg-gray-100 px-2.5 py-1 rounded-md">{role.type}</span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                            {role.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {role.salary}
                          </span>
                        </div>
                      </div>
                      <Link 
                        href={`/talent/dashboard/jobs/${role.id}`}
                        className="px-5 py-2 rounded-lg bg-gray-50 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                      >
                        View Job
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}
