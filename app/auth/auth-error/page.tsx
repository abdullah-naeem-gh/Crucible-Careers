'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const errorMsg = searchParams.get('error') || 'The link you followed has expired or is invalid.'

  return (
    <>
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
        className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </motion.div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Link Expired</h1>
      <p className="text-gray-600 mb-8 px-4 leading-relaxed">
        {errorMsg} Please request a new link to continue.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/gateway">
          <motion.button 
            className="inline-flex items-center justify-center h-12 px-8 bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white rounded-full font-semibold shadow-lg relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Return to Gateway
          </motion.button>
        </Link>
      </div>
    </>
  )
}

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen w-full relative overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-gray-50" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40 text-center max-w-md w-full mx-4"
      >
        <Suspense fallback={<div className="h-48 flex items-center justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>}>
          <AuthErrorContent />
        </Suspense>
      </motion.div>
    </main>
  )
}
