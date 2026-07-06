'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/shared/supabase/client'

type UserType = 'talent' | 'employer'

interface CheckEmailPageProps {
  userType: UserType
}

const roleTheme = {
  talent: {
    badge: 'Almost There',
    title: 'Verify Your',
    titleAccent: 'Email Address',
    description:
      'We sent a confirmation link to your email. Click it to activate your account and join the talent pool.',
    benefits: [
      'One-click verification',
      'Secure account activation',
      'Start your career journey',
    ],
    cardClass: 'bg-white/80 border-white/20',
    headingClass: 'text-gray-900',
    textClass: 'text-gray-600',
    navClass: 'text-gray-600 hover:text-gray-900',
    badgeClass: 'bg-orange-100 text-[#FF6B00]',
    loginPath: '/talent/login',
    signupPath: '/talent/signup',
    background: (
      <>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-gray-50" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-[#FF6B00] to-[#FF914D] rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
          <div className="absolute bottom-24 right-20 w-72 h-72 bg-gradient-to-r from-gray-200 to-white rounded-full mix-blend-multiply filter blur-xl" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </>
    ),
  },
  employer: {
    badge: 'Almost There',
    title: 'Verify Your',
    titleAccent: 'Email Address',
    description:
      'We sent a confirmation link to your employer email. Click it to activate your account and start hiring.',
    benefits: [
      'One-click verification',
      'Secure account activation',
      'Access your hiring dashboard',
    ],
    cardClass: 'bg-white/10 border-white/20',
    headingClass: 'text-white',
    textClass: 'text-gray-300',
    navClass: 'text-white/80 hover:text-white',
    badgeClass: 'bg-white/10 text-white border border-white/20',
    loginPath: '/employer/login',
    signupPath: '/employer/signup',
    background: (
      <>
        <div className="absolute inset-0 bg-[#1A1A1A]/95" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-[#FF6B00]/30 to-[#FF914D]/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
          <div className="absolute bottom-24 right-20 w-72 h-72 bg-gradient-to-r from-gray-800 to-gray-600 rounded-full mix-blend-multiply filter blur-xl" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </>
    ),
  },
}

export default function CheckEmailPage({ userType }: CheckEmailPageProps) {
  const theme = roleTheme[userType]
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [secondsRemaining, setSecondsRemaining] = useState(0)

  useEffect(() => {
    if (secondsRemaining <= 0) return
    const timeout = window.setTimeout(
      () => setSecondsRemaining((s) => s - 1),
      1000
    )
    return () => window.clearTimeout(timeout)
  }, [secondsRemaining])

  const resendEmail = async () => {
    if (secondsRemaining > 0 || isLoading || !email) return
    setIsLoading(true)
    setError('')
    try {
      const supabase = createBrowserSupabaseClient()
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      })
      if (resendError) throw resendError
      setSecondsRemaining(30)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend email.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen w-full relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0">{theme.background}</div>

      <div className="relative z-10 flex flex-col min-h-screen px-6">
        <nav className="relative z-20 py-4">
          <Link
            href={theme.loginPath}
            className={`inline-flex items-center transition-colors ${theme.navClass}`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Login
          </Link>
        </nav>

        <div className="flex-1 flex items-center justify-center py-8">
          <div className="w-full max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 items-center">

              {/* Left Side — info + benefits */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left flex flex-col justify-center"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mb-4"
                >
                  <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium ${theme.badgeClass}`}>
                    <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse" />
                    {theme.badge}
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className={`text-3xl lg:text-4xl font-bold mb-4 leading-tight ${theme.headingClass}`}
                >
                  {theme.title}
                  <br />
                  <span className="text-[#FF6B00]">{theme.titleAccent}</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className={`text-base mb-6 leading-relaxed ${theme.textClass}`}
                >
                  {theme.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="space-y-3"
                >
                  {theme.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-[#FF6B00] rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className={`text-sm ${theme.textClass}`}>{benefit}</span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right Side — email verification card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`backdrop-blur-sm rounded-2xl p-6 shadow-xl border flex flex-col justify-center ${theme.cardClass}`}
              >
                <div className="text-center">
                  {/* Envelope icon */}
                  <div className="w-14 h-14 bg-[#FF6B00] rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z"
                      />
                    </svg>
                  </div>

                  <h2 className={`text-xl font-bold mb-2 ${theme.headingClass}`}>
                    Check Your Email
                  </h2>

                  <p className={`text-sm mb-5 ${theme.textClass}`}>
                    We sent a confirmation link to{' '}
                    <span className="font-semibold text-[#FF6B00]">
                      {email || 'your email'}
                    </span>
                    . Click the link to activate your account.
                  </p>

                  {/* Resend button */}
                  <motion.button
                    type="button"
                    disabled={secondsRemaining > 0 || isLoading}
                    onClick={resendEmail}
                    whileHover={secondsRemaining > 0 ? undefined : { scale: 1.02 }}
                    whileTap={secondsRemaining > 0 ? undefined : { scale: 0.98 }}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-base transition-all ${
                      secondsRemaining > 0 || isLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#FF6B00] to-[#FF914D] hover:shadow-lg'
                    } text-white`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Sending...
                      </div>
                    ) : secondsRemaining > 0 ? (
                      `Resend in ${secondsRemaining}s`
                    ) : (
                      'Resend Email'
                    )}
                  </motion.button>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-sm text-red-500"
                    >
                      {error}
                    </motion.p>
                  )}

                  <p className={`mt-5 text-xs ${theme.textClass}`}>
                    Wrong email?{' '}
                    <Link
                      href={theme.signupPath}
                      className="text-[#FF6B00] hover:underline font-medium"
                    >
                      Sign up again
                    </Link>
                  </p>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
