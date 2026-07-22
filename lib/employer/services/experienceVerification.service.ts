import { createBrowserSupabaseClient } from '@/lib/shared/supabase/client'
import type { BlacklistedTalent, ExperienceVerificationRequest } from '@/types/employer/verification'

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

export async function getBlacklist(): Promise<BlacklistedTalent[]> {
  try {
    const res = await fetch('/api/employer/blacklist')
    if (!res.ok) return []
    const data = await res.json()
    return data.blacklist ?? []
  } catch (err) {
    console.error('getBlacklist error:', err)
    return []
  }
}

export async function removeFromBlacklist(id: string): Promise<void> {
  const res = await fetch(`/api/employer/blacklist/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to remove from blocklist')
  }
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
