import { createBrowserSupabaseClient } from '@/lib/shared/supabase/client'

export interface VerificationNotificationItem {
  id: string
  experienceId: string
  status: 'verified' | 'rejected'
  rejectionReason: string | null
  respondedAt: string | null
  company: string
  role: string
}

export async function getUnacknowledgedVerificationCount(): Promise<number> {
  try {
    const res = await fetch('/api/talent/experience-verifications')
    if (!res.ok) return 0
    const data = await res.json()
    return data.unreadCount ?? 0
  } catch (err) {
    console.error('getUnacknowledgedVerificationCount error:', err)
    return 0
  }
}

export async function getUnacknowledgedVerificationItems(): Promise<VerificationNotificationItem[]> {
  try {
    const res = await fetch('/api/talent/experience-verifications')
    if (!res.ok) return []
    const data = await res.json()
    return data.items ?? []
  } catch (err) {
    console.error('getUnacknowledgedVerificationItems error:', err)
    return []
  }
}

export async function acknowledgeVerifications(): Promise<void> {
  try {
    await fetch('/api/talent/experience-verifications/acknowledge', { method: 'POST' })
  } catch (err) {
    console.error('acknowledgeVerifications error:', err)
  }
}

export async function resendVerificationRequest(verificationRequestId: string): Promise<void> {
  const res = await fetch(`/api/talent/experience-verifications/${verificationRequestId}/resend`, { method: 'POST' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to resend verification request')
  }
}

/** Subscribe to realtime changes on this talent's verification requests. */
export function subscribeVerificationChanges(handler: () => void): () => void {
  const supabase = createBrowserSupabaseClient()
  const channel = supabase
    .channel(`experience-verification-changes-${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'talent_experience_verifications' }, handler)
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
