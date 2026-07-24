import type { TalentProfile, TalentExperience, TalentEducation } from '@/types/talent/profile'

type TalentProfileForEmbedding = Pick<
  TalentProfile,
  'headline' | 'overview' | 'location' | 'skills' | 'preferredRoles'
> & {
  experience: Pick<TalentExperience, 'role' | 'company' | 'description'>[]
  education: Pick<TalentEducation, 'degree' | 'field' | 'school'>[]
}

/** Turns a talent profile into a single block of text for embedding — only
 *  fields with real semantic matching value (no contact info, URLs, rates). */
export function buildTalentProfileEmbeddingText(profile: TalentProfileForEmbedding): string {
  const lines = [
    profile.headline,
    profile.overview,
    profile.location,
    profile.skills?.length ? `Skills: ${profile.skills.join(', ')}` : '',
    profile.preferredRoles?.length ? `Preferred roles: ${profile.preferredRoles.join(', ')}` : '',
    ...(profile.experience ?? []).map((e) => `${e.role} at ${e.company}. ${e.description || ''}`.trim()),
    ...(profile.education ?? []).map((e) => `${e.degree} in ${e.field}, ${e.school}`.trim()),
  ]

  return lines.filter(Boolean).join('\n')
}
