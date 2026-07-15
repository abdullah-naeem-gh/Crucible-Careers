import type { CompanyReview } from "@/types/employer/ranking";

const REVIEWS_KEY = "employer_company_reviews";
const STARS_PREFIX = "employer_premium_stars_";
const BOOSTS_PREFIX = "employer_active_boosts_";

// ── Review helpers ──────────────────────────────────────────────────────────

export function getAllReviews(): CompanyReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    return raw ? (JSON.parse(raw) as CompanyReview[]) : [];
  } catch {
    return [];
  }
}

export function getReviewsForCompany(companyName: string): CompanyReview[] {
  return getAllReviews().filter(
    (r) => r.companyName.toLowerCase() === companyName.toLowerCase(),
  );
}

export function addReview(
  review: Omit<CompanyReview, "id" | "createdAt">,
): void {
  if (typeof window === "undefined") return;
  const all = getAllReviews();
  const next: CompanyReview = {
    ...review,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(REVIEWS_KEY, JSON.stringify([...all, next]));
}

export function getAverageRating(companyName: string): number {
  const reviews = getReviewsForCompany(companyName);
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / reviews.length;
}

// ── Premium star & boost helpers ────────────────────────────────────────────

export function getPremiumStars(companyName: string): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(`${STARS_PREFIX}${companyName}`);
  return Math.max(0, parseInt(raw ?? "0", 10));
}

export function setPremiumStars(companyName: string, count: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${STARS_PREFIX}${companyName}`, String(Math.max(0, count)));
}

export function getActiveBoosts(companyName: string): string[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(`${BOOSTS_PREFIX}${companyName}`);
  if (raw) {
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  }
  // Migration from legacy stars
  const legacyStars = getPremiumStars(companyName);
  if (legacyStars > 0) {
    const migrated: string[] = [];
    if (legacyStars >= 1) migrated.push("job-spotlight");
    if (legacyStars >= 3) migrated.push("candidate-unlock");
    if (legacyStars >= 5) migrated.push("profile-branding");
    setActiveBoosts(companyName, migrated);
    return migrated;
  }
  return [];
}

export function setActiveBoosts(companyName: string, boosts: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${BOOSTS_PREFIX}${companyName}`, JSON.stringify(boosts));
  // Keep legacy stars count in sync for other readers / fallback
  let starsCount = 0;
  if (boosts.includes("job-spotlight")) starsCount += 3;
  if (boosts.includes("candidate-unlock")) starsCount += 3;
  if (boosts.includes("profile-branding")) starsCount += 4;
  setPremiumStars(companyName, starsCount);
}

/** Returns a Set of company names that have active job-spotlight boost or legacy premium stars */
export function getFeaturedCompanyNames(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const featured = new Set<string>();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(BOOSTS_PREFIX)) {
      try {
        const boosts = JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
        if (boosts.includes("job-spotlight")) {
          featured.add(key.slice(BOOSTS_PREFIX.length));
        }
      } catch {}
    } else if (key?.startsWith(STARS_PREFIX)) {
      const val = parseInt(localStorage.getItem(key) ?? "0", 10);
      if (val > 0) {
        featured.add(key.slice(STARS_PREFIX.length));
      }
    }
  }
  return featured;
}
