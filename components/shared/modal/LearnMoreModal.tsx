"use client";
import React, { useEffect, useRef } from 'react'

type LearnMoreModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  id?: string
  children?: React.ReactNode
}

export default function LearnMoreModal({ isOpen, onClose, title = 'Learn More', id = 'learn-more-modal', children }: LearnMoreModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
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

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onMouseDown={onOverlayClick}
    >
      <div ref={dialogRef} className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 md:p-8 relative">
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
        <h2 id={`${id}-title`} className="text-2xl md:text-3xl font-semibold mb-4 pr-24">
          {title}
        </h2>
        <div className="text-gray-600 leading-relaxed space-y-4">
          {children}
        </div>
      </div>
    </div>
  )
}
