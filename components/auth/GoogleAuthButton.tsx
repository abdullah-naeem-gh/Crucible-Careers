'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { signInWithGoogle } from '@/lib/shared/auth/actions'
import type { UserRole } from '@/types/shared/auth'

interface GoogleAuthButtonProps {
  portal: UserRole
  isDarkTheme?: boolean
  onError?: (message: string) => void
}

export default function GoogleAuthButton({ portal, isDarkTheme = false, onError }: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle(portal)
      // Browser is redirected to Google — component stays "loading" until then.
    } catch (err) {
      setIsLoading(false)
      onError?.(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.')
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 my-4">
        <div className={`flex-1 h-px ${isDarkTheme ? 'bg-white/20' : 'bg-gray-200'}`} />
        <span className={`text-xs ${isDarkTheme ? 'text-white/50' : 'text-gray-400'}`}>or continue with</span>
        <div className={`flex-1 h-px ${isDarkTheme ? 'bg-white/20' : 'bg-gray-200'}`} />
      </div>

      <motion.button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-sm flex items-center justify-center gap-3 border transition-all ${
          isLoading ? 'cursor-not-allowed opacity-60' : ''
        } ${
          isDarkTheme
            ? 'border-white/20 bg-white/5 text-white hover:bg-white/10'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        {isLoading ? (
          <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${isDarkTheme ? 'border-white' : 'border-gray-500'}`} />
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.76z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11C3.24 21.3 7.28 24 12 24z" />
              <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 010-4.54V6.62H1.26a12 12 0 000 10.76l4.01-3.11z" />
              <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.28 0 3.24 2.7 1.26 6.62l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77z" />
            </svg>
            Continue with Google
          </>
        )}
      </motion.button>
    </div>
  )
}
