import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import { createSupabaseAdminClient } from '@/lib/shared/supabase/admin'

export async function POST() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createSupabaseAdminClient()
  const { error } = await admin
    .from('talent_experience_verifications')
    .update({ talent_acknowledged_at: new Date().toISOString() })
    .eq('talent_id', user.id)
    .in('status', ['verified', 'rejected'])
    .is('talent_acknowledged_at', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
