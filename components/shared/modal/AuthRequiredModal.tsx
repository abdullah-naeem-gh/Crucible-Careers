"use client";
import React from 'react'

type AuthRequiredVariant = 'signed-out' | 'wrong-role'

type AuthRequiredModalProps = {
  isOpen: boolean
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

export default function AuthRequiredModal({ isOpen, variant, onPrimaryAction, id = 'auth-required-modal' }: AuthRequiredModalProps) {
  if (!isOpen) return null

  const content = CONTENT[variant]

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl md:p-8">
        <h2 id={`${id}-title`} className="mb-3 text-2xl font-semibold text-gray-900">
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
