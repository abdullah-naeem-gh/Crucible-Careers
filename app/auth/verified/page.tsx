'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { getCurrentUser } from '@/lib/shared/auth/actions'

export default function VerifiedPage() {
  const router = useRouter()
  const [error, setError] = useState(false)

  useEffect(() => {
    const redirectUser = async () => {
      try {
        const userWithProfile = await getCurrentUser()
        if (userWithProfile?.profile?.role) {
          const role = userWithProfile.profile.role
          setTimeout(() => {
            if (role === 'employer') {
              router.push('/employer/dashboard')
            } else {
              router.push('/talent/dashboard')
            }
          }, 3000)
        } else {
          // If no role or profile found, fallback to gateway
          setTimeout(() => {
            router.push('/gateway')
          }, 3000)
        }
      } catch (err) {
        console.error('Failed to get user role:', err)
        setError(true)
        setTimeout(() => {
          router.push('/gateway')
        }, 3000)
      }
    }

    redirectUser()
  }, [router])

  return (
    <main className="min-h-screen w-full relative overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-gray-50" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[#FF6B00] to-[#FF914D] rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40 text-center max-w-md w-full mx-4"
      >
        {!error ? (
          <>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Email Verified!</h1>
            <p className="text-gray-600 mb-8">
              Your email has been successfully verified. We are redirecting you to your dashboard...
            </p>
            
            <div className="flex justify-center">
              <div className="flex gap-2">
                <motion.div className="w-3 h-3 bg-[#FF6B00] rounded-full" animate={{ y: [-5, 5, -5] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
                <motion.div className="w-3 h-3 bg-[#FF6B00] rounded-full" animate={{ y: [-5, 5, -5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                <motion.div className="w-3 h-3 bg-[#FF6B00] rounded-full" animate={{ y: [-5, 5, -5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
              </div>
            </div>
          </>
        ) : (
          <>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
              className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Verification Error</h1>
            <p className="text-gray-600 mb-8">
              We couldn't verify your account details. Redirecting you to the gateway...
            </p>
          </>
        )}
      </motion.div>
    </main>
  )
}
