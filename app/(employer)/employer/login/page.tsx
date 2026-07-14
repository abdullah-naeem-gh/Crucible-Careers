'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import LoginForm, { type LoginFormData } from '@/components/auth/LoginForm'
import { login, getCurrentUser, logout } from '@/lib/shared/auth/actions'

export default function EmployerLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [error, setError] = useState('')

  const handleSubmit = async (formData: LoginFormData) => {
    setIsLoading(true)
    setError('')
    try {
      await login(formData.email, formData.password)
      
      const userWithProfile = await getCurrentUser()
      const role = userWithProfile?.profile?.role || userWithProfile?.user_metadata?.role
      
      if (role === 'talent') {
        await logout()
        setError('This account is registered as Talent. Please use the Talent login.')
        return
      }

      router.push('/employer/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen w-full relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-[#1A1A1A]/95" />
        {/* Soft orbs */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-[#FF6B00]/30 to-[#FF914D]/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
          <div className="absolute bottom-24 right-20 w-72 h-72 bg-gradient-to-r from-gray-800 to-gray-600 rounded-full mix-blend-multiply filter blur-xl" />
        </div>
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-screen px-6">
        {/* Navigation */}
        <nav className="relative z-20 py-4">
          <Link href="/gateway" className="inline-flex items-center text-white/80 hover:text-white transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Gateway
          </Link>
        </nav>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 items-center h-full">
              {/* Left Side - Content */}
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
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium border border-white/20">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Welcome Back
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight"
                >
                  Sign in to Your<br />
                  <span className="text-[#FF6B00]">Employer Account</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-base text-gray-300 mb-6 leading-relaxed"
                >
                  Access your hiring dashboard and continue building your elite team. 
                  Your next perfect hire is waiting for you.
                </motion.p>

                {/* Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="space-y-3 mb-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-[#FF6B00] rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-300 text-sm">Access your hiring dashboard</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-[#FF6B00] rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-300 text-sm">View candidate profiles</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-[#FF6B00] rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-300 text-sm">Manage your hiring pipeline</span>
                  </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#FF6B00]">2.5x</div>
                    <div className="text-xs text-gray-400">Faster Hires</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#FF6B00]">95%</div>
                    <div className="text-xs text-gray-400">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#FF6B00]">0</div>
                    <div className="text-xs text-gray-400">Job Postings</div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Side - Form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 flex flex-col justify-center"
              >
                <div className="mb-6 text-center">
                  <h2 className="text-xl font-bold text-white mb-1">Welcome Back</h2>
                  <p className="text-gray-300 text-sm">Sign in to your employer account</p>
                </div>

                <LoginForm
                  userType="employer"
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  onGoogleError={setError}
                />

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-sm text-red-400 text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="mt-6 text-center">
                  <p className="text-gray-300 text-sm">
                    Don't have an account?{' '}
                    <Link href="/employer/signup" className="text-[#FF6B00] hover:underline font-medium">
                      Sign up
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
