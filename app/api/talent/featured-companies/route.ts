import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('employer_boosts')
    .select('employer_id')
    .eq('boost_type', 'job-spotlight')
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching featured companies:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const employerIds = (data ?? []).map((b) => b.employer_id)
  return NextResponse.json({ employerIds })
}
