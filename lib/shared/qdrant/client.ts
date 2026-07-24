import { QdrantClient } from '@qdrant/js-client-rest'
import { EMBEDDING_DIM } from '@/lib/shared/embeddings/embed'

export const COLLECTIONS = {
  talentProfiles: 'talent_profiles',
  employerProfiles: 'employer_profiles',
  jobs: 'jobs',
} as const

let client: QdrantClient | null = null
let collectionsReady: Promise<void> | null = null

async function ensureCollections(qdrant: QdrantClient): Promise<void> {
  for (const name of Object.values(COLLECTIONS)) {
    const { exists } = await qdrant.collectionExists(name)
    if (!exists) {
      await qdrant.createCollection(name, {
        vectors: { size: EMBEDDING_DIM, distance: 'Cosine' },
      })
    }
  }
}

/** Lazy singleton, mirroring createSupabaseServerClient()'s pattern — the
 *  first call also idempotently provisions the three collections this app
 *  needs, so no separate manual migration step is required. */
export async function getQdrantClient(): Promise<QdrantClient> {
  if (!client) {
    client = new QdrantClient({
      url: process.env.QDRANT_URL!,
      apiKey: process.env.QDRANT_API_KEY,
    })
  }
  if (!collectionsReady) {
    collectionsReady = ensureCollections(client)
  }
  await collectionsReady
  return client
}
