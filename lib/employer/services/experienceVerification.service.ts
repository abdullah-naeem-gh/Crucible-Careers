import { createBrowserSupabaseClient } from '@/lib/shared/supabase/client'
import type { ExperienceVerificationRequest } from '@/types/employer/verification'

export async function getExperienceVerificationRequests(): Promise<ExperienceVerificationRequest[]> {
  try {
    const res = await fetch('/api/employer/experience-verifications')
    if (!res.ok) return []
    const data = await res.json()
    return data.requests ?? []
  } catch (err) {
    console.error('getExperienceVerificationRequests error:', err)
    return []
  }
}

export async function approveExperienceVerification(id: string): Promise<void> {
  const res = await fetch(`/api/employer/experience-verifications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'approve' }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to approve request')
  }
}

export async function rejectExperienceVerification(id: string, reason: string, blacklist: boolean): Promise<void> {
  const res = await fetch(`/api/employer/experience-verifications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reject', reason, blacklist }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to reject request')
  }
}

export async function getPendingExperienceVerificationCount(): Promise<number> {
  const requests = await getExperienceVerificationRequests()
  return requests.filter((r) => r.status === 'pending').length
}

/** Subscribe to realtime changes on this employer's verification requests. */
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
