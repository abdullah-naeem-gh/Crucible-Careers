'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconInfoCircle, IconCheck, IconLoader2 } from '@tabler/icons-react'
import type { ExperienceVerificationStatus } from '@/types/talent/profile'
import { resendVerificationRequest } from '@/lib/talent/services/experienceVerification.service'

const COOLDOWN_DAYS = 3

export interface ExperienceVerificationBadgeProps {
  status?: ExperienceVerificationStatus
  company: string
  verificationRequestId?: string
  rejectionReason?: string
  requestedAt?: string
  /** Only relevant when status is 'rejected' — true once a detail has been
   *  changed AND saved since the rejection, so a resend is actually allowed. */
  canResendAfterEdit?: boolean
  /** Only relevant when status is 'rejected' — true if this employer has
   *  blacklisted the talent, in which case resend is never possible. */
  isBlacklisted?: boolean
  onResent?: () => void
}

export default function ExperienceVerificationBadge({
  status,
  company,
  verificationRequestId,
  rejectionReason,
  requestedAt,
  canResendAfterEdit,
  isBlacklisted,
  onResent,
}: ExperienceVerificationBadgeProps) {
  const [open, setOpen] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localOverride, setLocalOverride] = useState<{ status: 'pending'; requestedAt: string } | null>(null)
  const [coords, setCoords] = useState<{ bottom: number; left: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  const POPUP_WIDTH = 320

  const positionPopup = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect()
      const maxLeft = window.innerWidth - POPUP_WIDTH - 8
      setCoords({ bottom: window.innerHeight - r.top + 8, left: Math.max(8, Math.min(r.left, maxLeft)) })
    }
  }

  const toggle = () => {
    if (!open) positionPopup()
    setOpen((v) => !v)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (!triggerRef.current?.contains(target) && !popupRef.current?.contains(target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    window.addEventListener('scroll', positionPopup, true)
    window.addEventListener('resize', positionPopup)
    return () => {
      window.removeEventListener('scroll', positionPopup, true)
      window.removeEventListener('resize', positionPopup)
    }
  }, [open])

  // Once the parent eventually refetches and passes down real, changed
  // values, drop the optimistic override in favor of the server truth.
  useEffect(() => {
    setLocalOverride(null)
  }, [status, requestedAt, rejectionReason])

  const effectiveStatus = localOverride?.status ?? status
  const effectiveRequestedAt = localOverride?.requestedAt ?? requestedAt

  if (!effectiveStatus || effectiveStatus === 'none') return null

  if (effectiveStatus === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
        <IconCheck size={12} /> Verified
      </span>
    )
  }

  const daysLeft = effectiveRequestedAt
    ? Math.max(0, COOLDOWN_DAYS - Math.floor((Date.now() - new Date(effectiveRequestedAt).getTime()) / (24 * 60 * 60 * 1000)))
    : 0
  const isPending = effectiveStatus === 'pending'
  // Pending resend is cooldown-gated; a rejected request stays disabled
  // until the talent has changed a detail AND saved (server-computed, since
  // it has to compare against the actually-saved row, not in-progress form
  // state the server has never seen). A blacklisted talent can never resend.
  const canResend = !isBlacklisted && !!verificationRequestId && (isPending ? daysLeft <= 0 : !!canResendAfterEdit)

  const handleResend = async () => {
    if (!verificationRequestId) return
    setResending(true)
    setError(null)
    try {
      await resendVerificationRequest(verificationRequestId)
      setLocalOverride({ status: 'pending', requestedAt: new Date().toISOString() })
      onResent?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend request')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="relative inline-flex items-center gap-1">
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
          isPending
            ? 'border-amber-200 bg-amber-50 text-amber-700'
            : 'border-red-200 bg-red-50 text-red-600'
        }`}
      >
        {isPending ? 'Verification Pending' : 'Rejected'}
      </span>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        className={`transition-colors ${isPending ? 'text-amber-500 hover:text-amber-700' : 'text-red-400 hover:text-red-600'}`}
      >
        <IconInfoCircle size={15} />
      </button>

      {mounted && open && coords && createPortal(
        <div
          ref={popupRef}
          style={{ position: 'fixed', bottom: coords.bottom, left: coords.left, zIndex: 99999 }}
          className="w-80 max-w-[90vw] rounded-xl border border-gray-200 bg-white p-4 text-left shadow-[0_16px_48px_rgba(0,0,0,0.14)]"
        >
          {isPending ? (
            <>
              <p className="text-sm text-gray-600">
                A verification request was sent to <strong>{company}</strong>.
              </p>
              {canResend ? (
                <button
                  type="button"
                  disabled={resending}
                  onClick={handleResend}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                >
                  {resending && <IconLoader2 size={12} className="animate-spin" />}
                  Resend Request
                </button>
              ) : (
                <p className="mt-2 text-xs text-gray-400">
                  You can resend in {daysLeft} day{daysLeft === 1 ? '' : 's'}.
                </p>
              )}
              {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-800">Rejected by {company}</p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Rejection Reason:</p>
              <p className="mt-1 text-xs text-gray-600">{rejectionReason || 'No reason provided.'}</p>
              {isBlacklisted ? (
                <p className="mt-3 text-xs font-medium text-gray-500">
                  You can no longer send verification requests to this company.
                </p>
              ) : (
                <>
                  <p className="mt-3 text-[11px] text-gray-400">
                    Change a detail and save your profile — once it's saved, you can resend below.
                  </p>
                  <button
                    type="button"
                    disabled={!canResend || resending}
                    onClick={handleResend}
                    title={!canResend ? 'Change a detail and save your profile first' : undefined}
                    className={`mt-2 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      canResend
                        ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60'
                        : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {resending && <IconLoader2 size={12} className="animate-spin" />}
                    Resend Request
                  </button>
                </>
              )}
              {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
            </>
          )}
        </div>,
        document.body,
      )}
    </div>
  )
}
