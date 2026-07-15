import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import type { CompanyReview } from '@/types/employer/ranking'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: companyRow } = await supabase
    .from('employer_company_names')
    .select('company')
    .eq('id', user.id)
    .single()

  const { data: reviewRows, error } = await supabase
    .from('company_reviews')
    .select('id, talent_id, rating, comment, created_at')
    .eq('employer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching employer reviews:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const talentIds = Array.from(new Set((reviewRows ?? []).map((r) => r.talent_id)))
  const nameByTalentId = new Map<string, string>()
  if (talentIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', talentIds)
    ;(profiles ?? []).forEach((p) => {
      const name = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim()
      nameByTalentId.set(p.id, name || 'Anonymous')
    })
  }

  const reviews: CompanyReview[] = (reviewRows ?? []).map((r) => ({
    id: r.id,
    companyName: companyRow?.company || 'Your Company',
    rating: r.rating,
    comment: r.comment || '',
    reviewerName: nameByTalentId.get(r.talent_id) || 'Anonymous',
    createdAt: r.created_at,
  }))

  const averageRating = reviews.length
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0

  return NextResponse.json({ reviews, averageRating })
}
