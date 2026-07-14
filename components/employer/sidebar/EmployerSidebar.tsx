"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DashboardThemeSwitcher } from "@/components/shared/theme/DashboardThemeProvider";
import ChatNotificationBell from "@/components/shared/chat/ChatNotificationBell";
import { subscribeChatChanges, getTotalUnread } from "@/lib/shared/chat/chat.service";

import {
  IconLayoutDashboard,
  IconBriefcase,
  IconChartBar,
  IconBuilding,
  IconUsers,
  IconChevronLeft,
  IconChevronRight,
  IconLogout,
  IconMessage,
} from "@tabler/icons-react";

type EmployerTab = "overview" | "jobs" | "applicants" | "analytics" | "profile" | "messages";

interface EmployerSidebarProps {
  activeTab: EmployerTab;
  company: string;
  logoUrl?: string | null;
  jobCount: number;
  applicationCount: number;
  onTabChange: (tab: EmployerTab) => void;
  onNewJob: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const tabs: Array<{ key: EmployerTab; label: string }> = [
  { key: "profile", label: "Company Profile" },
  { key: "overview", label: "Overview" },
  { key: "jobs", label: "Job Listings" },
  { key: "applicants", label: "All Applicants" },
  { key: "analytics", label: "Analytics" },
  { key: "messages", label: "Messages" },
];

const TAB_ICONS: Record<EmployerTab, React.ComponentType<any>> = {
  overview: IconLayoutDashboard,
  jobs: IconBriefcase,
  applicants: IconUsers,
  analytics: IconChartBar,
  profile: IconBuilding,
  messages: IconMessage,
};

export default function EmployerSidebar({
  activeTab,
  company,
  logoUrl,
  jobCount,
  applicationCount,
  onTabChange,
  onNewJob,
  collapsed = false,
  onCollapsedChange,
}: EmployerSidebarProps) {
  const [showNoJobsPrompt, setShowNoJobsPrompt] = useState(false);
  const [chatUnread, setChatUnread] = useState(0);
  const expandedReady = !collapsed;
  const railMode = collapsed;

  useEffect(() => {
    const refresh = () => { getTotalUnread('employer').then(setChatUnread) }
    refresh()
    return subscribeChatChanges(refresh)
  }, []);

  useEffect(() => {
    if (!expandedReady || jobCount > 0) {
      setShowNoJobsPrompt(false);
      return;
    }

    const revealPrompt = window.setTimeout(() => setShowNoJobsPrompt(true), 40);
    return () => window.clearTimeout(revealPrompt);
  }, [expandedReady, jobCount]);

  return (
    <motion.aside
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ opacity: { duration: 0.35, ease: "easeOut" }, x: { duration: 0.35, ease: "easeOut" } }}
      className={`relative flex min-h-[18rem] overflow-hidden flex-col rounded-[24px] border border-white/[0.07] bg-[#171717] shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)] transition-[padding,border-radius] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:h-[92vh] ${collapsed ? "items-center px-2 py-3 lg:px-2 lg:py-3" : "p-5 lg:p-6"}`}
    >
      {expandedReady && (
        <div className="absolute right-4 top-4 sm:right-5 sm:top-5 flex items-center gap-2">
          <ChatNotificationBell role="employer" isDark={true} onOpenMessages={() => onTabChange('messages')} />
          <DashboardThemeSwitcher />
        </div>
      )}
      <button
        type="button"
        onClick={() => onCollapsedChange?.(!collapsed)}
        className={railMode ? "absolute left-1/2 top-3 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full text-white/45 transition-colors hover:text-white cursor-pointer" : "absolute right-24 top-4 grid h-9 w-9 place-items-center rounded-full text-white/45 transition-colors hover:text-white cursor-pointer sm:right-24 sm:top-5"}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <IconChevronRight size={17} /> : <IconChevronLeft size={17} />}
      </button>

      <div className={`flex min-h-0 w-full flex-1 flex-col ${railMode ? "items-center" : "min-w-[232px]"}`}>

        <div className={railMode ? "mt-12 mb-5 flex flex-col items-center gap-2" : "mb-7 flex items-center gap-3"}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${company} logo`}
              className={railMode ? "h-8 w-8 shrink-0 rounded-full object-cover shadow-[0_8px_18px_rgba(255,107,0,0.2)]" : "h-11 w-11 shrink-0 rounded-full object-cover shadow-[0_8px_24px_rgba(255,107,0,0.24)]"}
            />
          ) : (
            <div className={railMode ? "grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF914D] text-[11px] font-semibold text-white shadow-[0_8px_18px_rgba(255,107,0,0.2)]" : "grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF914D] text-sm font-semibold text-white shadow-[0_8px_24px_rgba(255,107,0,0.24)]"}>
              {company.charAt(0)}
            </div>
          )}
          {expandedReady && (
            <div>
              <div className="font-semibold text-white">{company}</div>
              <div className="text-xs text-white/40">Employer account</div>
            </div>
          )}
        </div>

        <nav className={railMode ? "flex w-full flex-col items-center gap-1.5 text-sm" : "space-y-1.5 text-sm"}>
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            const count = tab.key === "jobs" ? jobCount
              : tab.key === "overview" || tab.key === "applicants" ? applicationCount
              : tab.key === "messages" ? (chatUnread > 0 ? chatUnread : null)
              : null;
            const IconComponent = TAB_ICONS[tab.key];

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                title={railMode ? tab.label : undefined}
                className={`${railMode ? "grid h-8 w-8 place-items-center justify-center px-0 py-0" : "flex w-full items-center justify-between px-3.5 py-2.5 text-left rounded-xl border"} transition-all cursor-pointer ${
                  active
                    ? railMode
                      ? "text-[#FF914D]"
                      : "border-orange-500/20 bg-orange-500/10 text-[#FF914D] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    : railMode
                      ? "text-white/42 hover:text-white"
                      : "border-transparent text-white/60 hover:border-white/[0.05] hover:bg-white/[0.035] hover:text-white"
                }`}
              >
                <div className={railMode ? "grid place-items-center" : "flex items-center gap-2.5"}>
                  {IconComponent && <IconComponent className={railMode ? "h-5 w-5 shrink-0 stroke-[1.7]" : "h-4.5 w-4.5 shrink-0 stroke-[1.6]"} />}
                  {expandedReady && <span>{tab.label}</span>}
                </div>
                {expandedReady && count !== null && (
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

        {showNoJobsPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="mt-auto hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-400/[0.035] p-4 lg:block"
          >
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
          </motion.div>
        )}

        <div className={railMode ? "mt-auto hidden flex-col items-center gap-3 text-xs text-white/35 lg:flex" : `${showNoJobsPrompt ? "mt-4" : "mt-auto"} hidden items-center justify-end text-xs text-white/35 lg:flex`}>
          <Link href="/" onClick={() => localStorage.removeItem("recruiter_jobs")} title="Logout" className={railMode ? "grid h-8 w-8 place-items-center rounded-full text-white/42 transition-colors hover:text-red-300" : "transition-colors hover:text-red-300"}>
            {railMode ? <IconLogout size={18} stroke={1.8} /> : "Logout"}
          </Link>
        </div>
      </div>
    </motion.aside>
  );
}



