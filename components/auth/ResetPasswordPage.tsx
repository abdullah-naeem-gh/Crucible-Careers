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
    cardClass: 'bg-white/80 border-white/20',
    headingClass: 'text-gray-900',
    textClass: 'text-gray-600',
    navClass: 'text-gray-600 hover:text-gray-900',
    inputClass: 'border-gray-300 focus:ring-orange-200 focus:border-orange-400',
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
    cardClass: 'bg-white/10 border-white/20',
    headingClass: 'text-white',
    textClass: 'text-gray-300',
    navClass: 'text-white/80 hover:text-white',
    inputClass: 'border-white/20 focus:ring-orange-200 focus:border-orange-400 bg-white/5 text-white placeholder-white/50',
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

function getRecoveryHashParams() {
  if (typeof window === 'undefined') return new URLSearchParams()
  return new URLSearchParams(window.location.hash.replace(/^#/, ''))
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userType: UserType = searchParams.get('userType') === 'employer' ? 'employer' : 'talent'
  const theme = roleTheme[userType]
  const loginPath = `/${userType}/login`

  const [recoveryState, setRecoveryState] = useState<RecoveryState>('verifying')
  const [message, setMessage] = useState('Verifying your password reset link...')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    let redirectTimeout: number | undefined

    async function verifyRecoveryLink() {
      try {
        if (process.env.NODE_ENV !== 'production') {
          const preview = searchParams.get('preview')

          if (preview === 'verified') {
            setRecoveryState('verified')
            setMessage('Email verified. Redirecting you to reset your password...')
            redirectTimeout = window.setTimeout(() => setRecoveryState('reset'), 2200)
            return
          }

          if (preview === 'reset') {
            setRecoveryState('reset')
            return
          }

          if (preview === 'success') {
            setRecoveryState('success')
            setMessage('Your password has been changed successfully. Redirecting you to login...')
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
        setMessage('Email verified. Redirecting you to reset your password...')
        redirectTimeout = window.setTimeout(() => setRecoveryState('reset'), 2200)
      } catch (error) {
        setRecoveryState('error')
        setMessage(error instanceof Error ? error.message : 'This password reset link is invalid or expired.')
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
      setMessage('Your password has been changed successfully. Redirecting you to login...')
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
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`w-full max-w-md backdrop-blur-sm rounded-2xl p-6 shadow-xl border ${theme.cardClass}`}
          >
            {recoveryState !== 'reset' ? (
              <div className="text-center">
                <div className="w-14 h-14 bg-[#FF6B00] rounded-full flex items-center justify-center mx-auto mb-5">
                  {recoveryState === 'verifying' ? (
                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
                  ) : recoveryState === 'error' ? (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <h1 className={`text-xl font-bold mb-2 ${theme.headingClass}`}>
                  {recoveryState === 'verified' ? 'Email Verified' : recoveryState === 'success' ? 'Password Changed' : recoveryState === 'error' ? 'Link Not Verified' : 'Verifying Email'}
                </h1>
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
                  <h1 className={`text-xl font-bold mb-1 ${theme.headingClass}`}>Reset Password</h1>
                  <p className={`text-sm ${theme.textClass}`}>Enter and confirm your new password</p>
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
    </main>
  )
}




