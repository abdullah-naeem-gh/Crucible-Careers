import type { SemanticType } from "@/types/employer/job";

// Every semantic type that already has its own dedicated section in the
// employer's applicant-detail views (Quick Facts, Skills, Resume,
// Professional Links, Candidate Bio). Anything NOT in this set — today just
// "custom", but also any semantic type added later that a display component
// hasn't been updated for yet — falls back to the generic Questionnaire
// Answers section instead of silently vanishing.
const DEDICATED_SEMANTIC_TYPES = new Set<SemanticType>([
  "name",
  "email",
  "phone",
  "location",
  "experience_years",
  "education",
  "skills",
  "portfolio",
  "linkedin",
  "github",
  "resume",
  "cover_letter",
]);

export function hasDedicatedDisplay(semanticType: SemanticType): boolean {
  return DEDICATED_SEMANTIC_TYPES.has(semanticType);
}
