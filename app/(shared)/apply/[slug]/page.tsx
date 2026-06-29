'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FormConfig, FormField, EmployerJob } from '@/types/employer/job'
import { FORM_TEMPLATES } from '@/lib/shared/formTemplates'

export default function ApplyFormPage() {
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug

  const [job, setJob] = useState<EmployerJob | null>(null)
  const [fieldsData, setFieldsData] = useState<Record<string, any>>({})
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Load Job details from localStorage
  useEffect(() => {
    if (!slug) return
    try {
      const raw = localStorage.getItem('recruiter_jobs')
      if (raw) {
        const parsed = JSON.parse(raw) as EmployerJob[]
        const found = parsed.find(j => j.id === slug)
        if (found) {
          setJob(found)
          // Initialize form fields with empty values
          const initialData: Record<string, any> = {}
          const config = found.formConfig || FORM_TEMPLATES.find(t => t.id === 'comprehensive') || FORM_TEMPLATES[0]
          config.fields.forEach(f => {
            initialData[f.id] = f.type === 'multi-select' ? [] : f.type === 'checkbox' ? false : ''
          })
          setFieldsData(initialData)
        }
      }
    } catch (e) {
      console.error('Failed to load job details', e)
    }
  }, [slug])

  // Derive form config
  const formConfig = useMemo<FormConfig>(() => {
    if (job?.formConfig) return job.formConfig
    // Fallback template
    return FORM_TEMPLATES.find(t => t.id === 'comprehensive') || FORM_TEMPLATES[0]
  }, [job])

  // Extract job details for display
  const jobInfo = useMemo(() => {
    if (job) {
      return {
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        salary: job.salary
      }
    }
    // Fallback parsing from slug
    if (!slug) return { title: 'Apply to this role', company: 'Hiring Company', location: '—', type: 'Full-time', salary: undefined }
    const parts = slug.replace(/[-_]/g, ' ').split(' ')
    const title = parts
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    return { title, company: 'Hiring Company', location: 'Remote', type: 'Full-time', salary: undefined }
  }, [job, slug])

  const handleChange = (fieldId: string, value: any) => {
    setFieldsData(prev => ({ ...prev, [fieldId]: value }))
    // Clear validation error on change
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
      const val = fieldsData[field.id]

      // Check required
      if (field.required) {
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
        } else if (field.type === 'file') {
          if (!resumeFile) {
            errors[field.id] = `Resume file is required.`
            isValid = false
          }
        } else {
          if (val === undefined || val === null || String(val).trim() === '') {
            errors[field.id] = `${field.label} is required.`
            isValid = false
          }
        }
      }

      // Check specific formats if present
      if (val && String(val).trim() !== '') {
        if (field.semanticType === 'email' && !/.+@.+\..+/.test(String(val))) {
          errors[field.id] = 'Please enter a valid email address.'
          isValid = false
        }
        if (field.semanticType === 'linkedin' && !String(val).includes('linkedin.com')) {
          errors[field.id] = 'LinkedIn URL must contain linkedin.com'
          isValid = false
        }
      }
    })

    setValidationErrors(errors)
    return isValid
  }

  const autofillFromResume = () => {
    if (!resumeFile) return
    const nameGuess = resumeFile.name
      .replace(/\.(pdf|docx?|txt)$/i, '')
      .replace(/resume|cv|profile/gi, '')
      .replace(/[_-]+/g, ' ')
      .trim()

    const tokens = nameGuess.split(' ').filter(Boolean)
    const firstName = tokens[0] || ''
    const lastName = tokens[1] || ''
    const fullName = nameGuess

    // Fill standard name fields
    const nameField = formConfig.fields.find(f => f.semanticType === 'name')
    if (nameField) {
      handleChange(nameField.id, fullName)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)

    // Simulate network delay
    await new Promise(r => setTimeout(r, 1200))

    try {
      // 1. Gather all dynamic field responses
      const customAnswers = formConfig.fields.map(field => {
        let value = fieldsData[field.id]
        if (field.type === 'file') {
          value = resumeFile ? resumeFile.name : ''
        }
        return {
          fieldId: field.id,
          label: field.label,
          value,
          semanticType: field.semanticType
        }
      })

      // 2. Extract standard candidate fields from semantic types
      let name = 'Applicant'
      let email = 'applicant@example.com'
      let phone = '—'
      let location = 'Remote'
      let experienceYears = 0
      let skills: string[] = []
      let linkedin = ''
      let github = ''
      let portfolio = ''
      let coverLetter = ''

      formConfig.fields.forEach(field => {
        const val = fieldsData[field.id]
        if (field.semanticType === 'name' && val) name = String(val)
        if (field.semanticType === 'email' && val) email = String(val)
        if (field.semanticType === 'phone' && val) phone = String(val)
        if (field.semanticType === 'location' && val) location = String(val)
        if (field.semanticType === 'experience_years' && val) experienceYears = Number(val)
        if (field.semanticType === 'linkedin' && val) linkedin = String(val)
        if (field.semanticType === 'github' && val) github = String(val)
        if (field.semanticType === 'portfolio' && val) portfolio = String(val)
        if (field.semanticType === 'cover_letter' && val) coverLetter = String(val)

        if (field.semanticType === 'skills' && val) {
          if (Array.isArray(val)) {
            skills = [...skills, ...val]
          } else {
            skills = [...skills, ...String(val).split(',').map(s => s.trim()).filter(Boolean)]
          }
        }
      })

      // 3. Dynamic match score calculation based on tags & template weights
      let matchScore = 70 // Baseline
      const jobTags = job?.tags || []
      
      // Skills evaluation
      if (jobTags.length > 0 && skills.length > 0) {
        const normalizedTags = jobTags.map(t => t.toLowerCase())
        const matched = skills.filter(s => normalizedTags.includes(s.toLowerCase())).length
        const skillsMatchPct = Math.round((matched / jobTags.length) * 100)
        matchScore = Math.round((matchScore + skillsMatchPct) / 2)
      }

      // Experience evaluation
      const expField = formConfig.fields.find(f => f.semanticType === 'experience_years')
      if (expField && expField.expectedAnswer) {
        const expected = Number(expField.expectedAnswer)
        if (experienceYears >= expected) {
          matchScore = Math.min(matchScore + 15, 100)
        } else {
          matchScore = Math.max(matchScore - 20, 35)
        }
      }

      // Cap score bounds
      matchScore = Math.max(10, Math.min(100, matchScore))

      // 4. Construct Candidate Profile object
      const newCandidate = {
        id: `applicant_${Date.now()}`,
        name,
        title: job?.title || 'Applicant',
        location,
        appliedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        email,
        phone,
        bio: coverLetter || `Productive software enthusiast with ${experienceYears} years of experience.`,
        experienceYears,
        skills: skills.length > 0 ? skills : (job?.tags ? job.tags.slice(0, 3) : ['Development']),
        education: 'Bachelor in Computer Science',
        linkedin: linkedin || undefined,
        github: github || undefined,
        portfolio: portfolio || undefined,
        screeningStatus: 'unscreened',
        customAnswers
      }

      // 5. Prepend applicant details in localStorage
      const storageKey = `recruiter_job_${slug}_applicants`
      const rawApplicants = localStorage.getItem(storageKey)
      let currentApplicants = []
      if (rawApplicants) {
        currentApplicants = JSON.parse(rawApplicants)
      }
      const updatedApplicants = [newCandidate, ...currentApplicants]
      localStorage.setItem(storageKey, JSON.stringify(updatedApplicants))

      // 6. Update the job's application count in `recruiter_jobs`
      const rawJobs = localStorage.getItem('recruiter_jobs')
      if (rawJobs) {
        const parsedJobs = JSON.parse(rawJobs) as EmployerJob[]
        const updatedJobs = parsedJobs.map(j => {
          if (j.id === slug) {
            return {
              ...j,
              applications: updatedApplicants.length
            }
          }
          return j
        })
        localStorage.setItem('recruiter_jobs', JSON.stringify(updatedJobs))
      }

      setSubmitted(true)
    } catch (e) {
      console.error('Failed to submit application', e)
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
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-700">Upload your PDF or Word document</p>
                <p className="text-[10px] text-gray-400">Max 5 MB file size</p>
              </div>
              <label className="btn-pill bg-[#FF6B00] text-white hover:bg-orange-600 text-xs px-3 py-1.5 rounded-lg cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0] || null
                    setResumeFile(file)
                    if (file) {
                      handleChange(field.id, file.name)
                    }
                  }}
                />
                Choose file
              </label>
            </div>
            {resumeFile && (
              <div className="mt-3 flex items-center justify-between text-xs border-t border-gray-200/50 pt-2.5">
                <span className="text-gray-600 font-medium truncate max-w-[60%]">{resumeFile.name}</span>
                <button
                  type="button"
                  className="text-orange-500 hover:text-orange-600 font-semibold"
                  onClick={autofillFromResume}
                >
                  Auto-fill from resume
                </button>
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">Crucible</Link>
          <Link href="/employers" className="btn-secondary-link text-sm">For Employers</Link>
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
            {jobInfo.title}
          </motion.h1>
          <motion.p
            className="text-gray-600 mt-2 text-sm"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            {jobInfo.company} · {jobInfo.location}
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
                <div className="space-y-4 bg-gray-50/20 rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2.5">Candidate Intake Form</h2>
                  <div className="space-y-4">
                    {formConfig.fields.map(field => {
                      const error = validationErrors[field.id]
                      // Checkbox renders inside its wrapper, others have standard label
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
              </section>

              <aside className="lg:col-span-1 space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="font-bold text-base text-gray-900 mb-2">Submit application</h3>
                  <p className="text-xs text-gray-500 mb-4">Make sure you have completed all mandatory questions marked with *.</p>
                  
                  <motion.button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-5 py-3 text-sm font-semibold text-white cursor-pointer shadow-[0_8px_20px_rgba(255,107,0,0.15)] hover:opacity-90 transition-opacity"
                    whileTap={{ scale: 0.98 }}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting…' : 'Apply now'}
                  </motion.button>
                  <p className="text-[10px] text-gray-400 text-center mt-3">By applying you agree to our Terms and Privacy Policy.</p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50/45 p-5">
                  <h3 className="font-bold text-sm text-gray-900 mb-3">About this role</h3>
                  <ul className="text-xs text-gray-600 list-disc pl-4 space-y-2">
                    <li>Company: {jobInfo.company}</li>
                    <li>Location: {jobInfo.location}</li>
                    <li>Type: {jobInfo.type}</li>
                    {jobInfo.salary && <li>Salary: {jobInfo.salary}</li>}
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
                Thank you for applying. Your application containing your custom response data has been saved and is currently being processed by the hiring team.
              </p>
              <div className="flex items-center justify-center gap-3 mt-8">
                <Link href="/talent/login" className="px-5 py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white rounded-xl text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity">
                  Login to track
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
