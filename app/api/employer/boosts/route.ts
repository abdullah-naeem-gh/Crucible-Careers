import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'

const BOOST_TYPES = ['job-spotlight', 'candidate-unlock', 'profile-branding']

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('employer_boosts')
    .select('boost_type, is_active')
    .eq('employer_id', user.id)

  if (error) {
    console.error('Error fetching boosts:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const activeBoosts = (data ?? []).filter((b) => b.is_active).map((b) => b.boost_type)
  return NextResponse.json({ activeBoosts })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const boostType = body.boostType
  const isActive = Boolean(body.isActive)

  if (!BOOST_TYPES.includes(boostType)) {
    return NextResponse.json({ error: 'Invalid boost type' }, { status: 400 })
  }

  // Payments aren't wired up yet — activation stays instant & free,
  // persisted with payment_status: 'unpaid' as a stub for later Stripe work.
  const { error } = await supabase
    .from('employer_boosts')
    .upsert(
      { employer_id: user.id, boost_type: boostType, is_active: isActive, activated_at: new Date().toISOString() },
      { onConflict: 'employer_id,boost_type' }
    )

  if (error) {
    console.error('Error toggling boost:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
