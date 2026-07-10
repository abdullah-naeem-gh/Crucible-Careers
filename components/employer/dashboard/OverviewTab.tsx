"use client";

import React from "react";
import { motion } from "framer-motion";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  IconUsers,
  IconBuilding,
  IconTrendingUp,
  IconBriefcase,
  IconActivity,
  IconCheck,
  IconBell
} from "@tabler/icons-react";

import { EmployerJob, JobType, JobStatus } from "@/types/employer/job";
export type { EmployerJob };

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
  onViewJobApplicants: (jobId: string) => void;
  onTabChange?: (tab: "overview" | "jobs" | "analytics" | "profile") => void;
  onNewJob?: () => void;
}

export default function OverviewTab({
  jobs,
  analytics,
  onOpenJobs,
  onViewJobApplicants,
  onTabChange,
  onNewJob
}: OverviewTabProps) {
  const metrics = [
    { label: "Total Jobs", value: analytics.totalJobs, note: `Active: ${analytics.activeJobs}`, trend: "+1 new", badgeBg: "bg-orange-500/10", badgeColor: "text-[#FF914D]", color: "text-[#FF914D]" },
    { label: "Applications", value: analytics.totalApplications, note: `Avg: ${analytics.avgApplications}/job`, trend: "+14.2%", badgeBg: "bg-emerald-500/10", badgeColor: "text-emerald-400", color: "text-emerald-400" },
    { label: "Total Views", value: analytics.totalViews, note: `Avg: ${analytics.avgViews}/job`, trend: "+8.5%", badgeBg: "bg-sky-500/10", badgeColor: "text-sky-400", color: "text-sky-400" },
    { label: "Conversion", value: "12.5%", note: "Views to Apps", trend: "Good", badgeBg: "bg-violet-500/10", badgeColor: "text-violet-400", color: "text-violet-400" },
  ];

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const actionItems = React.useMemo(() => {
    if (!mounted) {
      return [
        {
          id: "loading-1",
          type: "loading",
          title: "Loading Workspace...",
          description: "Syncing workspace checklist details...",
          actionLabel: "Syncing",
          onClick: () => {},
          iconBg: "bg-white/[0.03] text-white/20"
        },
        {
          id: "loading-2",
          type: "loading",
          title: "Preparing Tasks...",
          description: "Structuring pending items...",
          actionLabel: "Syncing",
          onClick: () => {},
          iconBg: "bg-white/[0.03] text-white/20"
        }
      ];
    }

    const items: any[] = [];

    // 1. Check if profile needs setup (missing overview description)
    try {
      const storedProfile = localStorage.getItem("recruiter_profile");
      const profile = storedProfile ? JSON.parse(storedProfile) : null;
      if (!profile || !profile.overview || profile.overview.includes("TechCorp is a product-led software company")) {
        items.push({
          id: "setup-profile",
          type: "profile",
          title: "Complete Company Profile",
          description: "Add branding details & overview to attract candidates.",
          actionLabel: "Setup Profile",
          onClick: () => onTabChange?.("profile"),
          iconBg: "bg-orange-500/10 text-[#FF914D]"
        });
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Check for active jobs with unscreened applicants
    jobs.forEach(job => {
      try {
        const key = `recruiter_job_${job.id}_applicants`;
        const stored = localStorage.getItem(key);
        const applicants = stored ? JSON.parse(stored) : [];
        const unscreenedCount = applicants.filter((a: any) => !a.screeningStatus || a.screeningStatus === "unscreened").length;
        
        if (unscreenedCount > 0) {
          items.push({
            id: `screen-${job.id}`,
            type: "screen",
            title: "Review Applicants",
            description: `${unscreenedCount} unscreened candidate${unscreenedCount > 1 ? 's' : ''} waiting for ${job.title}.`,
            actionLabel: "Screen Candidates",
            onClick: () => onViewJobApplicants(job.id),
            iconBg: "bg-emerald-500/10 text-emerald-400"
          });
        }
      } catch (e) {
        console.error(e);
      }
    });

    // 3. Check for draft roles
    const draftJobs = jobs.filter(j => j.status === "Draft");
    draftJobs.forEach(job => {
      items.push({
        id: `draft-${job.id}`,
        type: "draft",
        title: "Publish Draft Role",
        description: `"${job.title}" is in drafts and not visible to talent.`,
        actionLabel: "Publish Role",
        onClick: () => onViewJobApplicants(job.id),
        iconBg: "bg-violet-500/10 text-violet-400"
      });
    });

    // 4. Default task if nothing else is pending
    if (items.length === 0) {
      items.push({
        id: "all-clear",
        type: "success",
        title: "All Caught Up!",
        description: "Your recruitment workspace is completely up to date.",
        actionLabel: "Create Job Post",
        onClick: () => onNewJob?.(),
        iconBg: "bg-sky-500/10 text-sky-400"
      });
    }

    return items.slice(0, 2); // Show top 2 most critical items
  }, [mounted, jobs, onTabChange, onViewJobApplicants, onNewJob]);

  const notifications = React.useMemo(() => {
    return [
      {
        id: "n1",
        title: "New applicant matching",
        description: "Melissa Salazar matches 88% for Machine Learning Engineer.",
        time: "2 hours ago",
        type: "applicant",
        unread: true,
      },
      {
        id: "n2",
        title: "Views milestone reached",
        description: "AI Engineer listing has exceeded 150 unique views.",
        time: "1 day ago",
        type: "milestone",
        unread: true,
      },
      {
        id: "n3",
        title: "Company profile verified",
        description: "TechCorp workspace branding verified by administrator.",
        time: "2 days ago",
        type: "system",
        unread: false,
      }
    ];
  }, []);

  const activeJobs = React.useMemo(() => {
    return jobs.filter(j => j.status === "Active").slice(0, 2);
  }, [jobs]);

  return (
    <ViewMotion className="h-full flex flex-col">
      <section className={`${surface} flex-1 flex flex-col overflow-hidden`}>
        {/* Header welcome banner */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4.5 bg-gradient-to-r from-white/[0.01] to-transparent">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#FF914D] font-bold">Workspace Overview</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">Welcome back, TechCorp</h1>
          </div>
          <button onClick={onOpenJobs} className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-semibold text-white/80 cursor-pointer transition-all duration-200 hover:bg-[#FF6B00] hover:border-transparent hover:text-white hover:shadow-[0_4px_12px_rgba(255,107,0,0.2)]">
            Active Jobs ({analytics.activeJobs})
          </button>
        </div>

        {/* Content Area - No scrollbars needed */}
        <div className="flex-1 p-6 space-y-5 flex flex-col justify-between overflow-hidden">
          {/* Metrics Grid - Horizontal Row layout */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`${insetSurface} p-4 relative overflow-hidden group hover:border-white/10 transition-all duration-200`}
              >
                <div className="absolute -right-6 -bottom-6 w-16 h-16 rounded-full bg-gradient-to-br from-white/[0.01] to-white/[0.03] group-hover:scale-150 transition-transform duration-300" />
                
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold">{metric.label}</span>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${metric.badgeBg} ${metric.badgeColor}`}>
                    {metric.trend}
                  </span>
                </div>
                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span className={`text-2xl font-bold tracking-tight ${metric.color}`}>{metric.value}</span>
                </div>
                <div className="mt-1.5 text-[10px] text-white/30 font-medium">{metric.note}</div>
              </motion.div>
            ))}
          </div>

          {/* Unified Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-stretch overflow-hidden">
            {/* Left Activities Panel (col-span-8) */}
            <div className="lg:col-span-8 flex flex-col justify-between gap-4 overflow-hidden">
              
              {/* Section 1: Dynamic Action Required Panel */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2.5">
                  <IconActivity size={15} className="text-[#FF914D]" />
                  <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Action Required</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4 flex-1">
                  {actionItems.map((item) => (
                    <div key={item.id} className={`${insetSurface} p-4 flex flex-col justify-between hover:border-white/10 transition-all duration-200 group`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Action Icon */}
                          <div className={`h-9.5 w-9.5 rounded-xl ${item.iconBg} flex items-center justify-center font-bold text-xs shadow-sm shrink-0`}>
                            {item.type === "profile" && <IconBuilding size={16} />}
                            {item.type === "screen" && <IconUsers size={16} />}
                            {item.type === "draft" && <IconBriefcase size={16} />}
                            {item.type === "success" && <IconCheck size={16} />}
                            {item.type === "loading" && <IconActivity size={16} className="animate-pulse" />}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold text-white leading-tight group-hover:text-[#FF914D] transition-colors truncate">{item.title}</h3>
                            <p className="text-[10px] text-white/45 truncate mt-0.5">{item.type === "success" ? "All clear" : "Urgent Action Required"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Task Description */}
                      <p className="mt-3 text-[10.5px] text-white/35 leading-relaxed">
                        {item.description}
                      </p>
                      
                      {/* Footer Actions */}
                      <div className="mt-4 border-t border-white/[0.04] pt-2.5 flex items-center justify-end">
                        <button 
                          onClick={item.onClick}
                          className="font-semibold text-[10px] text-[#FF914D] hover:text-white flex items-center gap-1 cursor-pointer transition-colors leading-none"
                        >
                          {item.actionLabel} <span>→</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Top Active Job Postings */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2.5">
                  <IconBriefcase size={15} className="text-[#FF914D]" />
                  <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Top Performing Roles</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 flex-1">
                  {activeJobs.map((job) => (
                    <div key={job.id} className={`${insetSurface} p-4 flex flex-col justify-between hover:border-white/10 transition-all duration-200 group`}>
                      <div>
                        {/* Row 1: Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold text-white group-hover:text-[#FF914D] transition-colors truncate leading-tight">{job.title}</h3>
                            <p className="text-[10px] text-white/45 mt-1 truncate">{job.type} • {job.location}</p>
                          </div>
                          <StatusBadge status={job.status} />
                        </div>

                        {/* Row 2: Short Description */}
                        <p className="mt-2.5 text-[10px] text-white/35 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>

                        {/* Row 3: Tags / Skills required */}
                        <div className="mt-3 flex flex-wrap gap-1">
                          {job.tags?.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-[9px] text-[#FF914D]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Row 4: Metrics & Progress bar */}
                      <div className="mt-3.5">
                        <div className="flex items-center justify-between text-[9px] font-semibold text-white/40 mb-1">
                          <span>{job.views} views</span>
                          <span className="text-[#FF914D]">{job.applications} applications</span>
                        </div>
                        <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF914D]"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((job.applications / 30) * 100, 100)}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      {/* Row 5: Footer */}
                      <div className="mt-3 border-t border-white/[0.04] pt-2.5 flex items-center justify-end">
                        <button 
                          onClick={() => onViewJobApplicants(job.id)}
                          className="text-[9.5px] font-semibold text-white/60 hover:text-white flex items-center gap-1 cursor-pointer transition-colors leading-none"
                        >
                          Manage applicants <span>→</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {activeJobs.length === 0 && (
                    <div className={`${insetSurface} col-span-2 flex items-center justify-center py-8 text-white/30 text-xs`}>
                      No active jobs posted.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Notifications Panel (col-span-4) */}
            <div className={`${insetSurface} p-4.5 lg:col-span-4 flex flex-col justify-between hover:border-white/10 transition-all duration-200`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3 border-b border-white/[0.04] pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-[#FF6B00]/10 text-[#FF914D]">
                    <IconBell size={15} />
                  </div>
                  <h2 className="text-xs font-semibold text-white/90 uppercase tracking-wider">
                    Notifications
                  </h2>
                </div>
                <span className="text-[9.5px] font-bold text-[#FF914D] bg-[#FF6B00]/10 px-2 py-0.5 rounded-full border border-orange-500/15">2 Unread</span>
              </div>
              
              {/* Notifications List */}
              <div className="flex flex-col gap-3 flex-1 justify-start py-1">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className="flex items-start gap-3 p-2.5 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-150 relative group"
                  >
                    {/* Unread Glowing Dot Indicator */}
                    {notif.unread && (
                      <span className="absolute top-3.5 right-3 w-1.5 h-1.5 rounded-full bg-[#FF6B00] shadow-[0_0_6px_#FF6B00]" />
                    )}

                    {/* Icon based on type */}
                    <div className={`p-2 rounded-lg shrink-0 ${
                      notif.unread ? 'bg-[#FF6B00]/10 text-[#FF914D]' : 'bg-white/[0.04] text-white/40'
                    }`}>
                      {notif.type === "applicant" && <IconUsers size={14} />}
                      {notif.type === "milestone" && <IconTrendingUp size={14} />}
                      {notif.type === "system" && <IconCheck size={14} />}
                    </div>

                    <div className="min-w-0 pr-4">
                      <div className={`text-xs font-semibold leading-tight ${notif.unread ? 'text-white' : 'text-white/60'}`}>
                        {notif.title}
                      </div>
                      <p className="text-[10px] text-white/35 mt-1 leading-snug">
                        {notif.description}
                      </p>
                      <span className="text-[9px] text-white/25 mt-1 block font-medium">
                        {notif.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </ViewMotion>
  );
}
