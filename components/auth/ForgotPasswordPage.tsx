'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

type UserType = 'talent' | 'employer'

interface ForgotPasswordPageProps {
  userType: UserType
}

const roleCopy = {
  talent: {
    badge: 'Account Recovery',
    title: 'Reset Your',
    titleAccent: 'Talent Password',
    description: 'Enter the email connected to your talent account. We will send a secure link so you can choose a new password.',
    benefits: ['Secure recovery link', 'No OTP required', 'Back to your career dashboard'],
    cardClass: 'bg-white/80 border-white/20',
    headingClass: 'text-gray-900',
    textClass: 'text-gray-600',
    navClass: 'text-gray-600 hover:text-gray-900',
    inputClass: 'border-gray-300 focus:ring-orange-200 focus:border-orange-400',
    badgeClass: 'bg-orange-100 text-[#FF6B00]',
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
    badge: 'Account Recovery',
    title: 'Reset Your',
    titleAccent: 'Employer Password',
    description: 'Enter the email connected to your employer account. We will send a secure link so you can return to your hiring dashboard.',
    benefits: ['Secure recovery link', 'No OTP required', 'Back to your hiring pipeline'],
    cardClass: 'bg-white/10 border-white/20',
    headingClass: 'text-white',
    textClass: 'text-gray-300',
    navClass: 'text-white/80 hover:text-white',
    inputClass: 'border-white/20 focus:ring-orange-200 focus:border-orange-400 bg-white/5 text-white placeholder-white/50',
    badgeClass: 'bg-white/10 text-white border border-white/20',
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

export default function ForgotPasswordPage({ userType }: ForgotPasswordPageProps) {
  const copy = roleCopy[userType]
  const [email, setEmail] = useState('')
  const [sentEmail, setSentEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [secondsRemaining, setSecondsRemaining] = useState(0)

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return

    const previewParams = new URLSearchParams(window.location.search)
    if (previewParams.get('preview') !== 'sent') return

    const previewEmail = previewParams.get('email') || 'alex@example.com'
    setEmail(previewEmail)
    setSentEmail(previewEmail)
    setSecondsRemaining(30)
  }, [])

  useEffect(() => {
    if (secondsRemaining <= 0) return

    const timeout = window.setTimeout(() => {
      setSecondsRemaining(secondsRemaining - 1)
    }, 1000)

    return () => window.clearTimeout(timeout)
  }, [secondsRemaining])

  const sendResetEmail = async (event?: React.FormEvent) => {
    event?.preventDefault()
    if (secondsRemaining > 0 || isLoading) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userType })
      })
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429 && data.retryAfter) {
          setSecondsRemaining(data.retryAfter)
        }
        throw new Error(data.message || 'Unable to send password reset email')
      }

      setSentEmail(email)
      setSecondsRemaining(30)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send password reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen w-full relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0">{copy.background}</div>

      <div className="relative z-10 flex flex-col min-h-screen px-6">
        <nav className="relative z-20 py-4">
          <Link href={`/${userType}/login`} className={`inline-flex items-center transition-colors ${copy.navClass}`}>
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
                  <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium ${copy.badgeClass}`}>
                    <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse" />
                    {copy.badge}
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className={`text-3xl lg:text-4xl font-bold mb-4 leading-tight ${copy.headingClass}`}
                >
                  {copy.title}<br />
                  <span className="text-[#FF6B00]">{copy.titleAccent}</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className={`text-base mb-6 leading-relaxed ${copy.textClass}`}
                >
                  {copy.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="space-y-3 mb-6"
                >
                  {copy.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-[#FF6B00] rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className={`text-sm ${copy.textClass}`}>{benefit}</span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`backdrop-blur-sm rounded-2xl p-6 shadow-xl border flex flex-col justify-center ${copy.cardClass}`}
              >
                {sentEmail ? (
                  <div className="text-center">
                    <div className="w-14 h-14 bg-[#FF6B00] rounded-full flex items-center justify-center mx-auto mb-5">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className={`text-xl font-bold mb-2 ${copy.headingClass}`}>Email Verification</h2>
                    <p className={`text-sm mb-5 ${copy.textClass}`}>
                      We sent a password reset link to <span className="font-semibold text-[#FF6B00]">{sentEmail}</span>. Click the link in the email to verify your account and reset your password.
                    </p>
                    <motion.button
                      type="button"
                      disabled={secondsRemaining > 0 || isLoading}
                      onClick={() => sendResetEmail()}
                      whileHover={secondsRemaining > 0 ? undefined : { scale: 1.02 }}
                      whileTap={secondsRemaining > 0 ? undefined : { scale: 0.98 }}
                      className={`w-full py-3 px-6 rounded-lg font-semibold text-base transition-all ${
                        secondsRemaining > 0 || isLoading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#FF6B00] to-[#FF914D] hover:shadow-lg'
                      } text-white`}
                    >
                      {secondsRemaining > 0 ? `Resend in ${secondsRemaining}s` : 'Resend Email'}
                    </motion.button>
                    {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
                  </div>
                ) : (
                  <>
                    <div className="mb-6 text-center">
                      <h2 className={`text-xl font-bold mb-1 ${copy.headingClass}`}>Forgot Your Password?</h2>
                      <p className={`text-sm ${copy.textClass}`}>Enter your account email to receive a reset link</p>
                    </div>

                    <form onSubmit={sendResetEmail} className="space-y-4">
                      <div>
                        <label htmlFor="email" className={`block text-sm font-medium mb-1 ${copy.headingClass}`}>
                          Email Address *
                        </label>
                        <motion.input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          whileFocus={{ scale: 1.02 }}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${copy.inputClass}`}
                          placeholder="john.doe@example.com"
                          required
                        />
                      </div>

                      {error && <p className="text-sm text-red-500">{error}</p>}

                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-3 px-6 rounded-lg font-semibold text-base transition-all ${
                          isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#FF6B00] to-[#FF914D] hover:shadow-lg'
                        } text-white`}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Sending...
                          </div>
                        ) : (
                          'Send Reset Link'
                        )}
                      </motion.button>
                    </form>

                    <div className="mt-6 text-center">
                      <p className={`text-sm ${copy.textClass}`}>
                        Remember your password?{' '}
                        <Link href={`/${userType}/login`} className="text-[#FF6B00] hover:underline font-medium">
                          Sign in
                        </Link>
                      </p>
                    </div>
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

