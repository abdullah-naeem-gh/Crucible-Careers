"use client";
import { useState } from 'react'
import { motion } from 'framer-motion'
import GoogleAuthButton from './GoogleAuthButton'

interface SignUpFormProps {
  userType: 'talent' | 'employer'
  employerMode?: 'company' | 'recruiter'
  onSubmit: (formData: SignUpFormData) => void
  isLoading?: boolean
  onGoogleError?: (message: string) => void
}

export interface SignUpFormData {
  firstName: string
  lastName: string
  email: string
  company?: string
  companyJoinEmail?: string
  role?: string
  experience?: string
  skills?: string
  password: string
  confirmPassword: string
}

export default function SignUpForm({ userType, employerMode = 'company', onSubmit, isLoading = false, onGoogleError }: SignUpFormProps) {
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    companyJoinEmail: '',
    role: '',
    experience: '',
    skills: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<Partial<SignUpFormData>>({})

  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
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
  const requiresPersonalName = userType === 'talent' || employerMode === 'recruiter'
  
  const validateForm = (): boolean => {
    const newErrors: Partial<SignUpFormData> = {}
    let isValid = true

    if (requiresPersonalName && !formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
      isValid = false
    }

    if (requiresPersonalName && !formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
      isValid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
      isValid = false
    }

    if (userType === 'employer' && employerMode === 'company' && !formData.company?.trim()) {
      newErrors.company = 'Company name is required'
      isValid = false
    }

    if (userType === 'employer' && employerMode === 'recruiter') {
      if (!formData.companyJoinEmail?.trim()) {
        newErrors.companyJoinEmail = 'Company Crucible email is required'
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyJoinEmail)) {
        newErrors.companyJoinEmail = 'Enter a valid company email'
        isValid = false
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
      isValid = false
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
      isValid = false
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {requiresPersonalName && <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div>
            <label htmlFor="firstName" className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-white' : 'text-gray-700'}`}>
              First Name *
            </label>
            <motion.input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              variants={inputVariants}
              whileFocus="focus"
              className={`w-full min-w-0 px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all sm:px-4 sm:py-3 ${
                errors.firstName 
                  ? 'border-red-300 focus:ring-red-200' 
                  : isDarkTheme 
                    ? 'border-white/20 focus:ring-orange-200 focus:border-orange-400 bg-white/5 text-white placeholder-white/50' 
                    : 'border-gray-300 focus:ring-orange-200 focus:border-orange-400'
              }`}
              placeholder="John"
            />
            {errors.firstName && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-600"
              >
                {errors.firstName}
              </motion.p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-white' : 'text-gray-700'}`}>
              Last Name *
            </label>
            <motion.input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              variants={inputVariants}
              whileFocus="focus"
              className={`w-full min-w-0 px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all sm:px-4 sm:py-3 ${
                errors.lastName 
                  ? 'border-red-300 focus:ring-red-200' 
                  : isDarkTheme 
                    ? 'border-white/20 focus:ring-orange-200 focus:border-orange-400 bg-white/5 text-white placeholder-white/50' 
                    : 'border-gray-300 focus:ring-orange-200 focus:border-orange-400'
              }`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-600"
              >
                {errors.lastName}
              </motion.p>
            )}
          </div>
        </div>}

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

        {userType === 'employer' && employerMode === 'company' && (
          <div>
            <label htmlFor="company" className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-white' : 'text-gray-700'}`}>
              Company Name *
            </label>
            <motion.input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              variants={inputVariants}
              whileFocus="focus"
              className={`w-full min-w-0 px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all sm:px-4 sm:py-3 ${
                errors.company 
                  ? 'border-red-300 focus:ring-red-200' 
                  : isDarkTheme 
                    ? 'border-white/20 focus:ring-orange-200 focus:border-orange-400 bg-white/5 text-white placeholder-white/50' 
                    : 'border-gray-300 focus:ring-orange-200 focus:border-orange-400'
              }`}
              placeholder="Your Company Inc."
            />
            {errors.company && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-600"
              >
                {errors.company}
              </motion.p>
            )}
          </div>
        )}

        {userType === 'employer' && employerMode === 'recruiter' && (
          <div>
            <label htmlFor="companyJoinEmail" className="mb-1 block text-sm font-medium text-white">
              Company Crucible account email *
            </label>
            <motion.input
              id="companyJoinEmail"
              type="email"
              value={formData.companyJoinEmail}
              onChange={(e) => handleInputChange('companyJoinEmail', e.target.value)}
              variants={inputVariants}
              whileFocus="focus"
              className={`w-full min-w-0 rounded-lg border bg-white/5 px-3 py-2.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 sm:px-4 sm:py-3 ${errors.companyJoinEmail ? 'border-red-300 focus:ring-red-200' : 'border-white/20 focus:border-orange-400 focus:ring-orange-200'}`}
              placeholder="careers@company.com"
            />
            {errors.companyJoinEmail && <p className="mt-1 text-sm text-red-500">{errors.companyJoinEmail}</p>}
            <p className="mt-1.5 text-[11px] text-white/35">This routes a request to the company. An admin must approve it before you receive access.</p>
          </div>
        )}

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
            placeholder="Minimum 8 characters"
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

        <div>
          <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-white' : 'text-gray-700'}`}>
            Confirm Password *
          </label>
          <motion.input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            variants={inputVariants}
            whileFocus="focus"
            className={`w-full min-w-0 px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all sm:px-4 sm:py-3 ${
              errors.confirmPassword 
                ? 'border-red-300 focus:ring-red-200' 
                : isDarkTheme 
                  ? 'border-white/20 focus:ring-orange-200 focus:border-orange-400 bg-white/5 text-white placeholder-white/50' 
                  : 'border-gray-300 focus:ring-orange-200 focus:border-orange-400'
            }`}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-sm text-red-600"
            >
              {errors.confirmPassword}
            </motion.p>
          )}
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
              Creating account...
            </div>
          ) : (
            userType === 'talent' ? 'Join as Talent' : employerMode === 'company' ? 'Create company account' : 'Request company access'
          )}
        </motion.button>

        <p className={`text-xs text-center ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
          By signing up, you agree to our{' '}
          <a href="#" className="text-orange-600 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-orange-600 hover:underline">Privacy Policy</a>
        </p>
      </form>

      {!(userType === 'employer' && employerMode === 'company') && (
        <GoogleAuthButton portal={userType} isDarkTheme={isDarkTheme} onError={onGoogleError} />
      )}
    </motion.div>
  )
}
