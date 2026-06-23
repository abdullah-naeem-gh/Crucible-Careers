'use client'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import EmployerNav from '../../../components/EmployerNav'

type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
type JobStatus = 'Active' | 'Draft' | 'Paused' | 'Closed'

export interface EmployerJob {
  id: string
  title: string
  company: string
  location: string
  type: JobType
  status: JobStatus
  salary?: string
  tags: string[]
  postedAt: string
  description: string
  responsibilities: string[]
  requirements: string[]
  applications: number
  views: number
  matchScore: number
}

const STORAGE_KEY = 'recruiter_jobs'

const DEMO_JOBS: EmployerJob[] = [
  {
    id: '1',
    title: 'AI Engineer',
    company: 'Vyro',
    location: 'Karachi, Pakistan',
    type: 'Full-time',
    status: 'Active',
    salary: 'PKR 250k - 350k',
    tags: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'NLP'],
    postedAt: '1 day ago',
    description: 'Join Vyro\'s AI team to build cutting-edge machine learning solutions and drive innovation in artificial intelligence.',
    responsibilities: [
      'Develop and deploy machine learning models',
      'Implement AI algorithms and neural networks',
      'Optimize model performance and accuracy',
      'Collaborate with data scientists and engineers',
      'Research and implement latest AI technologies'
    ],
    requirements: [
      '3+ years of experience in AI/ML development',
      'Strong Python programming skills',
      'Experience with TensorFlow, PyTorch, or similar frameworks',
      'Knowledge of deep learning and neural networks',
      'Experience with NLP and computer vision',
      'Strong mathematical and statistical background'
    ],
    applications: 18,
    views: 89,
    matchScore: 92
  },
  {
    id: '2',
    title: 'Senior Frontend Engineer',
    company: 'TechCorp',
    location: 'Remote',
    type: 'Full-time',
    status: 'Active',
    salary: 'USD 120k - 150k',
    tags: ['React', 'TypeScript', 'Node.js', 'AWS'],
    postedAt: '2 days ago',
    description: 'We are looking for a Senior Frontend Engineer to join our growing team and help build amazing user experiences.',
    responsibilities: [
      'Lead frontend development initiatives',
      'Mentor junior developers',
      'Architect scalable solutions',
      'Collaborate with design and product teams'
    ],
    requirements: [
      '5+ years of React experience',
      'Strong TypeScript skills',
      'Experience with modern build tools',
      'Excellent communication skills'
    ],
    applications: 24,
    views: 156,
    matchScore: 85
  },
  {
    id: '3',
    title: 'Product Manager',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    type: 'Full-time',
    status: 'Active',
    salary: 'USD 130k - 160k',
    tags: ['Product Management', 'Agile', 'Analytics', 'B2B'],
    postedAt: '1 week ago',
    description: 'Join our product team to drive innovation and deliver exceptional user experiences.',
    responsibilities: [
      'Define product strategy and roadmap',
      'Work with engineering and design teams',
      'Analyze user feedback and metrics',
      'Drive product launches'
    ],
    requirements: [
      '3+ years of product management experience',
      'Experience with B2B SaaS products',
      'Strong analytical skills',
      'Excellent stakeholder management'
    ],
    applications: 18,
    views: 89,
    matchScore: 72
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'TechCorp',
    location: 'Remote',
    type: 'Contract',
    status: 'Draft',
    salary: 'USD 100k - 130k',
    tags: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
    postedAt: 'Draft',
    description: 'Help us build and maintain our cloud infrastructure and deployment pipelines.',
    responsibilities: [
      'Manage cloud infrastructure',
      'Implement CI/CD pipelines',
      'Monitor system performance',
      'Ensure security best practices'
    ],
    requirements: [
      '3+ years of DevOps experience',
      'Strong AWS knowledge',
      'Experience with Docker and Kubernetes',
      'Scripting skills (Python/Bash)'
    ],
    applications: 0,
    views: 0,
    matchScore: 0
  }
]

export default function EmployerDashboard() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-gray-500">Loading...</div>}>
      <EmployerDashboardContent />
    </Suspense>
  )
}

function EmployerDashboardContent() {
  const [company] = useState<string>('TechCorp')
  const [jobs, setJobs] = useState<EmployerJob[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const initialTab = (searchParams.get('tab') as 'overview' | 'analytics' | null) || 'overview'
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'analytics'>(initialTab)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFormOpen(false)
      }
    }
    if (isFormOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFormOpen])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const savedJobs = JSON.parse(raw)
        if (savedJobs && savedJobs.length > 0) {
          setJobs(savedJobs)
          setSelectedJobId(savedJobs[0]?.id || null)
        } else {
          setJobs(DEMO_JOBS)
          setSelectedJobId(DEMO_JOBS[0]?.id || null)
        }
      } else {
        setJobs(DEMO_JOBS)
        setSelectedJobId(DEMO_JOBS[0]?.id || null)
      }
    } catch {
      console.error('Error parsing jobs from localStorage')
      setJobs(DEMO_JOBS)
      setSelectedJobId(DEMO_JOBS[0]?.id || null)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
  }, [jobs])

  useEffect(() => {
    const hash = window.location.hash?.replace('#','')
    if (hash) {
      const exists = jobs.find(j => j.id === hash)
      if (exists) {
        setSelectedJobId(hash)
        setActiveTab('jobs')
      }
    }
  }, [jobs.length])

  const selectedJob = useMemo(() => jobs.find(j => j.id === selectedJobId) || null, [jobs, selectedJobId])

  const analytics = useMemo(() => {
    const totalJobs = jobs.length
    const activeJobs = jobs.filter(j => j.status === 'Active').length
    const totalApplications = jobs.reduce((sum, job) => sum + job.applications, 0)
    const totalViews = jobs.reduce((sum, job) => sum + job.views, 0)
    const avgApplications = totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0
    const avgViews = totalJobs > 0 ? Math.round(totalViews / totalJobs) : 0

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      totalViews,
      avgApplications,
      avgViews
    }
  }, [jobs])

  const topNavTabs = useMemo(() => [
    { label: 'Overview', tab: 'overview' as const },
    { label: `Job Listings (${analytics.totalJobs})`, tab: 'jobs' as const },
    { label: 'Analytics', tab: 'analytics' as const },
  ], [analytics.totalJobs])

  const addJob = (job: Omit<EmployerJob, 'id' | 'postedAt' | 'applications' | 'views' | 'matchScore'>) => {
    const newJob: EmployerJob = {
      ...job,
      id: String(Date.now()),
      postedAt: 'Just now',
      applications: 0,
      views: 0,
      matchScore: 0
    }
    setJobs(prev => [newJob, ...prev])
    setSelectedJobId(newJob.id)
    setIsFormOpen(false)
    setActiveTab('jobs')
  }

  const updateJob = (id: string, updates: Partial<EmployerJob>) => {
    setJobs(prev => prev.map(job => job.id === id ? { ...job, ...updates } : job))
  }

  const removeJob = (id: string) => {
    console.log('Removing job:', id);
    setJobs(prev => {
      const newJobs = prev.filter(j => j.id !== id);
      console.log('Jobs after removal:', newJobs);
      return newJobs;
    });
    if (selectedJobId === id) {
      console.log('Clearing selected job');
      setSelectedJobId(null);
    }
  }

  const Brand = () => (
    <div className="flex items-center gap-2 text-gray-900">
      <div className="h-5 w-6 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-[#FF6B00]" />
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-semibold">Crucible</motion.span>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50">
      <EmployerNav activeTab={activeTab === 'jobs' ? 'jobs' : activeTab} company={company} />

      <div className="flex-1 flex flex-col">

        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'jobs' && (
              <motion.div
                key="jobs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex max-w-7xl mx-auto px-6 py-6 gap-6"
              >
                <div className="w-96 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-gray-900 font-semibold">Your Job Listings</h2>
                      <button 
                        onClick={() => setIsFormOpen(true)} 
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white text-sm font-medium hover:from-[#FF5A00] hover:to-[#FF8A3D] transition-all duration-200"
                      >
                        + New Job
                      </button>
                    </div>
                    <div className="text-sm text-gray-500">{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</div>
                  </div>
                  
                  <div className="overflow-y-auto h-[calc(100vh-140px)]">
                    {jobs.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {jobs.map(job => (
                          <button
                            key={job.id}
                            onClick={() => {
                              console.log('Selecting job:', job.id, job.title);
                              setSelectedJobId(job.id);
                            }}
                            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                              selectedJobId === job.id ? 'bg-gray-50 border-r-2 border-[#FF6B00]' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-gray-900 text-sm">{job.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                job.status === 'Active' ? 'bg-green-100 text-green-700' :
                                job.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                                job.status === 'Paused' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {job.status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mb-2">{job.company} • {job.location}</div>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-700">{job.salary}</div>
                              <div className="text-xs text-[#FF6B00]">{job.applications} applications</div>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{job.postedAt}</div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B00]/20 to-[#FF914D]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-[#FF6B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                          </svg>
                        </div>
                        <h3 className="text-gray-900 font-medium mb-2">No jobs posted yet</h3>
                        <p className="text-gray-500 text-sm mb-4">Create your first job posting to get started</p>
                        <button 
                          onClick={() => setIsFormOpen(true)}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white text-sm font-medium"
                        >
                          Post a Job
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 bg-transparent overflow-y-auto">
                  {!selectedJob ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-[#FF6B00]/20 to-[#FF914D]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-10 h-10 text-[#FF6B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a job to view details</h3>
                        <p className="text-gray-600 text-sm">Choose a job from the list to see applications and manage settings</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              selectedJob.status === 'Active' ? 'bg-green-100 text-green-700' :
                              selectedJob.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                              selectedJob.status === 'Paused' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {selectedJob.status}
                            </span>
                            <span className="text-sm text-gray-500">{selectedJob.postedAt}</span>
                          </div>
                          <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedJob.title}</h1>
                          <div className="text-gray-700 mb-1">{selectedJob.company} • {selectedJob.location} • {selectedJob.type}</div>
                          <div className="text-lg font-semibold text-[#FF6B00]">{selectedJob.salary}</div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => updateJob(selectedJob.id, { status: selectedJob.status === 'Active' ? 'Paused' : 'Active' })}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            {selectedJob.status === 'Active' ? 'Pause' : 'Activate'}
                          </button>
                          <button 
                            onClick={() => removeJob(selectedJob.id)}
                            className="px-4 py-2 rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#FF6B00]">{selectedJob.applications}</div>
                          <div className="text-sm text-gray-500">Applications</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{selectedJob.views}</div>
                          <div className="text-sm text-gray-500">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedJob.views > 0 ? Math.round((selectedJob.applications / selectedJob.views) * 100) : 0}%
                          </div>
                          <div className="text-sm text-gray-500">Conversion Rate</div>
                        </div>
                      </div>

                      <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                        <p className="text-gray-700 leading-relaxed">{selectedJob.description}</p>
                      </div>

                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills & Technologies</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700 text-sm">{tag}</span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Responsibilities</h3>
                          <ul className="space-y-2">
                            {selectedJob.responsibilities.map((item, index) => (
                              <li key={index} className="flex items-start gap-3 text-gray-700">
                                <div className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full mt-2 flex-shrink-0"></div>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
                          <ul className="space-y-2">
                            {selectedJob.requirements.map((item, index) => (
                              <li key={index} className="flex items-start gap-3 text-gray-700">
                                <div className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full mt-2 flex-shrink-0"></div>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                <div className="grid grid-cols-4 gap-6 mb-8">
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 text-gray-900 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#FF6B00] to-[#FF914D] rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                        </svg>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#FF6B00]">{analytics.totalJobs}</div>
                        <div className="text-sm text-gray-500">Total Jobs</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">Active: {analytics.activeJobs}</div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-6 text-gray-900 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-400 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{analytics.totalApplications}</div>
                        <div className="text-sm text-gray-500">Applications</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">Avg: {analytics.avgApplications}/job</div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-6 text-gray-900 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{analytics.totalViews}</div>
                        <div className="text-sm text-gray-500">Total Views</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">Avg: {analytics.avgViews}/job</div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-6 text-gray-900 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-400 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">12.5%</div>
                        <div className="text-sm text-gray-500">Conversion</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">Views to Apps</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 text-gray-900 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Recent Applications</h3>
                    <div className="space-y-3">
                      {jobs.filter(j => j.applications > 0).slice(0, 3).map(job => (
                        <div key={job.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                          <div>
                            <div className="font-medium text-sm">{job.title}</div>
                            <div className="text-xs text-gray-500">{job.applications} applications</div>
                          </div>
                          <div className="text-xs text-gray-400">{job.postedAt}</div>
                        </div>
                      ))}
                      {jobs.filter(j => j.applications > 0).length === 0 && (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 bg-gradient-to-r from-[#FF6B00]/20 to-[#FF914D]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-[#FF6B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="text-gray-500 text-sm mb-2">No applications yet</div>
                          <div className="text-gray-400 text-xs">Applications will appear here once you post jobs</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-6 text-gray-900 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Job Performance</h3>
                    <div className="space-y-3">
                      {jobs.length > 0 ? (
                        jobs.slice(0, 3).map(job => (
                          <div key={job.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                            <div>
                              <div className="font-medium text-sm">{job.title}</div>
                              <div className="text-xs text-gray-500">{job.views} views</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-400">{job.status}</div>
                              <div className="text-xs text-[#FF6B00]">{job.applications} apps</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 bg-gradient-to-r from-[#FF6B00]/20 to-[#FF914D]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-[#FF6B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                            </svg>
                          </div>
                          <div className="text-gray-500 text-sm mb-2">No jobs posted yet</div>
                          <div className="text-gray-400 text-xs">Job performance metrics will appear here</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                <div className="bg-white border border-gray-100 rounded-2xl p-6 text-gray-900 shadow-sm">
                  <h3 className="text-xl font-semibold mb-6">Crucible Analytics</h3>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-medium mb-4">Performance Metrics</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="text-gray-700">Application Rate</span>
                          <span className="text-[#FF6B00] font-semibold">12.5%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="text-gray-700">Avg. Time to Hire</span>
                          <span className="text-[#FF6B00] font-semibold">18 days</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="text-gray-700">Quality Score</span>
                          <span className="text-[#FF6B00] font-semibold">8.7/10</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-4">Top Performing Jobs</h4>
                      <div className="space-y-3">
                        {jobs.slice(0, 3).map(job => (
                          <div key={job.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-sm">{job.title}</span>
                              <span className="text-[#FF6B00] text-sm">{job.applications} apps</span>
                            </div>
                            <div className="w-full bg-white rounded-full h-2 border border-gray-200">
                              <div 
                                className="bg-gradient-to-r from-[#FF6B00] to-[#FF914D] h-2 rounded-full" 
                                style={{ width: `${Math.min((job.applications / 30) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0A0A0A]/95 backdrop-blur-sm z-20 overflow-y-auto"
            onClick={() => setIsFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl shadow-2xl w-full max-w-4xl mx-auto my-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-[#1A1A1A] border-b border-[#2A2A2A] px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Create New Job</h3>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <JobForm
                  defaultCompany={company}
                  onSubmit={(payload) => addJob(payload)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface JobFormProps {
  defaultCompany: string
  onSubmit: (job: Omit<EmployerJob, 'id' | 'postedAt' | 'applications' | 'views' | 'matchScore'>) => void
}

function JobForm({ defaultCompany, onSubmit }: JobFormProps) {
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState(defaultCompany)
  const [location, setLocation] = useState('Remote')
  const [type, setType] = useState<JobType>('Full-time')
  const [status, setStatus] = useState<JobStatus>('Draft')
  const [currency, setCurrency] = useState('PKR')
  const [salary, setSalary] = useState('')
  const [tags, setTags] = useState('')
  const [description, setDescription] = useState('')
  const [responsibilities, setResponsibilities] = useState('')
  const [requirements, setRequirements] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title,
      company,
      location,
      type,
      status,
      salary: `${currency} ${salary}`,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      description,
      responsibilities: responsibilities.split('\n').map(s => s.trim()).filter(Boolean),
      requirements: requirements.split('\n').map(s => s.trim()).filter(Boolean)
    })
    setTitle(''); setCompany(defaultCompany); setLocation('Remote'); setType('Full-time'); setStatus('Draft'); setCurrency('PKR'); setSalary(''); setTags(''); setDescription(''); setResponsibilities(''); setRequirements('')
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <label className="block text-sm font-medium text-white/80 mb-1">Job title</label>
        <input 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          className="w-full px-3 py-2 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] placeholder-white/40" 
          placeholder="e.g., Senior Frontend Engineer" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">Company</label>
        <input 
          value={company} 
          onChange={e => setCompany(e.target.value)} 
          className="w-full px-3 py-2 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] placeholder-white/40" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">Location</label>
        <input 
          value={location} 
          onChange={e => setLocation(e.target.value)} 
          className="w-full px-3 py-2 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] placeholder-white/40" 
          placeholder="Remote / City, Country" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">Type</label>
        <select 
          value={type} 
          onChange={e => setType(e.target.value as JobType)} 
          className="w-full px-3 py-2 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
        >
          {(['Full-time','Part-time','Contract','Internship'] as JobType[]).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">Status</label>
        <select 
          value={status} 
          onChange={e => setStatus(e.target.value as JobStatus)} 
          className="w-full px-3 py-2 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
        >
          {(['Draft','Active','Paused','Closed'] as JobStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">Currency</label>
        <select 
          value={currency} 
          onChange={e => setCurrency(e.target.value)} 
          className="w-full px-3 py-2 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="PKR">PKR (₨)</option>
          <option value="CAD">CAD (C$)</option>
          <option value="AUD">AUD (A$)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">Salary</label>
        <input 
          value={salary} 
          onChange={e => setSalary(e.target.value)} 
          className="w-full px-3 py-2 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] placeholder-white/40" 
          placeholder="120k - 150k" 
        />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-white/80 mb-1">Tags (comma separated)</label>
        <input 
          value={tags} 
          onChange={e => setTags(e.target.value)} 
          className="w-full px-3 py-2 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] placeholder-white/40" 
          placeholder="React, TypeScript, Node.js" 
        />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-white/80 mb-1">Short description</label>
        <textarea 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          rows={2} 
          className="w-full px-3 py-2 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] placeholder-white/40" 
          placeholder="What makes this role exciting?" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">Responsibilities (one per line)</label>
        <textarea 
          value={responsibilities} 
          onChange={e => setResponsibilities(e.target.value)} 
          rows={3} 
          className="w-full px-3 py-2 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] placeholder-white/40" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">Requirements (one per line)</label>
        <textarea 
          value={requirements} 
          onChange={e => setRequirements(e.target.value)} 
          rows={3} 
          className="w-full px-3 py-2 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] placeholder-white/40" 
        />
      </div>
      <div className="col-span-2 flex items-center justify-end gap-3">
        <button 
          type="button" 
          onClick={() => { setTitle(''); setCompany(defaultCompany); setLocation('Remote'); setType('Full-time'); setStatus('Draft'); setCurrency('PKR'); setSalary(''); setTags(''); setDescription(''); setResponsibilities(''); setRequirements('') }} 
          className="px-4 py-2 rounded-lg border border-[#2A2A2A] text-white bg-[#1A1A1A] hover:bg-[#2A2A2A] transition-colors"
        >
          Reset
        </button>
        <button 
          type="submit" 
          className="px-6 py-2 rounded-lg text-white bg-gradient-to-r from-[#FF6B00] to-[#FF914D] hover:from-[#FF5A00] hover:to-[#FF8A3D] transition-all duration-200"
        >
          {status === 'Draft' ? 'Save Draft' : 'Publish Job'}
        </button>
      </div>
    </form>
  )
}
