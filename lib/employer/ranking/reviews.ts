import type { CompanyReview } from "@/types/employer/ranking";

/** Reviews + average rating for the logged-in employer's own company. */
export async function getEmployerReviews(): Promise<{ reviews: CompanyReview[]; averageRating: number }> {
  try {
    const res = await fetch("/api/employer/reviews");
    if (!res.ok) return { reviews: [], averageRating: 0 };
    return await res.json();
  } catch (err) {
    console.error("getEmployerReviews error:", err);
    return { reviews: [], averageRating: 0 };
  }
}

/** Talent submits a review tied to one of their own real applications. */
export async function addReview(params: { applicationId: string; rating: number; comment: string }): Promise<void> {
  const res = await fetch(`/api/talent/applications/${params.applicationId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating: params.rating, comment: params.comment }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to submit review");
  }
}

/** Active boost type ids for the logged-in employer's own company. */
export async function getEmployerBoosts(): Promise<string[]> {
  try {
    const res = await fetch("/api/employer/boosts");
    if (!res.ok) return [];
    const data = await res.json();
    return data.activeBoosts ?? [];
  } catch (err) {
    console.error("getEmployerBoosts error:", err);
    return [];
  }
}

/** Activate/deactivate a boost for the logged-in employer — instant & free, payments come later. */
export async function toggleEmployerBoost(boostType: string, isActive: boolean): Promise<void> {
  const res = await fetch("/api/employer/boosts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ boostType, isActive }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to update boost");
  }
}

/** Employer ids that currently have an active "job-spotlight" boost. */
export async function getFeaturedEmployerIds(): Promise<Set<string>> {
  try {
    const res = await fetch("/api/talent/featured-companies");
    if (!res.ok) return new Set();
    const data = await res.json();
    return new Set<string>(data.employerIds ?? []);
  } catch (err) {
    console.error("getFeaturedEmployerIds error:", err);
    return new Set();
  }
}
