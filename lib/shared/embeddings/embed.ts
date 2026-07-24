/** Output dimension of the embedding model — every Qdrant collection this
 *  app writes to must be created with this same vector size. */
export const EMBEDDING_DIM = 384

const MODEL_ENDPOINT =
  'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction'

function l2Normalize(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0))
  return norm === 0 ? vector : vector.map((v) => v / norm)
}

function meanPool(vectors: number[][]): number[] {
  const dim = vectors[0].length
  const sums = new Array(dim).fill(0)
  for (const v of vectors) {
    for (let i = 0; i < dim; i++) sums[i] += v[i]
  }
  return sums.map((s) => s / vectors.length)
}

/** Reduces whatever shape the API returned for a single text input down to a
 *  list of same-dimension vectors to pool — handles a flat pooled vector, a
 *  batch-of-one wrapper, and unpooled per-token embeddings, since this
 *  specific serverless route's exact response shape isn't fully consistent
 *  across model/task resolution. */
function toVectorList(data: unknown): number[][] {
  const arr = data as any[]
  if (typeof arr[0] === 'number') return [arr as number[]]
  if (Array.isArray(arr[0]) && typeof arr[0][0] === 'number') return arr as number[][]
  if (Array.isArray(arr[0]) && Array.isArray(arr[0][0])) return arr[0] as number[][]
  throw new Error('Unexpected embedding response shape')
}

/** Embeds a single piece of text into a normalized 384-dim vector via
 *  Hugging Face's free serverless Inference API — suitable for cosine-
 *  similarity comparison in Qdrant. Mean-pools whatever shape comes back
 *  (a no-op if it's already a single pooled vector) and always re-
 *  normalizes client-side, so it works whether or not the API already did. */
export async function embedText(text: string): Promise<number[]> {
  const apiKey = process.env.HF_API_KEY
  if (!apiKey) throw new Error('Hugging Face API key is not configured')

  const res = await fetch(MODEL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ inputs: text }),
  })

  if (!res.ok) {
    throw new Error(`Hugging Face API request failed: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  const vectors = toVectorList(data)
  const vector = vectors.length === 1 ? vectors[0] : meanPool(vectors)
  return l2Normalize(vector)
}
