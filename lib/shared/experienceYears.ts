import type { TalentExperience } from "@/types/talent/profile";

export function computeExperienceYears(experience: TalentExperience[]): number {
  const counted = (experience || []).filter((exp) => exp.verificationStatus !== 'rejected');
  if (counted.length === 0) return 0;
  const total = counted.reduce((sum, exp) => {
    const start = parseInt(exp.startDate, 10) || 0;
    const end = exp.current ? new Date().getFullYear() : parseInt(exp.endDate, 10) || 0;
    if (start && end && end >= start) {
      return sum + (end - start);
    }
    return sum + 1;
  }, 0);
  return total === 0 ? 1 : total;
}
