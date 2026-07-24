"use client";
import React, { useEffect, useRef } from 'react'

type AuthRequiredVariant = 'signed-out' | 'wrong-role'

type AuthRequiredModalProps = {
  isOpen: boolean
  onClose: () => void
  variant: AuthRequiredVariant
  onPrimaryAction: () => void
  id?: string
}

const CONTENT: Record<AuthRequiredVariant, { title: string; body: string; cta: string }> = {
  'signed-out': {
    title: 'Sign in to apply',
    body: 'You need a Crucible talent account to apply for this role. Sign in to continue — your details will prefill the application automatically.',
    cta: 'Log In',
  },
  'wrong-role': {
    title: 'Wrong account type',
    body: "You're currently signed in with an employer account. Log out and sign in with a talent account to apply for this role.",
    cta: 'Log Out & Continue',
  },
}

export default function AuthRequiredModal({ isOpen, onClose, variant, onPrimaryAction, id = 'auth-required-modal' }: AuthRequiredModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const to = window.setTimeout(() => closeButtonRef.current?.focus(), 0)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(to)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  const content = CONTENT[variant]

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onMouseDown={onOverlayClick}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl md:p-8">
        <div className="absolute right-3 top-3">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close modal"
            className="btn-pill bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Close
          </button>
        </div>

        <h2 id={`${id}-title`} className="mb-3 pr-24 text-2xl font-semibold text-gray-900">
          {content.title}
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-gray-600">{content.body}</p>

        <button
          type="button"
          onClick={onPrimaryAction}
          className="w-full rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg"
        >
          {content.cta}
        </button>
      </div>
    </div>
  )
}
