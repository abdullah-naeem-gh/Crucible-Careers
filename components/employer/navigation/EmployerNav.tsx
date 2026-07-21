"use client";
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardThemeSwitcher } from '@/components/shared/theme/DashboardThemeProvider'
import { logout } from '@/lib/shared/auth/actions'

interface EmployerNavProps {
  activeTab?: 'overview' | 'analytics' | 'jobs'
  company?: string
}

const EmployerNav = ({ activeTab = 'overview', company = 'TechCorp' }: EmployerNavProps) => {
  const router = useRouter()
  const isActive = (key: 'overview' | 'analytics' | 'jobs') => activeTab === key

  const handleLogout = async (event: React.MouseEvent) => {
    event.preventDefault()
    localStorage.removeItem('recruiter_jobs')
    try {
      await logout()
    } catch (err) {
      console.error('Logout error:', err)
    }
    router.push('/')
  }

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="sticky top-0 z-30 w-full border-b border-white/10 bg-[#0d0d0d]/80 text-white shadow-2xl shadow-black/20 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/employer" className="flex items-center gap-2 text-white">
            <div className="h-5 w-6 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-gradient-to-br from-[#FF6B00] to-[#FF914D] shadow-lg shadow-orange-500/20" />
            <span className="font-semibold">Crucible</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/employer/dashboard?tab=overview" className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('overview') ? 'border border-orange-500/20 bg-orange-500/10 text-[#FF914D]' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}>Overview</Link>
            <Link href="/employer/dashboard/jobs" className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('jobs') ? 'border border-orange-500/20 bg-orange-500/10 text-[#FF914D]' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}>Job Listings</Link>
            <Link href="/employer/dashboard?tab=analytics" className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('analytics') ? 'border border-orange-500/20 bg-orange-500/10 text-[#FF914D]' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}>Analytics</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <DashboardThemeSwitcher className="size-9" />
          <button className="hidden md:inline-flex px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/70 hover:bg-white/10 hover:text-white">Company</button>
          <button className="hidden md:inline-flex px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/70 hover:bg-white/10 hover:text-white">Profile</button>
          <Link href="/" className="px-3 py-2 rounded-lg border border-red-500/20 bg-red-500/10 text-sm text-red-300 hover:bg-red-500/20" onClick={handleLogout}>Logout</Link>
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-xs font-semibold text-white shadow-lg shadow-orange-500/20">{company.charAt(0)}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default EmployerNav


