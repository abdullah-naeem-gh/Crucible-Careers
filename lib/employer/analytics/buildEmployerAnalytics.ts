export type AnalyticsJobStatus = "Active" | "Draft" | "Paused" | "Closed";

export interface EmployerAnalyticsJobInput {
  id: string;
  title: string;
  location: string;
  type: string;
  status: AnalyticsJobStatus;
  tags: string[];
  applications: number;
  views: number;
  matchScore: number;
}

export interface EmployerAnalyticsApplicantInput {
  id: string;
  name?: string;
  screeningStatus?: "unscreened" | "shortlisted" | "rejected";
  skills?: string[];
  experienceYears?: number;
}

export type EmployerApplicantGroups = Record<string, EmployerAnalyticsApplicantInput[]>;

export interface EmployerAnalyticsInsight {
  id: string;
  title: string;
  body: string;
  tone: "positive" | "warning" | "neutral";
  jobId?: string;
}

export interface EmployerAnalyticsSnapshot {
  summary: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    totalViews: number;
    totalShortlisted: number;
    totalRejected: number;
    totalReviewed: number;
    totalUnreviewed: number;
    avgApplications: number;
    avgViews: number;
    avgMatchScore: number;
    viewToApplyRate: number;
    shortlistRate: number;
    rejectionRate: number;
  };
  funnel: Array<{
    key: "views" | "applications" | "reviewed" | "shortlisted" | "rejected";
    label: string;
    value: number;
    conversionFromPrevious: number | null;
    dropOffFromPrevious: number | null;
  }>;
  jobs: Array<{
    id: string;
    title: string;
    status: AnalyticsJobStatus;
    views: number;
    applications: number;
    conversionRate: number;
    matchScore: number;
    shortlisted: number;
    rejected: number;
    unreviewed: number;
    totalApplicants: number;
    health: "strong" | "attention" | "steady" | "inactive";
    recommendation: string;
  }>;
  candidateQuality: {
    averageMatchScore: number;
    shortlistRatio: number;
    topSkills: Array<{ skill: string; count: number }>;
    weakTags: Array<{ skill: string; count: number }>;
  };
  insights: EmployerAnalyticsInsight[];
}

const safeRate = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0);

const getApplicantCounts = (applicants: EmployerAnalyticsApplicantInput[] = []) => {
  const shortlisted = applicants.filter((applicant) => applicant.screeningStatus === "shortlisted").length;
  const rejected = applicants.filter((applicant) => applicant.screeningStatus === "rejected").length;
  const reviewed = shortlisted + rejected;
  return {
    shortlisted,
    rejected,
    reviewed,
    unreviewed: Math.max(applicants.length - reviewed, 0),
    totalApplicants: applicants.length,
  };
};

const getJobRecommendation = (
  job: EmployerAnalyticsJobInput,
  conversionRate: number,
  unreviewed: number,
  avgConversionRate: number,
) => {
  if (job.status !== "Active") return "Exclude inactive roles from weekly pipeline review until they are ready to publish.";
  if (job.views > 0 && job.applications === 0) return "High visibility, no applicants. Review the title, salary range, and must-have requirements.";
  if (job.views >= 80 && conversionRate < Math.max(avgConversionRate * 0.65, 8)) return "Traffic is not turning into applications. Clarify the role pitch and simplify unclear requirements.";
  if (unreviewed >= 5) return "Application volume is building. Screen candidates before the review queue gets stale.";
  if (job.matchScore >= 85 && conversionRate >= avgConversionRate) return "This role is performing well. Keep sourcing active and follow up quickly with qualified applicants.";
  return "Performance is stable. Watch the next applicant batch before making major edits.";
};

const getJobHealth = (
  job: EmployerAnalyticsJobInput,
  conversionRate: number,
  unreviewed: number,
  avgConversionRate: number,
): "strong" | "attention" | "steady" | "inactive" => {
  if (job.status !== "Active") return "inactive";
  if ((job.views > 0 && job.applications === 0) || unreviewed >= 5 || conversionRate < Math.max(avgConversionRate * 0.65, 8)) return "attention";
  if (job.matchScore >= 85 && conversionRate >= avgConversionRate) return "strong";
  return "steady";
};

export function buildEmployerAnalytics(
  jobs: EmployerAnalyticsJobInput[],
  applicantGroups: EmployerApplicantGroups = {},
): EmployerAnalyticsSnapshot {
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((job) => job.status === "Active").length;
  const totalApplications = jobs.reduce((sum, job) => sum + job.applications, 0);
  const totalViews = jobs.reduce((sum, job) => sum + job.views, 0);
  const avgConversionRate = safeRate(totalApplications, totalViews);

  const applicantTotals = jobs.reduce(
    (totals, job) => {
      const counts = getApplicantCounts(applicantGroups[job.id]);
      totals.shortlisted += counts.shortlisted;
      totals.rejected += counts.rejected;
      totals.reviewed += counts.reviewed;
      totals.unreviewed += counts.unreviewed;
      return totals;
    },
    { shortlisted: 0, rejected: 0, reviewed: 0, unreviewed: 0 },
  );

  const jobRows = jobs
    .map((job) => {
      const counts = getApplicantCounts(applicantGroups[job.id]);
      const conversionRate = safeRate(job.applications, job.views);
      return {
        id: job.id,
        title: job.title,
        status: job.status,
        views: job.views,
        applications: job.applications,
        conversionRate,
        matchScore: job.matchScore,
        shortlisted: counts.shortlisted,
        rejected: counts.rejected,
        unreviewed: counts.unreviewed,
        totalApplicants: counts.totalApplicants,
        health: getJobHealth(job, conversionRate, counts.unreviewed, avgConversionRate),
        recommendation: getJobRecommendation(job, conversionRate, counts.unreviewed, avgConversionRate),
      };
    })
    .sort((a, b) => b.applications - a.applications || b.views - a.views);

  const allApplicants = Object.values(applicantGroups).flat();
  const skillCounts = new Map<string, number>();
  allApplicants.forEach((applicant) => {
    applicant.skills?.forEach((skill) => {
      skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
    });
  });

  const tagCounts = new Map<string, number>();
  jobs.forEach((job) => {
    job.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1));
  });

  const topSkills = Array.from(skillCounts.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count || a.skill.localeCompare(b.skill))
    .slice(0, 6);

  const weakTags = Array.from(tagCounts.entries())
    .map(([skill, count]) => ({ skill, count: skillCounts.get(skill) || 0 }))
    .sort((a, b) => a.count - b.count || a.skill.localeCompare(b.skill))
    .slice(0, 6);

  const insights: EmployerAnalyticsInsight[] = [];
  const attentionJob = jobRows.find((job) => job.health === "attention");
  const strongJob = jobRows.find((job) => job.health === "strong");
  const unreviewedJob = jobRows.find((job) => job.unreviewed > 0);

  if (attentionJob) {
    insights.push({
      id: `attention-${attentionJob.id}`,
      title: `${attentionJob.title} needs review`,
      body: attentionJob.recommendation,
      tone: "warning",
      jobId: attentionJob.id,
    });
  }

  if (unreviewedJob) {
    insights.push({
      id: `review-${unreviewedJob.id}`,
      title: "Review queue",
      body: `${unreviewedJob.title} has ${unreviewedJob.unreviewed} unreviewed applicant${unreviewedJob.unreviewed === 1 ? "" : "s"}. Shortlist or reject them to keep the process moving.`,
      tone: "neutral",
      jobId: unreviewedJob.id,
    });
  }

  if (strongJob) {
    insights.push({
      id: `strong-${strongJob.id}`,
      title: `${strongJob.title} is performing well`,
      body: "This role has healthy application conversion and candidate fit. Keep promotion active and follow up quickly.",
      tone: "positive",
      jobId: strongJob.id,
    });
  }

  if (!insights.length) {
    insights.push({
      id: "baseline",
      title: "Analytics baseline",
      body: totalJobs ? "Add more applicant decisions to make the funnel view more useful." : "Create a job to start collecting employer analytics.",
      tone: "neutral",
    });
  }

  const reviewed = applicantTotals.reviewed;
  const shortlisted = applicantTotals.shortlisted;
  const rejected = applicantTotals.rejected;

  return {
    summary: {
      totalJobs,
      activeJobs,
      totalApplications,
      totalViews,
      totalShortlisted: shortlisted,
      totalRejected: rejected,
      totalReviewed: reviewed,
      totalUnreviewed: applicantTotals.unreviewed,
      avgApplications: totalJobs ? Math.round(totalApplications / totalJobs) : 0,
      avgViews: totalJobs ? Math.round(totalViews / totalJobs) : 0,
      avgMatchScore: totalJobs ? Math.round(jobs.reduce((sum, job) => sum + job.matchScore, 0) / totalJobs) : 0,
      viewToApplyRate: avgConversionRate,
      shortlistRate: safeRate(shortlisted, totalApplications),
      rejectionRate: safeRate(rejected, reviewed),
    },
    funnel: [
      { key: "views", label: "Views", value: totalViews, conversionFromPrevious: null, dropOffFromPrevious: null },
      { key: "applications", label: "Applications", value: totalApplications, conversionFromPrevious: safeRate(totalApplications, totalViews), dropOffFromPrevious: totalViews ? 100 - safeRate(totalApplications, totalViews) : null },
      { key: "reviewed", label: "Reviewed", value: reviewed, conversionFromPrevious: safeRate(reviewed, totalApplications), dropOffFromPrevious: totalApplications ? 100 - safeRate(reviewed, totalApplications) : null },
      { key: "shortlisted", label: "Shortlisted", value: shortlisted, conversionFromPrevious: safeRate(shortlisted, reviewed), dropOffFromPrevious: reviewed ? 100 - safeRate(shortlisted, reviewed) : null },
      { key: "rejected", label: "Rejected", value: rejected, conversionFromPrevious: safeRate(rejected, reviewed), dropOffFromPrevious: reviewed ? 100 - safeRate(rejected, reviewed) : null },
    ],
    jobs: jobRows,
    candidateQuality: {
      averageMatchScore: totalJobs ? Math.round(jobs.reduce((sum, job) => sum + job.matchScore, 0) / totalJobs) : 0,
      shortlistRatio: safeRate(shortlisted, totalApplications),
      topSkills,
      weakTags,
    },
    insights: insights.slice(0, 4),
  };
}

