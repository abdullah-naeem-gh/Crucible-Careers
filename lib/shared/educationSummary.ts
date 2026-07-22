import type { TalentEducation } from "@/types/talent/profile";

export function formatEducationSummary(education: TalentEducation[]): string {
  if (!education || education.length === 0) return "";
  return education
    .map((edu) => {
      const degreeField = [edu.degree, edu.field].filter(Boolean).join(" in ");
      const years = [edu.startYear, edu.endYear].filter(Boolean).join("–");
      const parts = [degreeField, edu.school].filter(Boolean).join(", ");
      return years ? `${parts} (${years})` : parts;
    })
    .filter(Boolean)
    .join("; ");
}
