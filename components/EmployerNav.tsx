"use client";
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface EmployerNavProps {
  activeTab?: 'overview' | 'analytics' | 'jobs'
  company?: string
}

const EmployerNav = ({ activeTab = 'overview', company = 'TechCorp' }: EmployerNavProps) => {
  const router = useRouter()

  const isActive = (key: 'overview' | 'analytics' | 'jobs') => activeTab === key

  return (
    <div className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-900">
            <div className="h-5 w-6 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-[#FF6B00]" />
            <span className="font-semibold">Crucible</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/dashboard/employer?tab=overview" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('overview') ? 'text-gray-900 bg-gray-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>Overview</Link>
            <Link href="/dashboard/employer/jobs" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('jobs') ? 'text-gray-900 bg-gray-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>Job Listings</Link>
            <Link href="/dashboard/employer?tab=analytics" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('analytics') ? 'text-gray-900 bg-gray-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>Analytics</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden md:inline-flex px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50">Company</button>
          <button className="hidden md:inline-flex px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50">Profile</button>
          <Link href="/" className="px-3 py-2 rounded-md border border-red-200 bg-red-50 text-sm text-red-700 hover:bg-red-100" onClick={() => localStorage.removeItem('recruiter_jobs')}>Logout</Link>
          <div className="h-7 w-7 rounded-full bg-[#FF6B00] text-white text-xs font-semibold grid place-items-center">{company.charAt(0)}</div>
        </div>
      </div>
    </div>
  )
}

export default EmployerNav
