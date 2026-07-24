'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { getCurrentUser, logout } from '@/lib/shared/auth/actions'
import { loadTalentProfile } from '@/lib/talent/services/profile.service'
import { isSafeRedirectPath } from '@/lib/shared/safeRedirect'
import type { UserRole } from '@/types/shared/auth'

function VerifiedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState(false)
  // Only a brand-new account creation shows the "You're In!" splash — an
  // existing user signing back in (via Google or otherwise) should land on
  // their dashboard immediately, with no celebratory interstitial.
  const [isNewSignup, setIsNewSignup] = useState(false)

  useEffect(() => {
    const redirectUser = async () => {
      try {
        const portalParam = searchParams.get('portal')
        const portal: UserRole | null = portalParam === 'talent' || portalParam === 'employer' ? portalParam : null

        const userWithProfile = await getCurrentUser()
        if (!userWithProfile) {
          router.push('/gateway')
          return
        }

        let role: UserRole | undefined = userWithProfile.profile?.role
        let firstName = userWithProfile.profile?.first_name || ''
        let newSignup = false

        if (!role && portal) {
          // Brand-new Google sign-up — assign the role for the portal they signed up through.
          newSignup = true
          const res = await fetch('/api/auth/set-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: portal }),
          })
          const { profile } = await res.json()
          role = profile?.role
          firstName = profile?.first_name || firstName
        }

        if (!role) {
          router.push('/auth/select-role')
          return
        }

        if (portal && role !== portal) {
          await logout()
          router.push(`/${portal}/login?error=wrong_portal`)
          return
        }

        const redirect = searchParams.get('redirect')
        let nextPath: string
        if (role === 'employer') {
          const contextResponse = await fetch('/api/employer/context')
          nextPath = contextResponse.ok
            ? (isSafeRedirectPath(redirect) ? redirect : '/employer/dashboard')
            : '/employer/setup'
        } else {
          const roleProfile = await loadTalentProfile()
          nextPath = roleProfile
            ? (isSafeRedirectPath(redirect) ? redirect : '/talent/dashboard')
            : `/talent/onboarding?name=${encodeURIComponent(firstName)}`
        }

        if (newSignup) {
          setIsNewSignup(true)
          setTimeout(() => router.push(nextPath), 1500)
        } else {
          router.replace(nextPath)
        }
      } catch (err) {
        console.error('Failed to complete sign-in:', err)
        setError(true)
        setTimeout(() => router.push('/gateway'), 3000)
      }
    }

    redirectUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          isNewSignup ? (
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

              <h1 className="text-3xl font-bold text-gray-900 mb-4">You're In!</h1>
              <p className="text-gray-600 mb-8">
                We're setting up your account. Redirecting you now...
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
            // Returning sign-in — no celebratory splash, just a brief neutral
            // loading state while router.replace() takes effect.
            <div className="flex flex-col items-center gap-3 py-4">
              <p className="text-sm font-medium text-gray-600">Logging you in...</p>
              <div className="flex gap-2">
                <motion.div className="w-3 h-3 bg-[#FF6B00] rounded-full" animate={{ y: [-5, 5, -5] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
                <motion.div className="w-3 h-3 bg-[#FF6B00] rounded-full" animate={{ y: [-5, 5, -5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                <motion.div className="w-3 h-3 bg-[#FF6B00] rounded-full" animate={{ y: [-5, 5, -5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
              </div>
            </div>
          )
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

export default function VerifiedPage() {
  return (
    <Suspense fallback={null}>
      <VerifiedContent />
    </Suspense>
  )
}
