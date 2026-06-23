'use client'

import { useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect } from 'react'
import Link from 'next/link'
import LearnMoreModal from '../../components/LearnMoreModal'

export default function GatewayChoosePath() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [talentGlow, setTalentGlow] = useState({ x: -1000, y: -1000 })
  const [clientGlow, setClientGlow] = useState({ x: -1000, y: -1000 })

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  // Mouse tracking effect
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event
      if (talentRef.current) {
        const rect = (talentRef.current as HTMLElement).getBoundingClientRect()
        setTalentGlow({ x: clientX - rect.left, y: clientY - rect.top })
      }
      if (clientRef.current) {
        const rect = (clientRef.current as HTMLElement).getBoundingClientRect()
        setClientGlow({ x: clientX - rect.left, y: clientY - rect.top })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const talentRef = useRef<HTMLDivElement | null>(null)
  const clientRef = useRef<HTMLDivElement | null>(null)
  const isTalentInView = useInView(talentRef, { once: true })
  const isClientInView = useInView(clientRef, { once: true })

  return (
    <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden">
      {/* Top-left back button */}
      <nav className="absolute top-4 left-4 z-30">
        <Link href="/" className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 border border-gray-200 text-gray-700 hover:bg-white shadow-sm backdrop-blur">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </nav>

      {/* Base Background */}
      <div className="absolute inset-0 w-full h-full z-0">
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

      {/* Center Divider with OR */}
      <div className="hidden lg:flex absolute inset-y-0 left-1/2 -translate-x-1/2 z-20 items-center pointer-events-none">
        <div className="w-px h-full bg-gradient-to-b from-transparent via-gray-300 to-transparent opacity-60" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider bg-white/90 border border-gray-200 shadow-sm">
          OR
        </div>
      </div>

      {/* Talent Panel */}
      <motion.section
        ref={talentRef}
        className="relative z-20 flex items-center justify-center p-12 lg:p-20 bg-white/80 backdrop-blur-sm overflow-hidden"
        aria-label="Join as Talent"
      >
        {/* Glow inside talent panel (behind content) */}
        <div
          className="pointer-events-none absolute w-80 h-80 bg-gradient-to-br from-[#FF6B00]/25 to-[#FF914D]/15 rounded-full blur-3xl z-0"
          style={{ left: `${talentGlow.x - 160}px`, top: `${talentGlow.y - 160}px` }}
        />

        <div className="relative z-10 text-center max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isTalentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-orange-100 text-[#FF6B00] rounded-full text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse" />
              For Job Seekers
            </div>
          </motion.div>

          <motion.h1
            className="text-gray-900 mb-6 leading-tight"
            style={{
              fontSize: '96px',
              fontWeight: 500,
              fontFamily: 'Manrope, sans-serif',
              letterSpacing: '-5.76px',
              lineHeight: '115px'
            }}
            initial={{ opacity: 0, y: 50 }}
            animate={isTalentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            I'm looking<br />for a role
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={isTalentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Join our curated talent pool and get matched with top opportunities through rigorous certification.
          </motion.p>

          {/* Benefits */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={isTalentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            {['Certified', 'Direct introductions', 'No cold applies'].map((chip) => (
              <span
                key={chip}
                className="px-3 py-1 rounded-full text-sm border border-gray-200 text-gray-700 bg-white"
              >
                {chip}
              </span>
            ))}
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={isTalentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link href="/signup/talent">
              <motion.button 
                className="inline-flex items-center justify-center h-14 w-64 bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white rounded-full font-semibold text-lg shadow-lg relative overflow-hidden"
                initial="rest"
                whileHover="hover"
                animate="rest"
              >
                <motion.div
                  className="absolute inset-0 bg-[#1A1A1A]/95 rounded-full"
                  variants={{
                    rest: { scaleX: 0, originX: 0 },
                    hover: { scaleX: 1, originX: 0 }
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
                <motion.div
                  className="relative z-10 flex items-center"
                  variants={{
                    rest: { color: '#ffffff' },
                    hover: { color: '#ffffff' }
                  }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  Join as Talent
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </motion.div>
              </motion.button>
            </Link>

            <button
              className="text-gray-700 hover:text-gray-900 font-medium underline underline-offset-4 transition-colors"
              onClick={openModal}
              aria-haspopup="dialog"
              aria-controls="learn-more-modal"
            >
              Learn More
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Client Panel - Dark */}
      <motion.section
        ref={clientRef}
        className="relative z-20 flex items-center justify-center p-12 lg:p-20 bg-[#1A1A1A]/95 text-white backdrop-blur-sm overflow-hidden"
        aria-label="Hire Talent"
      >
        {/* Glow inside employer panel (behind content) */}
        <div
          className="pointer-events-none absolute w-80 h-80 bg-gradient-to-br from-[#FF6B00]/30 to-[#FF914D]/20 rounded-full blur-3xl z-0"
          style={{ left: `${clientGlow.x - 160}px`, top: `${clientGlow.y - 160}px` }}
        />

        <div className="relative z-10 text-center max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isClientInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium mb-6 border border-white/20">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              For Employers
            </div>
          </motion.div>

          <motion.h1
            className="text-white mb-6 leading-tight"
            style={{
              fontSize: '96px',
              fontWeight: 500,
              fontFamily: 'Manrope, sans-serif',
              letterSpacing: '-5.76px',
              lineHeight: '115px'
            }}
            initial={{ opacity: 0, y: 50 }}
            animate={isClientInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            I'm hiring<br />talent
          </motion.h1>

          <motion.p
            className="text-xl text-gray-300 mb-8 max-w-lg mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={isClientInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            We hand-pick elite talent for your needs — no job postings, no noise, just certified excellence.
          </motion.p>

          {/* Benefits */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={isClientInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            {['No postings', 'Certified talent', 'Faster hires'].map((chip) => (
              <span
                key={chip}
                className="px-3 py-1 rounded-full text-sm border border-white/20 text.white/90 bg-white/5"
              >
                {chip}
              </span>
            ))}
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row items-center justifyCenter gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={isClientInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link href="/signup/employer">
              <motion.button 
                className="inline-flex items-center justify-center h-14 w-64 bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white rounded-full font-semibold text-lg shadow-lg relative overflow-hidden"
                initial="rest"
                whileHover="hover"
                animate="rest"
              >
                <motion.div
                  className="absolute inset-0 bg-white rounded-full"
                  variants={{
                    rest: { scaleX: 0, originX: 0 },
                    hover: { scaleX: 1, originX: 0 }
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
                <motion.div
                  className="relative z-10 flex items-center"
                  variants={{
                    rest: { color: '#ffffff' },
                    hover: { color: '#000000' }
                  }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  Hire Talent
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </motion.div>
              </motion.button>
            </Link>

            <button
              className="text-white/90 hover:text-white font-medium underline underline-offset-4 transition-colors"
              onClick={openModal}
              aria-haspopup="dialog"
              aria-controls="learn-more-modal"
            >
              Learn More
            </button>
          </motion.div>
        </div>
      </motion.section>

      <LearnMoreModal isOpen={isModalOpen} onClose={closeModal}>
        <p>
          Crucible is a premium gateway connecting ambitious talent with teams that value outcomes. We replace
          application spam with a curated pipeline built on evidence-based certification.
        </p>
        <p>
          For talent, you'll follow an industry-designed track, build a portfolio of verifiable work, and complete a
          rigorously proctored assessment. The result is a certification employers trust and a direct route to roles:
          introductions to hiring managers, not cold applies.
        </p>
        <p>
          For employers, we deliver a noise-free shortlist mapped to your requirements. Every candidate has passed
          scenario-based evaluations with referenceable artifacts and live screening. No job postings—just a faster,
          more transparent hiring lane with measurable quality.
        </p>
        <p>
          Security and integrity are foundational: identity checks, proctoring safeguards, and continuous calibration
          with industry partners keep the bar high. Crucible operates as an extension of your team—focused, accountable,
          and aligned to outcomes.
        </p>
      </LearnMoreModal>
    </main>
  )
}

