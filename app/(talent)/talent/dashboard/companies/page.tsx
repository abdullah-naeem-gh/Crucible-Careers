'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import TalentSidebar from '@/components/talent/sidebar/TalentSidebar'

const DEMO_COMPANIES = [
  { id: 'salik-labs', name: 'Salik Labs', location: 'Islamabad, Pakistan', openRoles: 3, logo: 'S', color: 'from-[#FF6B00] to-[#FF914D]' },
  { id: 'vyro', name: 'Vyro', location: 'Remote', openRoles: 5, logo: 'V', color: 'from-blue-500 to-blue-400' },
  { id: 'systems-limited', name: 'Systems Limited', location: 'Lahore, Pakistan', openRoles: 12, logo: 'SL', color: 'from-purple-600 to-purple-500' },
  { id: 'devsinc', name: 'Devsinc', location: 'Lahore, Pakistan', openRoles: 8, logo: 'D', color: 'from-green-500 to-green-400' },
  { id: 'arbisoft', name: 'Arbisoft', location: 'Lahore, Pakistan', openRoles: 4, logo: 'A', color: 'from-red-500 to-red-400' },
  { id: '10pearls', name: '10Pearls', location: 'Karachi, Pakistan', openRoles: 7, logo: '10', color: 'from-teal-500 to-teal-400' }
]

export default function CompaniesPage() {
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
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
                <p className="text-gray-600 mt-1">Discover top companies hiring on Crucible and explore their culture.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEMO_COMPANIES.map((company, idx) => (
                <motion.div 
                  key={company.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all group flex flex-col h-full relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${company.color} flex items-center justify-center shadow-inner shrink-0`}>
                      <span className="text-xl font-bold text-white">{company.logo}</span>
                    </div>
                    <span className="bg-orange-50 text-[#FF6B00] border border-orange-100 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap">
                      {company.openRoles} Open Roles
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-[#FF6B00] transition-colors">{company.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-6">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {company.location}
                    </p>
                  </div>
                  
                  <Link 
                    href={`/talent/dashboard/company/${company.id}`}
                    className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm text-center hover:bg-gray-50 transition-colors"
                  >
                    View Profile
                  </Link>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </section>
    </main>
  )
}
