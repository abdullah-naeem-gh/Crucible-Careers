import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: applicationId } = await params
  const body = await request.json()
  const rating = Number(body.rating)
  const comment = typeof body.comment === 'string' ? body.comment : ''

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be an integer between 1 and 5.' }, { status: 400 })
  }

  // Resolve the employer for this application server-side — never trust a
  // client-supplied employer id.
  const { data: application, error: applicationError } = await supabase
    .from('applications')
    .select('id, talent_id, jobs(employer_id)')
    .eq('id', applicationId)
    .single()

  if (applicationError || !application || application.talent_id !== user.id) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  const employerId = (application.jobs as any)?.employer_id
  if (!employerId) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  const { error: insertError } = await supabase
    .from('company_reviews')
    .insert({
      application_id: applicationId,
      employer_id: employerId,
      talent_id: user.id,
      rating,
      comment,
    })

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'You have already reviewed this application.' }, { status: 409 })
    }
    console.error('Error creating review:', insertError)
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
