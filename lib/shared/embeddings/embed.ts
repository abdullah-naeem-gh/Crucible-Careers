import { pipeline } from '@huggingface/transformers'

/** Output dimension of Xenova/all-MiniLM-L6-v2 — every Qdrant collection this
 *  app writes to must be created with this same vector size. */
export const EMBEDDING_DIM = 384

type Extractor = Awaited<ReturnType<typeof pipeline<'feature-extraction'>>>

/** Loaded once per server process and reused for every call — safe because
 *  this app runs as a long-running Node process (not serverless), so the
 *  model stays warm in memory instead of being reloaded per request. */
let extractorPromise: Promise<Extractor> | null = null

function getExtractor(): Promise<Extractor> {
  if (!extractorPromise) {
    extractorPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
  }
  return extractorPromise
}

/** Embeds a single piece of text into a normalized 384-dim vector, suitable
 *  for cosine-similarity comparison in Qdrant. */
export async function embedText(text: string): Promise<number[]> {
  const extractor = await getExtractor()
  const output = await extractor(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data as Float32Array)
}
