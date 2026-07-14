'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconFileText,
} from '@tabler/icons-react'
import { FormConfig, FormField, EmployerJob } from '@/types/employer/job'
import { FORM_TEMPLATES } from '@/lib/shared/formTemplates'
import { loadTalentProfile } from '@/lib/talent/services/profile.service'
import { computeExperienceYears } from '@/lib/shared/experienceYears'
import { createBrowserSupabaseClient } from '@/lib/shared/supabase/client'
import type { TalentProfile } from '@/types/talent/profile'

function buildInitialValue(field: FormField, profile: TalentProfile | null): any {
  if (field.type === 'multi-select') {
    if (field.semanticType === 'skills' && profile?.skills?.length && field.options?.length) {
      return profile.skills.filter((s) => field.options!.some((o) => o.toLowerCase() === s.toLowerCase()))
    }
    return []
  }
  if (field.type === 'checkbox') return false

  switch (field.semanticType) {
    case 'name':
      return profile ? `${profile.firstName} ${profile.lastName}`.trim() : ''
    case 'email':
      return profile?.email || ''
    case 'location':
      return profile?.location || ''
    case 'experience_years':
      return profile?.experience?.length ? computeExperienceYears(profile.experience) : ''
    case 'skills':
      if (profile?.skills?.length) {
        if (field.type === 'select' && field.options?.length) {
          return field.options.find((o) => profile.skills.some((s) => s.toLowerCase() === o.toLowerCase())) || ''
        }
        return profile.skills.join(', ')
      }
      return ''
    case 'linkedin':
      return profile?.linkedin || ''
    case 'github':
      return profile?.github || ''
    case 'portfolio':
      return profile?.portfolio || ''
    case 'cover_letter':
      return profile?.overview || ''
    default:
      return ''
  }
}

export default function ApplyFormPage() {
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug

  const [job, setJob] = useState<EmployerJob | null>(null)
  const [jobNotFound, setJobNotFound] = useState(false)
  const [profile, setProfile] = useState<TalentProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [fieldsData, setFieldsData] = useState<Record<string, any>>({})
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Load the real job (and its form_config) from the API
  useEffect(() => {
    if (!slug) return
    fetch(`/api/talent/jobs/${slug}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: EmployerJob) => setJob(data))
      .catch(() => setJobNotFound(true))
    fetch(`/api/talent/jobs/${slug}/view`, { method: 'POST' }).catch(() => {})
  }, [slug])

  // Load the real talent profile
  useEffect(() => {
    loadTalentProfile().then(({ profile: p }) => {
      setProfile(p)
      setProfileLoading(false)
    })
  }, [])

  const formConfig = useMemo<FormConfig>(() => {
    if (job?.formConfig) return job.formConfig
    return FORM_TEMPLATES.find((t) => t.id === 'comprehensive') || FORM_TEMPLATES[0]
  }, [job])

  // Prefill form fields once the job and profile are both resolved
  useEffect(() => {
    if (!job || profileLoading) return
    const initialData: Record<string, any> = {}
    formConfig.fields.forEach((field) => {
      initialData[field.id] = buildInitialValue(field, profile)
    })
    setFieldsData(initialData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job, profileLoading])

  const handleChange = (fieldId: string, value: any) => {
    setFieldsData(prev => ({ ...prev, [fieldId]: value }))
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const next = { ...prev }
        delete next[fieldId]
        return next
      })
    }
  }

  const handleCheckboxGroupChange = (fieldId: string, option: string, checked: boolean) => {
    const current = (fieldsData[fieldId] as string[]) || []
    const next = checked ? [...current, option] : current.filter(o => o !== option)
    handleChange(fieldId, next)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    let isValid = true

    formConfig.fields.forEach(field => {
      if (!field.required) return

      if (field.type === 'file') {
        if (!resumeFile && !profile?.resumeUrl) {
          errors[field.id] = 'Resume is required.'
          isValid = false
        }
        return
      }

      const val = fieldsData[field.id]

      if (field.type === 'multi-select') {
        if (!val || val.length === 0) {
          errors[field.id] = `${field.label} is required.`
          isValid = false
        }
      } else if (field.type === 'checkbox') {
        if (!val) {
          errors[field.id] = `You must agree to the ${field.label}.`
          isValid = false
        }
      } else {
        if (val === undefined || val === null || String(val).trim() === '') {
          errors[field.id] = `${field.label} is required.`
          isValid = false
        }
      }
    })

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!job) return
    if (!validateForm()) return
    if (!profile) return

    setSubmitting(true)

    try {
      let resumeUrl: string | undefined
      let resumeFilename: string | undefined

      if (resumeFile) {
        const supabase = createBrowserSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const ext = (resumeFile.name.includes('.') ? resumeFile.name.split('.').pop() : 'pdf') || 'pdf'
        const filePath = `${user.id}/application-resume-${crypto.randomUUID()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('talent-assets')
          .upload(filePath, resumeFile, { cacheControl: '3600', upsert: false })
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage.from('talent-assets').getPublicUrl(filePath)
        resumeUrl = publicUrl
        resumeFilename = resumeFile.name
      }

      const findField = (semanticType: string) => formConfig.fields.find(f => f.semanticType === semanticType)
      const valueOf = (field: FormField | undefined) => (field ? fieldsData[field.id] ?? '' : '')

      const coverLetter = valueOf(findField('cover_letter'))

      const skillsValue = valueOf(findField('skills'))
      const skills = Array.isArray(skillsValue)
        ? skillsValue
        : (skillsValue ? String(skillsValue).split(',').map((s: string) => s.trim()).filter(Boolean) : [])

      const standardAnswers = {
        name: valueOf(findField('name')),
        email: valueOf(findField('email')),
        phone: valueOf(findField('phone')),
        location: valueOf(findField('location')),
        experienceYears: Number(valueOf(findField('experience_years'))) || 0,
        skills,
        linkedin: valueOf(findField('linkedin')),
        github: valueOf(findField('github')),
        portfolio: valueOf(findField('portfolio')),
      }

      const customAnswers = formConfig.fields
        .filter(field => field.semanticType === 'custom')
        .map(field => ({
          fieldId: field.id,
          label: field.label,
          value: fieldsData[field.id],
          semanticType: field.semanticType || 'custom',
        }))

      const res = await fetch('/api/talent/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, resumeUrl, resumeFilename, coverLetter, standardAnswers, customAnswers }),
      })

      if (res.status === 201) {
        setSubmitted(true)
      } else if (res.status === 409) {
        const data = await res.json().catch(() => ({}))
        setSubmitError(data.error || "You've already applied to this job.")
      } else {
        setSubmitError('Something went wrong submitting your application. Please try again.')
      }
    } catch (err) {
      console.error('Failed to submit application', err)
      setSubmitError('Something went wrong submitting your application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderFieldInput = (field: FormField) => {
    const error = validationErrors[field.id]
    const val = fieldsData[field.id]
    const baseInputClass = `mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-900 transition-colors ${
      error ? 'border-red-400 focus:ring-red-200' : 'border-gray-300'
    }`

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            className={baseInputClass}
            value={val || ''}
            placeholder={field.placeholder}
            onChange={e => handleChange(field.id, e.target.value)}
          />
        )
      case 'paragraph':
        return (
          <textarea
            rows={4}
            className={baseInputClass}
            value={val || ''}
            placeholder={field.placeholder}
            onChange={e => handleChange(field.id, e.target.value)}
          />
        )
      case 'number':
        return (
          <input
            type="number"
            className={baseInputClass}
            value={val === undefined ? '' : val}
            placeholder={field.placeholder}
            onChange={e => handleChange(field.id, e.target.value === '' ? '' : Number(e.target.value))}
          />
        )
      case 'select':
        return (
          <select
            className={`${baseInputClass} cursor-pointer`}
            value={val || ''}
            onChange={e => handleChange(field.id, e.target.value)}
          >
            <option value="">Choose an option...</option>
            {(field.options || []).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )
      case 'multi-select':
        const selectedOptions = (val as string[]) || []
        return (
          <div className="mt-1.5 p-3 rounded-lg border border-gray-200 bg-gray-50/50 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(field.options || []).map(opt => {
              const isChecked = selectedOptions.includes(opt)
              return (
                <label key={opt} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                    onChange={e => handleCheckboxGroupChange(field.id, opt, e.target.checked)}
                  />
                  {opt}
                </label>
              )
            })}
          </div>
        )
      case 'radio':
        return (
          <div className="mt-2 space-y-2 pl-1">
            {(field.options || []).map(opt => (
              <label key={opt} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
                <input
                  type="radio"
                  name={field.id}
                  value={opt}
                  checked={val === opt}
                  className="border-gray-300 text-orange-500 focus:ring-orange-400"
                  onChange={() => handleChange(field.id, opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        )
      case 'checkbox':
        return (
          <label className="flex items-start gap-2.5 text-xs text-gray-600 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={!!val}
              className="mt-0.5 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
              onChange={e => handleChange(field.id, e.target.checked)}
            />
            <span>{field.label}</span>
          </label>
        )
      case 'file':
        return (
          <div className="mt-1.5 rounded-xl border-2 border-dashed border-gray-300 p-4 bg-gray-50/40">
            {profile?.resumeUrl && !resumeFile && (
              <div className="text-xs mb-3">
                <p className="text-gray-700 font-medium">Using resume on file</p>
                <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 underline">
                  {profile.resumeFilename || 'View resume'} ↗
                </a>
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-700">{profile?.resumeUrl ? 'Replace for this application' : 'Upload your PDF or Word document'}</p>
                <p className="text-[10px] text-gray-400">Max 5 MB file size</p>
              </div>
              <label className="btn-pill bg-[#FF6B00] text-white hover:bg-orange-600 text-xs px-3 py-1.5 rounded-lg cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={e => setResumeFile(e.target.files?.[0] || null)}
                />
                Choose file
              </label>
            </div>
            {resumeFile && (
              <div className="mt-3 flex items-center justify-between text-xs border-t border-gray-200/50 pt-2.5">
                <span className="text-gray-600 font-medium truncate max-w-[60%]">{resumeFile.name}</span>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 font-semibold"
                  onClick={() => setResumeFile(null)}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  if (jobNotFound) {
    return (
      <div className="min-h-screen bg-white text-gray-900 grid place-items-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Job not found</h1>
          <p className="mt-2 text-sm text-gray-500">This role may have been closed or removed.</p>
          <Link href="/talent/dashboard" className="mt-6 inline-block px-5 py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white rounded-xl text-xs font-semibold">
            Browse other jobs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">Crucible</Link>
          <Link href="/employer" className="btn-secondary-link text-sm">For Employers</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <motion.h1
            className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {job?.title || 'Loading role...'}
          </motion.h1>
          <motion.p
            className="text-gray-600 mt-2 text-sm"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            {job ? `${job.company} · ${job.location}` : ''}
          </motion.p>
        </div>

        <AnimatePresence initial={false} mode="wait">
          {!submitted ? (
            <motion.form
              key="apply-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <section className="lg:col-span-2 space-y-6">
                {/* Has profile: show summary preview */}
                {profile && (
                  <div className="space-y-4 rounded-2xl border border-orange-500/10 bg-orange-50/15 p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-lg font-bold text-[#FF6B00]">
                        {profile.firstName ? profile.firstName[0] : 'U'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{`${profile.firstName} ${profile.lastName}`.trim()}</h3>
                        <p className="text-xs text-gray-500">{profile.headline}</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100/50 pt-3 text-xs space-y-2 text-gray-600">
                      <div><span className="font-semibold">Email:</span> {profile.email}</div>
                      {profile.location && <div><span className="font-semibold">Location:</span> {profile.location}</div>}
                      {profile.skills && profile.skills.length > 0 && (
                        <div>
                          <span className="font-semibold block mb-1">Skills:</span>
                          <div className="flex flex-wrap gap-1">
                            {profile.skills.map((s: string) => (
                              <span key={s} className="bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded text-[10px]">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] text-[#FF6B00] font-medium bg-orange-500/5 p-2.5 rounded-lg border border-orange-500/10">
                      ✓ Crucible Profile attached. Fields below are pre-filled from your profile — review and edit anything before submitting.
                    </div>
                  </div>
                )}

                {/* No profile: show Crucible Profile Required warning */}
                {!profileLoading && !profile && (
                  <div className="space-y-5 rounded-2xl border border-red-200 bg-red-500/[0.03] p-8 text-center shadow-sm">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-500/10 text-red-500">
                      <IconFileText size={28} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">Crucible Profile Required</h3>
                      <p className="text-xs text-gray-500 dark:text-white/45 max-w-md mx-auto leading-relaxed">
                        To apply for this role, you must first set up your Crucible Careers profile. A Crucible Profile is required to submit application credentials.
                      </p>
                    </div>
                    <div className="pt-3">
                      <Link
                        href="/talent/dashboard?tab=profile"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
                      >
                        Build your Crucible Profile
                      </Link>
                    </div>
                  </div>
                )}

                {/* Application fields */}
                {profile && (
                  <div className="space-y-4 bg-gray-50/20 rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2.5">Application Details</h2>
                    <div className="space-y-4">
                      {formConfig.fields.map(field => {
                        const error = validationErrors[field.id]
                        if (field.type === 'checkbox') {
                          return (
                            <div key={field.id} className="pt-2">
                              {renderFieldInput(field)}
                              {error && <span className="text-[10px] text-red-500 font-semibold block mt-1">{error}</span>}
                            </div>
                          )
                        }
                        return (
                          <div key={field.id} className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-700">
                              {field.label}
                              {field.required && <span className="text-orange-500 ml-0.5">*</span>}
                            </label>
                            {renderFieldInput(field)}
                            {error && <span className="text-[10px] text-red-500 font-semibold block mt-1">{error}</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </section>

              <aside className="lg:col-span-1 space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="font-bold text-base text-gray-900 mb-2">Submit application</h3>
                  <p className="text-xs text-gray-500 mb-4">Make sure you have completed all mandatory questions marked with *.</p>

                  {submitError && (
                    <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                      {submitError}
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-5 py-3 text-sm font-semibold text-white cursor-pointer shadow-[0_8px_20px_rgba(255,107,0,0.15)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    whileTap={{ scale: 0.98 }}
                    disabled={submitting || !job || !profile}
                  >
                    {submitting ? 'Submitting…' : !profile ? 'Profile Required' : 'Apply now'}
                  </motion.button>
                  <p className="text-[10px] text-gray-400 text-center mt-3">By applying you agree to our Terms and Privacy Policy.</p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50/45 p-5">
                  <h3 className="font-bold text-sm text-gray-900 mb-3">About this role</h3>
                  <ul className="text-xs text-gray-600 list-disc pl-4 space-y-2">
                    <li>Company: {job?.company}</li>
                    <li>Location: {job?.location}</li>
                    <li>Type: {job?.type}</li>
                    {job?.salary && <li>Salary: {job.salary}</li>}
                  </ul>
                </div>
              </aside>
            </motion.form>
          ) : (
            <motion.div
              key="apply-success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="max-w-xl mx-auto text-center py-20"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="mx-auto mb-6 w-16 h-16 rounded-full bg-green-100 text-green-700 grid place-items-center"
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900">Application submitted!</h2>
              <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                Thank you for applying. Your application has been saved and is currently being processed by the hiring team.
              </p>
              <div className="flex items-center justify-center gap-3 mt-8">
                <Link href="/talent/dashboard?tab=applications" className="px-5 py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white rounded-xl text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity">
                  Track application
                </Link>
                <Link href="/" className="px-5 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  Back to home
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
