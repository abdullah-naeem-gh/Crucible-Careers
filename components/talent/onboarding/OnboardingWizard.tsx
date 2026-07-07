'use client'

import { motion } from 'framer-motion'

const STEP_NAMES = [
  'Welcome',
  'Basics',
  'Work Style',
  'Skills',
  'Experience',
  'Education',
  'Projects',
  'Your Matches',
]

interface Props {
  currentStep: number  // 0-indexed
  direction: 1 | -1
  children: React.ReactNode
}

export default function OnboardingWizard({ currentStep, direction, children }: Props) {
  const total = STEP_NAMES.length
  const progressPct = ((currentStep + 1) / total) * 100
  const stepName = STEP_NAMES[currentStep]

  return (
    <div className="w-full">
      {/* Progress header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[#FF6B00] uppercase tracking-wider">
            {stepName}
          </span>
          <span className="text-[11px] text-gray-400 tabular-nums">
            {currentStep + 1} / {total}
          </span>
        </div>

        {/* Track */}
        <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF914D]"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-between mt-2 px-0.5">
          {STEP_NAMES.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i < currentStep
                  ? 'w-1.5 h-1.5 bg-[#FF6B00]'
                  : i === currentStep
                  ? 'w-2 h-2 bg-[#FF6B00]'
                  : 'w-1.5 h-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step content — no extra animation wrapper here; page.tsx wraps with AnimatePresence */}
      {children}
    </div>
  )
}
