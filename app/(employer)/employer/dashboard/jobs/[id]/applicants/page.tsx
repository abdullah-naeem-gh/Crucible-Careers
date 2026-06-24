'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import EmployerNav from '@/components/employer/navigation/EmployerNav'

interface Applicant {
  id: string
  name: string
  initials: string
  location: string
  source: string
  rating: number
  match: number
  status: 'New' | 'In-review' | 'Interview' | 'Hired' | 'Rejected'
  label?: 'Selected' | 'Rejected' | 'Interview'
  atsScore?: number
  crucibleScore?: number
}

interface JobMeta {
  id: string
  title: string
  company: string
  location: string
  type: string
  postedAt: string
}

const DEMO_JOB: JobMeta = {
  id: '1',
  title: 'AI Engineer',
  company: 'Vyro',
  location: 'Karachi, Pakistan',
  type: 'Full-time',
  postedAt: '1 day ago'
}

const DEMO_APPLICANTS: Applicant[] = [
  { id: 'a1', name: 'Matthew Brown', initials: 'MB', location: 'New York, US-NY', source: 'Indeed', rating: 4, match: 78, status: 'In-review', label: 'Interview', atsScore: 72, crucibleScore: 80 },
  { id: 'a2', name: 'Melissa Salazar', initials: 'MS', location: 'New York, US-NY', source: 'Indeed', rating: 3, match: 73, status: 'In-review', atsScore: 65, crucibleScore: 74 },
  { id: 'a3', name: 'Emily Morgan', initials: 'EM', location: 'New York, US-NY', source: 'Indeed', rating: 5, match: 88, status: 'Interview', label: 'Selected', atsScore: 90, crucibleScore: 92 },
  { id: 'a4', name: 'Paul Rodgers', initials: 'PR', location: 'New York, US-NY', source: 'Indeed', rating: 2, match: 66, status: 'New', atsScore: 55, crucibleScore: 60 },
]

export default function EmployerApplicants() {
  const { id } = useParams()
  const [company] = useState('TechCorp')
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loaded, setLoaded] = useState(false)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<string>('All')
  const [minRating, setMinRating] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<'applicants' | 'interviews' | 'selected' | 'rejected'>('applicants')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    const key = `recruiter_job_${id}_applicants`
    const raw = localStorage.getItem(key)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setApplicants(parsed)
        } else {
          setApplicants(DEMO_APPLICANTS)
        }
      } catch {
        setApplicants(DEMO_APPLICANTS)
      }
    } else {
      setApplicants(DEMO_APPLICANTS)
    }
    setLoaded(true)
  }, [id])

  useEffect(() => {
    if (!id || !loaded) return
    localStorage.setItem(`recruiter_job_${id}_applicants`, JSON.stringify(applicants))
  }, [applicants, id, loaded])

  const filtered = useMemo(() => {
    return applicants.filter(a => {
      const q = query.trim().toLowerCase()
      const matchesQuery = q ? a.name.toLowerCase().includes(q) || a.location.toLowerCase().includes(q) || a.source.toLowerCase().includes(q) : true
      const matchesStatus = status === 'All' || a.status === status
      const matchesRating = a.rating >= minRating
      let matchesTab = false
      if (activeTab === 'applicants') matchesTab = !a.label
      if (activeTab === 'interviews') matchesTab = a.label === 'Interview'
      if (activeTab === 'selected') matchesTab = a.label === 'Selected'
      if (activeTab === 'rejected') matchesTab = a.label === 'Rejected'
      return matchesQuery && matchesStatus && matchesRating && matchesTab
    })
  }, [applicants, query, status, minRating, activeTab])

  const counts = useMemo(() => ({
    applicants: applicants.filter(a => !a.label).length,
    interviews: applicants.filter(a => a.label === 'Interview').length,
    selected: applicants.filter(a => a.label === 'Selected').length,
    rejected: applicants.filter(a => a.label === 'Rejected').length,
  }), [applicants])

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50">
      <EmployerNav activeTab="jobs" company={company} />

      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">{DEMO_JOB.company} • {DEMO_JOB.location} • {DEMO_JOB.type}</div>
              <h1 className="text-2xl font-semibold text-gray-900">{DEMO_JOB.title}</h1>
              <div className="mt-1 text-xs text-gray-500">Posted {DEMO_JOB.postedAt}</div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/employer/dashboard/jobs" className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50">Back to Jobs</Link>
              <button className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50">Add candidate</button>
            </div>
          </div>
        </div>

        <div className="mb-3 border-b border-gray-100">
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab('applicants')} className={`px-3 py-2 text-sm font-medium ${activeTab==='applicants'?'text-gray-900 border-b-2 border-[#16a34a]':'text-gray-500 hover:text-gray-700'}`}>Applicants ({counts.applicants})</button>
            <button onClick={() => setActiveTab('interviews')} className={`px-3 py-2 text-sm font-medium ${activeTab==='interviews'?'text-gray-900 border-b-2 border-[#16a34a]':'text-gray-500 hover:text-gray-700'}`}>Interviews ({counts.interviews})</button>
            <button onClick={() => setActiveTab('selected')} className={`px-3 py-2 text-sm font-medium ${activeTab==='selected'?'text-gray-900 border-b-2 border-[#16a34a]':'text-gray-500 hover:text-gray-700'}`}>Selected ({counts.selected})</button>
            <button onClick={() => setActiveTab('rejected')} className={`px-3 py-2 text-sm font-medium ${activeTab==='rejected'?'text-gray-900 border-b-2 border-[#16a34a]':'text-gray-500 hover:text-gray-700'}`}>Rejected ({counts.rejected})</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search applicants" className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400" />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <select value={status} onChange={e => setStatus(e.target.value)} className="appearance-none px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700">
              {['All','New','In-review','Interview','Hired','Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={minRating} onChange={e => setMinRating(Number(e.target.value))} className="appearance-none px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700">
              {[0,1,2,3,4,5].map(n => <option key={n} value={n}>Min rating {n}</option>)}
            </select>
            {selectedIds.length > 0 && (
              <div className="ml-auto flex items-center gap-2">
                <button onClick={() => setApplicants(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, label: 'Selected' } : a))} className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50">Mark Selected</button>
                <button onClick={() => setApplicants(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, label: 'Interview' } : a))} className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50">Move to Interview</button>
                <button onClick={() => setApplicants(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, label: 'Rejected' } : a))} className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50">Reject</button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-5 py-3"><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? filtered.map(a=>a.id) : [])} checked={selectedIds.length>0 && selectedIds.length===filtered.length} /></th>
                  <th className="px-5 py-3 font-medium">Applicant</th>
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Rating</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Match</th>
                  <th className="px-5 py-3 font-medium text-center">ATS</th>
                  <th className="px-5 py-3 font-medium text-center">Crucible</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4"><input type="checkbox" checked={selectedIds.includes(a.id)} onChange={(e)=> setSelectedIds(prev => e.target.checked ? [...prev,a.id] : prev.filter(id=>id!==a.id))} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 grid place-items-center text-xs font-semibold">{a.initials}</div>
                        <div>
                          <div className="font-medium text-gray-900">{a.name}</div>
                          <div className="text-xs text-gray-500">{a.status}{a.label ? ` • ${a.label}` : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{a.source}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(n => (
                          <span key={n} className={`inline-block w-4 h-4 ${n <= a.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{a.location}</td>
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF914D]" style={{ width: `${a.match}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-900">{a.match}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center text-gray-900 font-medium">{a.atsScore ?? '-'}%</td>
                    <td className="px-5 py-4 text-center text-gray-900 font-medium">{a.crucibleScore ?? '-'}%</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <select
                          value={a.label ? a.label.toLowerCase() : 'applicants'}
                          onChange={(e) => {
                            const v = e.target.value
                            setApplicants(prev => prev.map(x => {
                              if (x.id !== a.id) return x
                              if (v === 'applicants') return { ...x, label: undefined }
                              if (v === 'selected') return { ...x, label: 'Selected' }
                              if (v === 'interview') return { ...x, label: 'Interview' }
                              if (v === 'rejected') return { ...x, label: 'Rejected' }
                              if (v === 'inreview') return { ...x, status: 'In-review' }
                              return x
                            }))
                          }}
                          className="appearance-none px-3 py-1.5 rounded-md border border-gray-200 bg-white text-xs text-gray-700 hover:bg-gray-50"
                        >
                          <option value="applicants">Add to...</option>
                          <option value="selected">Selected</option>
                          <option value="interview">Interview</option>
                          <option value="inreview">In review</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-500">No applicants match your filters</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  )
}
