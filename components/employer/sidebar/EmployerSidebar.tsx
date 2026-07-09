"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DashboardThemeSwitcher } from "@/components/shared/theme/DashboardThemeProvider";

import {
  IconLayoutDashboard,
  IconBriefcase,
  IconChartBar,
  IconBuilding,
  IconUsers,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

type EmployerTab = "overview" | "jobs" | "applicants" | "analytics" | "profile";

interface EmployerSidebarProps {
  activeTab: EmployerTab;
  company: string;
  jobCount: number;
  applicationCount: number;
  onTabChange: (tab: EmployerTab) => void;
  onNewJob: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const tabs: Array<{ key: EmployerTab; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "jobs", label: "Job Listings" },
  { key: "applicants", label: "All Applicants" },
  { key: "analytics", label: "Analytics" },
  { key: "profile", label: "Company Profile" },
];

const TAB_ICONS: Record<EmployerTab, React.ComponentType<any>> = {
  overview: IconLayoutDashboard,
  jobs: IconBriefcase,
  applicants: IconUsers,
  analytics: IconChartBar,
  profile: IconBuilding,
};

export default function EmployerSidebar({
  activeTab,
  company,
  jobCount,
  applicationCount,
  onTabChange,
  onNewJob,
  collapsed = false,
  onCollapsedChange,
}: EmployerSidebarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`relative flex min-h-[18rem] flex-col rounded-[24px] border border-white/[0.07] bg-[#171717] shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)] transition-all duration-300 lg:h-[92vh] ${collapsed ? "items-center p-3 lg:p-3" : "p-5 lg:p-6"}`}
    >
      <DashboardThemeSwitcher className={collapsed ? "absolute right-3 top-3" : "absolute right-4 top-4 sm:right-5 sm:top-5"} />
      <button
        type="button"
        onClick={() => onCollapsedChange?.(!collapsed)}
        className={collapsed ? "absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer" : "absolute right-4 top-16 grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer sm:right-5"}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <IconChevronRight size={17} /> : <IconChevronLeft size={17} />}
      </button>
      <Link
        href="/gateway"
        title="Back"
        className={collapsed ? "mt-12 mb-5 grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white" : "mb-6 inline-flex items-center pr-14 text-sm text-white/50 transition-colors hover:text-white"}
      >
        <svg className={collapsed ? "h-5 w-5" : "mr-2 h-5 w-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 19l-7-7 7-7" />
        </svg>
        {!collapsed && "Back"}
      </Link>

      <div className={collapsed ? "mb-6 flex flex-col items-center gap-2" : "mb-7 flex items-center gap-3"}>
        <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF914D] text-sm font-semibold text-white shadow-[0_8px_24px_rgba(255,107,0,0.24)]">
          {company.charAt(0)}
        </div>
        {!collapsed && (
          <div>
            <div className="font-semibold text-white">{company}</div>
            <div className="text-xs text-white/40">Employer account</div>
          </div>
        )}
      </div>

      <nav className={collapsed ? "flex w-full flex-col items-center gap-2 text-sm" : "space-y-1.5 text-sm"}>
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          const count = tab.key === "jobs" ? jobCount : tab.key === "overview" || tab.key === "applicants" ? applicationCount : null;
          const IconComponent = TAB_ICONS[tab.key];

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              title={collapsed ? tab.label : undefined}
              className={`${collapsed ? "grid h-11 w-11 place-items-center justify-center px-0 py-0" : "flex w-full items-center justify-between px-3.5 py-2.5 text-left"} rounded-xl border transition-all cursor-pointer ${
                active
                  ? "border-orange-500/20 bg-orange-500/10 text-[#FF914D] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  : "border-transparent text-white/60 hover:border-white/[0.05] hover:bg-white/[0.035] hover:text-white"
              }`}
            >
              <div className={collapsed ? "grid place-items-center" : "flex items-center gap-2.5"}>
                {IconComponent && <IconComponent className="h-4.5 w-4.5 shrink-0 stroke-[1.6]" />}
                {!collapsed && <span>{tab.label}</span>}
              </div>
              {!collapsed && count !== null && (
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
          {collapsed ? "Out" : "Logout"}
        </Link>
      </div>

      <div className={collapsed ? "mt-auto hidden lg:block" : "mt-auto hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-400/[0.035] p-4 lg:block"}>
        {!collapsed && (
          <>
            <div className="mb-1 text-sm font-semibold text-white">No jobs posted yet?</div>
            <div className="mb-4 text-xs leading-relaxed text-white/45">
              Create your first job posting to get started.
            </div>
          </>
        )}
        <button
          type="button"
          onClick={onNewJob}
          title={collapsed ? "Post a Job" : undefined}
          className={collapsed ? "grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-lg font-semibold text-white shadow-[0_8px_20px_rgba(255,107,0,0.2)]" : "rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-3 py-2 text-xs font-medium text-white shadow-[0_8px_20px_rgba(255,107,0,0.2)]"}
        >
          {collapsed ? "+" : "Post a Job"}
        </button>
      </div>

      <div className={collapsed ? "mt-4 hidden flex-col items-center gap-3 text-xs text-white/35 lg:flex" : "mt-4 hidden items-center justify-between text-xs text-white/35 lg:flex"}>
        <Link href="/employer" title="Employer page" className="transition-colors hover:text-white/70">{collapsed ? "EP" : "Employer page"}</Link>
        <Link href="/" onClick={() => localStorage.removeItem("recruiter_jobs")} className="transition-colors hover:text-red-300">
          {collapsed ? "Out" : "Logout"}
        </Link>
      </div>
    </motion.aside>
  );
}


