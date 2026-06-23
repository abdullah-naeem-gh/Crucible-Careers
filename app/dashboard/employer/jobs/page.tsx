'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import EmployerNav from '../../../../components/EmployerNav'

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
  applications: number
  views: number
}

const STORAGE_KEY = 'recruiter_jobs'

const DEMO_JOBS: EmployerJob[] = [
  { id: '1', title: 'AI Engineer', company: 'Vyro', location: 'Karachi, Pakistan', type: 'Full-time', status: 'Active', salary: 'PKR 250k - 350k', tags: [], postedAt: '1 day ago', applications: 18, views: 89 },
  { id: '2', title: 'Senior Frontend Engineer', company: 'TechCorp', location: 'Remote', type: 'Full-time', status: 'Active', salary: 'USD 120k - 150k', tags: [], postedAt: '2 days ago', applications: 24, views: 156 },
  { id: '3', title: 'Product Manager', company: 'TechCorp', location: 'San Francisco, CA', type: 'Full-time', status: 'Active', salary: 'USD 130k - 160k', tags: [], postedAt: '1 week ago', applications: 18, views: 89 },
  { id: '4', title: 'DevOps Engineer', company: 'TechCorp', location: 'Remote', type: 'Contract', status: 'Draft', salary: 'USD 100k - 130k', tags: [], postedAt: 'Draft', applications: 0, views: 0 },
]

export default function EmployerJobs() {
  const [company] = useState<string>('TechCorp')
  const [jobs, setJobs] = useState<EmployerJob[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setJobs(parsed && parsed.length ? parsed : DEMO_JOBS)
      } else {
        setJobs(DEMO_JOBS)
      }
    } catch {
      setJobs(DEMO_JOBS)
    }
  }, [])

  function getApplicantsCount(jobId: string) {
    try {
      const raw = localStorage.getItem(`recruiter_job_${jobId}_applicants`)
      if (!raw) return 0
      const arr = JSON.parse(raw)
      return Array.isArray(arr) ? arr.length : 0
    } catch { return 0 }
  }

  const totals = useMemo(() => ({
    applications: jobs.reduce((s, j) => s + (getApplicantsCount(j.id)), 0),
    views: jobs.reduce((s, j) => s + j.views, 0),
  }), [jobs])

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50">
      <EmployerNav activeTab="jobs" company={company} />

      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Your Jobs</h1>
            <p className="text-sm text-gray-600">{jobs.length} total • {totals.applications} applications • {totals.views} views</p>
          </div>
          <button onClick={() => setIsFormOpen(true)} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white text-sm font-medium">+ New Job</button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Job</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium text-center">Applied</th>
                  <th className="px-5 py-3 font-medium text-center">Viewed</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">{job.title}</div>
                      <div className="text-xs text-gray-500">{job.company} • {job.location}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        job.status === 'Active' ? 'bg-green-100 text-green-700' :
                        job.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                        job.status === 'Paused' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>{job.status}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{job.type}</td>
                    <td className="px-5 py-4 text-center font-semibold text-gray-900">{getApplicantsCount(job.id)}</td>
                    <td className="px-5 py-4 text-center font-semibold text-gray-900">{job.views}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/employer?tab=jobs#${job.id}`} className="px-3 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">View details</Link>
                        <Link href={`/dashboard/employer/jobs/${job.id}/applicants`} className="px-3 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">Applicants</Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-500">No jobs yet. Create one from the dashboard.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center" onClick={() => setIsFormOpen(false)}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-xl" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create New Job</h3>
              <button className="text-gray-500" onClick={() => setIsFormOpen(false)}>✕</button>
            </div>
            <NewJobForm onSubmit={(job) => {
              const newJob: EmployerJob = {
                ...job,
                id: String(Date.now()),
                postedAt: 'Just now',
                applications: 0,
                views: 0,
              }
              const updated = [newJob, ...jobs]
              setJobs(updated)
              localStorage.setItem('recruiter_jobs', JSON.stringify(updated))
              setIsFormOpen(false)
            }} defaultCompany={company} />
          </div>
        </div>
      )}
    </main>
  )
}

interface NewJobPayload {
  title: string
  company: string
  location: string
  type: JobType
  status: JobStatus
  salary?: string
  tags: string[]
}

function NewJobForm({ onSubmit, defaultCompany }: { onSubmit: (job: NewJobPayload) => void, defaultCompany: string }) {
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState(defaultCompany)
  const [location, setLocation] = useState('Remote')
  const [type, setType] = useState<JobType>('Full-time')
  const [status, setStatus] = useState<JobStatus>('Draft')
  const [currency, setCurrency] = useState('USD')
  const [salary, setSalary] = useState('')
  const [tags, setTags] = useState('')

  return (
    <form className="p-5 grid grid-cols-2 gap-3" onSubmit={(e) => { e.preventDefault(); onSubmit({ title, company, location, type, status, salary: salary ? `${currency} ${salary}` : undefined, tags: tags.split(',').map(t=>t.trim()).filter(Boolean) }); }}>
      <div className="col-span-2">
        <label className="block text-sm text-gray-600 mb-1">Job title</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200" placeholder="e.g. Senior Frontend Engineer" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Company</label>
        <input value={company} onChange={e=>setCompany(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Location</label>
        <input value={location} onChange={e=>setLocation(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Type</label>
        <select value={type} onChange={e=>setType(e.target.value as JobType)} className="w-full px-3 py-2 rounded-lg border border-gray-200">
          {(['Full-time','Part-time','Contract','Internship'] as JobType[]).map(t=> <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Status</label>
        <select value={status} onChange={e=>setStatus(e.target.value as JobStatus)} className="w-full px-3 py-2 rounded-lg border border-gray-200">
          {(['Draft','Active','Paused','Closed'] as JobStatus[]).map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Currency</label>
        <select value={currency} onChange={e=>setCurrency(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200">
          {['USD','EUR','GBP','PKR','CAD','AUD'].map(c=> <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Salary</label>
        <input value={salary} onChange={e=>setSalary(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200" placeholder="120k - 150k" />
      </div>
      <div className="col-span-2">
        <label className="block text-sm text-gray-600 mb-1">Tags (comma separated)</label>
        <input value={tags} onChange={e=>setTags(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200" placeholder="React, TypeScript, Node.js" />
      </div>
      <div className="col-span-2 flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => { setTitle(''); setCompany(defaultCompany); setLocation('Remote'); setType('Full-time'); setStatus('Draft'); setCurrency('USD'); setSalary(''); setTags(''); }} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50">Reset</button>
        <button type="submit" className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-[#FF6B00] to-[#FF914D]">Create Job</button>
      </div>
    </form>
  )
}
