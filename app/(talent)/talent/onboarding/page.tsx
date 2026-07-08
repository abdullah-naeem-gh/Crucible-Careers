'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

import OnboardingWizard from '@/components/talent/onboarding/OnboardingWizard'
import OnboardingStep1 from '@/components/talent/onboarding/OnboardingStep1'
import OnboardingStep2, { type Step2Data } from '@/components/talent/onboarding/OnboardingStep2'
import OnboardingStep3, { type Step3Data } from '@/components/talent/onboarding/OnboardingStep3'
import OnboardingStep4, { type Step4Data } from '@/components/talent/onboarding/OnboardingStep4'
import OnboardingStep5, { newExperience } from '@/components/talent/onboarding/OnboardingStep5'
import OnboardingStep6, { newEducation } from '@/components/talent/onboarding/OnboardingStep6'
import OnboardingStep7, { newProject, type Step7Data } from '@/components/talent/onboarding/OnboardingStep7'
import OnboardingStep8, { type MatchedJob } from '@/components/talent/onboarding/OnboardingStep8'

import { JOBS } from '@/lib/talent/data/jobs'
import { createBlankTalentProfile, saveTalentProfile } from '@/lib/talent/services/profile.service'
import type { TalentEducation, TalentExperience } from '@/types/talent/profile'

// ─── Job matching ─────────────────────────────────────────────────────────────

function scoreJob(
  job: { title: string; description: string | null; tags?: string[] },
  skills: string[],
  roles: string[],
) {
  const haystack = `${job.title} ${job.description ?? ''} ${(job.tags ?? []).join(' ')}`.toLowerCase()
  let score = 0
  for (const s of skills) if (haystack.includes(s.toLowerCase())) score += 2
  for (const r of roles) if (haystack.includes(r.split(' ')[0].toLowerCase())) score += 3
  return score
}

function getMatchedJobs(skills: string[], roles: string[]): { count: number; topMatches: MatchedJob[] } {
  if (!skills.length && !roles.length) {
    return {
      count: JOBS.length,
      topMatches: JOBS.slice(0, 3).map((j) => ({ title: j.title, company: j.company, matchReason: 'Trending now' })),
    }
  }

  const scored = JOBS.map((job) => ({ job, score: scoreJob(job, skills, roles) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  const count = Math.max(scored.length, 5)
  const topMatches = scored.slice(0, 3).map(({ job }) => {
    const matchedSkill = skills.find((s) =>
      `${job.title} ${job.description ?? ''}`.toLowerCase().includes(s.toLowerCase()),
    )
    return { title: job.title, company: job.company, matchReason: matchedSkill ? `Matches "${matchedSkill}"` : 'Fits your profile' }
  })

  if (!topMatches.length) {
    return {
      count: JOBS.length,
      topMatches: JOBS.slice(0, 3).map((j) => ({ title: j.title, company: j.company, matchReason: 'Recommended for you' })),
    }
  }

  return { count, topMatches }
}

// ─── Slide variants ───────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -56 : 56, opacity: 0 }),
}

// ─── Steps that allow "I'll do this later" (0-indexed) ────────────────────────
const SKIPPABLE_STEPS = new Set([4, 5])

// ─── Inner content ────────────────────────────────────────────────────────────

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const firstName = searchParams.get('name') ?? ''

  useEffect(() => {
    const html = document.documentElement
    const hadDark = html.classList.contains('dark')
    const hadThemeDark = html.classList.contains('dashboard-theme-dark')

    html.classList.remove('dark', 'dashboard-theme-dark')
    html.classList.add('light', 'dashboard-theme-light')

    return () => {
      html.classList.remove('light', 'dashboard-theme-light')
      if (hadDark) html.classList.add('dark')
      if (hadThemeDark) html.classList.add('dashboard-theme-dark')
    }
  }, [])

  const [step, setStep] = useState(0)
  const [dir, setDir] = useState<1 | -1>(1)
  const [isSaving, setIsSaving] = useState(false)

  // ── Step 2: Basics ──
  const [s2, setS2] = useState<Step2Data>({
    headline: '',
    location: '',
    languagesStr: 'English',
  })

  // ── Step 3: Work style ──
  const [s3, setS3] = useState<Step3Data>({
    availability: 'Open to work',
    workPreference: 'Remote',
    preferredRoles: [],
    hourlyRate: '',
  })

  // ── Step 4: Skills ──
  const [s4, setS4] = useState<Step4Data>({ skills: [] })

  // ── Step 5: Experience ──
  const [experience, setExperience] = useState<TalentExperience[]>([newExperience()])

  // ── Step 6: Education ──
  const [education, setEducation] = useState<TalentEducation[]>([newEducation()])

  // ── Step 7: Projects & Links ──
  const [s7, setS7] = useState<Step7Data>({
    projects: [],
    overview: '',
    linkedin: '',
    github: '',
    portfolio: '',
    introVideoUrl: '',
  })

  // ── Match computation (memoised) ──
  const { count: matchCount, topMatches } = useMemo(
    () => getMatchedJobs(s4.skills, s3.preferredRoles),
    [s4.skills, s3.preferredRoles],
  )

  // ── Navigation ──
  const goNext = () => { setDir(1); setStep((s) => Math.min(s + 1, 7)) }
  const goBack = () => { setDir(-1); setStep((s) => Math.max(s - 1, 0)) }
  const skip = goNext // "I'll do this later" just advances

  // ── Gate per step ──
  const canContinue = (() => {
    if (step === 1) return s2.headline.trim() !== ''
    if (step === 3) return s4.skills.length > 0
    return true
  })()

  // ── Finish ──
  const saveProfile = async () => {
    setIsSaving(true)
    try {
      const blank = createBlankTalentProfile()
      const profile = {
        ...blank,
        firstName: '', // Handled by backend from auth session
        lastName: '', // Handled by backend from auth session
        headline: s2.headline,
        email: '', // Handled by backend from auth session
        location: s2.location,
        languages: s2.languagesStr.split(',').map((l) => l.trim()).filter(Boolean),
        availability: s3.availability,
        workPreference: s3.workPreference,
        preferredRoles: s3.preferredRoles,
        hourlyRate: s3.hourlyRate,
        skills: s4.skills,
        experience,
        education,
        projects: s7.projects,
        overview: s7.overview,
        linkedin: s7.linkedin,
        github: s7.github,
        portfolio: s7.portfolio,
        introVideoUrl: s7.introVideoUrl,
      }
      await saveTalentProfile(profile)
    } catch (err) {
      console.error('Error saving profile:', err)
      // In a real app, you might want to show a toast here
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = async () => {
    if (step === 6) {
      await saveProfile()
      goNext()
    } else {
      goNext()
    }
  }

  const isCelebrationStep = step === 7
  const isWelcomeStep = step === 0

  return (
    <main className="min-h-screen w-full relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-gray-50" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-16 left-16 w-80 h-80 bg-gradient-to-r from-[#FF6B00] to-[#FF914D] rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-16 w-72 h-72 bg-gradient-to-r from-gray-200 to-white rounded-full mix-blend-multiply filter blur-3xl" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-5 left-6 z-30">
        <Link href="/" className="text-sm font-bold text-gray-800 tracking-tight">
          Crucible<span className="text-[#FF6B00]">.</span>
        </Link>
      </div>
      <div className="absolute top-5 right-5 z-30">
        <button
          onClick={() => router.push('/talent/dashboard?tab=jobs')}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip for now →
        </button>
      </div>

      {/* Card */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-lg"
        >
          <div className="rounded-[28px] border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_24px_64px_rgba(0,0,0,0.08)] px-7 py-7">
            <OnboardingWizard currentStep={step} direction={dir}>
              {/* Animated step body */}
              <div className="overflow-hidden">
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={step}
                    custom={dir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    {step === 0 && <OnboardingStep1 firstName={firstName} />}
                    {step === 1 && <OnboardingStep2 data={s2} onChange={setS2} />}
                    {step === 2 && <OnboardingStep3 data={s3} onChange={setS3} />}
                    {step === 3 && <OnboardingStep4 data={s4} onChange={setS4} />}
                    {step === 4 && <OnboardingStep5 experience={experience} onChange={setExperience} />}
                    {step === 5 && <OnboardingStep6 education={education} onChange={setEducation} />}
                    {step === 6 && <OnboardingStep7 data={s7} onChange={setS7} />}
                    {step === 7 && (
                      <OnboardingStep8
                        firstName={firstName}
                        skills={s4.skills}
                        preferredRoles={s3.preferredRoles}
                        matchCount={matchCount}
                        topMatches={topMatches}
                        onExplore={() => router.push(`/talent/dashboard?tab=jobs&onboarded=1&name=${encodeURIComponent(firstName)}`)}
                        isSaving={isSaving}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </OnboardingWizard>

            {/* Navigation footer — hidden on celebration step (has its own CTA) */}
            {!isCelebrationStep && (
              <div className="flex items-center mt-7 pt-5 border-t border-gray-100">
                {/* Back */}
                {step > 0 ? (
                  <button onClick={goBack} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
                    ← Back
                  </button>
                ) : (
                  <span />
                )}

                <div className="ml-auto flex items-center gap-3">
                  {/* "I'll do this later" — only on skippable steps */}
                  {SKIPPABLE_STEPS.has(step) && (
                    <button
                      onClick={skip}
                      className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      I&rsquo;ll do this later →
                    </button>
                  )}

                  {/* Continue */}
                  <motion.button
                    onClick={handleNext}
                    whileHover={canContinue && !isSaving ? { scale: 1.02 } : {}}
                    whileTap={canContinue && !isSaving ? { scale: 0.97 } : {}}
                    disabled={!canContinue || isSaving}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                      canContinue && !isSaving
                        ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white shadow-md shadow-orange-200/60 hover:shadow-orange-300/70'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSaving ? 'Saving...' : isWelcomeStep ? 'Get started →' : step === 6 ? 'See my matches →' : 'Continue →'}
                  </motion.button>
                </div>
              </div>
            )}
          </div>

          {!isCelebrationStep && (
            <p className="text-center text-[11px] text-gray-400 mt-3.5">
              All fields are editable from your dashboard at any time
            </p>
          )}
        </motion.div>
      </div>
    </main>
  )
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function TalentOnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  )
}
