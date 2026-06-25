"use client";

import React from "react";
import { motion } from "framer-motion";
import { StatusBadge } from "@/components/ui/StatusBadge";

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

interface OverviewTabProps {
  jobs: EmployerJob[];
  analytics: Analytics;
  onOpenJobs: () => void;
}

export default function OverviewTab({ jobs, analytics, onOpenJobs }: OverviewTabProps) {
  const metrics = [
    { label: "Total Jobs", value: analytics.totalJobs, note: `Active: ${analytics.activeJobs}`, color: "text-[#FF914D]" },
    { label: "Applications", value: analytics.totalApplications, note: `Avg: ${analytics.avgApplications}/job`, color: "text-emerald-400" },
    { label: "Total Views", value: analytics.totalViews, note: `Avg: ${analytics.avgViews}/job`, color: "text-sky-400" },
    { label: "Conversion", value: "12.5%", note: "Views to Apps", color: "text-violet-400" },
  ];

  return (
    <ViewMotion className="grid h-full grid-cols-1 gap-5 lg:grid-cols-9 lg:gap-7">
      <section className={`${surface} flex flex-col overflow-hidden lg:col-span-5`}>
        <div className="flex items-end justify-between border-b border-white/[0.07] px-5 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#FF914D]">Employer dashboard</p>
            <h1 className="mt-1 text-2xl font-semibold">Overview</h1>
          </div>
          <button onClick={onOpenJobs} className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-white/60 cursor-pointer transition-colors duration-150 hover:bg-white/[0.06] hover:text-white">
            View jobs
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`${insetSurface} p-4`}
            >
              <div className={`text-2xl font-semibold ${metric.color}`}>{metric.value}</div>
              <div className="mt-1 text-sm font-medium text-white">{metric.label}</div>
              <div className="mt-3 text-xs text-white/35">{metric.note}</div>
            </motion.div>
          ))}
        </div>

        <div className="min-h-0 flex-1 px-5 pb-5">
          <div className={`${insetSurface} h-full p-4`}>
            <h2 className="mb-3 text-sm font-semibold">Recent Applications</h2>
            <div className="space-y-2">
              {jobs.filter((job) => job.applications > 0).slice(0, 3).map((job) => (
                <div key={job.id} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                  <div>
                    <div className="text-sm font-medium">{job.title}</div>
                    <div className="mt-1 text-xs text-white/35">{job.applications} applications</div>
                  </div>
                  <div className="text-xs text-white/30">{job.postedAt}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`${surface} overflow-auto custom-scrollbar p-5 lg:col-span-4`}>
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/30">Live roles</p>
          <h2 className="mt-1 text-xl font-semibold">Job Performance</h2>
        </div>
        <div className="space-y-3">
          {jobs.map((job, index) => (
            <motion.button
              key={job.id}
              type="button"
              onClick={onOpenJobs}
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`${insetSurface} w-full p-4 text-left cursor-pointer transition-colors duration-150 hover:border-orange-500/25`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-white/35">{job.company} • {job.location}</div>
                  <div className="mt-1 font-semibold">{job.title}</div>
                </div>
                <StatusBadge status={job.status} />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-white/35">{job.views} views</span>
                <span className="text-[#FF914D]">{job.applications} applications</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF914D]"
                  style={{ width: `${Math.min((job.applications / 30) * 100, 100)}%` }}
                />
              </div>
            </motion.button>
          ))}
        </div>
      </section>
    </ViewMotion>
  );
}
