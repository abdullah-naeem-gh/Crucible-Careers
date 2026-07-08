'use client'

import { motion } from 'framer-motion'

interface Props {
  currentStep: number
  direction: 1 | -1
  children: React.ReactNode
}

// Steps 0–6 (7 total). Step 0 = welcome (no progress shown). Steps 1–5 show progress.
// Step 6 = celebration (no progress shown).
const TOTAL_PROGRESS = 5 // steps 1–5 shown in progress bar

export default function EmployerOnboardingWizard({ currentStep, children }: Props) {
  const showProgress = currentStep > 0 && currentStep < 6

  return (
    <div>
      {/* Progress: dots + "Step X of Y" label */}
      {showProgress && (
        <div className="flex flex-col items-center gap-2 mb-6">
          {/* Dot track */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_PROGRESS }).map((_, i) => {
              const dotStep = i + 1
              const isActive = dotStep === currentStep
              const isComplete = dotStep < currentStep
              return (
                <motion.div
                  key={i}
                  layout
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className={`rounded-full transition-colors duration-300 ${
                    isActive
                      ? 'w-6 h-1.5 bg-[#FF6B00]'
                      : isComplete
                      ? 'w-1.5 h-1.5 bg-[#FF6B00]/60'
                      : 'w-1.5 h-1.5 bg-white/30'   // clearly visible but dimmed
                  }`}
                />
              )
            })}
          </div>
          {/* Step counter text */}
          <p className="text-[10px] font-medium tracking-widest uppercase text-white/30">
            Step {currentStep} of {TOTAL_PROGRESS}
          </p>
        </div>
      )}
      {children}
    </div>
  )
}
