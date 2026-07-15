export type RankGrade = "D" | "C" | "B" | "A" | "S";

export interface RankSignal {
  key: string;
  label: string;
  description: string;
  score: number;      // 0–100
  rawValue: number;
  unit: string;
  weightedPoints: number; // contribution to total (0–100 * weight)
}

export interface CompanyRanking {
  grade: RankGrade;
  totalScore: number;   // 0–100 composite
  signals: RankSignal[];
  activeBoosts: string[];
  nextGrade: RankGrade | null;
  pointsToNext: number | null;
}

export interface CompanyReview {
  id: string;
  companyName: string;
  rating: number;       // 1–5
  comment: string;
  reviewerName: string;
  createdAt: string;    // ISO
}
