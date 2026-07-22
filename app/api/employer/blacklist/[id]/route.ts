import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import { createSupabaseAdminClient } from '@/lib/shared/supabase/admin'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: existing, error: fetchError } = await supabase
    .from('employer_talent_blacklist')
    .select('id')
    .eq('id', id)
    .eq('employer_id', user.id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Blacklist entry not found' }, { status: 404 })
  }

  const admin = createSupabaseAdminClient()
  const { error } = await admin.from('employer_talent_blacklist').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
