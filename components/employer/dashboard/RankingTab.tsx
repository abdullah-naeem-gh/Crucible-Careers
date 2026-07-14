"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconBriefcase,
  IconInfoCircle,
  IconStar,
  IconStarFilled,
  IconUsers,
  IconBolt,
} from "@tabler/icons-react";
import type { EmployerJob } from "@/types/employer/job";
import type { CompanyRanking, CompanyReview, RankGrade } from "@/types/employer/ranking";
import { buildCompanyRanking } from "@/lib/employer/ranking/buildCompanyRanking";
import {
  getReviewsForCompany,
  getAverageRating,
  getActiveBoosts,
  setActiveBoosts,
} from "@/lib/employer/ranking/reviews";

// ── Constants ─────────────────────────────────────────────────────────────────

interface BoostPackage {
  id: string;
  name: string;
  price: string;
  description: string;
  points: number;
  features: string[];
}

const BOOST_PACKAGES: BoostPackage[] = [
  {
    id: "job-spotlight",
    name: "Job Board Spotlight",
    price: "$19.99/mo",
    description: "Featured badge & top search placement",
    points: 3,
    features: [
      "Highlighted 'Featured' badge on all job listings",
      "Priority top placement in talent search results",
      "Estimated 3x higher applicant click-through rate",
    ],
  },
  {
    id: "candidate-unlock",
    name: "Talent Match Unlock",
    price: "$29.99/mo",
    description: "Direct outreach & contact details",
    points: 3,
    features: [
      "Direct chat messaging with matching candidates",
      "Unlock full contact details (email, phone, resume links)",
      "Automated match alerts for new candidate profiles",
    ],
  },
  {
    id: "profile-branding",
    name: "Company Branding Pro",
    price: "$14.99/mo",
    description: "Verified badge & custom banner",
    points: 4,
    features: [
      "Verified Employer badge next to company name",
      "Custom brand header image and links on profile page",
      "Remove third-party ads or competitor job links",
    ],
  },
];

// Thresholds shown in the info tooltip
const RANK_THRESHOLDS: Array<{ grade: RankGrade; min: number; max: number }> = [
  { grade: "D", min: 0,  max: 35 },
  { grade: "C", min: 36, max: 53 },
  { grade: "B", min: 54, max: 71 },
  { grade: "A", min: 72, max: 87 },
  { grade: "S", min: 88, max: 100 },
];

const GRADE_CONFIG: Record<
  RankGrade,
  { color: string; glow: string; bg: string; border: string; label: string; textGlow: string }
> = {
  D: {
    color: "text-rose-400",
    glow: "shadow-[0_0_18px_rgba(251,113,133,0.18)]",
    bg: "bg-rose-500/[0.07]",
    border: "border-rose-500/20",
    label: "Developing",
    textGlow: "",
  },
  C: {
    color: "text-amber-400",
    glow: "shadow-[0_0_18px_rgba(251,191,36,0.15)]",
    bg: "bg-amber-500/[0.07]",
    border: "border-amber-500/20",
    label: "Competent",
    textGlow: "",
  },
  B: {
    color: "text-orange-400",
    glow: "shadow-[0_0_18px_rgba(255,107,0,0.18)]",
    bg: "bg-orange-500/[0.07]",
    border: "border-orange-500/20",
    label: "Established",
    textGlow: "",
  },
  A: {
    color: "text-sky-400",
    glow: "shadow-[0_0_18px_rgba(56,189,248,0.15)]",
    bg: "bg-sky-500/[0.07]",
    border: "border-sky-500/20",
    label: "Distinguished",
    textGlow: "",
  },
  S: {
    color: "text-emerald-400",
    glow: "shadow-[0_0_22px_rgba(52,211,153,0.2)]",
    bg: "bg-emerald-500/[0.07]",
    border: "border-emerald-500/20",
    label: "Supreme",
    textGlow: "",
  },
};

const GRADE_ORDER: RankGrade[] = ["D", "C", "B", "A", "S"];

const surface =
  "rounded-[24px] border border-white/[0.07] bg-[#171717] shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)]";
const insetSurface =
  "rounded-2xl border border-white/[0.065] bg-[#141414] shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2),inset_-1px_-1px_3px_rgba(255,255,255,0.025)]";

// ── Demo seed: gives a B-rank without persistent storage ──────────────────────
// Jobs=8 gives jobsScore=40 → 10pts. Hires demo seeded ~18 → 100% → 30pts.
// Reviews 4.2/5 → 84% → 17pts. Stars=0 → 0pts. Total ≈ 57 → B
const DEMO_AVG_RATING = 4.2;
const DEMO_SHORTLISTED_OVERRIDE = 18; // injected so hires score hits ~100

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({
  value,
  tone = "orange",
}: {
  value: number;
  tone?: "orange" | "emerald" | "sky" | "amber" | "rose";
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 80);
    return () => clearTimeout(t);
  }, [value]);

  const colors: Record<string, string> = {
    orange: "from-[#FF6B00] to-[#FF914D]",
    emerald: "from-emerald-500 to-emerald-300",
    sky: "from-sky-500 to-sky-300",
    amber: "from-amber-500 to-amber-300",
    rose: "from-rose-500 to-rose-300",
  };

  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.055]">
      <div
        className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out ${colors[tone]}`}
        style={{ width: `${Math.max(0, Math.min(width, 100))}%` }}
      />
    </div>
  );
}

function StarRow({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) =>
        star <= Math.round(rating) ? (
          <IconStarFilled key={star} size={size} className="text-amber-400" />
        ) : (
          <IconStar key={star} size={size} className="text-white/20" />
        ),
      )}
    </div>
  );
}

function GradeBadge({ grade }: { grade: RankGrade }) {
  const cfg = GRADE_CONFIG[grade];
  const isS = grade === "S";

  return (
    <div
      className={`relative grid place-items-center rounded-2xl border font-black ${cfg.bg} ${cfg.border} ${cfg.glow} ${cfg.color} h-24 w-24 text-5xl`}
    >
      {isS && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/8 via-transparent to-sky-400/8 animate-pulse" />
      )}
      {grade}
    </div>
  );
}

function RankInfoTooltip({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-8 z-20 w-56 rounded-2xl border border-white/[0.09] bg-[#1c1c1c] p-3 shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
        >
          <p className="text-[10px] uppercase tracking-wider text-white/35 font-semibold mb-2">
            Score → Rank
          </p>
          <div className="space-y-1.5">
            {RANK_THRESHOLDS.map(({ grade, min, max }) => {
              const cfg = GRADE_CONFIG[grade];
              return (
                <div key={grade} className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-bold ${cfg.color}`}>{grade}</span>
                  <span className="text-[10px] text-white/40">
                    {grade === "S" ? `${min} – 100` : `${min} – ${max}`} pts
                  </span>
                  <span className="text-[10px] text-white/25">{cfg.label}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-2.5 text-[9px] leading-relaxed text-white/25">
            Score = Jobs×25% + Hires×30% + Reviews×20% + Boosts×25%
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GradeLadder({ current }: { current: RankGrade }) {
  return (
    <div className="flex items-center gap-1.5">
      {GRADE_ORDER.map((g, i) => {
        const isCurrent = g === current;
        const isPast = GRADE_ORDER.indexOf(g) < GRADE_ORDER.indexOf(current);
        const cfg = GRADE_CONFIG[g];

        // Slightly color inactive ranks using their theme color with low opacity
        const colorClass = isCurrent
          ? `${cfg.bg} ${cfg.border} ${cfg.color}`
          : isPast
          ? `border-white/[0.05] bg-white/[0.01] ${cfg.color} opacity-50`
          : `border-white/[0.02] bg-transparent ${cfg.color} opacity-25`;

        return (
          <div key={g} className="flex items-center gap-1.5">
            <span
              className={`rounded-lg px-2 py-0.5 text-[11px] font-bold border transition-all ${colorClass}`}
            >
              {g}
            </span>
            {i < GRADE_ORDER.length - 1 && (
              <span className={`text-[10px] ${isPast ? "text-white/20" : "text-white/8"}`}>─</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SignalCard({
  signal,
  index,
}: {
  signal: CompanyRanking["signals"][number];
  index: number;
}) {
  const tones: Record<string, "orange" | "emerald" | "sky" | "amber"> = {
    jobs: "orange",
    hires: "emerald",
    reviews: "amber",
    boosts: "sky",
  };
  const icons: Record<string, React.ReactNode> = {
    jobs: <IconBriefcase size={15} className="text-[#FF914D]" />,
    hires: <IconUsers size={15} className="text-emerald-400" />,
    reviews: <IconStarFilled size={15} className="text-amber-400" />,
    boosts: <IconBolt size={15} className="text-sky-400" />,
  };
  const accentColors: Record<string, string> = {
    jobs: "text-[#FF914D]",
    hires: "text-emerald-400",
    reviews: "text-amber-400",
    boosts: "text-sky-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06, ease: "easeOut" }}
      className={`${insetSurface} p-4`}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {icons[signal.key]}
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
            {signal.label}
          </span>
        </div>
        <span className={`text-[10px] font-semibold ${accentColors[signal.key]} shrink-0`}>
          +{signal.weightedPoints} pts
        </span>
      </div>
      <div className={`text-lg font-bold ${accentColors[signal.key]} mb-2`}>
        {signal.rawValue}
        <span className="ml-1 text-xs font-normal text-white/30">{signal.unit}</span>
      </div>
      <ProgressBar value={signal.score} tone={tones[signal.key] ?? "orange"} />
      <div className="mt-1.5 text-[10px] text-white/25">{signal.description}</div>
    </motion.div>
  );
}

function ReviewCard({ review }: { review: CompanyReview }) {
  const date = new Date(review.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-semibold text-white">{review.reviewerName}</div>
          <div className="mt-1">
            <StarRow rating={review.rating} size={11} />
          </div>
        </div>
        <span className="text-[9px] text-white/25 shrink-0 mt-0.5">{date}</span>
      </div>
      {review.comment && (
        <p className="mt-2 text-[11px] leading-relaxed text-white/40 italic">
          &ldquo;{review.comment}&rdquo;
        </p>
      )}
    </div>
  );
}

function PremiumBoostCard({
  activeBoosts,
  onToggleBoost,
}: {
  activeBoosts: string[];
  onToggleBoost: (boostId: string) => void;
}) {
  const [purchasedKey, setPurchasedKey] = useState<string | null>(null);

  const handleBuy = (boostId: string) => {
    const isActivating = !activeBoosts.includes(boostId);
    onToggleBoost(boostId);
    if (isActivating) {
      setPurchasedKey(boostId);
      setTimeout(() => setPurchasedKey(null), 1600);
    }
  };

  return (
    <div className={`${insetSurface} p-5 flex flex-col gap-4`}>
      <div className="flex items-center gap-2 mb-1">
        <IconBolt size={18} className="text-[#FF914D]" />
        <div>
          <h2 className="text-sm font-semibold text-white">Premium Visibility &amp; Tools</h2>
          <p className="text-[10px] text-white/30">Select specific boosts to amplify your presence and unlock features</p>
        </div>
      </div>

      <div className="space-y-4">
        {BOOST_PACKAGES.map((pkg) => {
          const isActive = activeBoosts.includes(pkg.id);
          return (
            <div
              key={pkg.id}
              className={`relative flex flex-col rounded-2xl border p-4 transition-all duration-300 ${
                isActive
                  ? "border-[#FF6B00]/30 bg-orange-500/[0.035] shadow-[0_4px_20px_rgba(255,107,0,0.05)]"
                  : "border-white/[0.07] bg-white/[0.015] hover:border-white/15"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white">{pkg.name}</h3>
                    {isActive && (
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[10px] text-white/40">{pkg.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-semibold text-[#FF914D]">{pkg.price}</div>
                  <div className="text-[9px] text-white/25">+{pkg.points} pts score</div>
                </div>
              </div>

              {/* What you are paying for details */}
              <div className="mt-3 border-t border-white/[0.04] pt-2.5">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-white/30 mb-1.5">
                  Includes:
                </div>
                <ul className="space-y-1">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-[10px] leading-relaxed text-white/50">
                      <span className="text-[#FF914D] shrink-0 mt-0.5">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleBuy(pkg.id)}
                  className={`w-full sm:w-auto rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "border border-white/10 bg-white/5 text-white/60 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20"
                      : "bg-[#FF6B00] text-white hover:bg-[#FF802B] shadow-[0_4px_12px_rgba(255,107,0,0.2)]"
                  }`}
                >
                  {isActive ? "Deactivate Boost" : "Buy Boost"}
                </button>
              </div>

              <AnimatePresence>
                {purchasedKey === pkg.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center rounded-2xl bg-orange-500/15 text-orange-300 text-xs font-bold backdrop-blur-[1px]"
                  >
                    ✓ Boost Activated!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <p className="text-center text-[9px] text-white/20">
        Demo mode — activation is simulated, instant &amp; free
      </p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface RankingTabProps {
  jobs: EmployerJob[];
  company: string;
}

export default function RankingTab({ jobs, company }: RankingTabProps) {
  const [activeBoosts, setActiveBoostsState] = useState<string[]>([]);
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [avgRating, setAvgRating] = useState(DEMO_AVG_RATING);
  const [showInfo, setShowInfo] = useState(false);

  // Load active boosts on mount
  useEffect(() => {
    const boosts = getActiveBoosts(company);
    setActiveBoostsState(boosts);
  }, [company]);

  const handleToggleBoost = (boostId: string) => {
    let nextBoosts: string[];
    if (activeBoosts.includes(boostId)) {
      nextBoosts = activeBoosts.filter((id) => id !== boostId);
    } else {
      nextBoosts = [...activeBoosts, boostId];
    }
    setActiveBoostsState(nextBoosts);
    setActiveBoosts(company, nextBoosts);
  };

  // Load persisted reviews (written by talent via apply page)
  useEffect(() => {
    const revs = getReviewsForCompany(company);
    if (revs.length > 0) {
      setReviews(revs);
      setAvgRating(getAverageRating(company));
    }
    // If no real reviews, keep demo rating so B rank renders from the start
  }, [company]);

  // Build ranking — inject DEMO_SHORTLISTED_OVERRIDE so hires score is non-zero
  // even with an empty jobs array, giving a realistic B grade by default
  const ranking = useMemo(() => {
    const base = buildCompanyRanking(jobs, activeBoosts, avgRating);
    if (jobs.length === 0) {
      // Demo override: bump hires score so the rank is sensible
      const demoHiresScore = Math.min((DEMO_SHORTLISTED_OVERRIDE / 15) * 100, 100);
      const demoJobsScore = 35; // pretend 7 jobs
      const reviewScore = Math.min((avgRating / 5) * 100, 100);
      
      let boostsPoints = 0;
      if (activeBoosts.includes("job-spotlight")) boostsPoints += 3;
      if (activeBoosts.includes("candidate-unlock")) boostsPoints += 3;
      if (activeBoosts.includes("profile-branding")) boostsPoints += 4;
      const boostsScore = Math.min((boostsPoints / 10) * 100, 100);

      const totalScore = Math.round(
        demoJobsScore * 0.25 + demoHiresScore * 0.30 + reviewScore * 0.20 + boostsScore * 0.25,
      );
      return {
        ...base,
        totalScore,
        grade: (totalScore >= 88 ? "S" : totalScore >= 72 ? "A" : totalScore >= 54 ? "B" : totalScore >= 36 ? "C" : "D") as RankGrade,
      };
    }
    return base;
  }, [jobs, activeBoosts, avgRating]);

  const cfg = GRADE_CONFIG[ranking.grade as RankGrade];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full min-h-0"
    >
      <section className={`${surface} flex h-full flex-col overflow-hidden`}>
        <header className="relative flex flex-col gap-4 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FF914D]">Company Rankings</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">{company}</h1>
            <p className="mt-1.5 text-sm text-white/45">Your ranking details and premium visibility boosts.</p>
          </div>

          {/* Info tooltip trigger */}
          <div className="relative shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setShowInfo((o) => !o)}
              className={`cursor-pointer transition-colors ${showInfo ? "text-white/60" : "text-white/25 hover:text-white/50"} flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 text-xs font-semibold`}
              aria-label="Ranking info"
            >
              <IconInfoCircle size={15} stroke={1.6} />
              <span>Rank Scale</span>
            </button>
            <RankInfoTooltip visible={showInfo} />
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 custom-scrollbar lg:p-6 space-y-5">
          {/* Hero Row (Grade Badge & Progress) */}
          <div className={`${insetSurface} p-5 flex flex-col gap-6 sm:flex-row sm:items-center`}>
            {/* Grade badge */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="text-[9px] uppercase tracking-wider text-white/30 font-semibold">
                Rank
              </div>
              <motion.div
                key={ranking.grade}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
              >
                <GradeBadge grade={ranking.grade as RankGrade} />
              </motion.div>
              <div className={`text-xs font-semibold ${cfg.color} opacity-85`}>{cfg.label}</div>
            </div>

            {/* Score progress */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Performance Score</span>
                <span className={`text-2xl font-black ${cfg.color}`}>
                  {ranking.totalScore}
                  <span className="text-xs font-normal text-white/35 ml-1">/ 100</span>
                </span>
              </div>
              <ProgressBar
                value={ranking.totalScore}
                tone={
                  ranking.grade === "S"
                    ? "emerald"
                    : ranking.grade === "A"
                    ? "sky"
                    : ranking.grade === "B"
                    ? "orange"
                    : ranking.grade === "C"
                    ? "amber"
                    : "rose"
                }
              />
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
                <GradeLadder current={ranking.grade as RankGrade} />
                {ranking.nextGrade ? (
                  <span className="text-[11px] text-white/30">
                    Next: <span className={`font-semibold ${GRADE_CONFIG[ranking.nextGrade].color}`}>{ranking.nextGrade}</span> (+{ranking.pointsToNext} pts)
                  </span>
                ) : (
                  <span className="text-[11px] text-emerald-400 font-semibold">✨ Max Rank Achieved!</span>
                )}
              </div>
            </div>
          </div>

          {/* Signals Grid (2x2) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ranking.signals.map((signal, i) => (
              <SignalCard key={signal.key} signal={signal} index={i} />
            ))}
          </div>

          {/* Reviews + Boost Panel */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Reviews list */}
            <div className={`${insetSurface} p-5 flex flex-col`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/35 font-semibold">Community</p>
                  <h2 className="text-sm font-semibold text-white mt-0.5">Employer Reviews</h2>
                </div>
                {avgRating > 0 && reviews.length > 0 ? (
                  <div className="text-right">
                    <div className="text-lg font-black text-amber-400 leading-none">
                      {avgRating.toFixed(1)}
                    </div>
                    <StarRow rating={avgRating} size={11} />
                    <div className="text-[9px] text-white/25 mt-0.5">
                      {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] text-white/20">No reviews yet</span>
                )}
              </div>

              <div className="flex flex-col gap-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                {reviews.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/[0.06] p-5 text-center my-auto">
                    <IconStar size={18} className="mx-auto mb-1.5 text-white/10" />
                    <p className="text-[11px] text-white/25">
                      Reviews from candidates will appear here after they apply.
                    </p>
                  </div>
                ) : (
                  reviews
                    .slice()
                    .reverse()
                    .map((r) => <ReviewCard key={r.id} review={r} />)
                )}
              </div>
            </div>

            {/* Boost Panel */}
            <PremiumBoostCard activeBoosts={activeBoosts} onToggleBoost={handleToggleBoost} />
          </div>
        </div>
      </section>
    </motion.div>
  );
}
