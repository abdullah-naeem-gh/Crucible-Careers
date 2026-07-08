'use client'

import { Children, ReactNode, isValidElement, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface StepperProps {
  children: ReactNode
  initialStep?: number
  onStepChange?: (step: number) => void
  onFinalStepCompleted?: () => void
  backButtonText?: string
  nextButtonText?: string
  disableStepIndicators?: boolean
  className?: string
}

export function Step({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange,
  onFinalStepCompleted,
  backButtonText = 'Previous',
  nextButtonText = 'Next',
  disableStepIndicators = false,
  className = '',
}: StepperProps) {
  const steps = useMemo(() => Children.toArray(children).filter(isValidElement), [children])
  const [activeStep, setActiveStep] = useState(Math.min(Math.max(initialStep, 1), steps.length || 1))
  const stepIndex = activeStep - 1
  const isFirst = activeStep === 1
  const isFinal = activeStep === steps.length

  const setStep = (step: number) => {
    const nextStep = Math.min(Math.max(step, 1), steps.length)
    setActiveStep(nextStep)
    onStepChange?.(nextStep)
  }

  const goNext = () => {
    if (isFinal) {
      onFinalStepCompleted?.()
      return
    }
    setStep(activeStep + 1)
  }

  return (
    <div className={`flex min-h-[34rem] flex-col ${className}`}>
      {!disableStepIndicators && (
        <div className="mb-6 flex items-center gap-2">
          {steps.map((_, index) => {
            const stepNumber = index + 1
            const active = stepNumber === activeStep
            const complete = stepNumber < activeStep
            return (
              <button
                key={stepNumber}
                type="button"
                onClick={() => setStep(stepNumber)}
                className={`h-2 flex-1 cursor-pointer rounded-full transition-all ${
                  active || complete ? 'bg-[#FF6B00]' : 'bg-gray-200 dark:bg-white/10'
                } ${active ? 'shadow-[0_0_0_3px_rgba(255,107,0,0.12)]' : ''}`}
                aria-label={`Go to step ${stepNumber}`}
              />
            )
          })}
        </div>
      )}

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            {steps[stepIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-200 pt-4 dark:border-white/[0.08]">
        <button
          type="button"
          onClick={() => setStep(activeStep - 1)}
          disabled={isFirst}
          className="cursor-pointer rounded-xl border border-gray-200 bg-white/70 px-4 py-2.5 text-sm font-medium text-gray-600 transition disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60"
        >
          {backButtonText}
        </button>
        <div className="text-xs font-medium text-gray-400 dark:text-white/35">
          Step {activeStep} of {steps.length}
        </div>
        <button
          type="button"
          onClick={goNext}
          className="cursor-pointer rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,107,0,0.2)]"
        >
          {isFinal ? 'Create profile' : nextButtonText}
        </button>
      </div>
    </div>
  )
}
