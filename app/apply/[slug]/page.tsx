'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

type ApplyFormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  website?: string
  linkedin?: string
  portfolio?: string
  github?: string
  coverLetter?: string
  consent: boolean
}

const initialData: ApplyFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  linkedin: '',
  portfolio: '',
  github: '',
  coverLetter: '',
  consent: false
}

export default function ApplyFormPage() {
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  const [data, setData] = useState<ApplyFormData>(initialData)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const jobInfo = useMemo(() => {
    if (!slug) return { title: 'Apply to this role', company: 'Company', location: '—' }
    const parts = slug.replace(/[-_]/g, ' ').split(' ')
    const title = parts
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    return { title, company: 'Hiring Company', location: 'Remote' }
  }, [slug])

  const handleChange = (field: keyof ApplyFormData, value: string | boolean) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const onUploadResume = (file: File | null) => {
    setResumeFile(file)
  }

  const autofillFromResume = () => {
    if (!resumeFile) return
    const nameGuess = resumeFile.name
      .replace(/\.(pdf|docx?|txt)$/i, '')
      .replace(/resume|cv|profile/gi, '')
      .replace(/[_-]+/g, ' ')
      .trim()

    const tokens = nameGuess.split(' ').filter(Boolean)
    const firstName = tokens[0] || data.firstName
    const lastName = tokens[1] || data.lastName
    setData(prev => ({
      ...prev,
      firstName: prev.firstName || firstName,
      lastName: prev.lastName || lastName
    }))
  }

  const isValid = useMemo(() => {
    return (
      data.firstName.trim() !== '' &&
      data.lastName.trim() !== '' &&
      /.+@.+\..+/.test(data.email) &&
      data.consent === true
    )
  }, [data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 900))
    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">Crucible</Link>
          <Link href="/employers" className="btn-secondary-link">For Employers</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <motion.h1
            className="text-3xl md:text-4xl font-semibold tracking-tight"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {jobInfo.title}
          </motion.h1>
          <motion.p
            className="text-gray-600 mt-2"
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
              <section className="lg:col-span-2 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First name</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={data.firstName}
                        onChange={e => handleChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last name</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={data.lastName}
                        onChange={e => handleChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={data.email}
                        onChange={e => handleChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={data.phone}
                        onChange={e => handleChange('phone', e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={data.location}
                        onChange={e => handleChange('location', e.target.value)}
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Website</label>
                      <input
                        type="url"
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={data.website}
                        onChange={e => handleChange('website', e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Resume</h2>
                  <div className="rounded-xl border-2 border-dashed border-gray-300 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-700">Upload your resume (.pdf, .docx)</p>
                        <p className="text-xs text-gray-500">Max 5 MB</p>
                      </div>
                      <label className="btn-pill btn-primary cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          className="hidden"
                          onChange={e => onUploadResume(e.target.files?.[0] ?? null)}
                        />
                        Choose file
                      </label>
                    </div>
                    {resumeFile ? (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-gray-700 truncate max-w-[60%]">{resumeFile.name}</span>
                        <button
                          type="button"
                          className="text-sm font-medium text-orange-600 hover:text-orange-700"
                          onClick={autofillFromResume}
                        >
                          Auto-fill from resume
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Links</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                      <input
                        type="url"
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={data.linkedin}
                        onChange={e => handleChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Portfolio</label>
                      <input
                        type="url"
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={data.portfolio}
                        onChange={e => handleChange('portfolio', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">GitHub</label>
                      <input
                        type="url"
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={data.github}
                        onChange={e => handleChange('github', e.target.value)}
                        placeholder="https://github.com/username"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Cover letter</h2>
                    <span className="text-xs text-gray-500">Optional</span>
                  </div>
                  <textarea
                    rows={5}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    value={data.coverLetter}
                    onChange={e => handleChange('coverLetter', e.target.value)}
                    placeholder="Briefly share why you're a great fit."
                  />
                </div>
              </section>

              <aside className="lg:col-span-1 space-y-6">
                <div className="rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold mb-3">Submit application</h3>
                  <p className="text-sm text-gray-600 mb-4">You can create an account after applying to track your status.</p>
                  <div className="flex items-start gap-2 mb-4">
                    <input
                      id="consent"
                      type="checkbox"
                      className="mt-1"
                      checked={data.consent}
                      onChange={e => handleChange('consent', e.target.checked)}
                    />
                    <label htmlFor="consent" className="text-sm text-gray-700">I agree to share my application with the employer.</label>
                  </div>
                  <motion.button
                    type="submit"
                    className="btn-pill btn-primary w-full"
                    whileTap={{ scale: 0.98 }}
                    disabled={!isValid || submitting}
                  >
                    {submitting ? 'Submitting…' : 'Apply now'}
                  </motion.button>
                  <p className="text-xs text-gray-500 mt-3">By applying you agree to our Terms and Privacy Policy.</p>
                </div>

                <div className="rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold mb-3">About this role</h3>
                  <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                    <li>Company: {jobInfo.company}</li>
                    <li>Location: {jobInfo.location}</li>
                    <li>Type: Full-time</li>
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
              <h2 className="text-2xl font-semibold">Application submitted!</h2>
              <p className="text-gray-600 mt-2">Create an account or log in to track your application: In review, Shortlisted, Interviews, Offer.</p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <Link href="/login/talent" className="btn-pill btn-primary">Login to track</Link>
                <Link href="/" className="btn-pill border border-gray-300">Back to home</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
