'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import TalentSidebar from '@/components/talent/sidebar/TalentSidebar'

interface Application {
  id: string
  jobTitle: string
  company: string
  appliedAt: string
  status: 'Applied' | 'Under Review' | 'Interview' | 'Offer' | 'Rejected'
  matchScore: number
  lastUpdated: string
}

const DEMO_APPLICATIONS: Application[] = [
  {
    id: '1',
    jobTitle: 'Senior Frontend Engineer',
    company: 'Salik Labs',
    appliedAt: '2024-01-15',
    status: 'Under Review',
    matchScore: 86,
    lastUpdated: '2 days ago'
  },
  {
    id: '2',
    jobTitle: 'Machine Learning Engineer',
    company: 'Vyro',
    appliedAt: '2024-01-10',
    status: 'Interview',
    matchScore: 73,
    lastUpdated: '1 day ago'
  },
  {
    id: '3',
    jobTitle: 'Backend Engineer',
    company: 'Systems Limited',
    appliedAt: '2024-01-08',
    status: 'Applied',
    matchScore: 64,
    lastUpdated: '5 days ago'
  },
  {
    id: '4',
    jobTitle: 'Product Designer',
    company: 'Salik Labs',
    appliedAt: '2024-01-05',
    status: 'Rejected',
    matchScore: 79,
    lastUpdated: '1 week ago'
  }
]

const getStatusColor = (status: Application['status']) => {
  switch (status) {
    case 'Applied': return 'bg-blue-100 text-blue-800'
    case 'Under Review': return 'bg-yellow-100 text-yellow-800'
    case 'Interview': return 'bg-purple-100 text-purple-800'
    case 'Offer': return 'bg-green-100 text-green-800'
    case 'Rejected': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function TalentApplications() {
  const [selectedStatus, setSelectedStatus] = useState<string>('All')

  const statuses = ['All', 'Applied', 'Under Review', 'Interview', 'Offer', 'Rejected']
  
  const filteredApplications = selectedStatus === 'All' 
    ? DEMO_APPLICATIONS 
    : DEMO_APPLICATIONS.filter(app => app.status === selectedStatus)

  return (
    <main className="min-h-screen w-full relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-gray-50" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <section className="relative z-10 h-screen">
        <div className="h-full max-w-7xl mx-auto grid grid-cols-12 gap-8 px-6">
          <TalentSidebar applicationCount={DEMO_APPLICATIONS.length} />

          <div className="col-span-9 grid grid-cols-1 gap-8 h-[92vh] self-center">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
                <p className="text-gray-600 mt-1">Track your job applications and their status</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{DEMO_APPLICATIONS.length}</div>
                <div className="text-sm text-gray-500">Total Applications</div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Status</h2>
            <div className="flex flex-wrap gap-3">
              {statuses.map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === status
                      ? 'bg-[#FF6B00] text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

            <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-lg overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Applications ({filteredApplications.length})</h2>
            </div>

            <div className="space-y-4">
              {filteredApplications.map(application => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{application.jobTitle}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{application.company}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                        <span>Last updated: {application.lastUpdated}</span>
                        <span>{application.matchScore}% match</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Link href={`/talent/dashboard/applications/${application.id}`} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50">
                        View Details
                      </Link>
                      <button className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-[#FF6B00] to-[#FF914D]">
                        Follow Up
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {filteredApplications.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                  <p className="text-gray-500 mb-4">You haven't applied to any jobs yet, or no applications match your current filter.</p>
                  <Link href="/talent/dashboard" className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-gradient-to-r from-[#FF6B00] to-[#FF914D]">
                    Browse Jobs
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </section>
    </main>
  )
}
