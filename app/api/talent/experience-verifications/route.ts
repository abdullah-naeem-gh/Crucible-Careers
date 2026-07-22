import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: rows, error } = await supabase
    .from('talent_experience_verifications')
    .select('id, experience_id, status, rejection_reason, responded_at, talent_experiences (company, role)')
    .eq('talent_id', user.id)
    .in('status', ['verified', 'rejected'])
    .is('talent_acknowledged_at', null)
    .order('responded_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const items = (rows ?? []).map((r: any) => ({
    id: r.id,
    experienceId: r.experience_id,
    status: r.status,
    rejectionReason: r.rejection_reason,
    respondedAt: r.responded_at,
    company: r.talent_experiences?.company || '',
    role: r.talent_experiences?.role || '',
  }))

  return NextResponse.json({ unreadCount: items.length, items })
}
