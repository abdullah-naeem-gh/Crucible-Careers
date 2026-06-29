"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  IconAlertTriangle,
  IconBriefcase,
  IconChartBar,
  IconChecks,
  IconEye,
  IconPercentage,
  IconTargetArrow,
  IconUsers,
} from "@tabler/icons-react";
import {
  buildEmployerAnalytics,
  type EmployerApplicantGroups,
  type EmployerAnalyticsInsight,
} from "@/lib/employer/analytics/buildEmployerAnalytics";

export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";
export type JobStatus = "Active" | "Draft" | "Paused" | "Closed";

export interface EmployerJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  status: JobStatus;
  salary?: string;
  tags: string[];
  postedAt: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  applications: number;
  views: number;
  matchScore: number;
}

export interface Analytics {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalViews: number;
  avgApplications: number;
  avgViews: number;
}

type TimeRange = "7d" | "30d" | "90d" | "all";

const surface = "rounded-[24px] border border-white/[0.07] bg-[#171717] shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)]";
const insetSurface = "rounded-2xl border border-white/[0.065] bg-[#141414] shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2),inset_-1px_-1px_3px_rgba(255,255,255,0.025)]";

const timeRanges: Array<{ key: TimeRange; label: string }> = [
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
  { key: "all", label: "All" },
];

const formatNumber = (value: number) => new Intl.NumberFormat("en").format(value);
const formatPercent = (value: number | null) => (value === null ? "--" : `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`);

function ViewMotion({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function KpiCard({
  label,
  value,
  note,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  note: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className={`${insetSurface} p-4`}>
      <div className="flex items-start gap-3">
        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.025] ${accent}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/35">{label}</div>
          <div className="mt-1 text-2xl font-semibold leading-none text-white">{value}</div>
        </div>
      </div>
      <div className="mt-4 text-xs text-white/35">{note}</div>
    </div>
  );
}

function ProgressBar({ value, tone = "orange" }: { value: number; tone?: "orange" | "emerald" | "sky" | "red" }) {
  const color = {
    orange: "from-[#FF6B00] to-[#FF914D]",
    emerald: "from-emerald-500 to-emerald-300",
    sky: "from-sky-500 to-sky-300",
    red: "from-red-500 to-red-300",
  }[tone];

  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/[0.055]">
      <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} />
    </div>
  );
}

function FunnelStep({
  label,
  value,
  conversion,
  width,
}: {
  label: string;
  value: number;
  conversion: number | null;
  width: number;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/35">{label}</div>
          <div className="mt-1 text-lg font-semibold text-white">{formatNumber(value)}</div>
        </div>
        <div className="text-right text-xs text-white/35">
          <div className="font-semibold text-[#FF914D]">{formatPercent(conversion)}</div>
          <div>from prior</div>
        </div>
      </div>
      <div className="mt-3">
        <ProgressBar value={width} />
      </div>
    </div>
  );
}

function HealthBadge({ health }: { health: "strong" | "attention" | "steady" | "inactive" }) {
  const styles = {
    strong: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    attention: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    steady: "border-sky-500/25 bg-sky-500/10 text-sky-300",
    inactive: "border-white/[0.08] bg-white/[0.025] text-white/35",
  }[health];

  return <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${styles}`}>{health}</span>;
}

function InsightCard({ insight }: { insight: EmployerAnalyticsInsight }) {
  const iconClass = insight.tone === "warning" ? "text-amber-300" : insight.tone === "positive" ? "text-emerald-300" : "text-sky-300";

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-[#121212] ${iconClass}`}>
          {insight.tone === "warning" ? <IconAlertTriangle size={16} /> : insight.tone === "positive" ? <IconChecks size={16} /> : <IconChartBar size={16} />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-white">{insight.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-white/45">{insight.body}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className={`${surface} grid h-full min-h-[32rem] place-items-center p-8 text-center`}>
      <div>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.07] bg-white/[0.025] text-[#FF914D]">
          <IconChartBar size={24} />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-white">No analytics yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/40">Create or publish jobs to start tracking views, applications, funnel movement, and candidate quality.</p>
      </div>
    </div>
  );
}

interface AnalyticsTabProps {
  jobs: EmployerJob[];
  analytics: Analytics;
}

export default function AnalyticsTab({ jobs }: AnalyticsTabProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [applicantGroups, setApplicantGroups] = useState<EmployerApplicantGroups>({});

  useEffect(() => {
    const nextGroups: EmployerApplicantGroups = {};

    jobs.forEach((job) => {
      try {
        const saved = localStorage.getItem(`recruiter_job_${job.id}_applicants`);
        const parsed = saved ? JSON.parse(saved) : null;
        if (Array.isArray(parsed)) nextGroups[job.id] = parsed;
      } catch {
        nextGroups[job.id] = [];
      }
    });

    setApplicantGroups(nextGroups);
  }, [jobs]);

  const snapshot = useMemo(() => buildEmployerAnalytics(jobs, applicantGroups), [jobs, applicantGroups]);
  const maxFunnelValue = Math.max(...snapshot.funnel.map((step) => step.value), 1);
  const attentionJobs = snapshot.jobs.filter((job) => job.health === "attention").length;
  const rangeLabel = timeRanges.find((range) => range.key === timeRange)?.label || "30D";

  if (!jobs.length) return <EmptyState />;

  return (
    <ViewMotion className="grid h-full grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-7">
      <section className={`${surface} min-h-0 overflow-auto p-5 custom-scrollbar lg:col-span-8`}>
        <div className="flex flex-col gap-4 border-b border-white/[0.07] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#FF914D]">Recruiting operations</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Funnel overview</h1>
            <p className="mt-2 text-sm text-white/40">{rangeLabel} snapshot of traffic, applications, and review progress.</p>
          </div>
          <div className="inline-flex w-fit rounded-xl border border-white/[0.08] bg-[#121212] p-1">
            {timeRanges.map((range) => (
              <button
                key={range.key}
                type="button"
                onClick={() => setTimeRange(range.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  timeRange === range.key ? "bg-[#FF6B00] text-white" : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard label="Views" value={formatNumber(snapshot.summary.totalViews)} note={`${snapshot.summary.avgViews} average views per job`} icon={<IconEye size={18} />} accent="text-sky-400" />
          <KpiCard label="Applications" value={formatNumber(snapshot.summary.totalApplications)} note={`${snapshot.summary.avgApplications} average applications per job`} icon={<IconUsers size={18} />} accent="text-[#FF914D]" />
          <KpiCard label="View to Apply" value={formatPercent(snapshot.summary.viewToApplyRate)} note="Portfolio conversion rate" icon={<IconPercentage size={18} />} accent="text-violet-400" />
          <KpiCard label="Shortlisted" value={formatNumber(snapshot.summary.totalShortlisted)} note={`${formatPercent(snapshot.summary.shortlistRate)} of applicants`} icon={<IconChecks size={18} />} accent="text-emerald-400" />
          <KpiCard label="Active Roles" value={snapshot.summary.activeJobs} note={`${attentionJobs} role${attentionJobs === 1 ? "" : "s"} need attention`} icon={<IconBriefcase size={18} />} accent="text-amber-300" />
          <KpiCard label="Avg Match" value={`${snapshot.summary.avgMatchScore}%`} note="Average role alignment" icon={<IconTargetArrow size={18} />} accent="text-rose-300" />
        </div>

        <div className={`${insetSurface} mt-5 p-5`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">Funnel movement</h2>
              <p className="mt-1 text-xs text-white/35">Follow the handoff from job traffic to applications and screening decisions.</p>
            </div>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1 text-xs text-white/40">{snapshot.summary.totalUnreviewed} unreviewed</span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
            {snapshot.funnel.map((step) => (
              <FunnelStep
                key={step.key}
                label={step.label}
                value={step.value}
                conversion={step.conversionFromPrevious}
                width={(step.value / maxFunnelValue) * 100}
              />
            ))}
          </div>
        </div>

        <div className={`${insetSurface} mt-5 overflow-hidden`}>
          <div className="flex flex-col gap-2 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Job performance</h2>
              <p className="mt-1 text-xs text-white/35">Sorted by application volume with review status and recommended follow-up.</p>
            </div>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="border-b border-white/[0.07] text-[10px] uppercase tracking-wider text-white/35">
                <tr>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-3 py-3 font-semibold">Views</th>
                  <th className="px-3 py-3 font-semibold">Apps</th>
                  <th className="px-3 py-3 font-semibold">Conversion</th>
                  <th className="px-3 py-3 font-semibold">Shortlist</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.055]">
                {snapshot.jobs.map((job) => (
                  <tr key={job.id} className="align-top">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{job.title}</div>
                      <div className="mt-1 max-w-md text-xs leading-relaxed text-white/35">{job.recommendation}</div>
                    </td>
                    <td className="px-3 py-4 text-white/60">{formatNumber(job.views)}</td>
                    <td className="px-3 py-4 text-[#FF914D]">{formatNumber(job.applications)}</td>
                    <td className="px-3 py-4">
                      <div className="w-28">
                        <div className="mb-1 text-xs text-white/55">{formatPercent(job.conversionRate)}</div>
                        <ProgressBar value={job.conversionRate} tone={job.health === "attention" ? "red" : "orange"} />
                      </div>
                    </td>
                    <td className="px-3 py-4 text-white/60">{job.shortlisted} / {job.totalApplicants || job.applications}</td>
                    <td className="px-3 py-4"><HealthBadge health={job.health} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <aside className="flex min-h-0 flex-col gap-5 overflow-auto pr-1 custom-scrollbar lg:col-span-4">
        <section className={`${surface} p-5`}>
          <p className="text-xs uppercase tracking-[0.18em] text-white/30">Recruiter queue</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Recommended follow-up</h2>
          <div className="mt-5 space-y-3">
            {snapshot.insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
          </div>
        </section>

        <section className={`${surface} p-5`}>
          <p className="text-xs uppercase tracking-[0.18em] text-white/30">Applicant mix</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Skill coverage</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className={`${insetSurface} p-4`}>
              <div className="text-2xl font-semibold text-emerald-300">{snapshot.candidateQuality.averageMatchScore}%</div>
              <div className="mt-1 text-xs text-white/35">Avg match</div>
            </div>
            <div className={`${insetSurface} p-4`}>
              <div className="text-2xl font-semibold text-[#FF914D]">{formatPercent(snapshot.candidateQuality.shortlistRatio)}</div>
              <div className="mt-1 text-xs text-white/35">Shortlist ratio</div>
            </div>
          </div>
          <div className="mt-5">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Most common skills</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {snapshot.candidateQuality.topSkills.length ? snapshot.candidateQuality.topSkills.map((item) => (
                <span key={item.skill} className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">{item.skill} · {item.count}</span>
              )) : <span className="text-xs text-white/30">Review applicants to build this list.</span>}
            </div>
          </div>
          <div className="mt-5">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Low-coverage requirements</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {snapshot.candidateQuality.weakTags.map((item) => (
                <span key={item.skill} className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-xs text-white/45">{item.skill} · {item.count}</span>
              ))}
            </div>
          </div>
        </section>

        <section className={`${surface} p-5`}>
          <p className="text-xs uppercase tracking-[0.18em] text-white/30">Role watchlist</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Open roles</h2>
          <div className="mt-5 space-y-3">
            {snapshot.jobs.slice(0, 5).map((job) => (
              <div key={job.id} className={`${insetSurface} p-4`}>
                <div className="flex items-start gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{job.title}</div>
                    <div className="mt-1 text-xs text-white/35">{formatPercent(job.conversionRate)} conversion · {job.unreviewed} unreviewed</div>
                  </div>
                  <HealthBadge health={job.health} />
                </div>
                <div className="mt-3"><ProgressBar value={job.matchScore} tone={job.health === "strong" ? "emerald" : "sky"} /></div>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </ViewMotion>
  );
}
