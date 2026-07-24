import type { EmployerJob } from '@/types/employer/job'

type JobForEmbedding = Pick<EmployerJob, 'title' | 'description' | 'responsibilities' | 'requirements' | 'tags'>

/** Turns a job posting into a single block of text for embedding. */
export function buildJobEmbeddingText(job: JobForEmbedding): string {
  const lines = [
    job.title,
    job.description,
    ...(job.responsibilities ?? []),
    ...(job.requirements ?? []),
    job.tags?.length ? `Skills: ${job.tags.join(', ')}` : '',
  ]

  return lines.filter(Boolean).join('\n')
}
