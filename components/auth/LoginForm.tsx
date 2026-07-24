"use client";
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import GoogleAuthButton from './GoogleAuthButton'

interface LoginFormProps {
  userType: 'talent' | 'employer'
  onSubmit: (formData: LoginFormData) => void
  isLoading?: boolean
  onGoogleError?: (message: string) => void
  redirectTo?: string
}

export interface LoginFormData {
  email: string
  password: string
}

export default function LoginForm({ userType, onSubmit, isLoading = false, onGoogleError, redirectTo }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState<Partial<LoginFormData>>({})

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const inputVariants = {
    focus: { scale: 1.02 },
    blur: { scale: 1 }
  }

  const isDarkTheme = userType === 'employer'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-white' : 'text-gray-700'}`}>
            Email Address *
          </label>
          <motion.input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            variants={inputVariants}
            whileFocus="focus"
            className={`w-full min-w-0 px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all sm:px-4 sm:py-3 ${
              errors.email 
                ? 'border-red-300 focus:ring-red-200' 
                : isDarkTheme 
                  ? 'border-white/20 focus:ring-orange-200 focus:border-orange-400 bg-white/5 text-white placeholder-white/50' 
                  : 'border-gray-300 focus:ring-orange-200 focus:border-orange-400'
            }`}
            placeholder="john.doe@example.com"
          />
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-sm text-red-600"
            >
              {errors.email}
            </motion.p>
          )}
        </div>

        <div>
          <label htmlFor="password" className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-white' : 'text-gray-700'}`}>
            Password *
          </label>
          <motion.input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            variants={inputVariants}
            whileFocus="focus"
            className={`w-full min-w-0 px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all sm:px-4 sm:py-3 ${
              errors.password 
                ? 'border-red-300 focus:ring-red-200' 
                : isDarkTheme 
                  ? 'border-white/20 focus:ring-orange-200 focus:border-orange-400 bg-white/5 text-white placeholder-white/50' 
                  : 'border-gray-300 focus:ring-orange-200 focus:border-orange-400'
            }`}
            placeholder="Enter your password"
          />
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-sm text-red-600"
            >
              {errors.password}
            </motion.p>
          )}
        </div>

        <div className="text-right">
          <Link href={`/${userType}/forgot-password`} className={`text-sm hover:underline ${isDarkTheme ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>
            Forgot your password?
          </Link>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-all sm:px-6 sm:py-3 sm:text-base ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#FF6B00] to-[#FF914D] hover:shadow-lg'
          } text-white`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Signing in...
            </div>
          ) : (
            `Sign in as ${userType === 'talent' ? 'Talent' : 'Employer'}`
          )}
        </motion.button>

        <p className={`text-xs text-center ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
          By signing in, you agree to our{' '}
          <a href="#" className="text-orange-600 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-orange-600 hover:underline">Privacy Policy</a>
        </p>
      </form>

      <GoogleAuthButton portal={userType} isDarkTheme={isDarkTheme} onError={onGoogleError} redirectTo={redirectTo} />
    </motion.div>
  )
}

