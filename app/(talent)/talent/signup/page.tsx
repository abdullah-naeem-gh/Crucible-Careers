'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SignUpForm, { type SignUpFormData } from '@/components/auth/SignUpForm'
import { signUp } from '@/lib/shared/auth/actions'

export default function TalentSignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [error, setError] = useState('')

  const handleSubmit = async (formData: SignUpFormData) => {
    setIsLoading(true)
    setError('')
    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        role: 'talent',
        firstName: formData.firstName,
        lastName: formData.lastName,
      })
      router.push(`/talent/check-email?email=${encodeURIComponent(formData.email)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative h-dvh w-full overflow-x-clip overflow-y-auto">
      {/* Background */}
      <div className="fixed inset-0 z-0 h-full w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-gray-50" />
        {/* Soft orbs */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-[#FF6B00] to-[#FF914D] rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
          <div className="absolute bottom-24 right-20 w-72 h-72 bg-gradient-to-r from-gray-200 to-white rounded-full mix-blend-multiply filter blur-xl" />
        </div>
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-dvh flex-col px-3 sm:px-6">
        {/* Navigation */}
        <nav className="relative z-20 flex flex-wrap items-center justify-between gap-3 py-3 sm:py-4">
          <Link href="/gateway" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <Link
            href="/employer/signup"
            className="rounded-full border border-gray-200 bg-white/80 px-3 py-2 text-xs font-medium text-gray-700 shadow-sm backdrop-blur transition-colors hover:border-[#FF6B00] hover:text-[#FF6B00] sm:px-4 sm:text-sm"
          >
            Employer Sign Up
          </Link>
        </nav>

        {/* Content */}
        <div className="flex flex-1 items-start justify-center py-4 sm:py-6 lg:items-center">
        <div className="w-full max-w-5xl mx-auto">
          <div className="grid grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-2">
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="order-2 flex flex-col justify-center text-center lg:order-1 lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-4"
              >
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-orange-100 text-[#FF6B00] rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse" />
                  For Job Seekers
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mb-3 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:mb-4 lg:text-4xl"
              >
                Join Our Elite<br />
                <span className="text-[#FF6B00]">Talent Pool</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-4 text-sm leading-relaxed text-gray-600 sm:text-base lg:mb-6"
              >
                Get matched with top opportunities through our rigorous certification process. 
                No more cold applications — just direct introductions to hiring managers.
              </motion.p>

              {/* Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mb-4 space-y-3 lg:mb-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#FF6B00] rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm">Rigorous certification process</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#FF6B00] rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm">Direct introductions to hiring managers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#FF6B00] rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm">No cold applications or job postings</span>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="grid grid-cols-3 gap-2 sm:gap-4"
              >
                <div className="text-center">
                  <div className="text-xl font-bold text-[#FF6B00]">95%</div>
                  <div className="text-xs text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-[#FF6B00]">2.5x</div>
                  <div className="text-xs text-gray-600">Faster Hires</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-[#FF6B00]">500+</div>
                  <div className="text-xs text-gray-600">Companies</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-1 flex min-w-0 flex-col justify-center rounded-xl border border-white/20 bg-white/80 p-4 shadow-xl backdrop-blur-sm sm:rounded-2xl sm:p-6 lg:order-2"
            >
              <div className="mb-4 text-center sm:mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Create Your Account</h2>
                <p className="text-gray-600 text-sm">Join thousands of certified professionals</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}

              <SignUpForm
                userType="talent"
                onSubmit={handleSubmit}
                isLoading={isLoading}
                onGoogleError={setError}
              />

              <div className="mt-4 text-center sm:mt-6">
                                  <p className="text-gray-600 text-sm">
                    Already have an account?{' '}
                    <Link href="/talent/login" className="text-[#FF6B00] hover:underline font-medium">
                      Sign in
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
