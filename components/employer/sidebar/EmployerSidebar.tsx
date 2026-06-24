"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type EmployerTab = "overview" | "jobs" | "analytics" | "profile";

interface EmployerSidebarProps {
  activeTab: EmployerTab;
  company: string;
  jobCount: number;
  applicationCount: number;
  onTabChange: (tab: EmployerTab) => void;
  onNewJob: () => void;
}

const tabs: Array<{ key: EmployerTab; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "jobs", label: "Job Listings" },
  { key: "analytics", label: "Analytics" },
  { key: "profile", label: "Company Profile" },
];

export default function EmployerSidebar({
  activeTab,
  company,
  jobCount,
  applicationCount,
  onTabChange,
  onNewJob,
}: EmployerSidebarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex min-h-[18rem] flex-col rounded-[24px] border border-white/[0.07] bg-[#171717] p-5 shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)] lg:h-[92vh] lg:p-6"
    >
      <Link
        href="/gateway"
        className="mb-6 inline-flex items-center text-sm text-white/50 transition-colors hover:text-white"
      >
        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="mb-7 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF914D] text-sm font-semibold text-white shadow-[0_8px_24px_rgba(255,107,0,0.24)]">
          {company.charAt(0)}
        </div>
        <div>
          <div className="font-semibold text-white">{company}</div>
          <div className="text-xs text-white/40">Employer account</div>
        </div>
      </div>

      <nav className="space-y-1.5 text-sm">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          const count = tab.key === "jobs" ? jobCount : tab.key === "overview" ? applicationCount : null;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                active
                  ? "border-orange-500/20 bg-orange-500/10 text-[#FF914D] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  : "border-transparent text-white/60 hover:border-white/[0.05] hover:bg-white/[0.035] hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              {count !== null && (
                <span className={`rounded-md px-2 py-0.5 text-xs ${active ? "bg-orange-500/15 text-[#FF914D]" : "text-white/30"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}

      </nav>

      <div className="mt-6 grid grid-cols-2 gap-2 lg:hidden">
        <button
          type="button"
          onClick={onNewJob}
          className="rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-4 py-2.5 text-sm font-medium text-white"
        >
          + New Job
        </button>
        <Link
          href="/"
          onClick={() => localStorage.removeItem("recruiter_jobs")}
          className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-center text-sm text-white/60"
        >
          Logout
        </Link>
      </div>

      <div className="mt-auto hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-400/[0.035] p-4 lg:block">
        <div className="mb-1 text-sm font-semibold text-white">No jobs posted yet?</div>
        <div className="mb-4 text-xs leading-relaxed text-white/45">
          Create your first job posting to get started.
        </div>
        <button
          type="button"
          onClick={onNewJob}
          className="rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-3 py-2 text-xs font-medium text-white shadow-[0_8px_20px_rgba(255,107,0,0.2)]"
        >
          Post a Job
        </button>
      </div>

      <div className="mt-4 hidden items-center justify-between text-xs text-white/35 lg:flex">
        <Link href="/employers" className="transition-colors hover:text-white/70">Employer page</Link>
        <Link href="/" onClick={() => localStorage.removeItem("recruiter_jobs")} className="transition-colors hover:text-red-300">
          Logout
        </Link>
      </div>
    </motion.aside>
  );
}
