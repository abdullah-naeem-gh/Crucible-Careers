"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  IconArrowRight,
  IconBriefcase,
  IconCalendar,
  IconClipboardCheck,
  IconPlayerPlay,
  IconPlus,
  IconUsers,
} from "@tabler/icons-react";
import { calculateAtsScore, getApplicantsByJob, getPipelineStage } from "@/lib/employer/services/applicants.service";
import { ApplicantPipelineStage, CandidateProfile } from "@/types/employer/applicant";
import { EmployerJob } from "@/types/employer/job";
import { Skeleton } from "@/components/ui/Skeleton";

export type { EmployerJob };

export interface Analytics {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalViews: number;
  avgApplications: number;
  avgViews: number;
}

interface OverviewTabProps {
  jobs: EmployerJob[];
  company: string;
  onOpenJob: (jobId?: string) => void;
  onOpenApplicants: (jobId?: string, stage?: ApplicantPipelineStage) => void;
  onNewJob: () => void;
  jobsLoading?: boolean;
}

interface ApplicantWithJob {
  candidate: CandidateProfile;
  job: EmployerJob;
  stage: ApplicantPipelineStage;
  fitScore: number;
  originalIndex: number;
}

interface QueueItem {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  icon: typeof IconUsers;
  onClick: () => void;
}

const surface = "rounded-[24px] border border-white/[0.07] bg-[#171717] shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)]";
const rowSurface = "rounded-2xl border border-white/[0.065] bg-[#141414]";

const stageLabels: Record<ApplicantPipelineStage, string> = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  interviewing: "Interviewing",
  offered: "Offer",
  hired: "Hired",
  feedback: "Awaiting feedback",
  rejected: "Rejected",
};

function formatAppliedDate(value: string) {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return value || "Date unavailable";
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  }).format(date);
}

function OverviewMotion({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

export default function OverviewTab({ jobs, company, onOpenJob, onOpenApplicants, onNewJob, jobsLoading = false }: OverviewTabProps) {
  const [applicantsByJob, setApplicantsByJob] = useState<Record<string, CandidateProfile[]>>({});
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(true);
  const isLoading = jobsLoading || isLoadingApplicants;

  useEffect(() => {
    let cancelled = false;
    getApplicantsByJob(jobs).then((data) => {
      if (!cancelled) setApplicantsByJob(data);
    }).finally(() => {
      if (!cancelled) setIsLoadingApplicants(false);
    });
    return () => {
      cancelled = true;
    };
  }, [jobs]);

  const viewModel = useMemo(() => {
    let originalIndex = 0;
    const applicants: ApplicantWithJob[] = jobs.flatMap((job) =>
      (applicantsByJob[job.id] ?? []).map((candidate) => ({
        candidate,
        job,
        stage: getPipelineStage(candidate),
        fitScore: candidate.atsScore ?? calculateAtsScore(candidate.skills ?? [], job.tags ?? []),
        originalIndex: originalIndex++,
      })),
    );

    const reviewByJob = jobs
      .map((job) => {
        const candidates = applicants.filter((item) => item.job.id === job.id && item.stage === "applied");
        return { job, candidates, bestFit: candidates.reduce((best, item) => Math.max(best, item.fitScore), 0) };
      })
      .filter((item) => item.candidates.length > 0)
      .sort((a, b) => b.candidates.length - a.candidates.length || b.bestFit - a.bestFit);

    const interviewingByJob = jobs
      .map((job) => ({ job, count: applicants.filter((item) => item.job.id === job.id && item.stage === "interviewing").length }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);

    const recent = [...applicants].sort((a, b) => {
      const aTime = Date.parse(a.candidate.appliedDate);
      const bTime = Date.parse(b.candidate.appliedDate);
      const aValid = !Number.isNaN(aTime);
      const bValid = !Number.isNaN(bTime);
      if (aValid && bValid) return bTime - aTime || a.originalIndex - b.originalIndex;
      if (aValid !== bValid) return aValid ? -1 : 1;
      return a.originalIndex - b.originalIndex;
    }).slice(0, 5);

    return {
      applicants,
      activeRoles: jobs.filter((job) => job.status === "Active").length,
      needsReview: reviewByJob.reduce((total, item) => total + item.candidates.length, 0),
      interviewing: interviewingByJob.reduce((total, item) => total + item.count, 0),
      reviewByJob,
      interviewingByJob,
      recent,
    };
  }, [applicantsByJob, jobs]);

  const queue = useMemo<QueueItem[]>(() => {
    if (!jobs.length) {
      return [{
        id: "create-first-role",
        title: "Create your first role",
        description: "Publish a role to start receiving and reviewing applicants.",
        actionLabel: "Create job",
        icon: IconPlus,
        onClick: onNewJob,
      }];
    }

    const items: QueueItem[] = viewModel.reviewByJob.map(({ job, candidates }) => ({
      id: `review-${job.id}`,
      title: `Review ${job.title} applicants`,
      description: `${candidates.length} new candidate${candidates.length === 1 ? " is" : "s are"} waiting for an initial decision.`,
      actionLabel: "Review now",
      icon: IconUsers,
      onClick: () => onOpenApplicants(job.id, "applied"),
    }));

    jobs.filter((job) => job.status === "Draft").forEach((job) => {
      items.push({
        id: `draft-${job.id}`,
        title: `Finish ${job.title}`,
        description: "This draft is not visible to candidates yet.",
        actionLabel: "Open draft",
        icon: IconClipboardCheck,
        onClick: () => onOpenJob(job.id),
      });
    });

    jobs.filter((job) => job.status === "Paused").forEach((job) => {
      const waiting = (applicantsByJob[job.id] ?? []).filter((candidate) => {
        const stage = getPipelineStage(candidate);
        return stage !== "hired" && stage !== "rejected";
      }).length;
      if (!waiting) return;
      items.push({
        id: `paused-${job.id}`,
        title: `Resume ${job.title}`,
        description: `${waiting} candidate${waiting === 1 ? " is" : "s are"} still in progress while this role is paused.`,
        actionLabel: "Review role",
        icon: IconPlayerPlay,
        onClick: () => onOpenJob(job.id),
      });
    });

    return items.slice(0, 4);
  }, [applicantsByJob, jobs, onNewJob, onOpenApplicants, onOpenJob, viewModel.reviewByJob]);

  const reviewDestination = viewModel.reviewByJob[0]?.job.id;
  const interviewDestination = viewModel.interviewingByJob[0]?.job.id;
  const hasActiveJobs = viewModel.activeRoles > 0;
  const currentState = !jobs.length
    ? "Create a role to start building your hiring pipeline."
    : viewModel.needsReview > 0
      ? `${viewModel.needsReview} new candidate${viewModel.needsReview === 1 ? " needs" : "s need"} your review.`
      : viewModel.interviewing > 0
        ? `${viewModel.interviewing} candidate${viewModel.interviewing === 1 ? " is" : "s are"} currently interviewing.`
        : hasActiveJobs && !viewModel.applicants.length
          ? "Your roles are live. New applicants will appear here as they arrive."
          : "There are no immediate hiring actions waiting for you.";

  const summary = [
    { label: "Active roles", value: viewModel.activeRoles, helper: "View job listings", icon: IconBriefcase, onClick: () => onOpenJob() },
    { label: "Needs review", value: viewModel.needsReview, helper: "Open new applicants", icon: IconClipboardCheck, onClick: () => onOpenApplicants(reviewDestination, "applied") },
    { label: "In interviews", value: viewModel.interviewing, helper: "Open hiring pipeline", icon: IconUsers, onClick: () => onOpenApplicants(interviewDestination) },
  ];

  return (
    <OverviewMotion>
      <section className={`${surface} flex h-full min-h-[38rem] flex-col overflow-hidden`}>
        <header className="flex flex-col gap-4 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FF914D]">{company}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Hiring overview</h1>
            <p className="mt-1.5 text-sm text-white/45">{currentState}</p>
          </div>
          <button type="button" onClick={onNewJob} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FF6B00] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(255,107,0,0.18)] transition-colors hover:bg-[#ff7a1a] cursor-pointer">
            <IconPlus size={17} /> New job
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 custom-scrollbar lg:p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {summary.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button key={item.label} type="button" onClick={item.onClick} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className={`${rowSurface} overview-summary-card group min-w-0 p-4 text-left transition-colors hover:border-orange-500/30 hover:bg-white/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{item.label}</span>
                    <Icon size={16} className="shrink-0 text-white/25 transition-colors group-hover:text-[#FF914D]" />
                  </div>
                  {isLoading ? (
                    <Skeleton className="mt-2 h-7 w-10 rounded" />
                  ) : (
                    <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{item.value}</div>
                  )}
                  <div className="mt-1 truncate text-[11px] text-white/30">{item.helper}</div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
            <section className="lg:col-span-7">
              <div className="mb-3 flex items-end justify-between gap-4">
                <div><h2 className="text-sm font-semibold text-white">Priority queue</h2><p className="mt-1 text-xs text-white/35">The next decisions that will move hiring forward.</p></div>
                {queue.length > 0 && <span className="text-xs tabular-nums text-white/30">{queue.length} action{queue.length === 1 ? "" : "s"}</span>}
              </div>

              <div className="space-y-2.5">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={`${rowSurface} flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center`}>
                      <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                      <div className="min-w-0 flex-1">
                        <Skeleton className="h-3.5 w-2/5 rounded" />
                        <Skeleton className="mt-2 h-3 w-3/5 rounded" />
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {queue.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.id} className={`${rowSurface} flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center`}>
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.04] text-[#FF914D]"><Icon size={18} /></div>
                          <div className="min-w-0 flex-1"><h3 className="text-sm font-medium text-white/90">{item.title}</h3><p className="mt-1 text-xs leading-relaxed text-white/38">{item.description}</p></div>
                          <button type="button" onClick={item.onClick} className="overview-action-button inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg px-2 py-1.5 text-xs font-semibold text-[#FF914D] transition-colors hover:bg-orange-500/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] sm:self-center cursor-pointer">{item.actionLabel}<IconArrowRight size={14} /></button>
                        </div>
                      );
                    })}

                    {!queue.length && (
                      <div className={`${rowSurface} px-5 py-8 text-center`}><IconClipboardCheck size={22} className="mx-auto text-emerald-400/70" /><h3 className="mt-3 text-sm font-medium text-white/80">Nothing needs attention right now</h3><p className="mt-1.5 text-xs text-white/35">New applicants and role tasks will appear here when action is needed.</p></div>
                    )}
                  </>
                )}
              </div>
            </section>

            <section className="lg:col-span-5">
              <div className="mb-3"><h2 className="text-sm font-semibold text-white">Recent applicants</h2><p className="mt-1 text-xs text-white/35">The latest candidates across all roles.</p></div>
              <div className={`${rowSurface} overflow-hidden`}>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`p-3.5 ${i > 0 ? "border-t border-white/[0.055]" : ""}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <Skeleton className="h-3.5 w-2/5 rounded" />
                          <Skeleton className="mt-2 h-3 w-1/3 rounded" />
                        </div>
                        <Skeleton className="h-4 w-12 shrink-0 rounded" />
                      </div>
                    </div>
                  ))
                ) : viewModel.recent.length > 0 ? viewModel.recent.map((item, index) => (
                  <button key={`${item.job.id}-${item.candidate.id}`} type="button" onClick={() => onOpenApplicants(item.job.id, item.stage)} className={`overview-applicant-row group block w-full p-3.5 text-left transition-colors hover:bg-white/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF6B00] cursor-pointer ${index > 0 ? "border-t border-white/[0.055]" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0"><div className="truncate text-sm font-medium text-white/85 group-hover:text-white">{item.candidate.name}</div><div className="mt-0.5 truncate text-xs text-white/38">{item.job.title}</div></div>
                      <span className="shrink-0 rounded-lg border border-white/[0.07] bg-white/[0.035] px-2 py-1 text-[10px] font-semibold text-white/55">{item.fitScore}% fit</span>
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-white/32"><span className="font-medium text-[#FF914D]/80">{stageLabels[item.stage]}</span><span className="inline-flex items-center gap-1"><IconCalendar size={12} />{formatAppliedDate(item.candidate.appliedDate)}</span></div>
                  </button>
                )) : (
                  <div className="px-5 py-10 text-center"><IconUsers size={22} className="mx-auto text-white/20" /><h3 className="mt-3 text-sm font-medium text-white/70">{hasActiveJobs ? "No applicants yet" : "No applicant activity"}</h3><p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-white/32">{hasActiveJobs ? "Your active roles are ready. New candidates will appear here when they apply." : "Applicant activity will appear after you publish a role."}</p></div>
                )}
              </div>
            </section>
          </div>
        </div>
      </section>
    </OverviewMotion>
  );
}
