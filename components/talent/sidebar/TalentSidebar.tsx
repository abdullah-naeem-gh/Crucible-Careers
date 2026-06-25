"use client";
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DashboardThemeSwitcher } from '@/components/shared/theme/DashboardThemeProvider'

interface TalentSidebarProps {
  jobCount?: number
  applicationCount?: number
  savedCount?: number
}

export default function TalentSidebar({ jobCount = 4, applicationCount = 12, savedCount = 5 }: TalentSidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <aside className="relative flex min-h-[18rem] flex-col rounded-[24px] border border-gray-100 bg-white/70 backdrop-blur-sm p-5 shadow-lg lg:h-[92vh] lg:p-6">
      <DashboardThemeSwitcher className="absolute right-4 top-4 sm:right-5 sm:top-5" />
      <Link href="/gateway" className="mb-5 inline-flex items-center pr-14 text-gray-600 transition-colors hover:text-gray-900">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        Back
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF914D]" />
        <div>
          <div className="font-semibold text-gray-900">Alex Johnson</div>
          <div className="text-xs text-gray-500">Frontend Engineer</div>
        </div>
      </div>

      <nav className="space-y-1 text-sm">
        <Link
          href="/talent/dashboard"
          className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
            isActive('/talent/dashboard')
              ? 'bg-orange-50 text-[#FF6B00] border border-orange-100'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Jobs <span className="rounded-md bg-[#FF6B00]/10 text-[#FF6B00] px-2">{jobCount}</span>
        </Link>
        <Link
          href="/talent/dashboard/companies"
          className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
            isActive('/talent/dashboard/companies')
              ? 'bg-orange-50 text-[#FF6B00] border border-orange-100'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Companies
        </Link>
        <Link
          href="/talent/dashboard/applications"
          className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
            isActive('/talent/dashboard/applications')
              ? 'bg-orange-50 text-[#FF6B00] border border-orange-100'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Applications <span className="text-gray-400">{applicationCount}</span>
        </Link>
        <Link
          href="/talent/dashboard/saved"
          className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
            isActive('/talent/dashboard/saved')
              ? 'bg-orange-50 text-[#FF6B00] border border-orange-100'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Saved <span className="text-gray-400">{savedCount}</span>
        </Link>
        <Link
          href="/talent/dashboard/profile"
          className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
            isActive('/talent/dashboard/profile')
              ? 'bg-orange-50 text-[#FF6B00] border border-orange-100'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Profile
        </Link>
        <Link
          href="/talent/dashboard/exams"
          className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
            isActive('/talent/dashboard/exams')
              ? 'bg-orange-50 text-[#FF6B00] border border-orange-100'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Exams & Badges
        </Link>
        <Link
          href="/talent/dashboard/settings"
          className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
            isActive('/talent/dashboard/settings')
              ? 'bg-orange-50 text-[#FF6B00] border border-orange-100'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Settings
        </Link>
      </nav>

      <div className="mt-auto rounded-xl p-4 bg-gradient-to-br from-[#FF6B00]/10 to-[#FF914D]/10 border border-orange-200">
        <div className="text-sm font-semibold text-gray-900 mb-1">Boost your match</div>
        <div className="text-xs text-gray-600 mb-3">Complete your profile to increase your match score by up to 20%.</div>
        <Link href="/talent/dashboard/profile" className="inline-block text-xs px-3 py-2 rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white">
          Update Profile
        </Link>
      </div>
    </aside>
  )
}


