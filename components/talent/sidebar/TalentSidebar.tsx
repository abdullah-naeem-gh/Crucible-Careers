"use client";
import Link from 'next/link'
import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { DashboardThemeSwitcher } from '@/components/shared/theme/DashboardThemeProvider'
import { logout } from '@/lib/shared/auth/actions'
import {
  IconBriefcase,
  IconBuilding,
  IconFileDescription,
  IconBookmark,
  IconUser,
  IconAward,
  IconSettings
} from '@tabler/icons-react'

const TAB_ICONS: Record<string, React.ComponentType<any>> = {
  jobs: IconBriefcase,
  companies: IconBuilding,
  applications: IconFileDescription,
  saved: IconBookmark,
  profile: IconUser,
  exams: IconAward,
  settings: IconSettings,
}

interface TalentSidebarProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
  jobCount?: number
  applicationCount?: number
  savedCount?: number
  profileNeedsSetup?: boolean
  profileCompletion?: number
  profileFirstName?: string
  profileLastName?: string
  profileEmail?: string
  profilePhotoUrl?: string | null
}

export default function TalentSidebar({
  activeTab,
  onTabChange,
  jobCount = 4,
  applicationCount = 12,
  savedCount = 5,
  profileNeedsSetup = false,
  profileCompletion = 0,
  profileFirstName,
  profileLastName,
  profileEmail,
  profilePhotoUrl
}: TalentSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    localStorage.removeItem('crucible-talent-dashboard-theme')
    try {
      await logout()
    } catch (err) {
      console.error('Logout error:', err)
    }
    router.push('/')
  }

  const isActive = (key: string) => {
    if (activeTab) {
      return activeTab === key
    }
    if (key === 'profile') {
      return pathname === '/talent/dashboard'
    }
    return pathname === `/talent/dashboard/${key}`
  }

  const renderTab = (key: string, label: string, count?: number, tag?: string) => {
    const active = isActive(key)
    const IconComponent = TAB_ICONS[key]
    return (
      <Link
        href={onTabChange ? '#' : key === 'profile' ? '/talent/dashboard' : `/talent/dashboard/${key}`}
        onClick={(e) => {
          if (onTabChange) {
            e.preventDefault()
            onTabChange(key)
          }
        }}
        className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 transition-all cursor-pointer ${
          active
            ? 'border-orange-500/20 bg-orange-500/10 text-[#FF914D] font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
            : 'border-transparent text-gray-700 hover:border-gray-200 hover:bg-gray-50 dark:text-white/60 dark:hover:border-white/[0.05] dark:hover:bg-white/[0.035] dark:hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {IconComponent && <IconComponent className="h-4.5 w-4.5 shrink-0 stroke-[1.6]" />}
          <span>{label}</span>
        </div>
        <span className="flex items-center gap-2">
          {tag && (
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
              tag === 'Set-up Now'
                ? 'border-orange-500/35 text-[#FF6B00] bg-transparent dark:border-orange-500/40 dark:text-[#FF914D]'
                : active
                  ? 'border-transparent bg-orange-500/15 text-[#FF914D]'
                  : 'border-transparent bg-orange-50 text-[#FF6B00] dark:bg-orange-500/10 dark:text-[#FF914D]'
            }`}>
              {tag}
            </span>
          )}
          {count !== undefined && count !== null && (
            <span className={`rounded-md px-2 py-0.5 text-xs ${active ? 'bg-orange-500/15 text-[#FF914D]' : 'text-gray-400 dark:text-white/30'}`}>
              {count}
            </span>
          )}
        </span>
      </Link>
    )
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative flex min-h-[18rem] flex-col rounded-[24px] border border-gray-100 bg-white/70 backdrop-blur-sm p-5 shadow-lg dark:border-white/[0.07] dark:bg-[#171717] dark:shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)] lg:h-[92vh] lg:p-6"
    >
      <DashboardThemeSwitcher className="absolute right-4 top-4 sm:right-5 sm:top-5" />
      <Link href="/gateway" className="mb-6 inline-flex items-center pr-14 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-white/50 dark:hover:text-white">
        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 19l-7-7 7-7"/></svg>
        Back
      </Link>
      <div className="mb-7 flex items-center gap-3">
        {profilePhotoUrl ? (
          <img
            src={profilePhotoUrl}
            alt="Profile photo"
            className="h-11 w-11 shrink-0 rounded-full object-cover shadow-[0_8px_24px_rgba(255,107,0,0.24)]"
          />
        ) : (
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF914D] text-sm font-semibold text-white shadow-[0_8px_24px_rgba(255,107,0,0.24)]">
            {profileFirstName || profileLastName ? `${profileFirstName?.charAt(0) || ''}${profileLastName?.charAt(0) || ''}`.toUpperCase() : 'AJ'}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 dark:text-white truncate pr-2">{profileFirstName || profileLastName ? `${profileFirstName || ''} ${profileLastName || ''}`.trim() : 'Alex Johnson'}</div>
          <div className="text-xs text-gray-500 dark:text-white/40 truncate pr-2">{profileEmail || 'Talent account'}</div>
        </div>
      </div>

      <nav className="space-y-1.5 text-sm">
        {renderTab('profile', 'Profile', undefined, profileNeedsSetup ? 'Set-up Now' : undefined)}
        {renderTab('jobs', 'Jobs', jobCount)}
        {renderTab('companies', 'Companies')}
        {renderTab('applications', 'Applications', applicationCount)}
        {renderTab('saved', 'Saved', savedCount)}
        {renderTab('exams', 'Exams & Badges')}
        {renderTab('settings', 'Settings')}
      </nav>

      <div className="mt-6 grid grid-cols-2 gap-2 lg:hidden">
        <Link
          href={onTabChange ? '#' : '/talent/dashboard/profile'}
          onClick={(e) => {
            if (onTabChange) {
              e.preventDefault()
              onTabChange('profile')
            }
          }}
          className="rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-4 py-2.5 text-center text-sm font-medium text-white"
        >
          Profile
        </Link>
        <a
          href="#"
          onClick={handleLogout}
          className="rounded-xl border border-gray-200 bg-white/60 px-4 py-2.5 text-center text-sm text-gray-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-white/60"
        >
          Logout
        </a>
      </div>

      <div className="mt-auto hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-[#FF6B00]/10 to-[#FF914D]/10 p-4 dark:border-orange-500/20 dark:from-orange-500/10 dark:to-orange-400/[0.035] lg:block">
        <div className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Profile Completion</div>
        <div className="my-2 h-2 w-full rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF914D] transition-all duration-500" style={{ width: `${profileCompletion}%` }} />
        </div>
        <div className="mb-4 text-xs leading-relaxed text-gray-600 dark:text-white/45">{profileCompletion}% complete. Keep building to stand out!</div>
        <Link
          href={onTabChange ? '#' : '/talent/dashboard/profile'}
          onClick={(e) => {
            if (onTabChange) {
              e.preventDefault()
              onTabChange('profile')
            }
          }}
          className="inline-block rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-3 py-2 text-xs font-medium text-white shadow-[0_8px_20px_rgba(255,107,0,0.2)]"
        >
          {profileNeedsSetup ? 'Set Up Profile' : 'Update Profile'}
        </Link>
      </div>

      <div className="mt-4 hidden items-center justify-between text-xs text-gray-400 dark:text-white/35 lg:flex">
        <Link href="/gateway" className="transition-colors hover:text-gray-700 dark:hover:text-white/70">Gateway</Link>
        <a href="#" onClick={handleLogout} className="transition-colors hover:text-red-800 dark:hover:text-red-300">
          Logout
        </a>
      </div>
    </motion.aside>
  )
}
