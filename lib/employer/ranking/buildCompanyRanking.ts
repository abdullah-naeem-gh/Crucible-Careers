import type { CompanyRanking, RankGrade, RankSignal } from "@/types/employer/ranking";
import type { EmployerJob } from "@/types/employer/job";

// ── Thresholds ──────────────────────────────────────────────────────────────
const GRADE_THRESHOLDS: Array<{ grade: RankGrade; min: number }> = [
  { grade: "S", min: 88 },
  { grade: "A", min: 72 },
  { grade: "B", min: 54 },
  { grade: "C", min: 36 },
  { grade: "D", min: 0 },
];

function gradeFromScore(score: number): RankGrade {
  for (const { grade, min } of GRADE_THRESHOLDS) {
    if (score >= min) return grade;
  }
  return "D";
}

// Iterate lowest→highest so a D score finds C next, not S
const GRADE_THRESHOLDS_ASC: Array<{ grade: RankGrade; min: number }> = [
  { grade: "C", min: 36 },
  { grade: "B", min: 54 },
  { grade: "A", min: 72 },
  { grade: "S", min: 88 },
];

function nextGradeInfo(
  score: number,
): { nextGrade: RankGrade | null; pointsToNext: number | null } {
  for (const { grade, min } of GRADE_THRESHOLDS_ASC) {
    if (score < min) {
      return { nextGrade: grade, pointsToNext: min - score };
    }
  }
  return { nextGrade: null, pointsToNext: null }; // already S
}

// ── Scoring ─────────────────────────────────────────────────────────────────
const WEIGHTS = { jobs: 0.25, hires: 0.30, reviews: 0.20, boosts: 0.25 };

export function buildCompanyRanking(
  jobs: EmployerJob[],
  activeBoosts: string[],
  avgReviewRating: number, // 0–5
): CompanyRanking {
  // Signal: jobs posted — max meaningful = 20 → 100 %
  const jobsScore = Math.min((jobs.length / 20) * 100, 100);

  // Signal: successful hires — estimate ~18% of applications shortlisted
  const totalShortlisted = jobs.reduce(
    (sum, j) => sum + Math.floor(j.applications * 0.18),
    0,
  );
  const hiresScore = Math.min((totalShortlisted / 15) * 100, 100);

  // Signal: reviews — avg rating (0–5) mapped to 0–100
  const reviewScore = Math.min((avgReviewRating / 5) * 100, 100);

  // Signal: premium boosts — map active boosts to score (max 10 points → 100%)
  let boostsPoints = 0;
  if (activeBoosts.includes("job-spotlight")) boostsPoints += 3;
  if (activeBoosts.includes("candidate-unlock")) boostsPoints += 3;
  if (activeBoosts.includes("profile-branding")) boostsPoints += 4;

  const boostsScore = Math.min((boostsPoints / 10) * 100, 100);

  const totalScore = Math.round(
    jobsScore * WEIGHTS.jobs +
      hiresScore * WEIGHTS.hires +
      reviewScore * WEIGHTS.reviews +
      boostsScore * WEIGHTS.boosts,
  );

  const grade = gradeFromScore(totalScore);
  const { nextGrade, pointsToNext } = nextGradeInfo(totalScore);

  const signals: RankSignal[] = [
    {
      key: "jobs",
      label: "Jobs Posted",
      description: "Active and historical job listings",
      score: jobsScore,
      rawValue: jobs.length,
      unit: "jobs",
      weightedPoints: Math.round(jobsScore * WEIGHTS.jobs),
    },
    {
      key: "hires",
      label: "Successful Hires",
      description: "Estimated shortlisted / hired candidates",
      score: hiresScore,
      rawValue: totalShortlisted,
      unit: "hires",
      weightedPoints: Math.round(hiresScore * WEIGHTS.hires),
    },
    {
      key: "reviews",
      label: "Employer Reviews",
      description: "Talent & community rating",
      score: reviewScore,
      rawValue: Math.round(avgReviewRating * 10) / 10,
      unit: "/ 5",
      weightedPoints: Math.round(reviewScore * WEIGHTS.reviews),
    },
    {
      key: "boosts",
      label: "Premium Boosts",
      description: "Purchased visibility & outreach packages",
      score: boostsScore,
      rawValue: activeBoosts.length,
      unit: "boosts",
      weightedPoints: Math.round(boostsScore * WEIGHTS.boosts),
    },
  ];

  return { grade, totalScore, signals, activeBoosts, nextGrade, pointsToNext };
}
