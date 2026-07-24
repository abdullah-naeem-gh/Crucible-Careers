import { getQdrantClient, COLLECTIONS } from '@/lib/shared/qdrant/client'

/** Cosine similarity between two vectors — range [-1, 1]. Used when scoring
 *  one specific pair (e.g. a single talent against a single job); list-view
 *  scoring instead uses Qdrant's own search, whose score under a Cosine-
 *  distance collection is the same formula computed natively in the DB. */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

/** Maps a cosine similarity score ([-1, 1]) to a friendly 0-100 percentage. */
export function toMatchPercent(score: number): number {
  return Math.max(0, Math.min(100, Math.round(((score + 1) / 2) * 100)))
}

async function retrieveVector(collection: string, id: string): Promise<number[] | null> {
  const qdrant = await getQdrantClient()
  const points = await qdrant.retrieve(collection, { ids: [id], with_vector: true })
  const vector = points[0]?.vector
  return Array.isArray(vector) ? (vector as number[]) : null
}

export function getTalentVector(userId: string): Promise<number[] | null> {
  return retrieveVector(COLLECTIONS.talentProfiles, userId)
}

export function getJobVector(jobId: string): Promise<number[] | null> {
  return retrieveVector(COLLECTIONS.jobs, jobId)
}

/** Scores many jobs against one talent vector in a single Qdrant search call
 *  (native Cosine-distance scoring), rather than one round trip per job. */
export async function scoreJobsForTalent(talentVector: number[], jobIds: string[]): Promise<Map<string, number>> {
  if (jobIds.length === 0) return new Map()

  const qdrant = await getQdrantClient()
  const results = await qdrant.search(COLLECTIONS.jobs, {
    vector: talentVector,
    limit: jobIds.length,
    filter: { must: [{ has_id: jobIds }] },
    with_payload: false,
  })

  return new Map(results.map((r) => [String(r.id), toMatchPercent(r.score)]))
}
