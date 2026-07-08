'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { IconRocket, IconBriefcase, IconArrowRight, IconSparkles } from '@tabler/icons-react'

export interface MatchedJob {
  title: string
  company: string
  matchReason: string
}

interface Props {
  firstName: string
  skills: string[]
  preferredRoles: string[]
  matchCount: number
  topMatches: MatchedJob[]
  onExplore: () => void
  isSaving?: boolean
}

export default function OnboardingStep8({
  firstName, skills, preferredRoles, matchCount, topMatches, onExplore, isSaving = false
}: Props) {
  const [count, setCount] = useState(0)
  const [burst, setBurst] = useState(false)

  useEffect(() => {
    setBurst(true)
    const step = Math.ceil(matchCount / (1200 / 16))
    let current = 0
    const timer = setInterval(() => {
      current = Math.min(current + step, matchCount)
      setCount(current)
      if (current >= matchCount) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [matchCount])

  const displaySkills = skills.slice(0, 3)

  return (
    <div className="flex flex-col items-center text-center space-y-5 py-2">
      {/* Burst rings + icon */}
      {burst && (
        <div className="relative">
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2.8, opacity: 0 }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-orange-400/30"
          />
          <motion.div
            initial={{ scale: 0, opacity: 0.3 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 1.7, ease: 'easeOut', delay: 0.1 }}
            className="absolute inset-0 rounded-full bg-orange-300/20"
          />
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.15 }}
            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF914D] flex items-center justify-center shadow-xl shadow-orange-300/40"
          >
            <IconRocket size={34} className="text-white" />
          </motion.div>
        </div>
      )}

      {/* Count */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-2">
        <div className="text-6xl font-extrabold text-[#FF6B00] tabular-nums leading-none">{count}+</div>
        <div className="text-xs font-semibold text-gray-400 mt-1.5 uppercase tracking-wider">jobs matched for you</div>
      </motion.div>

      {/* Headline */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="space-y-1.5">
        <h2 className="text-2xl font-bold text-gray-900">
          {firstName ? `You're all set, ${firstName}!` : "Your profile is ready!"}
        </h2>
        <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
          {displaySkills.length > 0 ? (
            <>Based on <span className="font-semibold text-gray-700">{displaySkills.join(', ')}{skills.length > 3 ? ` +${skills.length - 3} more` : ''}</span>, we&rsquo;ve curated your feed.</>
          ) : preferredRoles.length > 0 ? (
            <>Based on your interest in <span className="font-semibold text-gray-700">{preferredRoles.slice(0, 2).join(' & ')}</span>, we&rsquo;ve curated your feed.</>
          ) : (
            'We\'ve built your personalised job feed, ready to explore.'
          )}
        </p>
      </motion.div>

      {/* Top matches */}
      {topMatches.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="w-full max-w-sm space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-1">
            <IconSparkles size={11} /> Your top picks
          </p>
          {topMatches.slice(0, 3).map((job, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.75 + i * 0.07 }}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-gray-100 bg-white/70 text-left">
              <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                <IconBriefcase size={14} className="text-[#FF6B00]" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">{job.title}</div>
                <div className="text-[11px] text-gray-500 truncate">{job.company} · {job.matchReason}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="w-full max-w-sm pt-1">
        <motion.button
          onClick={onExplore}
          disabled={isSaving}
          whileHover={isSaving ? {} : { scale: 1.03 }}
          whileTap={isSaving ? {} : { scale: 0.97 }}
          className={`w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-semibold text-base transition-shadow ${
            isSaving
              ? 'bg-orange-300 text-white cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white shadow-lg shadow-orange-200/60 hover:shadow-orange-300/70'
          }`}
        >
          {isSaving ? 'Saving profile...' : 'Explore your matched jobs'}
          {!isSaving && <IconArrowRight size={18} />}
        </motion.button>
        <p className="text-[11px] text-gray-400 mt-2.5">
          Your full profile is saved. Continue editing anytime in the dashboard.
        </p>
      </motion.div>
    </div>
  )
}
