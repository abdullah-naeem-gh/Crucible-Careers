import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/shared/supabase/admin'
import { buildTalentProfileEmbeddingText } from '@/lib/talent/services/profileEmbeddingText'
import { buildCompanyEmbeddingText } from '@/lib/employer/services/companyEmbeddingText'
import { buildJobEmbeddingText } from '@/lib/employer/services/jobEmbeddingText'
import { embedText } from '@/lib/shared/embeddings/embed'
import { getQdrantClient, COLLECTIONS } from '@/lib/shared/qdrant/client'
import { cosineSimilarity, toMatchPercent } from '@/lib/shared/matching/matchScore'

const BATCH_SIZE = 50

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size))
  return chunks
}

interface GroupResult {
  total: number
  succeeded: number
}

/**
 * Phase-5 backfill — generates and upserts embeddings for every talent
 * profile, employer profile, and job that existed before the Phases 2-4
 * write-path hooks were added. Dev-only, re-runnable (not deleted after one
 * use — may need to run again after a future model/serializer change).
 */
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  const admin = createSupabaseAdminClient()
  const errors: string[] = []

  // --- Talent profiles ---
  const { data: talentRows, error: talentError } = await admin
    .from('talent_profiles')
    .select(`
      user_id,
      headline,
      overview,
      location,
      skills,
      preferred_roles,
      talent_experiences (role, company, description),
      talent_educations (degree, field, school)
    `)

  if (talentError) errors.push(`talent_profiles query: ${talentError.message}`)

  const talentResult: GroupResult = { total: talentRows?.length ?? 0, succeeded: 0 }
  const talentPoints: { id: string; vector: number[]; payload: Record<string, unknown> }[] = []

  for (const row of talentRows ?? []) {
    try {
      const text = buildTalentProfileEmbeddingText({
        headline: row.headline || '',
        overview: row.overview || '',
        location: row.location || '',
        skills: row.skills || [],
        preferredRoles: row.preferred_roles || [],
        experience: row.talent_experiences || [],
        education: row.talent_educations || [],
      })
      const vector = await embedText(text)
      talentPoints.push({ id: row.user_id, vector, payload: { updated_at: new Date().toISOString() } })
      talentResult.succeeded++
    } catch (err) {
      errors.push(`talent_profiles ${row.user_id}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // --- Employer profiles ---
  const { data: employerRows, error: employerError } = await admin
    .from('employer_profiles')
    .select('id, tagline, industry, headquarters, overview, culture, benefits, tech_stack')

  if (employerError) errors.push(`employer_profiles query: ${employerError.message}`)

  const employerIds = (employerRows ?? []).map((r) => r.id)
  const { data: baseProfiles, error: baseProfilesError } = employerIds.length
    ? await admin.from('profiles').select('id, company').in('id', employerIds)
    : { data: [], error: null }

  if (baseProfilesError) errors.push(`profiles query: ${baseProfilesError.message}`)

  const companyNameById = new Map((baseProfiles ?? []).map((p) => [p.id, p.company]))

  const employerResult: GroupResult = { total: employerRows?.length ?? 0, succeeded: 0 }
  const employerPoints: { id: string; vector: number[]; payload: Record<string, unknown> }[] = []

  for (const row of employerRows ?? []) {
    try {
      const text = buildCompanyEmbeddingText({
        name: companyNameById.get(row.id) || '',
        tagline: row.tagline || '',
        industry: row.industry || '',
        headquarters: row.headquarters || '',
        overview: row.overview || '',
        culture: row.culture || '',
        benefits: row.benefits || '',
        techStack: row.tech_stack || '',
      })
      const vector = await embedText(text)
      employerPoints.push({ id: row.id, vector, payload: { updated_at: new Date().toISOString() } })
      employerResult.succeeded++
    } catch (err) {
      errors.push(`employer_profiles ${row.id}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // --- Jobs ---
  const { data: jobRows, error: jobsError } = await admin
    .from('jobs')
    .select('id, employer_id, status, title, description, responsibilities, requirements, tags')

  if (jobsError) errors.push(`jobs query: ${jobsError.message}`)

  const jobResult: GroupResult = { total: jobRows?.length ?? 0, succeeded: 0 }
  const jobPoints: { id: string; vector: number[]; payload: Record<string, unknown> }[] = []

  for (const row of jobRows ?? []) {
    try {
      const text = buildJobEmbeddingText({
        title: row.title || '',
        description: row.description || '',
        responsibilities: row.responsibilities || [],
        requirements: row.requirements || [],
        tags: row.tags || [],
      })
      const vector = await embedText(text)
      jobPoints.push({
        id: row.id,
        vector,
        payload: { employer_id: row.employer_id, status: row.status, updated_at: new Date().toISOString() },
      })
      jobResult.succeeded++
    } catch (err) {
      errors.push(`jobs ${row.id}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // --- Upsert everything in batches ---
  const qdrant = await getQdrantClient()

  try {
    for (const batch of chunk(talentPoints, BATCH_SIZE)) {
      await qdrant.upsert(COLLECTIONS.talentProfiles, { points: batch })
    }
    for (const batch of chunk(employerPoints, BATCH_SIZE)) {
      await qdrant.upsert(COLLECTIONS.employerProfiles, { points: batch })
    }
    for (const batch of chunk(jobPoints, BATCH_SIZE)) {
      await qdrant.upsert(COLLECTIONS.jobs, { points: batch })
    }
  } catch (err) {
    errors.push(`Qdrant upsert: ${err instanceof Error ? err.message : String(err)}`)
  }

  // --- Recompute existing applications' ats_score with the new method ---
  const { data: appRows, error: appsError } = await admin
    .from('applications')
    .select('id, talent_id, job_id')

  if (appsError) errors.push(`applications query: ${appsError.message}`)

  const applicationsResult: GroupResult = { total: appRows?.length ?? 0, succeeded: 0 }
  const talentVectorById = new Map<string, number[]>()
  const jobVectorById = new Map<string, number[]>()

  try {
    const uniqueTalentIds = Array.from(new Set((appRows ?? []).map((a) => a.talent_id)))
    const uniqueJobIds = Array.from(new Set((appRows ?? []).map((a) => a.job_id)))

    if (uniqueTalentIds.length) {
      const points = await qdrant.retrieve(COLLECTIONS.talentProfiles, { ids: uniqueTalentIds, with_vector: true })
      points.forEach((p) => { if (Array.isArray(p.vector)) talentVectorById.set(String(p.id), p.vector as number[]) })
    }
    if (uniqueJobIds.length) {
      const points = await qdrant.retrieve(COLLECTIONS.jobs, { ids: uniqueJobIds, with_vector: true })
      points.forEach((p) => { if (Array.isArray(p.vector)) jobVectorById.set(String(p.id), p.vector as number[]) })
    }
  } catch (err) {
    errors.push(`Retrieving vectors for applications recompute: ${err instanceof Error ? err.message : String(err)}`)
  }

  for (const app of appRows ?? []) {
    try {
      const talentVector = talentVectorById.get(app.talent_id)
      const jobVector = jobVectorById.get(app.job_id)
      if (!talentVector || !jobVector) {
        errors.push(`applications ${app.id}: missing vector for talent or job`)
        continue
      }
      const score = toMatchPercent(cosineSimilarity(talentVector, jobVector))
      const { error: updateError } = await admin.from('applications').update({ ats_score: score }).eq('id', app.id)
      if (updateError) throw updateError
      applicationsResult.succeeded++
    } catch (err) {
      errors.push(`applications ${app.id}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return NextResponse.json({
    talentProfiles: talentResult,
    employerProfiles: employerResult,
    jobs: jobResult,
    applications: applicationsResult,
    errors,
  })
}
