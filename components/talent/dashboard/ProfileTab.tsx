
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconCheck,
  IconChevronDown,
  IconCamera,
  IconDeviceFloppy,
  IconExternalLink,
  IconFileText,
  IconMapPin,
  IconPlus,
  IconRotate2,
} from '@tabler/icons-react'
import { IconVideo, IconWorld, IconLoader2 } from '@tabler/icons-react'
import { TalentEducation, TalentExperience, TalentProfile, TalentProject } from '@/types/talent/profile'
import { calculateCompletionPercentage } from '@/lib/talent/services/profile.service'
import { createBrowserSupabaseClient } from '@/lib/shared/supabase/client'
import ImageCropModal from '@/components/ui/ImageCropModal'
import LocationPicker from '@/components/ui/LocationPicker'
import { Skeleton } from '@/components/ui/Skeleton'

interface ProfileTabProps {
  profile: TalentProfile | null
  onProfileChange: (profile: TalentProfile | null) => void
  isLoading?: boolean
}

const surface = 'rounded-[24px] border border-gray-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-white/[0.07] dark:bg-[#171717] dark:shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)]'
const insetSurface = 'rounded-2xl border border-gray-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.065] dark:bg-[#141414] dark:shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2),inset_-1px_-1px_3px_rgba(255,255,255,0.025)]'
const labelClass = 'mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/35'
const fieldClass = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 dark:border-white/[0.08] dark:bg-[#121212] dark:text-white dark:placeholder:text-white/20'
const WORK_PREFERENCES = ['Remote', 'On-site', 'Hybrid']
const AVAILABILITY_OPTIONS = ['Open to work', 'Available immediately', 'Available in 2 weeks', 'Available in 1 month', 'Not actively looking']

const newExperience = (): TalentExperience => ({
  id: crypto.randomUUID(),
  company: '',
  role: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
  previousSalary: '',
  payslipVerified: false,
})

const newEducation = (): TalentEducation => ({
  id: crypto.randomUUID(),
  school: '',
  degree: '',
  field: '',
  startYear: '',
  endYear: '',
  description: '',
})

const newProject = (): TalentProject => ({
  id: crypto.randomUUID(),
  title: '',
  description: '',
  link: '',
  imageUrl: null,
  videoUrl: '',
})

function splitList(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function joinList(value: string[]) {
  return value.join(', ')
}

function initials(first: string, last: string) {
  if (!first && !last) return 'TP'
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
}

function normalizeUrl(url: string) {
  if (!url) return ''
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

function CsvField({
  value,
  onChange,
  placeholder,
  rows,
}: {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  rows?: number
}) {
  const [text, setText] = useState(joinList(value))
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) setText(joinList(value))
  }, [focused, value])

  const update = (nextText: string) => {
    setText(nextText)
    onChange(splitList(nextText))
  }

  const sharedProps = {
    className: fieldClass,
    value: text,
    placeholder,
    onFocus: () => setFocused(true),
    onBlur: () => {
      setFocused(false)
      setText(joinList(splitList(text)))
    },
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(event.target.value),
  }

  if (rows && rows > 1) return <textarea {...sharedProps} rows={rows} />
  return <input {...sharedProps} />
}


function CustomSelect({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium profile-select-trigger shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10"
      >
        <span>{value || options[0]}</span>
        <IconChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 6, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full z-30 max-h-60 overflow-y-auto rounded-xl profile-select-menu shadow-[0_18px_45px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.03] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-white/15 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-white/25 [&::-webkit-scrollbar-track]:bg-transparent"
          >
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
                className={`flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left text-sm profile-select-option ${option === value ? 'profile-select-option-active font-semibold' : ''}`}
              >
                <span>{option}</span>
                {option === value && <IconCheck size={15} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FormSection({ title, action, children, highlight = false }: { title: string; action?: React.ReactNode; children: React.ReactNode; highlight?: boolean }) {
  return (
    <section className={`${insetSurface} p-4 transition-all duration-300 ${highlight ? 'ring-1 ring-orange-400/50 bg-orange-50/10 shadow-[0_0_15px_rgba(255,107,0,0.08)] dark:ring-orange-500/30 dark:bg-orange-500/[0.02] dark:shadow-[0_0_20px_rgba(255,107,0,0.05)]' : ''}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className={`text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${highlight ? 'text-orange-500 dark:text-orange-400 font-bold' : 'text-gray-500 dark:text-white/35'}`}>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={`${insetSurface} p-4`}>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400 dark:text-white/35">{title}</h3>
      {children}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className={`${surface} flex min-h-[42rem] flex-col overflow-hidden p-6 lg:min-h-0 lg:h-full`}>
      <div className="flex items-center gap-4 border-b border-gray-200 pb-5 dark:border-white/[0.07]">
        <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="mt-2 h-5 w-48 rounded" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="mt-2 h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Skeleton className="h-3 w-28 rounded" />
        <Skeleton className="mt-2 h-24 w-full rounded-xl" />
      </div>
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className={`${surface} grid h-full min-h-[38rem] place-items-center p-6 text-center [&_button:not(:disabled)]:cursor-pointer`}>
      <div className="max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FF6B00]">Talent Profile</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-950 dark:text-white">Build your first profile</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-white/45">
          Create a focused profile employers can scan quickly: headline, skills, proof of work, experience, education, and intro media.
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="cursor-pointer mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,107,0,0.2)]"
        >
          <IconPlus size={17} />
          Start setup
        </button>
      </div>
    </div>
  )
}

function ProfilePreview({ profile }: { profile: TalentProfile }) {
  const visibleExperience = profile.experience.filter((item) => item.company || item.role || item.description)
  const visibleEducation = profile.education.filter((item) => item.school || item.degree || item.field)
  const visibleProjects = profile.projects.filter((item) => item.title || item.description || item.link)
  const stats = [
    { label: 'Skills', value: profile.skills.length },
    { label: 'Experience', value: visibleExperience.length },
    { label: 'Projects', value: visibleProjects.length },
    { label: 'Education', value: visibleEducation.length },
  ]

  return (
    <motion.div
      key={profile.id + profile.updatedAt + profile.firstName + profile.lastName + profile.headline}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.26, ease: 'easeOut' }}
      className="space-y-5"
    >
      <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#171717]">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0">
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[22px] border border-white/60 bg-gradient-to-br from-orange-100 to-white shadow-[0_10px_24px_rgba(255,107,0,0.14)] dark:border-white/[0.08] dark:from-[#FF6B00]/20 dark:to-[#FF914D]/10">
                {profile.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="absolute inset-0 grid place-items-center text-xl font-bold text-[#FF6B00]">{initials(profile.firstName, profile.lastName)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF6B00]">Profile Preview</p>
                <h2 className="mt-2 truncate text-[28px] font-semibold text-gray-950 dark:text-white">
                  {profile.firstName || profile.lastName ? `${profile.firstName} ${profile.lastName}`.trim() : <span className="text-gray-400 dark:text-white/25">Your name</span>}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600 dark:text-white/50">
                  {profile.headline || <span className="italic text-gray-400 dark:text-white/20">Professional headline</span>}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-gray-600 dark:text-white/40">
                  {profile.location && <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200/80 bg-white/80 px-3 py-1 dark:border-white/10 dark:bg-white/[0.04]"><IconMapPin size={13} />{profile.location}</span>}
                  {profile.availability && <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{profile.availability}</span>}
                  {profile.workPreference && <span className="rounded-full border border-gray-200/80 bg-white/80 px-3 py-1 dark:border-white/10 dark:bg-white/[0.04]">{profile.workPreference}</span>}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 self-start">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-gray-200/80 bg-white/80 p-3 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-white/30">{stat.label}</div>
                <div className="mt-2 text-2xl font-semibold text-gray-950 dark:text-white">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-7">
          <PreviewSection title="Overview">
            {profile.overview ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-white/55">{profile.overview}</p>
            ) : (
              <p className="text-xs italic text-gray-400 dark:text-white/20">No professional overview summary provided yet.</p>
            )}
          </PreviewSection>

          <PreviewSection title="Work history">
            {visibleExperience.length > 0 ? (
              <div className="space-y-4">
                {visibleExperience.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 dark:border-white/[0.06] dark:bg-white/[0.025]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-950 dark:text-white">{item.role || 'Role title'}</h4>
                        <div className="mt-1 text-xs font-medium text-[#FF6B00]">{item.company || 'Company'}</div>
                      </div>
                      <span className="text-[11px] text-gray-500 dark:text-white/35">{item.startDate || 'Start'} - {item.current ? 'Present' : item.endDate || 'End'}</span>
                    </div>
                    {(item.location || item.description) && (
                      <div className="mt-3 space-y-2">
                        {item.location && <div className="text-[11px] text-gray-500 dark:text-white/35">{item.location}</div>}
                        {item.description && <p className="text-xs leading-relaxed text-gray-600 dark:text-white/50">{item.description}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-gray-400 dark:text-white/20">No work experience entries added.</p>
            )}
          </PreviewSection>

          <PreviewSection title="Project proofs">
            {visibleProjects.length > 0 ? (
              <div className="space-y-3">
                {visibleProjects.map((item) => (
                  <div key={item.id} className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 dark:border-white/[0.06] dark:bg-white/[0.025]">
                    <div className="flex gap-3">
                      {item.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt="Project" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-gray-950 dark:text-white">{item.title || 'Project title'}</h4>
                        {item.description && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-white/45">{item.description}</p>}
                        <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-medium text-[#FF6B00]">
                          {item.link && <a href={normalizeUrl(item.link)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">Link <IconExternalLink size={12} /></a>}
                          {item.videoUrl && <span className="inline-flex items-center gap-1"><IconVideo size={12} /> Video</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-gray-400 dark:text-white/20">No project proofs added.</p>
            )}
          </PreviewSection>
        </div>

        <div className="space-y-5 xl:col-span-5">
          <PreviewSection title="Skills and focus">
            <div className="space-y-3">
              {profile.preferredRoles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.preferredRoles.map((role) => (
                    <span key={role} className="rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-800 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-[#FF914D]">{role}</span>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic text-gray-400 dark:text-white/20">No preferred roles specified</p>
              )}
              {profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700 dark:border-white/[0.07] dark:bg-white/[0.025] dark:text-white/50">{skill}</span>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic text-gray-400 dark:text-white/20">No skills added yet</p>
              )}
            </div>
          </PreviewSection>

          <PreviewSection title="Education">
            {visibleEducation.length > 0 ? (
              <div className="space-y-3 text-sm text-gray-700 dark:text-white/55">
                {visibleEducation.map((item) => (
                  <div key={item.id} className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 dark:border-white/[0.06] dark:bg-white/[0.025]">
                    <div className="font-semibold text-gray-950 dark:text-white">{item.school || 'School'}</div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-white/35">{[item.degree, item.field].filter(Boolean).join(', ') || 'Degree'} - {item.startYear || 'Start'} to {item.endYear || 'End'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-gray-400 dark:text-white/20">No education entries added.</p>
            )}
          </PreviewSection>

          <PreviewSection title="Links and media">
            {(profile.linkedin || profile.github || profile.portfolio || profile.introVideoUrl || profile.resumeFilename) ? (
              <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 xl:grid-cols-1">
                {profile.linkedin && <a href={normalizeUrl(profile.linkedin)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/70 px-3 py-2 text-blue-600 dark:border-white/[0.06] dark:bg-white/[0.025] dark:text-sky-300"><IconBrandLinkedin size={15} /> LinkedIn</a>}
                {profile.github && <a href={normalizeUrl(profile.github)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/70 px-3 py-2 text-gray-700 dark:border-white/[0.06] dark:bg-white/[0.025] dark:text-white/60"><IconBrandGithub size={15} /> GitHub</a>}
                {profile.portfolio && <a href={normalizeUrl(profile.portfolio)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/70 px-3 py-2 text-[#FF6B00] dark:border-white/[0.06] dark:bg-white/[0.025]"><IconWorld size={15} /> Portfolio</a>}
                {profile.introVideoUrl && <a href={normalizeUrl(profile.introVideoUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/70 px-3 py-2 text-[#FF6B00] dark:border-white/[0.06] dark:bg-white/[0.025]"><IconVideo size={15} /> Intro video</a>}
                {profile.resumeUrl && <a href={normalizeUrl(profile.resumeUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/70 px-3 py-2 text-gray-600 dark:border-white/[0.06] dark:bg-white/[0.025] dark:text-white/45 hover:text-orange-500"><IconFileText size={15} /> {profile.resumeFilename || 'View Resume'}</a>}
              </div>
            ) : (
              <p className="text-xs italic text-gray-400 dark:text-white/20">No external links or media added yet.</p>
            )}
          </PreviewSection>
        </div>
      </div>
    </motion.div>
  )
}

function getMissingProfileSections(profile: TalentProfile | null): string[] {
  if (!profile) return []
  const missing: string[] = []
  if (!(profile.firstName?.trim() || profile.lastName?.trim()) || !profile.email?.trim() || !profile.headline?.trim() || !profile.location?.trim() || !profile.photoUrl) {
    missing.push('Identity')
  }
  if (!profile.overview?.trim() || !profile.availability?.trim() || !profile.workPreference?.trim()) {
    missing.push('Positioning')
  }
  if (!profile.skills || profile.skills.length === 0) {
    missing.push('Skills and languages')
  }
  const hasValidExp = Array.isArray(profile.experience) &&
    profile.experience.length > 0 &&
    profile.experience.some(exp => exp.company?.trim() || exp.role?.trim())
  if (!hasValidExp) {
    missing.push('Experience')
  }
  const hasValidEdu = Array.isArray(profile.education) &&
    profile.education.length > 0 &&
    profile.education.some(edu => edu.school?.trim() || edu.degree?.trim())
  if (!hasValidEdu) {
    missing.push('Education')
  }
  return missing
}

export default function ProfileTab({ profile, onProfileChange, isLoading = false }: ProfileTabProps) {
  const [formState, setFormState] = useState<TalentProfile | null>(profile)
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const [pendingProfilePhoto, setPendingProfilePhoto] = useState<string | null>(null)
  const [pendingProjectImage, setPendingProjectImage] = useState<{ projectId: string; imageSrc: string } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const supabase = createBrowserSupabaseClient()

  const uploadToStorage = async (fileOrBlob: File | Blob, pathPrefix: string, originalName?: string) => {
    setIsUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const extFromName = originalName && originalName.includes('.') ? originalName.split('.').pop() : undefined
      const ext = (extFromName || fileOrBlob.type.split('/')[1] || 'bin').toLowerCase()
      const filename = `${pathPrefix}-${crypto.randomUUID()}.${ext}`
      const filePath = `${user.id}/${filename}`

      const { data, error } = await supabase.storage.from('talent-assets').upload(filePath, fileOrBlob, {
        cacheControl: '3600',
        upsert: false
      })
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from('talent-assets').getPublicUrl(filePath)
      return publicUrl
    } catch (e) {
      console.error("Upload error", e)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    setFormState(profile)
  }, [profile])

  const set = <K extends keyof TalentProfile>(key: K, value: TalentProfile[K]) => {
    setFormState((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const saveProfile = (p = formState) => {
    if (!p) return
    onProfileChange(p)
    setIsEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  const updateExperience = (id: string, updates: Partial<TalentExperience>) => {
    if (!formState) return
    set('experience', formState.experience.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const updateEducation = (id: string, updates: Partial<TalentEducation>) => {
    if (!formState) return
    set('education', formState.education.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const updateProject = (id: string, updates: Partial<TalentProject>) => {
    if (!formState) return
    set('projects', formState.projects.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const handleVerify = (id: string) => {
    setVerifyingId(id)
    setTimeout(() => {
      updateExperience(id, { payslipVerified: true })
      setVerifyingId(null)
    }, 1200)
  }

  const addExperience = () => {
    setFormState((prev) => (prev ? { ...prev, experience: [...prev.experience, newExperience()] } : prev))
  }

  const addEducation = () => {
    setFormState((prev) => (prev ? { ...prev, education: [...prev.education, newEducation()] } : prev))
  }

  const addProject = () => {
    setFormState((prev) => (prev ? { ...prev, projects: [...prev.projects, newProject()] } : prev))
  }

  const handleImageFile = (file: File | undefined, onLoad: (dataUrl: string) => void) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => onLoad(String(event.target?.result ?? ''))
    reader.readAsDataURL(file)
  }

  const completionPercentage = useMemo(() => {
    return calculateCompletionPercentage(formState)
  }, [formState])

  const missingProfileSections = useMemo(() => {
    return getMissingProfileSections(formState)
  }, [formState])


  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (!formState) {
    return <EmptyState onCreate={() => router.push('/talent/onboarding')} />
  }

  return (
    <div className="h-full min-h-0 [&_button:not(:disabled)]:cursor-pointer">
      <section className={`${surface} flex min-h-[42rem] flex-col overflow-hidden lg:min-h-0 lg:h-full`}>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 px-5 py-5 dark:border-white/[0.07]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FF6B00]">Talent Profile</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-950 dark:text-white">
                {isEditing ? 'Edit your profile' : 'Your profile'}
              </h1>
              <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-semibold text-[#FF6B00] dark:bg-orange-500/10 dark:text-[#FF914D]">
                {completionPercentage}% Complete
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start">
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/talent/onboarding')}
              title="Restart profile setup via onboarding"
              aria-label="Restart setup"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:bg-white/[0.035] dark:text-white/75 dark:hover:bg-white/[0.05] dark:hover:text-white"
            >
              <IconRotate2 size={18} />
            </motion.button>
            {isEditing ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => saveProfile()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,107,0,0.18)]"
              >
                {saved ? <IconCheck size={16} /> : <IconDeviceFloppy size={16} />}
                {saved ? 'Saved' : 'Save'}
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-950 dark:border-white/10 dark:bg-white/[0.035] dark:text-white/80 dark:hover:bg-white/[0.05] dark:hover:text-white"
              >
                Edit
              </motion.button>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-5 custom-scrollbar">
          <AnimatePresence initial={false} mode="wait">
            {isEditing ? (
              <motion.div key="profile-edit" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22, ease: 'easeOut' }} className="space-y-4">
                <FormSection title="Identity" highlight={missingProfileSections.includes('Identity')}>
                  <div className="mb-5 flex items-center gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-orange-50 dark:border-white/10 dark:bg-white/[0.03]">
                      {formState.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={formState.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center text-lg font-bold text-[#FF6B00]">{initials(formState.firstName, formState.lastName)}</span>
                      )}
                    </div>
                    <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => { handleImageFile(event.target.files?.[0], setPendingProfilePhoto); event.target.value = ''; }} />
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => photoInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:bg-white/[0.035] dark:text-white/55 dark:hover:bg-white/[0.06] dark:hover:text-white" disabled={isUploading}>
                        {isUploading ? <IconLoader2 size={15} className="animate-spin" /> : <IconCamera size={15} />}
                        {formState.photoUrl ? 'Change photo' : 'Upload photo'}
                      </button>
                      {formState.photoUrl && <button type="button" onClick={() => set('photoUrl', null)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 cursor-pointer hover:bg-red-100 hover:text-red-700 dark:border-red-500/15 dark:bg-red-500/[0.07] dark:text-red-300 dark:hover:bg-red-500/20">Remove</button>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="First name" required><input className={fieldClass} value={formState.firstName} onChange={(e) => set('firstName', e.target.value)} /></Field>
                    <Field label="Last name" required><input className={fieldClass} value={formState.lastName} onChange={(e) => set('lastName', e.target.value)} /></Field>
                    <div className="sm:col-span-2"><Field label="Email" required><input type="email" className={fieldClass + " disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:dark:bg-white/5"} value={formState.email} disabled onChange={(e) => set('email', e.target.value)} /></Field></div>
                    <div className="sm:col-span-2"><Field label="Headline" required><input className={fieldClass} value={formState.headline} onChange={(e) => set('headline', e.target.value)} placeholder="Frontend engineer building polished SaaS apps" /></Field></div>
                    <div className="sm:col-span-2">
                      <Field label="Location">
                        <LocationPicker value={formState.location} onChange={(value) => set('location', value)} />
                      </Field>
                    </div>
                  </div>
                </FormSection>
                <FormSection title="Positioning" highlight={missingProfileSections.includes('Positioning')}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Availability"><CustomSelect value={formState.availability} options={AVAILABILITY_OPTIONS} onChange={(value) => set('availability', value)} /></Field>
                    <Field label="Work preference"><CustomSelect value={formState.workPreference} options={WORK_PREFERENCES} onChange={(value) => set('workPreference', value)} /></Field>
                    <Field label="Preferred roles"><CsvField value={formState.preferredRoles} onChange={(value) => set('preferredRoles', value)} /></Field>
                    <Field label="Rate or salary preference"><input className={fieldClass} value={formState.hourlyRate} onChange={(e) => set('hourlyRate', e.target.value)} /></Field>
                    <div className="sm:col-span-2"><Field label="Overview" required><textarea className={fieldClass} rows={5} value={formState.overview} onChange={(e) => set('overview', e.target.value)} /></Field></div>
                  </div>
                </FormSection>

                <FormSection title="Skills and languages" highlight={missingProfileSections.includes('Skills and languages')}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Skills" required><CsvField rows={4} value={formState.skills} onChange={(value) => set('skills', value)} /></Field>
                    <Field label="Languages"><CsvField rows={4} value={formState.languages} onChange={(value) => set('languages', value)} /></Field>
                  </div>
                </FormSection>

                <FormSection title="Experience" highlight={missingProfileSections.includes('Experience')} action={<button type="button" onClick={addExperience} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-xs font-semibold text-[#FF6B00] hover:bg-orange-100 dark:border-orange-500/20 dark:bg-orange-500/10 dark:hover:bg-orange-500/15"><IconPlus size={14} /> Add</button>}>
                  <div className="space-y-4">
                    {formState.experience.map((item) => (
                      <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.035)] dark:border-white/[0.06] dark:bg-white/[0.025]">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500 dark:text-white/35">Work entry</span>
                          <button type="button" onClick={() => set('experience', formState.experience.filter((exp) => exp.id !== item.id))} className="text-xs font-medium text-red-500">Remove</button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <Field label="Role"><input className={fieldClass} value={item.role} onChange={(e) => updateExperience(item.id, { role: e.target.value })} /></Field>
                          <Field label="Company"><input className={fieldClass} value={item.company} onChange={(e) => updateExperience(item.id, { company: e.target.value })} /></Field>
                          <Field label="Location"><input className={fieldClass} value={item.location} onChange={(e) => updateExperience(item.id, { location: e.target.value })} /></Field>
                          <Field label="Start"><input className={fieldClass} value={item.startDate} onChange={(e) => updateExperience(item.id, { startDate: e.target.value })} /></Field>
                          <Field label="End"><input className={fieldClass} value={item.current ? 'Present' : item.endDate} disabled={item.current} onChange={(e) => updateExperience(item.id, { endDate: e.target.value })} /></Field>
                          <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-white/45 sm:col-span-2">
                            <input type="checkbox" checked={item.current} onChange={(e) => updateExperience(item.id, { current: e.target.checked, endDate: e.target.checked ? '' : item.endDate })} className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#FF6B00] focus:ring-orange-500" />
                            Currently working here / Present
                          </label>
                          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100 pt-3 mt-1 dark:border-white/5">
                            <div>
                              <Field label="Previous Salary"><input className={fieldClass} value={item.previousSalary || ''} onChange={(e) => updateExperience(item.id, { previousSalary: e.target.value })} placeholder="e.g. $80,000 / yr" /></Field>
                            </div>
                            <div className="flex flex-col justify-end">
                              <label className={labelClass}>Verification status</label>
                              {item.payslipVerified ? (
                                <div className="flex items-center gap-2 h-[46px] px-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-700 text-sm font-semibold dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                                  <IconCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                                  <span>Verified with payslips</span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  disabled={verifyingId === item.id}
                                  onClick={() => handleVerify(item.id)}
                                  className="flex items-center justify-center gap-2 h-[46px] w-full rounded-xl border border-dashed border-orange-300 bg-orange-50/30 text-[#FF6B00] hover:bg-orange-50 hover:border-orange-400 text-xs font-semibold transition-all disabled:opacity-75 dark:border-orange-500/30 dark:bg-orange-500/5 dark:hover:bg-orange-500/10 dark:hover:border-orange-500/40"
                                >
                                  {verifyingId === item.id ? (
                                    <>
                                      <IconLoader2 size={16} className="animate-spin" />
                                      <span>Uploading & verifying...</span>
                                    </>
                                  ) : (
                                    <>
                                      <IconFileText size={16} />
                                      <span>Verify with payslips</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="sm:col-span-2"><Field label="Impact"><textarea className={fieldClass} rows={3} value={item.description} onChange={(e) => updateExperience(item.id, { description: e.target.value })} placeholder="Describe outcomes, ownership, and measurable impact." /></Field></div>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addExperience} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:border-orange-200 hover:text-[#FF6B00] dark:border-white/10 dark:bg-transparent dark:text-white/50"><IconPlus size={15} /> Add another experience</button>
                  </div>
                </FormSection>

                <FormSection title="Education" highlight={missingProfileSections.includes('Education')} action={<button type="button" onClick={addEducation} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-xs font-semibold text-[#FF6B00] hover:bg-orange-100 dark:border-orange-500/20 dark:bg-orange-500/10 dark:hover:bg-orange-500/15"><IconPlus size={14} /> Add</button>}>
                  <div className="space-y-4">
                    {formState.education.map((item) => (
                      <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.035)] dark:border-white/[0.06] dark:bg-white/[0.025]">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500 dark:text-white/35">Education entry</span>
                          <button type="button" onClick={() => set('education', formState.education.filter((edu) => edu.id !== item.id))} className="text-xs font-medium text-red-500">Remove</button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <Field label="School"><input className={fieldClass} value={item.school} onChange={(e) => updateEducation(item.id, { school: e.target.value })} /></Field>
                          <Field label="Degree"><input className={fieldClass} value={item.degree} onChange={(e) => updateEducation(item.id, { degree: e.target.value })} /></Field>
                          <Field label="Field"><input className={fieldClass} value={item.field} onChange={(e) => updateEducation(item.id, { field: e.target.value })} /></Field>
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="From"><input className={fieldClass} value={item.startYear} onChange={(e) => updateEducation(item.id, { startYear: e.target.value })} placeholder="2020" /></Field>
                            <Field label="To"><input className={fieldClass} value={item.endYear} onChange={(e) => updateEducation(item.id, { endYear: e.target.value })} placeholder="2024" /></Field>
                          </div>
                          <div className="sm:col-span-2"><Field label="Description"><textarea className={fieldClass} rows={2} value={item.description || ''} onChange={(e) => updateEducation(item.id, { description: e.target.value })} placeholder="Notable achievements, coursework, or clubs." /></Field></div>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addEducation} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:border-orange-200 hover:text-[#FF6B00] dark:border-white/10 dark:bg-transparent dark:text-white/50"><IconPlus size={15} /> Add another education</button>
                  </div>
                </FormSection>

                <FormSection title="Project proofs" action={<button type="button" onClick={addProject} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-xs font-semibold text-[#FF6B00] hover:bg-orange-100 dark:border-orange-500/20 dark:bg-orange-500/10 dark:hover:bg-orange-500/15"><IconPlus size={14} /> Add</button>}>
                  <div className="space-y-4">
                    {formState.projects.map((item) => (
                      <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.035)] dark:border-white/[0.06] dark:bg-white/[0.025]">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500 dark:text-white/35">Project entry</span>
                          <button type="button" onClick={() => set('projects', formState.projects.filter((project) => project.id !== item.id))} className="text-xs font-medium text-red-500">Remove</button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <Field label="Title"><input className={fieldClass} value={item.title} onChange={(e) => updateProject(item.id, { title: e.target.value })} /></Field>
                          <Field label="Link"><input type="url" className={fieldClass} value={item.link} onChange={(e) => updateProject(item.id, { link: e.target.value })} /></Field>
                          <Field label="Video URL"><input type="url" className={fieldClass} value={item.videoUrl} onChange={(e) => updateProject(item.id, { videoUrl: e.target.value })} /></Field>
                          <Field label="Image"><input type="file" accept="image/*" className="block w-full text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:text-xs file:font-medium file:text-[#FF6B00] dark:text-white/35 dark:file:bg-orange-500/10" onChange={(event) => handleImageFile(event.target.files?.[0], (dataUrl) => setPendingProjectImage({ projectId: item.id, imageSrc: dataUrl }))} /></Field>
                          <div className="sm:col-span-2"><Field label="Description"><textarea className={fieldClass} rows={3} value={item.description} onChange={(e) => updateProject(item.id, { description: e.target.value })} /></Field></div>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addProject} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:border-orange-200 hover:text-[#FF6B00] dark:border-white/10 dark:bg-transparent dark:text-white/50"><IconPlus size={15} /> Add another project</button>
                  </div>
                </FormSection>

                <FormSection title="Links and media">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="LinkedIn"><input type="url" className={fieldClass} value={formState.linkedin} onChange={(e) => set('linkedin', e.target.value)} /></Field>
                    <Field label="GitHub"><input type="url" className={fieldClass} value={formState.github} onChange={(e) => set('github', e.target.value)} /></Field>
                    <Field label="Portfolio"><input type="url" className={fieldClass} value={formState.portfolio} onChange={(e) => set('portfolio', e.target.value)} /></Field>
                    <Field label="Intro video URL"><input type="url" className={fieldClass} value={formState.introVideoUrl} onChange={(e) => set('introVideoUrl', e.target.value)} /></Field>
                    <Field label="Resume">
                      <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={async (event) => {
                        const file = event.target.files?.[0]
                        if (!file) return
                        const publicUrl = await uploadToStorage(file, 'resume', file.name)
                        if (publicUrl) {
                          setFormState(prev => prev ? { ...prev, resumeFilename: file.name, resumeUrl: publicUrl } : prev)
                        }
                        event.target.value = ''
                      }} />
                      <button type="button" onClick={() => resumeInputRef.current?.click()} disabled={isUploading} className="inline-flex w-full items-center justify-between rounded-xl border border-dashed border-gray-300 bg-white/60 px-3 py-2.5 text-sm text-gray-600 cursor-pointer hover:bg-gray-100 hover:border-gray-400 dark:border-white/10 dark:bg-white/[0.025] dark:text-white/45 dark:hover:bg-white/[0.05] dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-white transition-all disabled:opacity-50">
                        <span>{formState.resumeFilename || 'Upload resume pdf'}</span>
                        {isUploading ? <IconLoader2 size={16} className="animate-spin" /> : <IconFileText size={16} />}
                      </button>
                    </Field>
                  </div>
                </FormSection>
              </motion.div>
            ) : (
              <motion.div key="profile-preview" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
                <ProfilePreview profile={formState} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <ImageCropModal
        imageSrc={pendingProfilePhoto}
        onCancel={() => setPendingProfilePhoto(null)}
        onApply={async (dataUrl) => {
          setPendingProfilePhoto(null)
          const response = await fetch(dataUrl)
          const blob = await response.blob()
          const publicUrl = await uploadToStorage(blob, 'profile')
          if (publicUrl) set('photoUrl', publicUrl)
        }}
      />
      <ImageCropModal
        imageSrc={pendingProjectImage?.imageSrc ?? null}
        onCancel={() => setPendingProjectImage(null)}
        onApply={async (dataUrl) => {
          const projectId = pendingProjectImage?.projectId
          setPendingProjectImage(null)
          if (projectId) {
            const response = await fetch(dataUrl)
            const blob = await response.blob()
            const publicUrl = await uploadToStorage(blob, 'project')
            if (publicUrl) updateProject(projectId, { imageUrl: publicUrl })
          }
        }}
        aspectRatio={16 / 9}
      />
    </div>
  )
}
