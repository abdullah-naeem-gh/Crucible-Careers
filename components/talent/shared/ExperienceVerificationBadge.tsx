'use client'

import { useEffect, useRef, useState } from 'react'
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
  onResent?: () => void
}

export default function ExperienceVerificationBadge({
  status,
  company,
  verificationRequestId,
  rejectionReason,
  requestedAt,
  canResendAfterEdit,
  onResent,
}: ExperienceVerificationBadgeProps) {
  const [open, setOpen] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localOverride, setLocalOverride] = useState<{ status: 'pending'; requestedAt: string } | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
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
  // state the server has never seen).
  const canResend = !!verificationRequestId && (isPending ? daysLeft <= 0 : !!canResendAfterEdit)

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
    <div ref={wrapperRef} className="relative inline-flex items-center gap-1">
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
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`transition-colors ${isPending ? 'text-amber-500 hover:text-amber-700' : 'text-red-400 hover:text-red-600'}`}
      >
        <IconInfoCircle size={15} />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-xl border border-gray-200 bg-white p-3 text-left shadow-lg">
          {isPending ? (
            <>
              <p className="text-xs text-gray-600">
                A verification request was sent to <strong>{company}</strong>.
              </p>
              {canResend ? (
                <button
                  type="button"
                  disabled={resending}
                  onClick={handleResend}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                >
                  {resending && <IconLoader2 size={12} className="animate-spin" />}
                  Resend Request
                </button>
              ) : (
                <p className="mt-1.5 text-[11px] text-gray-400">
                  You can resend in {daysLeft} day{daysLeft === 1 ? '' : 's'}.
                </p>
              )}
              {error && <p className="mt-1.5 text-[11px] text-red-500">{error}</p>}
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-gray-700">Rejected by {company}</p>
              <p className="mt-1 text-xs text-gray-500">{rejectionReason || 'No reason provided.'}</p>
              <p className="mt-1.5 text-[11px] text-gray-400">
                Change a detail and save your profile — once it's saved, you can resend below.
              </p>
              <button
                type="button"
                disabled={!canResend || resending}
                onClick={handleResend}
                title={!canResend ? 'Change a detail and save your profile first' : undefined}
                className={`mt-2 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                  canResend
                    ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60'
                    : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                {resending && <IconLoader2 size={12} className="animate-spin" />}
                Resend Request
              </button>
              {error && <p className="mt-1.5 text-[11px] text-red-500">{error}</p>}
            </>
          )}
        </div>
      )}
    </div>
  )
}
