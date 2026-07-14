import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Anonymous browsing shouldn't error out — a view only counts once it can
  // be attributed to a talent, so just no-op when there's no session.
  if (!user) {
    return NextResponse.json({ ok: true })
  }

  const { id } = await params

  await supabase
    .from('job_views')
    .upsert({ job_id: id, talent_id: user.id }, { onConflict: 'job_id,talent_id', ignoreDuplicates: true })

  return NextResponse.json({ ok: true })
}
