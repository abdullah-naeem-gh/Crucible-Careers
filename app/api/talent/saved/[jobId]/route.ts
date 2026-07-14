import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId } = await params

  const { error } = await supabase
    .from('saved_jobs')
    .delete()
    .eq('job_id', jobId)
    .eq('talent_id', user.id)

  if (error) {
    console.error('Error removing saved job:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
