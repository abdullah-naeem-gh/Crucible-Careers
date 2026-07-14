'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { UserRole } from '@/types/shared/auth'

export default function SelectRolePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<UserRole | null>(null)

  const choose = async (role: UserRole) => {
    setIsLoading(role)
    try {
      await fetch('/api/auth/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      router.push(`/auth/verified?portal=${role}`)
    } catch {
      setIsLoading(null)
    }
  }

  return (
    <main className="min-h-screen w-full relative overflow-hidden flex items-center justify-center">
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">One more thing</h1>
        <p className="text-gray-600 mb-8">Tell us why you're here so we can set up the right account.</p>

        <div className="space-y-3">
          <button
            onClick={() => choose('talent')}
            disabled={isLoading !== null}
            className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-gradient-to-r from-[#FF6B00] to-[#FF914D] hover:shadow-lg transition-all disabled:opacity-60"
          >
            {isLoading === 'talent' ? 'Setting up...' : "I'm looking for a job"}
          </button>
          <button
            onClick={() => choose('employer')}
            disabled={isLoading !== null}
            className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-[#1A1A1A] hover:bg-[#111] transition-all disabled:opacity-60"
          >
            {isLoading === 'employer' ? 'Setting up...' : "I'm hiring"}
          </button>
        </div>
      </motion.div>
    </main>
  )
}
