"use client";

import React from "react";
import { motion } from "framer-motion";

type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";
type JobStatus = "Active" | "Draft" | "Paused" | "Closed";

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

function MiniMetric({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className={`${insetSurface} p-3 text-center`}>
      <div className={`text-lg font-semibold ${accent}`}>{value}</div>
      <div className="mt-1 text-[11px] text-white/35">{label}</div>
    </div>
  );
}

function AnalyticsRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.055] pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-white/45">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

interface AnalyticsTabProps {
  jobs: EmployerJob[];
  analytics: Analytics;
}

export default function AnalyticsTab({ jobs, analytics }: AnalyticsTabProps) {
  return (
    <ViewMotion className="grid h-full grid-cols-1 gap-5 lg:grid-cols-9 lg:gap-7">
      <section className={`${surface} overflow-auto custom-scrollbar p-6 lg:col-span-5`}>
        <p className="text-xs uppercase tracking-[0.18em] text-[#FF914D]">Crucible Analytics</p>
        <h1 className="mt-1 text-2xl font-semibold">Performance Metrics</h1>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <MiniMetric label="Application Rate" value="12.5%" accent="text-[#FF914D]" />
          <MiniMetric label="Avg. Time to Hire" value="18 days" accent="text-sky-400" />
          <MiniMetric label="Quality Score" value="8.7/10" accent="text-emerald-400" />
          <MiniMetric label="Active Jobs" value={analytics.activeJobs} accent="text-violet-400" />
        </div>
        <div className={`${insetSurface} mt-5 p-5`}>
          <h2 className="text-sm font-semibold">Summary</h2>
          <div className="mt-4 space-y-4">
            <AnalyticsRow label="Total Jobs" value={analytics.totalJobs} />
            <AnalyticsRow label="Total Applications" value={analytics.totalApplications} />
            <AnalyticsRow label="Total Views" value={analytics.totalViews} />
            <AnalyticsRow label="Average Applications" value={`${analytics.avgApplications}/job`} />
            <AnalyticsRow label="Average Views" value={`${analytics.avgViews}/job`} />
          </div>
        </div>
      </section>

      <section className={`${surface} overflow-auto custom-scrollbar p-6 lg:col-span-4`}>
        <p className="text-xs uppercase tracking-[0.18em] text-white/30">Ranked by applications</p>
        <h2 className="mt-1 text-xl font-semibold">Top Performing Jobs</h2>
        <div className="mt-6 space-y-3">
          {jobs.map((job, index) => (
            <div key={job.id} className={`${insetSurface} p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <span className="text-xs font-semibold text-white/25">0{index + 1}</span>
                  <div>
                    <div className="text-sm font-medium">{job.title}</div>
                    <div className="mt-1 text-xs text-white/35">{job.views} views</div>
                  </div>
                </div>
                <span className="text-sm text-[#FF914D]">{job.applications} apps</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                <div className="h-full rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF914D]" style={{ width: `${Math.min((job.applications / 30) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </ViewMotion>
  );
}
