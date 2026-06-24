'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import TalentSidebar from '@/components/talent/sidebar/TalentSidebar'

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

const DEMO_SAVED_JOBS: SavedJob[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'Salik Labs',
    location: 'Remote',
    type: 'Full-time',
    salary: '$130k - $160k',
    tags: ['React', 'TypeScript', 'Tailwind', 'Vite'],
    postedAt: '2 days ago',
    description: 'Build delightful, high-performance web experiences used by thousands of professionals every day.',
    matchScore: 86,
    savedAt: '2024-01-15'
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
    matchScore: 73,
    savedAt: '2024-01-12'
  },
  {
    id: '3',
    title: 'Product Designer',
    company: 'Salik Labs',
    location: 'Remote',
    type: 'Contract',
    salary: '$70 - $110/hr',
    tags: ['Product Design', 'Figma', 'Design Systems'],
    postedAt: '8 days ago',
    description: 'Craft elegant experiences across the product surface area.',
    matchScore: 79,
    savedAt: '2024-01-10'
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'TechCorp',
    location: 'Onsite — San Francisco',
    type: 'Full-time',
    salary: '$120k - $150k',
    tags: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
    postedAt: '1 week ago',
    description: 'Build and maintain scalable infrastructure for our growing platform.',
    matchScore: 68,
    savedAt: '2024-01-08'
  }
]

export default function TalentSaved() {
  const [selectedCompany, setSelectedCompany] = useState<string>('All')
  const [selectedType, setSelectedType] = useState<string>('All')

  const companies = ['All', ...Array.from(new Set(DEMO_SAVED_JOBS.map(j => j.company)))]
  const types = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship']

  const filteredJobs = DEMO_SAVED_JOBS.filter(job => {
    const matchesCompany = selectedCompany === 'All' || job.company === selectedCompany
    const matchesType = selectedType === 'All' || job.type === selectedType
    return matchesCompany && matchesType
  })

  return (
    <main className="min-h-screen w-full relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-gray-50" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <section className="relative z-10 h-screen">
        <div className="h-full max-w-7xl mx-auto grid grid-cols-12 gap-8 px-6">
          <TalentSidebar savedCount={DEMO_SAVED_JOBS.length} />

          <div className="col-span-9 grid grid-cols-1 gap-8 h-[92vh] self-center">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
                <p className="text-gray-600 mt-1">Your bookmarked job opportunities</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{DEMO_SAVED_JOBS.length}</div>
                <div className="text-sm text-gray-500">Saved Jobs</div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Saved Jobs</h2>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                >
                  {companies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                >
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-auto">
            {filteredJobs.map(job => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">{job.company} • {job.location}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                    <div className="text-sm text-gray-600 mb-2">{job.type} • {job.salary}</div>
                  </div>
                  <button className="text-red-500 hover:text-red-700 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-700">
                      {tag}
                    </span>
                  ))}
                  {job.tags.length > 3 && (
                    <span className="px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-500">
                      +{job.tags.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-900">{job.matchScore}% match</div>
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF914D]" 
                        style={{ width: `${job.matchScore}%` }} 
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">Saved {new Date(job.savedAt).toLocaleDateString()}</div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50">
                    View Details
                  </button>
                  <button className="flex-1 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-[#FF6B00] to-[#FF914D]">
                    Apply Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved jobs found</h3>
              <p className="text-gray-500 mb-4">You haven't saved any jobs yet, or no saved jobs match your current filter.</p>
              <Link href="/talent/dashboard" className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-gradient-to-r from-[#FF6B00] to-[#FF914D]">
                Browse Jobs
              </Link>
            </div>
          )}
        </div>
      </div>
      </section>
    </main>
  )
}
