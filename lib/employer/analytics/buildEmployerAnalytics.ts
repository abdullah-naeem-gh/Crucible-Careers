export type AnalyticsJobStatus = "Active" | "Draft" | "Paused" | "Closed";
export type AnalyticsHealth = "strong" | "attention" | "steady" | "inactive";
export type InsightTone = "positive" | "warning" | "neutral";

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
  title?: string;
  location?: string;
  appliedDate?: string;
  screeningStatus?: "unscreened" | "shortlisted" | "rejected";
  skills?: string[];
  experienceYears?: number;
  matchScore?: number;
  source?: string;
}

export type EmployerApplicantGroups = Record<string, EmployerAnalyticsApplicantInput[]>;

export interface EmployerAnalyticsInsight {
  id: string;
  title: string;
  body: string;
  tone: InsightTone;
  jobId?: string;
}

export interface EmployerRoleInsight {
  id: string;
  title: string;
  status: AnalyticsJobStatus;
  location: string;
  type: string;
  views: number;
  applications: number;
  conversionRate: number;
  matchScore: number;
  shortlisted: number;
  rejected: number;
  unreviewed: number;
  totalApplicants: number;
  health: AnalyticsHealth;
  recommendation: string;
  strongSkills: Array<{ skill: string; count: number }>;
  weakRequirements: Array<{ skill: string; count: number }>;
}

export interface EmployerCandidateInsight {
  id: string;
  name: string;
  roleId: string;
  roleTitle: string;
  status: "unscreened" | "shortlisted" | "rejected";
  qualityScore: number;
  experienceYears: number;
  skills: string[];
  recommendation: string;
}

export interface EmployerSourceInsight {
  source: string;
  views: number;
  applications: number;
  conversionRate: number;
  shortlisted: number;
  rejected: number;
  qualityScore: number;
  recommendation: string;
}

export interface EmployerTimelinePoint {
  label: string;
  views: number;
  applications: number;
  reviewed: number;
  shortlisted: number;
  rejected: number;
}

export interface EmployerDimensionInsight {
  label: string;
  views: number;
  applications: number;
  conversionRate: number;
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
    health: AnalyticsHealth;
    recommendation: string;
  }>;
  roleInsights: EmployerRoleInsight[];
  candidateInsights: {
    qualityBuckets: Array<{ label: "High" | "Medium" | "Low"; count: number; percentage: number }>;
    experienceMix: Array<{ label: string; count: number; percentage: number }>;
    reviewQueue: EmployerCandidateInsight[];
    topCandidates: EmployerCandidateInsight[];
    roleDecisionRates: Array<{
      jobId: string;
      title: string;
      shortlisted: number;
      rejected: number;
      unreviewed: number;
      shortlistRate: number;
      rejectionRate: number;
    }>;
  };
  candidateQuality: {
    averageMatchScore: number;
    shortlistRatio: number;
    topSkills: Array<{ skill: string; count: number }>;
    weakTags: Array<{ skill: string; count: number }>;
  };
  sourceInsights: {
    hasSourceData: boolean;
    sources: EmployerSourceInsight[];
    typePerformance: EmployerDimensionInsight[];
    locationPerformance: EmployerDimensionInsight[];
    recommendation: string;
  };
  timeline: EmployerTimelinePoint[];
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
): AnalyticsHealth => {
  if (job.status !== "Active") return "inactive";
  if ((job.views > 0 && job.applications === 0) || unreviewed >= 5 || conversionRate < Math.max(avgConversionRate * 0.65, 8)) return "attention";
  if (job.matchScore >= 85 && conversionRate >= avgConversionRate) return "strong";
  return "steady";
};

const countSkills = (applicants: EmployerAnalyticsApplicantInput[]) => {
  const skillCounts = new Map<string, number>();
  applicants.forEach((applicant) => {
    applicant.skills?.forEach((skill) => {
      skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
    });
  });
  return skillCounts;
};

const mapSkillCounts = (counts: Map<string, number>, limit = 6) =>
  Array.from(counts.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count || a.skill.localeCompare(b.skill))
    .slice(0, limit);

const getCandidateQualityScore = (applicant: EmployerAnalyticsApplicantInput, job: EmployerAnalyticsJobInput) => {
  if (typeof applicant.matchScore === "number") return applicant.matchScore;
  return job.matchScore;
};

const getCandidateRecommendation = (candidate: EmployerCandidateInsight) => {
  if (candidate.status === "shortlisted") return "Already shortlisted. Prioritize outreach and next-step scheduling.";
  if (candidate.status === "rejected") return "Already rejected. No recruiter action needed unless the role criteria changed.";
  if (candidate.qualityScore >= 85) return "High-fit applicant waiting for review. Prioritize screening.";
  if (candidate.experienceYears >= 5) return "Experienced applicant in the review queue. Check role alignment before rejecting.";
  return "Unreviewed applicant. Screen against must-have requirements.";
};

const buildDimensionInsights = (jobs: EmployerAnalyticsJobInput[], key: "type" | "location") => {
  const groups = new Map<string, { views: number; applications: number }>();
  jobs.forEach((job) => {
    const label = job[key] || "Unknown";
    const current = groups.get(label) || { views: 0, applications: 0 };
    current.views += job.views;
    current.applications += job.applications;
    groups.set(label, current);
  });

  return Array.from(groups.entries())
    .map(([label, values]) => ({
      label,
      views: values.views,
      applications: values.applications,
      conversionRate: safeRate(values.applications, values.views),
    }))
    .sort((a, b) => b.applications - a.applications || b.views - a.views);
};

const buildTimeline = (jobs: EmployerAnalyticsJobInput[], applicantGroups: EmployerApplicantGroups): EmployerTimelinePoint[] => {
  const totalViews = jobs.reduce((sum, job) => sum + job.views, 0);
  const totalApplications = jobs.reduce((sum, job) => sum + job.applications, 0);
  const totals = jobs.reduce(
    (acc, job) => {
      const counts = getApplicantCounts(applicantGroups[job.id]);
      acc.reviewed += counts.reviewed;
      acc.shortlisted += counts.shortlisted;
      acc.rejected += counts.rejected;
      return acc;
    },
    { reviewed: 0, shortlisted: 0, rejected: 0 },
  );

  const weights = [0.12, 0.16, 0.14, 0.18, 0.17, 0.11, 0.12];
  return weights.map((weight, index) => ({
    label: `W${index + 1}`,
    views: Math.round(totalViews * weight),
    applications: Math.round(totalApplications * weight),
    reviewed: Math.round(totals.reviewed * weight),
    shortlisted: Math.round(totals.shortlisted * weight),
    rejected: Math.round(totals.rejected * weight),
  }));
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

  const roleInsights: EmployerRoleInsight[] = jobs
    .map((job) => {
      const applicants = applicantGroups[job.id] || [];
      const counts = getApplicantCounts(applicants);
      const conversionRate = safeRate(job.applications, job.views);
      const skillCounts = countSkills(applicants);
      const strongSkills = mapSkillCounts(skillCounts, 4);
      const weakRequirements = job.tags
        .map((skill) => ({ skill, count: skillCounts.get(skill) || 0 }))
        .sort((a, b) => a.count - b.count || a.skill.localeCompare(b.skill))
        .slice(0, 4);

      return {
        id: job.id,
        title: job.title,
        status: job.status,
        location: job.location,
        type: job.type,
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
        strongSkills,
        weakRequirements,
      };
    })
    .sort((a, b) => b.applications - a.applications || b.views - a.views);

  const jobRows = roleInsights.map((role) => ({
    id: role.id,
    title: role.title,
    status: role.status,
    views: role.views,
    applications: role.applications,
    conversionRate: role.conversionRate,
    matchScore: role.matchScore,
    shortlisted: role.shortlisted,
    rejected: role.rejected,
    unreviewed: role.unreviewed,
    totalApplicants: role.totalApplicants,
    health: role.health,
    recommendation: role.recommendation,
  }));

  const allApplicants = Object.values(applicantGroups).flat();
  const allSkillCounts = countSkills(allApplicants);

  const tagCounts = new Map<string, number>();
  jobs.forEach((job) => {
    job.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1));
  });

  const topSkills = mapSkillCounts(allSkillCounts, 6);
  const weakTags = Array.from(tagCounts.entries())
    .map(([skill]) => ({ skill, count: allSkillCounts.get(skill) || 0 }))
    .sort((a, b) => a.count - b.count || a.skill.localeCompare(b.skill))
    .slice(0, 6);

  const candidates: EmployerCandidateInsight[] = jobs.flatMap((job) =>
    (applicantGroups[job.id] || []).map((applicant) => {
      const candidate: EmployerCandidateInsight = {
        id: applicant.id,
        name: applicant.name || "Unnamed applicant",
        roleId: job.id,
        roleTitle: job.title,
        status: applicant.screeningStatus || "unscreened",
        qualityScore: getCandidateQualityScore(applicant, job),
        experienceYears: applicant.experienceYears || 0,
        skills: applicant.skills || [],
        recommendation: "",
      };
      return { ...candidate, recommendation: getCandidateRecommendation(candidate) };
    }),
  );

  const highQuality = candidates.filter((candidate) => candidate.qualityScore >= 85).length;
  const mediumQuality = candidates.filter((candidate) => candidate.qualityScore >= 70 && candidate.qualityScore < 85).length;
  const lowQuality = candidates.filter((candidate) => candidate.qualityScore < 70).length;
  const candidateTotal = Math.max(candidates.length, 1);

  const experienceBuckets = [
    { label: "0-2 years", count: candidates.filter((candidate) => candidate.experienceYears <= 2).length },
    { label: "3-5 years", count: candidates.filter((candidate) => candidate.experienceYears >= 3 && candidate.experienceYears <= 5).length },
    { label: "6+ years", count: candidates.filter((candidate) => candidate.experienceYears >= 6).length },
  ].map((bucket) => ({ ...bucket, percentage: safeRate(bucket.count, candidateTotal) }));

  const roleDecisionRates = roleInsights.map((role) => ({
    jobId: role.id,
    title: role.title,
    shortlisted: role.shortlisted,
    rejected: role.rejected,
    unreviewed: role.unreviewed,
    shortlistRate: safeRate(role.shortlisted, role.totalApplicants || role.applications),
    rejectionRate: safeRate(role.rejected, role.shortlisted + role.rejected),
  }));

  const hasSourceData = candidates.some((candidate) => {
    const original = Object.values(applicantGroups).flat().find((applicant) => applicant.id === candidate.id);
    return Boolean(original?.source);
  });

  const sourceMap = new Map<string, { applications: number; shortlisted: number; rejected: number; qualityTotal: number }>();
  jobs.forEach((job) => {
    (applicantGroups[job.id] || []).forEach((applicant) => {
      const source = applicant.source || "Unattributed";
      const current = sourceMap.get(source) || { applications: 0, shortlisted: 0, rejected: 0, qualityTotal: 0 };
      current.applications += 1;
      if (applicant.screeningStatus === "shortlisted") current.shortlisted += 1;
      if (applicant.screeningStatus === "rejected") current.rejected += 1;
      current.qualityTotal += getCandidateQualityScore(applicant, job);
      sourceMap.set(source, current);
    });
  });

  const sourceInsights = Array.from(sourceMap.entries())
    .filter(([source]) => hasSourceData || source !== "Unattributed")
    .map(([source, values]) => ({
      source,
      views: 0,
      applications: values.applications,
      conversionRate: 0,
      shortlisted: values.shortlisted,
      rejected: values.rejected,
      qualityScore: values.applications ? Math.round(values.qualityTotal / values.applications) : 0,
      recommendation: values.shortlisted > values.rejected ? "Quality is healthy. Keep this source in the recruiting mix." : "Track source quality before investing more time here.",
    }))
    .sort((a, b) => b.applications - a.applications);

  const typePerformance = buildDimensionInsights(jobs, "type");
  const locationPerformance = buildDimensionInsights(jobs, "location");

  const insights: EmployerAnalyticsInsight[] = [];
  const attentionJob = roleInsights.find((job) => job.health === "attention");
  const strongJob = roleInsights.find((job) => job.health === "strong");
  const unreviewedJob = roleInsights.find((job) => job.unreviewed > 0);
  const highFitUnreviewed = candidates.find((candidate) => candidate.status === "unscreened" && candidate.qualityScore >= 85);

  if (attentionJob) {
    insights.push({
      id: `attention-${attentionJob.id}`,
      title: `${attentionJob.title} needs review`,
      body: attentionJob.recommendation,
      tone: "warning",
      jobId: attentionJob.id,
    });
  }

  if (highFitUnreviewed) {
    insights.push({
      id: `candidate-${highFitUnreviewed.id}`,
      title: `${highFitUnreviewed.name} is waiting for review`,
      body: `${highFitUnreviewed.roleTitle} has a high-fit unreviewed applicant. Check the profile before the queue grows.`,
      tone: "warning",
      jobId: highFitUnreviewed.roleId,
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
    roleInsights,
    candidateInsights: {
      qualityBuckets: [
        { label: "High", count: highQuality, percentage: safeRate(highQuality, candidateTotal) },
        { label: "Medium", count: mediumQuality, percentage: safeRate(mediumQuality, candidateTotal) },
        { label: "Low", count: lowQuality, percentage: safeRate(lowQuality, candidateTotal) },
      ],
      experienceMix: experienceBuckets,
      reviewQueue: candidates
        .filter((candidate) => candidate.status === "unscreened")
        .sort((a, b) => b.qualityScore - a.qualityScore || b.experienceYears - a.experienceYears)
        .slice(0, 8),
      topCandidates: candidates
        .filter((candidate) => candidate.status !== "rejected")
        .sort((a, b) => b.qualityScore - a.qualityScore || b.experienceYears - a.experienceYears)
        .slice(0, 8),
      roleDecisionRates,
    },
    candidateQuality: {
      averageMatchScore: totalJobs ? Math.round(jobs.reduce((sum, job) => sum + job.matchScore, 0) / totalJobs) : 0,
      shortlistRatio: safeRate(shortlisted, totalApplications),
      topSkills,
      weakTags,
    },
    sourceInsights: {
      hasSourceData,
      sources: sourceInsights,
      typePerformance,
      locationPerformance,
      recommendation: hasSourceData
        ? "Compare source quality before increasing sourcing effort."
        : "Source attribution is not available yet. Use role type and location performance as a temporary sourcing proxy.",
    },
    timeline: buildTimeline(jobs, applicantGroups),
    insights: insights.slice(0, 5),
  };
}
