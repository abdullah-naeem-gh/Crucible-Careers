'use client'

import { Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

import EmployerOnboardingWizard from '@/components/employer/onboarding/EmployerOnboardingWizard'
import EmployerStep1 from '@/components/employer/onboarding/EmployerStep1'
import EmployerStep2, { type Step2Data } from '@/components/employer/onboarding/EmployerStep2'
import EmployerStep3, { type Step3Data } from '@/components/employer/onboarding/EmployerStep3'
import EmployerStep4, { type Step4Data } from '@/components/employer/onboarding/EmployerStep4'
import EmployerStep5, { type Step5Data } from '@/components/employer/onboarding/EmployerStep5'
import EmployerStep6, { type Step6Data } from '@/components/employer/onboarding/EmployerStep6'
import EmployerStep7 from '@/components/employer/onboarding/EmployerStep7'
import { saveEmployerProfile } from '@/lib/employer/services/profile.service'

// ─── Slide variants ──────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -56 : 56, opacity: 0 }),
}

// Steps 3, 4 are skippable (0-indexed)
const SKIPPABLE_STEPS = new Set([3, 4])

const PROFILE_STORAGE_KEY = 'recruiter_profile'

// ─── Inner content ───────────────────────────────────────────────────────────

function EmployerOnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const companyName = searchParams.get('name') ?? ''

  // Force dark theme for the duration of onboarding
  useEffect(() => {
    const html = document.documentElement
    const hadLight = html.classList.contains('light')
    const hadThemeLight = html.classList.contains('dashboard-theme-light')

    html.classList.remove('light', 'dashboard-theme-light')
    html.classList.add('dark', 'dashboard-theme-dark')
    html.style.colorScheme = 'dark'

    return () => {
      html.classList.remove('dark', 'dashboard-theme-dark')
      html.style.colorScheme = ''
      if (hadLight) html.classList.add('light')
      if (hadThemeLight) html.classList.add('dashboard-theme-light')
    }
  }, [])

  const [step, setStep] = useState(0)
  const [dir, setDir] = useState<1 | -1>(1)
  const [isSaving, setIsSaving] = useState(false)

  // ── Step 2: Company identity ──
  const [s2, setS2] = useState<Step2Data>({
    name: companyName,
    tagline: '',
    industry: '',
    companySize: '',
    founded: '',
    headquarters: '',
  })

  // ── Step 3: Online presence ──
  const [s3, setS3] = useState<Step3Data>({
    website: '',
    linkedin: '',
    twitter: '',
  })

  // ── Step 4: Overview & culture ──
  const [s4, setS4] = useState<Step4Data>({
    overview: '',
    culture: '',
  })

  // ── Step 5: Perks & tech ──
  const [s5, setS5] = useState<Step5Data>({
    benefits: [],
    techStack: [],
  })

  // ── Step 6: Logo ──
  const [s6, setS6] = useState<Step6Data>({ logoUrl: null })

  // ── Navigation ──
  const goNext = () => { setDir(1); setStep((s) => Math.min(s + 1, 6)) }
  const goBack = () => { setDir(-1); setStep((s) => Math.max(s - 1, 0)) }
  const skip = goNext

  // ── Gate per step ──
  const canContinue = (() => {
    if (step === 1) return s2.industry !== '' && s2.companySize !== '' && s2.headquarters.trim() !== ''
    if (step === 2) return s3.website.trim() !== ''
    return true
  })()

  // ── Save & redirect ──
  const saveProfile = async () => {
    setIsSaving(true)
    const profile = {
      name: s2.name,
      tagline: s2.tagline,
      industry: s2.industry,
      companySize: s2.companySize,
      founded: s2.founded,
      website: s3.website,
      headquarters: s2.headquarters,
      overview: s4.overview,
      culture: s4.culture,
      benefits: s5.benefits.join(', '),
      techStack: s5.techStack.join(', '),
      linkedin: s3.linkedin,
      twitter: s3.twitter,
      logoUrl: s6.logoUrl,
    }
    
    try {
      await saveEmployerProfile(profile)
    } catch (err) {
      console.error('Failed to save profile during onboarding:', err)
      // fallback just in case
      try {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
      } catch { /* ignore */ }
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = async () => {
    if (step === 5) {
      await saveProfile()
      goNext()
    } else {
      goNext()
    }
  }

  const isCelebrationStep = step === 6
  const isWelcomeStep = step === 0

  return (
    <main className="min-h-screen w-full relative overflow-x-hidden bg-[#0c0c0c]">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f0f] via-[#0c0c0c] to-[#111]" />
        {/* Subtle orange radial glow */}
        <div className="absolute inset-0 opacity-100">
          <div
            className="absolute"
            style={{
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '700px',
              height: '420px',
              background: 'radial-gradient(ellipse at 50% 0%, rgba(255,107,0,0.13) 0%, transparent 65%)',
            }}
          />
          <div
            className="absolute bottom-0 right-0"
            style={{
              width: '400px',
              height: '300px',
              background: 'radial-gradient(ellipse at bottom right, rgba(255,145,77,0.06) 0%, transparent 70%)',
            }}
          />
        </div>
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-5 left-6 z-30">
        <Link href="/" className="text-sm font-bold text-white tracking-tight">
          Crucible<span className="text-[#FF6B00]">.</span>
        </Link>
      </div>
      <div className="absolute top-5 right-5 z-30">
        <button
          onClick={() => router.push('/employer/dashboard?onboarded=1')}
          className="text-sm text-white/30 hover:text-white/60 transition-colors"
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
          <motion.div
            layout="position"
            transition={{ layout: { type: 'spring', stiffness: 350, damping: 35 } }}
            className="rounded-[28px] border border-white/[0.07] bg-[#161616]/90 backdrop-blur-xl shadow-[0_24px_64px_rgba(0,0,0,0.55)] px-7 py-7"
          >
            <EmployerOnboardingWizard currentStep={step} direction={dir}>
              {/* Animated step body — relative & overflow-hidden container lets popLayout position the exiting element correctly */}
              <div className="relative overflow-hidden -mx-2 px-2 -mb-2 pb-2">
                <AnimatePresence mode="popLayout" custom={dir}>
                  <motion.div
                    key={step}
                    custom={dir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="w-full shrink-0"
                  >
                    {step === 0 && <EmployerStep1 companyName={companyName} />}
                    {step === 1 && <EmployerStep2 data={s2} onChange={setS2} />}
                    {step === 2 && <EmployerStep3 data={s3} onChange={setS3} />}
                    {step === 3 && <EmployerStep4 data={s4} onChange={setS4} />}
                    {step === 4 && <EmployerStep5 data={s5} onChange={setS5} />}
                    {step === 5 && <EmployerStep6 data={s6} onChange={setS6} />}
                    {step === 6 && (
                      <EmployerStep7
                        companyName={s2.name || companyName}
                        industry={s2.industry}
                        companySize={s2.companySize}
                        onExplore={() => router.push(`/employer/dashboard?onboarded=1&name=${encodeURIComponent(s2.name || companyName)}`)}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </EmployerOnboardingWizard>

            {/* Navigation footer — hidden on celebration step */}
            {!isCelebrationStep && (
              <div className="flex items-center mt-7 pt-5 border-t border-white/[0.07]">
                {/* Back */}
                {step > 0 ? (
                  <button onClick={goBack} className="text-sm text-white/30 hover:text-white/60 transition-colors">
                    ← Back
                  </button>
                ) : (
                  <span />
                )}

                <div className="ml-auto flex items-center gap-3">
                  {/* "I'll do this later" on skippable steps */}
                  {SKIPPABLE_STEPS.has(step) && (
                    <button
                      onClick={skip}
                      className="text-sm text-white/30 hover:text-white/55 transition-colors"
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
                        ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white shadow-md shadow-orange-900/40 hover:shadow-orange-800/50'
                        : 'bg-white/[0.06] text-white/25 cursor-not-allowed'
                    }`}
                  >
                    {isSaving ? 'Saving...' : isWelcomeStep ? 'Get started →' : step === 5 ? 'Finish setup →' : 'Continue →'}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>

          {!isCelebrationStep && (
            <p className="text-center text-[11px] text-white/25 mt-3.5">
              All fields are editable from your dashboard at any time
            </p>
          )}
        </motion.div>
      </div>
    </main>
  )
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function EmployerOnboardingPage() {
  return (
    <Suspense>
      <EmployerOnboardingContent />
    </Suspense>
  )
}
