
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBriefcase,
  IconCheck,
  IconChevronDown,
  IconCamera,
  IconDeviceFloppy,
  IconExternalLink,
  IconFileText,
  IconMapPin,
  IconPlus,
  IconRotate2,
  IconTrash,
  IconVideo,
  IconWorld,
} from '@tabler/icons-react'
import Stepper, { Step } from '@/components/talent/profile/Stepper'
import { TalentEducation, TalentExperience, TalentProfile, TalentProject } from '@/types/talent/profile'
import { createBlankTalentProfile, upsertTalentProfile, calculateCompletionPercentage } from '@/lib/talent/services/profile.service'
import ImageCropModal from '@/components/ui/ImageCropModal'
import LocationPicker from '@/components/ui/LocationPicker'

interface ProfileTabProps {
  profiles: TalentProfile[]
  onProfilesChange: (profiles: TalentProfile[]) => void
}

const surface = 'rounded-[24px] border border-gray-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-white/[0.07] dark:bg-[#171717] dark:shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)]'
const insetSurface = 'rounded-2xl border border-gray-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.065] dark:bg-[#141414] dark:shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2),inset_-1px_-1px_3px_rgba(255,255,255,0.025)]'
const labelClass = 'mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/35'
const fieldClass = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 dark:border-white/[0.08] dark:bg-[#121212] dark:text-white dark:placeholder:text-white/20'
const selectClass = fieldClass + ' cursor-pointer'
const WORK_PREFERENCES = ['Remote', 'On-site', 'Hybrid']
const AVAILABILITY_OPTIONS = ['Open to work', 'Available immediately', 'Available in 2 weeks', 'Available in 1 month', 'Not actively looking']

const newExperience = (): TalentExperience => ({
  id: `exp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  company: '',
  role: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
})

const newEducation = (): TalentEducation => ({
  id: `edu-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  school: '',
  degree: '',
  field: '',
  startYear: '',
  endYear: '',
  description: '',
})

const newProject = (): TalentProject => ({
  id: `project-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  title: '',
  description: '',
  link: '',
  imageDataUrl: null,
  videoUrl: '',
})

function splitList(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function joinList(value: string[]) {
  return value.join(', ')
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'TP'
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase()
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

function nextProfileName(count: number) {
  return 'Profile ' + (count + 1)
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

  return (
    <motion.div
      key={profile.id + profile.updatedAt + profile.name + profile.headline}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <div className={`${insetSurface} p-4`}>
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-orange-100 to-white dark:border-white/[0.08] dark:from-[#FF6B00]/20 dark:to-[#FF914D]/10">
            {profile.photoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoDataUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span className="absolute inset-0 grid place-items-center text-lg font-bold text-[#FF6B00]">{initials(profile.name)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold text-gray-950 dark:text-white">
              {profile.name || <span className="text-gray-400 dark:text-white/25">Your name</span>}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-white/45">
              {profile.headline || <span className="italic text-gray-400 dark:text-white/20">Professional headline</span>}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-500 dark:text-white/35">
              {profile.location && <span className="inline-flex items-center gap-1"><IconMapPin size={13} />{profile.location}</span>}
              {profile.availability && <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{profile.availability}</span>}
              {profile.workPreference && <span className="rounded-md border border-gray-200 px-2 py-0.5 dark:border-white/10">{profile.workPreference}</span>}
            </div>
          </div>
        </div>
      </div>

      <PreviewSection title="Overview">
        {profile.overview ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-white/55">{profile.overview}</p>
        ) : (
          <p className="text-xs italic text-gray-400 dark:text-white/20">No professional overview summary provided yet.</p>
        )}
      </PreviewSection>

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

      <PreviewSection title="Work history">
        {visibleExperience.length > 0 ? (
          <div className="space-y-4">
            {visibleExperience.map((item) => (
              <div key={item.id} className="border-l-2 border-orange-200 pl-3 dark:border-orange-500/25">
                <h4 className="text-sm font-semibold text-gray-950 dark:text-white">{item.role || 'Role title'}</h4>
                <div className="mt-1 flex flex-wrap justify-between gap-2 text-xs text-gray-500 dark:text-white/35">
                  <span className="font-medium text-[#FF6B00]">{item.company || 'Company'}</span>
                  <span>{item.startDate || 'Start'} - {item.current ? 'Present' : item.endDate || 'End'}</span>
                </div>
                {item.description && <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-white/50">{item.description}</p>}
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
                  {item.imageDataUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageDataUrl} alt="Project" className="h-14 w-16 shrink-0 rounded-lg object-cover" />
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

      <PreviewSection title="Education">
        {visibleEducation.length > 0 ? (
          <div className="space-y-3 text-sm text-gray-700 dark:text-white/55">
            {visibleEducation.map((item) => (
              <div key={item.id}>
                <div className="font-semibold text-gray-950 dark:text-white">{item.school || 'School'}</div>
                <div className="text-xs text-gray-500 dark:text-white/35">{[item.degree, item.field].filter(Boolean).join(', ') || 'Degree'} - {item.startYear || 'Start'} to {item.endYear || 'End'}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-gray-400 dark:text-white/20">No education entries added.</p>
        )}
      </PreviewSection>

      {(profile.linkedin || profile.github || profile.portfolio || profile.introVideoUrl || profile.resumeFilename) && (
        <PreviewSection title="Links and media">
          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
            {profile.linkedin && <a href={normalizeUrl(profile.linkedin)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 dark:text-sky-300"><IconBrandLinkedin size={15} /> LinkedIn</a>}
            {profile.github && <a href={normalizeUrl(profile.github)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gray-700 dark:text-white/60"><IconBrandGithub size={15} /> GitHub</a>}
            {profile.portfolio && <a href={normalizeUrl(profile.portfolio)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#FF6B00]"><IconWorld size={15} /> Portfolio</a>}
            {profile.introVideoUrl && <a href={normalizeUrl(profile.introVideoUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#FF6B00]"><IconVideo size={15} /> Intro video</a>}
            {profile.resumeFilename && <span className="inline-flex items-center gap-2 text-gray-600 dark:text-white/45"><IconFileText size={15} /> {profile.resumeFilename}</span>}
          </div>
        </PreviewSection>
      )}
    </motion.div>
  )
}
function OnboardingModal({
  open,
  onClose,
  onCreate,
  defaultProfileName,
  existingProfile,
}: {
  open: boolean
  onClose: () => void
  onCreate: (profile: TalentProfile) => void
  defaultProfileName: string
  existingProfile?: TalentProfile | null
}) {
  const [draft, setDraft] = useState<TalentProfile>(() => existingProfile || createBlankTalentProfile({
    profileName: 'My Profile',
    availability: 'Open to work',
    workPreference: 'Remote',
    languages: ['English'],
    education: [newEducation()],
    experience: [newExperience()],
    projects: [newProject()],
  }))

  useEffect(() => {
    if (open) {
      setDraft(existingProfile ? { ...existingProfile } : createBlankTalentProfile({
        profileName: 'My Profile',
        availability: 'Open to work',
        workPreference: 'Remote',
        languages: ['English'],
        education: [newEducation()],
        experience: [newExperience()],
        projects: [newProject()],
      }))
    }
  }, [open, existingProfile])

  const set = <K extends keyof TalentProfile>(key: K, value: TalentProfile[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const createProfile = () => {
    onCreate({
      ...draft,
      profileName: 'My Profile',
      updatedAt: new Date().toISOString(),
    })
  }

  const skipToManual = () => {
    onCreate(createBlankTalentProfile({
      profileName: 'My Profile',
      education: [newEducation()],
      experience: [newExperience()],
      projects: [newProject()],
    }))
  }

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 14, filter: 'blur(2px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 8, filter: 'blur(2px)' }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="solid-popup-modal max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] dark:border-white/[0.07] dark:bg-[#171717] [&_button:not(:disabled)]:cursor-pointer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-white/[0.07] sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FF6B00]">Profile setup</p>
                <h2 className="mt-1 text-xl font-semibold text-gray-950 dark:text-white">Set up your profile</h2>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={skipToManual} className="cursor-pointer hidden rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-white/45 dark:hover:bg-white/[0.04] sm:block">
                  Open full editor
                </button>
                <button type="button" onClick={onClose} className="cursor-pointer grid h-9 w-9 place-items-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-white/10 dark:text-white/45 dark:hover:bg-white/[0.04]">
                  x
                </button>
              </div>
            </div>
            <div className="max-h-[78vh] overflow-auto p-5 custom-scrollbar sm:p-6">
              <Stepper onFinalStepCompleted={createProfile} backButtonText="Previous" nextButtonText="Next">
                <Step>
                  <div className="grid min-h-[26rem] place-items-center text-center">
                    <div className="max-w-xl">
                      <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-orange-500/10 text-[#FF6B00]"><IconBriefcase size={30} /></div>
                      <h3 className="text-3xl font-semibold text-gray-950 dark:text-white">Create your talent profile</h3>
                      <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-white/45">
                        Add the essentials employers expect to see: your headline, skills, work history, education, project proofs, and links.
                      </p>
                      <button type="button" onClick={skipToManual} className="cursor-pointer mt-6 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 dark:border-white/10 dark:text-white/55 sm:hidden">
                        Open full editor
                      </button>
                    </div>
                  </div>
                </Step>
                <Step>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-gray-950 dark:text-white">Start with the basics</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Full name" required><input className={fieldClass} value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="Alex Johnson" /></Field>
                      <Field label="Professional headline" required><input className={fieldClass} value={draft.headline} onChange={(e) => set('headline', e.target.value)} placeholder="Frontend engineer building polished SaaS apps" /></Field>
                      <Field label="Email" required><input type="email" className={fieldClass} value={draft.email} onChange={(e) => set('email', e.target.value)} placeholder="alex@email.com" /></Field>
                      <div className="sm:col-span-2">
                        <Field label="Location">
                          <LocationPicker value={draft.location} onChange={(value) => set('location', value)} />
                        </Field>
                      </div>
                      <Field label="Languages"><CsvField value={draft.languages} onChange={(value) => set('languages', value)} placeholder="English, Urdu" /></Field>
                    </div>
                  </div>
                </Step>
                <Step>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-gray-950 dark:text-white">Define how you want to work</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Availability"><CustomSelect value={draft.availability} options={AVAILABILITY_OPTIONS} onChange={(value) => set('availability', value)} /></Field>
                      <Field label="Work preference"><CustomSelect value={draft.workPreference} options={WORK_PREFERENCES} onChange={(value) => set('workPreference', value)} /></Field>
                      <Field label="Preferred roles"><CsvField value={draft.preferredRoles} onChange={(value) => set('preferredRoles', value)} placeholder="Frontend Engineer, React Developer" /></Field>
                      <Field label="Rate or salary preference"><input className={fieldClass} value={draft.hourlyRate} onChange={(e) => set('hourlyRate', e.target.value)} placeholder="USD 35/hr or PKR 250k/mo" /></Field>
                    </div>
                  </div>
                </Step>
                <Step>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-gray-950 dark:text-white">Add searchable skills</h3>
                    <Field label="Skills" required><CsvField rows={6} value={draft.skills} onChange={(value) => set('skills', value)} placeholder="React, TypeScript, Next.js, Tailwind CSS" /></Field>
                    <p className="text-xs text-gray-500 dark:text-white/35">Use comma-separated skills. These become chips in the preview and help matching surfaces later.</p>
                  </div>
                </Step>
                <Step>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-2xl font-semibold text-gray-950 dark:text-white">Add work experience</h3>
                      <button type="button" onClick={() => set('experience', [...draft.experience, newExperience()])} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-xs font-semibold text-[#FF6B00] hover:bg-orange-100 dark:border-orange-500/20 dark:bg-orange-500/10"><IconPlus size={14} /> Add</button>
                    </div>
                    <div className="space-y-4 max-h-[48vh] overflow-y-auto pr-1 custom-scrollbar">
                      {draft.experience.map((item, index) => (
                        <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.035)] dark:border-white/[0.06] dark:bg-white/[0.025]">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 dark:text-white/35">Experience {index + 1}</span>
                            {draft.experience.length > 1 && <button type="button" onClick={() => set('experience', draft.experience.filter((entry) => entry.id !== item.id))} className="cursor-pointer text-xs font-medium text-red-500">Remove</button>}
                          </div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="Role"><input className={fieldClass} value={item.role} onChange={(e) => set('experience', draft.experience.map((entry) => entry.id === item.id ? { ...entry, role: e.target.value } : entry))} placeholder="Frontend Engineer" /></Field>
                            <Field label="Company"><input className={fieldClass} value={item.company} onChange={(e) => set('experience', draft.experience.map((entry) => entry.id === item.id ? { ...entry, company: e.target.value } : entry))} placeholder="TechCorp" /></Field>
                            <Field label="Start"><input className={fieldClass} value={item.startDate} onChange={(e) => set('experience', draft.experience.map((entry) => entry.id === item.id ? { ...entry, startDate: e.target.value } : entry))} placeholder="2023" /></Field>
                            <Field label="End"><input className={fieldClass} value={item.current ? 'Present' : item.endDate} disabled={item.current} onChange={(e) => set('experience', draft.experience.map((entry) => entry.id === item.id ? { ...entry, endDate: e.target.value } : entry))} placeholder="Present" /></Field>
                            <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-white/45 sm:col-span-2">
                              <input type="checkbox" checked={item.current} onChange={(e) => set('experience', draft.experience.map((entry) => entry.id === item.id ? { ...entry, current: e.target.checked, endDate: e.target.checked ? '' : entry.endDate } : entry))} className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#FF6B00] focus:ring-orange-500" />
                              Currently working here / Present
                            </label>
                            <div className="sm:col-span-2"><Field label="Impact"><textarea className={fieldClass} rows={3} value={item.description} onChange={(e) => set('experience', draft.experience.map((entry) => entry.id === item.id ? { ...entry, description: e.target.value } : entry))} placeholder="Describe outcomes, ownership, and measurable impact." /></Field></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Step>
                <Step>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-2xl font-semibold text-gray-950 dark:text-white">Add education</h3>
                      <button type="button" onClick={() => set('education', [...draft.education, newEducation()])} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-xs font-semibold text-[#FF6B00] hover:bg-orange-100 dark:border-orange-500/20 dark:bg-orange-500/10"><IconPlus size={14} /> Add</button>
                    </div>
                    <div className="space-y-4 max-h-[48vh] overflow-y-auto pr-1 custom-scrollbar">
                      {draft.education.map((item, index) => (
                        <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.035)] dark:border-white/[0.06] dark:bg-white/[0.025]">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 dark:text-white/35">Education {index + 1}</span>
                            {draft.education.length > 1 && <button type="button" onClick={() => set('education', draft.education.filter((entry) => entry.id !== item.id))} className="cursor-pointer text-xs font-medium text-red-500">Remove</button>}
                          </div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="School"><input className={fieldClass} value={item.school} onChange={(e) => set('education', draft.education.map((entry) => entry.id === item.id ? { ...entry, school: e.target.value } : entry))} placeholder="University name" /></Field>
                            <Field label="Degree"><input className={fieldClass} value={item.degree} onChange={(e) => set('education', draft.education.map((entry) => entry.id === item.id ? { ...entry, degree: e.target.value } : entry))} placeholder="BS Computer Science" /></Field>
                            <Field label="Field"><input className={fieldClass} value={item.field} onChange={(e) => set('education', draft.education.map((entry) => entry.id === item.id ? { ...entry, field: e.target.value } : entry))} placeholder="Software Engineering" /></Field>
                            <div className="grid grid-cols-2 gap-3">
                               <Field label="From"><input className={fieldClass} value={item.startYear} onChange={(e) => set('education', draft.education.map((entry) => entry.id === item.id ? { ...entry, startYear: e.target.value } : entry))} placeholder="2020" /></Field>
                               <Field label="To"><input className={fieldClass} value={item.endYear} onChange={(e) => set('education', draft.education.map((entry) => entry.id === item.id ? { ...entry, endYear: e.target.value } : entry))} placeholder="2024" /></Field>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Step>
                <Step>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-2xl font-semibold text-gray-950 dark:text-white">Add project proofs</h3>
                      <button type="button" onClick={() => set('projects', [...draft.projects, newProject()])} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-xs font-semibold text-[#FF6B00] hover:bg-orange-100 dark:border-orange-500/20 dark:bg-orange-500/10"><IconPlus size={14} /> Add</button>
                    </div>
                    <div className="space-y-4 max-h-[48vh] overflow-y-auto pr-1 custom-scrollbar">
                      {draft.projects.map((item, index) => (
                        <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.035)] dark:border-white/[0.06] dark:bg-white/[0.025]">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 dark:text-white/35">Project {index + 1}</span>
                            {draft.projects.length > 1 && <button type="button" onClick={() => set('projects', draft.projects.filter((entry) => entry.id !== item.id))} className="cursor-pointer text-xs font-medium text-red-500">Remove</button>}
                          </div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="Project title"><input className={fieldClass} value={item.title} onChange={(e) => set('projects', draft.projects.map((entry) => entry.id === item.id ? { ...entry, title: e.target.value } : entry))} placeholder="AI recruiting dashboard" /></Field>
                            <Field label="Project link"><input type="url" className={fieldClass} value={item.link} onChange={(e) => set('projects', draft.projects.map((entry) => entry.id === item.id ? { ...entry, link: e.target.value } : entry))} placeholder="https://example.com" /></Field>
                            <Field label="Optional video URL"><input type="url" className={fieldClass} value={item.videoUrl} onChange={(e) => set('projects', draft.projects.map((entry) => entry.id === item.id ? { ...entry, videoUrl: e.target.value } : entry))} placeholder="Loom or YouTube link" /></Field>
                            <div className="sm:col-span-2"><Field label="Project summary"><textarea className={fieldClass} rows={3} value={item.description} onChange={(e) => set('projects', draft.projects.map((entry) => entry.id === item.id ? { ...entry, description: e.target.value } : entry))} placeholder="Explain the problem, your role, and the result." /></Field></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Step>
                <Step>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-gray-950 dark:text-white">Finish with intro and links</h3>
                    <Field label="Overview" required><textarea className={fieldClass} rows={5} value={draft.overview} onChange={(e) => set('overview', e.target.value)} placeholder="Write a concise client-facing profile overview." /></Field>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="LinkedIn"><input type="url" className={fieldClass} value={draft.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="linkedin.com/in/..." /></Field>
                      <Field label="GitHub"><input type="url" className={fieldClass} value={draft.github} onChange={(e) => set('github', e.target.value)} placeholder="github.com/..." /></Field>
                      <Field label="Portfolio"><input type="url" className={fieldClass} value={draft.portfolio} onChange={(e) => set('portfolio', e.target.value)} placeholder="your-site.com" /></Field>
                      <Field label="Intro video URL"><input type="url" className={fieldClass} value={draft.introVideoUrl} onChange={(e) => set('introVideoUrl', e.target.value)} placeholder="Loom or YouTube link" /></Field>
                    </div>
                  </div>
                </Step>
                <Step>
                  <div className="grid min-h-[26rem] gap-5 lg:grid-cols-2">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-950 dark:text-white">Review your profile</h3>
                      <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-white/45">Create the profile now, then continue refining every field in the full manual editor.</p>
                    </div>
                    <ProfilePreview profile={draft} />
                  </div>
                </Step>
              </Stepper>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
function getMissingProfileSections(profile: TalentProfile | null): string[] {
  if (!profile) return []
  const missing: string[] = []
  if (!profile.name?.trim() || !profile.email?.trim() || !profile.headline?.trim() || !profile.location?.trim() || !profile.photoDataUrl) {
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

export default function ProfileTab({ profiles, onProfilesChange }: ProfileTabProps) {
  const [activeProfileId, setActiveProfileId] = useState<string | null>(profiles[0]?.id ?? null)
  const [formState, setFormState] = useState<TalentProfile | null>(profiles[0] ?? null)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const [pendingProfilePhoto, setPendingProfilePhoto] = useState<string | null>(null)
  const [pendingProjectImage, setPendingProjectImage] = useState<{ projectId: string; imageSrc: string } | null>(null)

  const activeProfile = useMemo(
    () => profiles.find((profile) => profile.id === activeProfileId) ?? profiles[0] ?? null,
    [activeProfileId, profiles],
  )

  useEffect(() => {
    if (!profiles.length) {
      setActiveProfileId(null)
      setFormState(null)
      return
    }

    const nextActive = activeProfile ?? profiles[0]
    setActiveProfileId(nextActive.id)
    setFormState(nextActive)
  }, [activeProfile, profiles])

  const set = <K extends keyof TalentProfile>(key: K, value: TalentProfile[K]) => {
    setFormState((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const saveProfile = (profile = formState) => {
    if (!profile) return
    const nextProfiles = upsertTalentProfile(profiles, profile)
    onProfilesChange(nextProfiles)
    setActiveProfileId(profile.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  const createProfile = (profile: TalentProfile) => {
    const nextProfile = { ...profile, isPrimary: profiles.length === 0 }
    const next = upsertTalentProfile(profiles, nextProfile)
    onProfilesChange(next)
    setActiveProfileId(nextProfile.id)
    setFormState(nextProfile)
    setIsOnboardingOpen(false)
  }

  const removeProfile = (id: string) => {
    const next = profiles.filter((profile) => profile.id !== id)
    onProfilesChange(next)

    if (id === activeProfileId) {
      setActiveProfileId(next[0]?.id ?? null)
      setFormState(next[0] ?? null)
    }
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

  if (!formState) {
    return (
      <>
        <EmptyState onCreate={() => setIsOnboardingOpen(true)} />
        <OnboardingModal open={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} onCreate={createProfile} defaultProfileName="My Profile" existingProfile={profiles[0] || null} />
      </>
    )
  }

  return (
    <div className="h-full min-h-0 [&_button:not(:disabled)]:cursor-pointer">
      <div className="grid h-full min-h-0 grid-cols-1 gap-5 lg:grid-cols-9 lg:gap-7">
        <section className={`${surface} flex min-h-[42rem] flex-col overflow-hidden lg:col-span-5 lg:min-h-0 lg:h-full`}>
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-5 dark:border-white/[0.07]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FF6B00]">Talent Profile</p>
              <div className="flex items-center gap-3">
                <h1 className="mt-1 text-2xl font-semibold text-gray-950 dark:text-white">Build your profile</h1>
                <span className="mt-1 inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-semibold text-[#FF6B00] dark:bg-orange-500/10 dark:text-[#FF914D]">
                  {completionPercentage}% Complete
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOnboardingOpen(true)}
                title="Restart onboarding setup"
                aria-label="Restart setup"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:bg-white/[0.035] dark:text-white/75 dark:hover:bg-white/[0.05] dark:hover:text-white"
              >
                <IconRotate2 size={18} />
              </button>
              <button
                type="button"
                onClick={() => saveProfile()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,107,0,0.18)]"
              >
                <IconDeviceFloppy size={16} />
                {saved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-auto p-5 custom-scrollbar">
            <FormSection title="Identity" highlight={missingProfileSections.includes('Identity')}>
              <div className="mb-5 flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-orange-50 dark:border-white/10 dark:bg-white/[0.03]">
                  {formState.photoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formState.photoDataUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center text-lg font-bold text-[#FF6B00]">{initials(formState.name)}</span>
                  )}
                </div>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => { handleImageFile(event.target.files?.[0], setPendingProfilePhoto); event.target.value = ''; }} />
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => photoInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:bg-white/[0.035] dark:text-white/55 dark:hover:bg-white/[0.06] dark:hover:text-white">
                    <IconCamera size={15} /> {formState.photoDataUrl ? 'Change photo' : 'Upload photo'}
                  </button>
                  {formState.photoDataUrl && <button type="button" onClick={() => set('photoDataUrl', null)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 cursor-pointer hover:bg-red-100 hover:text-red-700 dark:border-red-500/15 dark:bg-red-500/[0.07] dark:text-red-300 dark:hover:bg-red-500/20">Remove</button>}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full name" required><input className={fieldClass} value={formState.name} onChange={(e) => set('name', e.target.value)} /></Field>
                <Field label="Email" required><input type="email" className={fieldClass} value={formState.email} onChange={(e) => set('email', e.target.value)} /></Field>
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
                      <div className="sm:col-span-2"><Field label="Description"><textarea className={fieldClass} rows={3} value={item.description} onChange={(e) => updateExperience(item.id, { description: e.target.value })} /></Field></div>
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
                      <Field label="Image"><input type="file" accept="image/*" className="block w-full text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:text-xs file:font-medium file:text-[#FF6B00] dark:text-white/35 dark:file:bg-orange-500/10" onChange={(event) => handleImageFile(event.target.files?.[0], (dataUrl) => updateProject(item.id, { imageDataUrl: dataUrl }))} /></Field>
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
                  <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(event) => set('resumeFilename', event.target.files?.[0]?.name ?? '')} />
                  <button type="button" onClick={() => resumeInputRef.current?.click()} className="inline-flex w-full items-center justify-between rounded-xl border border-dashed border-gray-300 bg-white/60 px-3 py-2.5 text-sm text-gray-600 cursor-pointer hover:bg-gray-100 hover:border-gray-400 dark:border-white/10 dark:bg-white/[0.025] dark:text-white/45 dark:hover:bg-white/[0.05] dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-white transition-all">
                    <span>{formState.resumeFilename || 'Upload resume metadata'}</span>
                    <IconFileText size={16} />
                  </button>
                </Field>
              </div>
            </FormSection>
          </div>
        </section>

        <section className={`${surface} min-h-[42rem] overflow-auto p-5 custom-scrollbar lg:col-span-4 lg:min-h-0 lg:h-full`}>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-white/30">Live preview</p>
          <ProfilePreview profile={activeProfile ?? formState} />
        </section>
      </div>

      <OnboardingModal open={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} onCreate={createProfile} defaultProfileName="My Profile" existingProfile={formState} />
      <ImageCropModal
        imageSrc={pendingProfilePhoto}
        onCancel={() => setPendingProfilePhoto(null)}
        onApply={(dataUrl) => {
          set('photoDataUrl', dataUrl)
          setPendingProfilePhoto(null)
        }}
      />
      <ImageCropModal
        imageSrc={pendingProjectImage?.imageSrc ?? null}
        onCancel={() => setPendingProjectImage(null)}
        onApply={(dataUrl) => {
          if (pendingProjectImage) {
            updateProject(pendingProjectImage.projectId, { imageDataUrl: dataUrl })
          }
          setPendingProjectImage(null)
        }}
        aspectRatio={16 / 9}
      />
    </div>
  )
}
