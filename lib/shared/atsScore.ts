export function computeAtsScore(candidateSkills: string[], jobTags: string[]): number {
  if (!jobTags.length) return 75;
  const matches = candidateSkills.filter((s) =>
    jobTags.some((t) => t.toLowerCase() === s.toLowerCase())
  ).length;
  const percentage = Math.round((matches / Math.max(jobTags.length, 1)) * 100);
  // Scale between 60% and 97% based on alignment
  return Math.min(Math.max(60 + Math.round(percentage * 0.38), 65), 97);
}
