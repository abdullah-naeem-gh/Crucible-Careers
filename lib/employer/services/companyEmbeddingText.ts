import type { CompanyProfile } from '@/types/employer/profile'

type CompanyProfileForEmbedding = Pick<
  CompanyProfile,
  'name' | 'tagline' | 'industry' | 'headquarters' | 'overview' | 'culture' | 'benefits' | 'techStack'
>

/** Turns a company profile into a single block of text for embedding — only
 *  fields with real semantic matching value (no dates, sizes, or URLs). */
export function buildCompanyEmbeddingText(profile: CompanyProfileForEmbedding): string {
  const lines = [
    profile.name,
    profile.tagline,
    profile.industry,
    profile.headquarters,
    profile.overview,
    profile.culture,
    profile.benefits,
    profile.techStack,
  ]

  return lines.filter(Boolean).join('\n')
}
