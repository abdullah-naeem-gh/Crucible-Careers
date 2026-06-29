"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  IconAlertTriangle,
  IconBriefcase,
  IconChartBar,
  IconChecks,
  IconEye,
  IconMapPin,
  IconPercentage,
  IconRoute,
  IconTargetArrow,
  IconUsers,
} from "@tabler/icons-react";
import {
  buildEmployerAnalytics,
  type AnalyticsHealth,
  type EmployerApplicantGroups,
  type EmployerAnalyticsInsight,
  type EmployerAnalyticsSnapshot,
} from "@/lib/employer/analytics/buildEmployerAnalytics";

export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";
export type JobStatus = "Active" | "Draft" | "Paused" | "Closed";

type TimeRange = "7d" | "30d" | "90d" | "all";
type AnalyticsView = "overview" | "roles" | "candidates" | "sources";

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

const surface = "rounded-[24px] border border-white/[0.07] bg-[#171717] shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)]";
const insetSurface = "rounded-2xl border border-white/[0.065] bg-[#141414] shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2),inset_-1px_-1px_3px_rgba(255,255,255,0.025)]";

const timeRanges: Array<{ key: TimeRange; label: string }> = [
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
  { key: "all", label: "All" },
];

const analyticsViews: Array<{ key: AnalyticsView; label: string; description: string }> = [
  { key: "overview", label: "Overview", description: "Funnel and portfolio health" },
  { key: "roles", label: "Roles", description: "Job-level diagnostics" },
  { key: "candidates", label: "Candidates", description: "Applicant quality and queues" },
  { key: "sources", label: "Sources", description: "Channels, location, and job type" },
];

const formatNumber = (value: number) => new Intl.NumberFormat("en").format(value);
const formatPercent = (value: number | null) => (value === null ? "--" : `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`);
const getMax = (values: number[]) => Math.max(...values, 1);

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

function ProgressBar({ value, tone = "orange" }: { value: number; tone?: "orange" | "emerald" | "sky" | "red" | "violet" }) {
  const color = {
    orange: "from-[#FF6B00] to-[#FF914D]",
    emerald: "from-emerald-500 to-emerald-300",
    sky: "from-sky-500 to-sky-300",
    red: "from-red-500 to-red-300",
    violet: "from-violet-500 to-violet-300",
  }[tone];

  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/[0.055]">
      <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} />
    </div>
  );
}

function HealthBadge({ health }: { health: AnalyticsHealth }) {
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

function TimelineStrip({ snapshot }: { snapshot: EmployerAnalyticsSnapshot }) {
  const maxViews = getMax(snapshot.timeline.map((point) => point.views));
  const maxApps = getMax(snapshot.timeline.map((point) => point.applications));

  return (
    <div className={`${insetSurface} p-5`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">Weekly movement</h2>
          <p className="mt-1 text-xs text-white/35">Demo-mode trend from current aggregate data; backend events will replace this.</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-7 gap-2">
        {snapshot.timeline.map((point) => (
          <div key={point.label} className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-2">
            <div className="flex h-24 items-end gap-1">
              <div className="w-full rounded-t bg-sky-400/70" style={{ height: `${Math.max((point.views / maxViews) * 100, 4)}%` }} />
              <div className="w-full rounded-t bg-[#FF6B00]/80" style={{ height: `${Math.max((point.applications / maxApps) * 100, 4)}%` }} />
            </div>
            <div className="mt-2 text-center text-[10px] font-semibold text-white/35">{point.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-white/35">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-400" /> Views</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#FF6B00]" /> Applications</span>
      </div>
    </div>
  );
}

function RoleTable({ snapshot }: { snapshot: EmployerAnalyticsSnapshot }) {
  return (
    <div className={`${insetSurface} overflow-hidden`}>
      <div className="border-b border-white/[0.07] p-5">
        <h2 className="text-base font-semibold text-white">Role comparison</h2>
        <p className="mt-1 text-xs text-white/35">Conversion, review backlog, and status by role.</p>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-[860px] w-full text-left text-sm">
          <thead className="border-b border-white/[0.07] text-[10px] uppercase tracking-wider text-white/35">
            <tr>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-3 py-3 font-semibold">Views</th>
              <th className="px-3 py-3 font-semibold">Apps</th>
              <th className="px-3 py-3 font-semibold">Conversion</th>
              <th className="px-3 py-3 font-semibold">Reviewed</th>
              <th className="px-3 py-3 font-semibold">Unreviewed</th>
              <th className="px-3 py-3 font-semibold">Avg match</th>
              <th className="px-3 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.055]">
            {snapshot.roleInsights.map((role) => (
              <tr key={role.id} className="align-top">
                <td className="px-5 py-4">
                  <div className="font-semibold text-white">{role.title}</div>
                  <div className="mt-1 text-xs text-white/35">{role.type} - {role.location}</div>
                </td>
                <td className="px-3 py-4 text-white/60">{formatNumber(role.views)}</td>
                <td className="px-3 py-4 text-[#FF914D]">{formatNumber(role.applications)}</td>
                <td className="px-3 py-4">
                  <div className="w-28">
                    <div className="mb-1 text-xs text-white/55">{formatPercent(role.conversionRate)}</div>
                    <ProgressBar value={role.conversionRate} tone={role.health === "attention" ? "red" : "orange"} />
                  </div>
                </td>
                <td className="px-3 py-4 text-white/60">{role.shortlisted + role.rejected}</td>
                <td className="px-3 py-4 text-white/60">{role.unreviewed}</td>
                <td className="px-3 py-4 text-white/60">{role.matchScore}%</td>
                <td className="px-3 py-4"><HealthBadge health={role.health} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoleDiagnosticCard({ role }: { role: EmployerAnalyticsSnapshot["roleInsights"][number] }) {
  return (
    <div className={`${insetSurface} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white">{role.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-white/40">{role.recommendation}</p>
        </div>
        <HealthBadge health={role.health} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3"><div className="font-semibold text-white">{formatPercent(role.conversionRate)}</div><div className="mt-1 text-white/35">conversion</div></div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3"><div className="font-semibold text-white">{role.unreviewed}</div><div className="mt-1 text-white/35">unreviewed</div></div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3"><div className="font-semibold text-white">{role.matchScore}%</div><div className="mt-1 text-white/35">match</div></div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Strong skills</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {role.strongSkills.length ? role.strongSkills.map((item) => <span key={item.skill} className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">{item.skill} - {item.count}</span>) : <span className="text-xs text-white/30">No applicant skills yet.</span>}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Low coverage</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {role.weakRequirements.map((item) => <span key={item.skill} className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-xs text-white/45">{item.skill} - {item.count}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function CandidateCard({ candidate }: { candidate: EmployerAnalyticsSnapshot["candidateInsights"]["topCandidates"][number] }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white">{candidate.name}</h3>
          <p className="mt-1 text-xs text-white/35">{candidate.roleTitle}</p>
        </div>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/45">{candidate.status}</span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs">
        <span className="text-white/35">Quality</span>
        <span className="font-semibold text-white">{candidate.qualityScore}%</span>
      </div>
      <div className="mt-2"><ProgressBar value={candidate.qualityScore} tone={candidate.qualityScore >= 85 ? "emerald" : "sky"} /></div>
      <p className="mt-3 text-xs leading-relaxed text-white/40">{candidate.recommendation}</p>
    </div>
  );
}

function DimensionList({ title, rows }: { title: string; rows: EmployerAnalyticsSnapshot["sourceInsights"]["typePerformance"] }) {
  const max = getMax(rows.map((row) => row.applications));

  return (
    <div className={`${insetSurface} p-5`}>
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs">
              <span className="font-medium text-white/70">{row.label}</span>
              <span className="text-white/35">{row.applications} apps - {formatPercent(row.conversionRate)}</span>
            </div>
            <ProgressBar value={(row.applications / max) * 100} tone="sky" />
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewView({ snapshot, rangeLabel }: { snapshot: EmployerAnalyticsSnapshot; rangeLabel: string }) {
  const maxFunnelValue = getMax(snapshot.funnel.map((step) => step.value));
  const attentionJobs = snapshot.jobs.filter((job) => job.health === "attention").length;

  return (
    <div className="grid min-h-0 grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-7">
      <section className={`${surface} min-h-0 overflow-auto p-5 custom-scrollbar lg:col-span-8`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard label="Views" value={formatNumber(snapshot.summary.totalViews)} note={`${snapshot.summary.avgViews} average views per job`} icon={<IconEye size={18} />} accent="text-sky-400" />
          <KpiCard label="Applications" value={formatNumber(snapshot.summary.totalApplications)} note={`${snapshot.summary.avgApplications} average applications per job`} icon={<IconUsers size={18} />} accent="text-[#FF914D]" />
          <KpiCard label="View to Apply" value={formatPercent(snapshot.summary.viewToApplyRate)} note={`${rangeLabel} portfolio conversion`} icon={<IconPercentage size={18} />} accent="text-violet-400" />
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
              <FunnelStep key={step.key} label={step.label} value={step.value} conversion={step.conversionFromPrevious} width={(step.value / maxFunnelValue) * 100} />
            ))}
          </div>
        </div>

        <div className="mt-5"><TimelineStrip snapshot={snapshot} /></div>
        <div className="mt-5"><RoleTable snapshot={snapshot} /></div>
      </section>

      <aside className="flex min-h-0 flex-col gap-5 overflow-auto pr-1 custom-scrollbar lg:col-span-4">
        <section className={`${surface} p-5`}>
          <p className="text-xs uppercase tracking-[0.18em] text-white/30">Recruiter queue</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Recommended follow-up</h2>
          <div className="mt-5 space-y-3">{snapshot.insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}</div>
        </section>
        <section className={`${surface} p-5`}>
          <p className="text-xs uppercase tracking-[0.18em] text-white/30">Role watchlist</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Open roles</h2>
          <div className="mt-5 space-y-3">
            {snapshot.roleInsights.slice(0, 5).map((role) => (
              <div key={role.id} className={`${insetSurface} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{role.title}</div>
                    <div className="mt-1 text-xs text-white/35">{formatPercent(role.conversionRate)} conversion - {role.unreviewed} unreviewed</div>
                  </div>
                  <HealthBadge health={role.health} />
                </div>
                <div className="mt-3"><ProgressBar value={role.matchScore} tone={role.health === "strong" ? "emerald" : "sky"} /></div>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

function RolesView({ snapshot }: { snapshot: EmployerAnalyticsSnapshot }) {
  const attentionRoles = snapshot.roleInsights.filter((role) => role.health === "attention");

  return (
    <section className={`${surface} min-h-0 overflow-auto p-5 custom-scrollbar`}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <KpiCard label="Roles needing review" value={attentionRoles.length} note="Active roles with conversion or queue issues" icon={<IconAlertTriangle size={18} />} accent="text-amber-300" />
        <KpiCard label="Unreviewed applicants" value={snapshot.summary.totalUnreviewed} note="Across all active and inactive roles" icon={<IconUsers size={18} />} accent="text-sky-400" />
        <KpiCard label="Avg conversion" value={formatPercent(snapshot.summary.viewToApplyRate)} note="Views turning into applications" icon={<IconPercentage size={18} />} accent="text-[#FF914D]" />
      </div>
      <div className="mt-5"><RoleTable snapshot={snapshot} /></div>
      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        {snapshot.roleInsights.map((role) => <RoleDiagnosticCard key={role.id} role={role} />)}
      </div>
    </section>
  );
}

function CandidatesView({ snapshot }: { snapshot: EmployerAnalyticsSnapshot }) {
  return (
    <section className={`${surface} min-h-0 overflow-auto p-5 custom-scrollbar`}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {snapshot.candidateInsights.qualityBuckets.map((bucket) => (
          <KpiCard key={bucket.label} label={`${bucket.label} fit`} value={bucket.count} note={`${formatPercent(bucket.percentage)} of known applicants`} icon={<IconTargetArrow size={18} />} accent={bucket.label === "High" ? "text-emerald-300" : bucket.label === "Medium" ? "text-sky-300" : "text-amber-300"} />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className={`${insetSurface} p-5`}>
          <h2 className="text-base font-semibold text-white">Review queue</h2>
          <p className="mt-1 text-xs text-white/35">Unreviewed candidates sorted by fit and experience.</p>
          <div className="mt-4 grid gap-3">
            {snapshot.candidateInsights.reviewQueue.length ? snapshot.candidateInsights.reviewQueue.map((candidate) => <CandidateCard key={`${candidate.roleId}-${candidate.id}`} candidate={candidate} />) : <p className="text-sm text-white/35">No unreviewed candidates in the current data.</p>}
          </div>
        </div>

        <div className={`${insetSurface} p-5`}>
          <h2 className="text-base font-semibold text-white">Top candidates</h2>
          <p className="mt-1 text-xs text-white/35">Highest-fit candidates that have not been rejected.</p>
          <div className="mt-4 grid gap-3">
            {snapshot.candidateInsights.topCandidates.length ? snapshot.candidateInsights.topCandidates.map((candidate) => <CandidateCard key={`${candidate.roleId}-${candidate.id}`} candidate={candidate} />) : <p className="text-sm text-white/35">Applicant profiles will appear here after candidates apply.</p>}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className={`${insetSurface} p-5`}>
          <h2 className="text-base font-semibold text-white">Experience mix</h2>
          <div className="mt-4 space-y-3">
            {snapshot.candidateInsights.experienceMix.map((bucket) => (
              <div key={bucket.label}>
                <div className="mb-1 flex justify-between text-xs"><span className="text-white/60">{bucket.label}</span><span className="text-white/35">{bucket.count} candidates</span></div>
                <ProgressBar value={bucket.percentage} tone="violet" />
              </div>
            ))}
          </div>
        </div>
        <div className={`${insetSurface} p-5`}>
          <h2 className="text-base font-semibold text-white">Decision rates by role</h2>
          <div className="mt-4 space-y-3">
            {snapshot.candidateInsights.roleDecisionRates.map((role) => (
              <div key={role.jobId} className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3">
                <div className="flex justify-between gap-3 text-xs"><span className="font-medium text-white/70">{role.title}</span><span className="text-white/35">{role.unreviewed} unreviewed</span></div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-white/45"><span>Shortlist {formatPercent(role.shortlistRate)}</span><span>Reject {formatPercent(role.rejectionRate)}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SourcesView({ snapshot }: { snapshot: EmployerAnalyticsSnapshot }) {
  return (
    <section className={`${surface} min-h-0 overflow-auto p-5 custom-scrollbar`}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <KpiCard label="Source data" value={snapshot.sourceInsights.hasSourceData ? "Live" : "Pending"} note={snapshot.sourceInsights.recommendation} icon={<IconRoute size={18} />} accent="text-sky-400" />
        <KpiCard label="Best type" value={snapshot.sourceInsights.typePerformance[0]?.label || "--"} note={`${snapshot.sourceInsights.typePerformance[0]?.applications || 0} applications`} icon={<IconBriefcase size={18} />} accent="text-[#FF914D]" />
        <KpiCard label="Best location" value={snapshot.sourceInsights.locationPerformance[0]?.label || "--"} note={`${snapshot.sourceInsights.locationPerformance[0]?.applications || 0} applications`} icon={<IconMapPin size={18} />} accent="text-emerald-300" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className={`${insetSurface} p-5`}>
          <h2 className="text-base font-semibold text-white">Source performance</h2>
          <p className="mt-1 text-xs text-white/35">Attribution needs backend events. Current demo data has no source field.</p>
          <div className="mt-4 space-y-3">
            {snapshot.sourceInsights.sources.length ? snapshot.sourceInsights.sources.map((source) => (
              <div key={source.source} className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3">
                <div className="flex items-start justify-between gap-3"><div><div className="text-sm font-semibold text-white">{source.source}</div><div className="mt-1 text-xs text-white/35">{source.recommendation}</div></div><span className="text-xs text-[#FF914D]">{source.applications} apps</span></div>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.015] p-5 text-sm leading-relaxed text-white/40">
                Add `source` to application and view events to compare LinkedIn, referrals, job boards, direct traffic, and campaigns.
              </div>
            )}
          </div>
        </div>
        <DimensionList title="Job type performance" rows={snapshot.sourceInsights.typePerformance} />
      </div>
      <div className="mt-5"><DimensionList title="Location performance" rows={snapshot.sourceInsights.locationPerformance} /></div>
    </section>
  );
}

interface AnalyticsTabProps {
  jobs: EmployerJob[];
  analytics: Analytics;
}

export default function AnalyticsTab({ jobs }: AnalyticsTabProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [activeView, setActiveView] = useState<AnalyticsView>("overview");
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
  const rangeLabel = timeRanges.find((range) => range.key === timeRange)?.label || "30D";

  if (!jobs.length) return <EmptyState />;

  return (
    <ViewMotion className="flex h-full min-h-0 flex-col gap-5 overflow-y-auto pr-1 pb-1 custom-scrollbar">
      <section className={`${surface} shrink-0 p-5`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#FF914D]">Recruiting operations</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Analytics workspace</h1>
            <p className="mt-2 text-sm text-white/40">{rangeLabel} snapshot of roles, candidates, sources, and review progress.</p>
          </div>
          <div className="inline-flex w-fit rounded-xl border border-white/[0.08] bg-[#121212] p-1">
            {timeRanges.map((range) => (
              <button
                key={range.key}
                type="button"
                onClick={() => setTimeRange(range.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${timeRange === range.key ? "bg-[#FF6B00] text-white" : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"}`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-2 md:grid-cols-4">
          {analyticsViews.map((view) => (
            <button
              key={view.key}
              type="button"
              onClick={() => setActiveView(view.key)}
              className={`rounded-2xl border p-3 text-left transition-all cursor-pointer ${activeView === view.key ? "border-orange-500/40 bg-orange-500/10 text-white" : "border-white/[0.07] bg-white/[0.015] text-white/55 hover:border-white/[0.12] hover:text-white"}`}
            >
              <div className="text-sm font-semibold">{view.label}</div>
              <div className="mt-1 text-xs text-white/35">{view.description}</div>
            </button>
          ))}
        </div>
      </section>

      <div className="min-h-0 shrink-0">
        {activeView === "overview" && <OverviewView snapshot={snapshot} rangeLabel={rangeLabel} />}
        {activeView === "roles" && <RolesView snapshot={snapshot} />}
        {activeView === "candidates" && <CandidatesView snapshot={snapshot} />}
        {activeView === "sources" && <SourcesView snapshot={snapshot} />}
      </div>
    </ViewMotion>
  );
}
