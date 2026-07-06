'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@/lib/shared/supabase/client'

type UserType = 'talent' | 'employer'
type RecoveryState = 'verifying' | 'verified' | 'reset' | 'success' | 'error'

const roleTheme = {
  talent: {
    badge: 'Secure Recovery',
    titleAccent: 'Talent Account',
    cardClass: 'bg-white/80 border-white/20',
    headingClass: 'text-gray-900',
    textClass: 'text-gray-600',
    mutedClass: 'text-gray-500',
    navClass: 'text-gray-600 hover:text-gray-900',
    inputClass: 'border-gray-300 focus:ring-orange-200 focus:border-orange-400',
    badgeClass: 'bg-orange-100 text-[#FF6B00]',
    benefits: ['Verified email recovery', 'Secure password reset', 'Return to your talent dashboard'],
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
            backgroundSize: '40px 40px'
          }}
        />
      </>
    )
  },
  employer: {
    badge: 'Secure Recovery',
    titleAccent: 'Employer Account',
    cardClass: 'bg-white/10 border-white/20',
    headingClass: 'text-white',
    textClass: 'text-gray-300',
    mutedClass: 'text-gray-400',
    navClass: 'text-white/80 hover:text-white',
    inputClass: 'border-white/20 focus:ring-orange-200 focus:border-orange-400 bg-white/5 text-white placeholder-white/50',
    badgeClass: 'bg-white/10 text-white border border-white/20',
    benefits: ['Verified email recovery', 'Secure password reset', 'Return to your hiring dashboard'],
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
            backgroundSize: '40px 40px'
          }}
        />
      </>
    )
  }
}

const stateCopy = {
  verifying: {
    eyebrow: 'Verifying Email',
    title: 'Checking Your',
    cardTitle: 'Verifying Email',
    description: 'We are confirming that this reset link belongs to your account before allowing a password change.',
    cardDescription: 'Verifying your password reset link...',
    step: 'Step 2 of 3'
  },
  verified: {
    eyebrow: 'Email Verified',
    title: 'Email Confirmed',
    cardTitle: 'Email Verified',
    description: 'Your email has been verified. The reset form will appear in a moment so you can choose a new password.',
    cardDescription: 'Email verified. Redirecting you to reset your password...',
    step: 'Step 2 of 3'
  },
  reset: {
    eyebrow: 'Reset Password',
    title: 'Choose a New',
    cardTitle: 'Reset Password',
    description: 'Create a new password for your account. After it is saved, you can sign in with the updated credentials.',
    cardDescription: 'Enter and confirm your new password',
    step: 'Step 3 of 3'
  },
  success: {
    eyebrow: 'Password Changed',
    title: 'You Are Ready',
    cardTitle: 'Password Changed',
    description: 'Your password has been changed successfully. You will return to the login page to sign in again.',
    cardDescription: 'Your password has been changed successfully. Redirecting you to login...',
    step: 'Complete'
  },
  error: {
    eyebrow: 'Link Not Verified',
    title: 'Request a New',
    cardTitle: 'Link Not Verified',
    description: 'This recovery link could not be verified. Request a fresh email and continue the reset flow from there.',
    cardDescription: 'This password reset link is invalid or expired.',
    step: 'Action needed'
  }
}

function getRecoveryHashParams() {
  if (typeof window === 'undefined') return new URLSearchParams()
  return new URLSearchParams(window.location.hash.replace(/^#/, ''))
}

function StatusIcon({ recoveryState }: { recoveryState: RecoveryState }) {
  if (recoveryState === 'verifying') {
    return <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
  }

  if (recoveryState === 'error') {
    return (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  }

  return (
    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userType: UserType = searchParams.get('userType') === 'employer' ? 'employer' : 'talent'
  const theme = roleTheme[userType]
  const loginPath = `/${userType}/login`

  const [recoveryState, setRecoveryState] = useState<RecoveryState>('verifying')
  const [message, setMessage] = useState(stateCopy.verifying.cardDescription)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const copy = stateCopy[recoveryState]

  useEffect(() => {
    let redirectTimeout: number | undefined

    async function verifyRecoveryLink() {
      try {
        if (process.env.NODE_ENV !== 'production') {
          const preview = searchParams.get('preview')

          if (preview === 'verified') {
            setRecoveryState('verified')
            setMessage(stateCopy.verified.cardDescription)
            redirectTimeout = window.setTimeout(() => setRecoveryState('reset'), 2200)
            return
          }

          if (preview === 'reset') {
            setRecoveryState('reset')
            return
          }

          if (preview === 'success') {
            setRecoveryState('success')
            setMessage(stateCopy.success.cardDescription)
            return
          }
        }

        const supabase = createBrowserSupabaseClient()
        const tokenHash = searchParams.get('token_hash')
        const code = searchParams.get('code')
        const hashParams = getRecoveryHashParams()
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (tokenHash) {
          const type = (searchParams.get('type') || 'recovery') as EmailOtpType
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
          if (error) throw error
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          if (error) throw error
        } else {
          throw new Error('This password reset link is missing a verification token.')
        }

        setRecoveryState('verified')
        setMessage(stateCopy.verified.cardDescription)
        redirectTimeout = window.setTimeout(() => setRecoveryState('reset'), 2200)
      } catch (error) {
        setRecoveryState('error')
        setMessage(error instanceof Error ? error.message : stateCopy.error.cardDescription)
      }
    }

    verifyRecoveryLink()

    return () => {
      if (redirectTimeout) window.clearTimeout(redirectTimeout)
    }
  }, [searchParams])

  const submitNewPassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError('')

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      setRecoveryState('success')
      setMessage(stateCopy.success.cardDescription)
      window.setTimeout(() => router.replace(loginPath), 2500)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to change password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen w-full relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0">{theme.background}</div>

      <div className="relative z-10 flex flex-col min-h-screen px-6">
        <nav className="relative z-20 py-4">
          <Link href={loginPath} className={`inline-flex items-center transition-colors ${theme.navClass}`}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Login
          </Link>
        </nav>

        <div className="flex-1 flex items-center justify-center py-8">
          <div className="w-full max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 items-center h-full">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left flex flex-col justify-center h-full"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mb-4"
                >
                  <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium ${theme.badgeClass}`}>
                    <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse" />
                    {copy.eyebrow}
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className={`text-3xl lg:text-4xl font-bold mb-4 leading-tight ${theme.headingClass}`}
                >
                  {copy.title}<br />
                  <span className="text-[#FF6B00]">{theme.titleAccent}</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className={`text-base mb-6 leading-relaxed ${theme.textClass}`}
                >
                  {copy.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="space-y-3 mb-6"
                >
                  {theme.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-[#FF6B00] rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className={`text-sm ${theme.textClass}`}>{benefit}</span>
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#FF6B00]">1</div>
                    <div className={`text-xs ${theme.mutedClass}`}>Email Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#FF6B00]">2</div>
                    <div className={`text-xs ${theme.mutedClass}`}>Verified</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#FF6B00]">3</div>
                    <div className={`text-xs ${theme.mutedClass}`}>Reset</div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`backdrop-blur-sm rounded-2xl p-6 shadow-xl border flex flex-col justify-center ${theme.cardClass}`}
              >
                {recoveryState !== 'reset' ? (
                  <div className="text-center">
                    <div className="w-14 h-14 bg-[#FF6B00] rounded-full flex items-center justify-center mx-auto mb-5">
                      <StatusIcon recoveryState={recoveryState} />
                    </div>
                    <div className="mb-3">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#FF6B00]">{copy.step}</span>
                    </div>
                    <h2 className={`text-xl font-bold mb-2 ${theme.headingClass}`}>{copy.cardTitle}</h2>
                    <p className={`text-sm ${theme.textClass}`}>{message}</p>
                    {recoveryState === 'error' && (
                      <Link href={`/${userType}/forgot-password`} className="mt-5 inline-flex justify-center w-full py-3 px-6 rounded-lg font-semibold text-base bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white hover:shadow-lg transition-all">
                        Request New Link
                      </Link>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="mb-6 text-center">
                      <div className="w-14 h-14 bg-[#FF6B00] rounded-full flex items-center justify-center mx-auto mb-5">
                        <StatusIcon recoveryState={recoveryState} />
                      </div>
                      <div className="mb-3">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#FF6B00]">{copy.step}</span>
                      </div>
                      <h2 className={`text-xl font-bold mb-1 ${theme.headingClass}`}>{copy.cardTitle}</h2>
                      <p className={`text-sm ${theme.textClass}`}>{copy.cardDescription}</p>
                    </div>

                    <form onSubmit={submitNewPassword} className="space-y-4">
                      <div>
                        <label htmlFor="password" className={`block text-sm font-medium mb-1 ${theme.headingClass}`}>
                          New Password *
                        </label>
                        <motion.input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          whileFocus={{ scale: 1.02 }}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${theme.inputClass}`}
                          placeholder="Minimum 8 characters"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-1 ${theme.headingClass}`}>
                          Confirm Password *
                        </label>
                        <motion.input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          whileFocus={{ scale: 1.02 }}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${theme.inputClass}`}
                          placeholder="Confirm your password"
                          required
                        />
                      </div>

                      {formError && <p className="text-sm text-red-500">{formError}</p>}

                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-3 px-6 rounded-lg font-semibold text-base transition-all ${
                          isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#FF6B00] to-[#FF914D] hover:shadow-lg'
                        } text-white`}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Changing password...
                          </div>
                        ) : (
                          'Change Password'
                        )}
                      </motion.button>
                    </form>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
