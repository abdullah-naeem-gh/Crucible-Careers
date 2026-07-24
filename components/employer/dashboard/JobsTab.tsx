"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { IconUsers, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, IconLink, IconCheck } from "@tabler/icons-react";
import { EmployerJob } from "@/types/employer/job";
import { Skeleton } from "@/components/ui/Skeleton";
import { copyToClipboard } from "@/lib/shared/clipboard";

const JOBS_PER_PAGE = 10;
type JobFilter = "all" | "active" | "inactive" | "archived";

const jobFilters: { label: string; value: JobFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Paused / Drafted", value: "inactive" },
  { label: "Archived", value: "archived" },
];

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

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-xs leading-relaxed text-white/50">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF6B00]" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CopyApplyLinkButton({ jobId, compact = false }: { jobId: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await copyToClipboard(`${window.location.origin}/apply/${jobId}`);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        title="Copy public apply link"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-white/45 cursor-pointer hover:bg-white/[0.05] hover:text-white transition-all"
      >
        {copied ? <IconCheck size={14} className="text-emerald-400" /> : <IconLink size={14} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-white/55 cursor-pointer hover:bg-white/[0.05] hover:text-white"
    >
      {copied ? <IconCheck size={14} className="text-emerald-400" /> : <IconLink size={14} />}
      {copied ? "Copied!" : "Copy Apply Link"}
    </button>
  );
}

interface JobsTabProps {
  jobs: EmployerJob[];
  selectedJob: EmployerJob | null;
  onSelect: (id: string) => void;
  onNewJob: () => void;
  onEditJob: (job: EmployerJob) => void;
  onUpdate: (id: string, updates: Partial<EmployerJob>) => void;
  onRemove: (id: string, hard?: boolean) => void;
  canHardDelete?: boolean;
  onViewApplications: (id: string) => void;
}

export default function JobsTab({
  jobs,
  selectedJob,
  onSelect,
  onNewJob,
  onEditJob,
  onUpdate,
  onRemove,
  canHardDelete = false,
  onViewApplications,
}: JobsTabProps) {
  const [isFormPreviewOpen, setIsFormPreviewOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobFilter, setJobFilter] = useState<JobFilter>("all");
  const [pageJobs, setPageJobs] = useState<EmployerJob[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  // Re-fetch this page from the backend whenever the page changes or the
  // underlying job count changes (job created/deleted elsewhere in the dashboard).
  useEffect(() => {
    let cancelled = false;

    const loadPage = async () => {
      setIsLoadingPage(true);
      try {
        const res = await fetch(`/api/employer/jobs?page=${currentPage}&limit=${JOBS_PER_PAGE}&status=${jobFilter}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        if (currentPage > data.totalPages && data.totalPages > 0) {
          setCurrentPage(data.totalPages);
          return;
        }

        setPageJobs(data.jobs);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error("Failed to load jobs page", err);
      } finally {
        if (!cancelled) setIsLoadingPage(false);
      }
    };

    loadPage();
    return () => {
      cancelled = true;
    };
  }, [currentPage, jobFilter, jobs.length]);

  // Prefer the parent's copy of each job so optimistic updates (pause/activate)
  // show up immediately instead of waiting on the next page re-fetch.
  const paginatedJobs = pageJobs.map((job) => jobs.find((j) => j.id === job.id) ?? job);

  return (
    <ViewMotion className="grid h-full grid-cols-1 gap-5 lg:grid-cols-9 lg:gap-7">
      <section className={`${surface} flex min-h-[38rem] flex-col overflow-hidden lg:col-span-5 lg:min-h-0`}>
        <div className="border-b border-white/[0.07] p-5">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div className="w-full rounded-xl border border-white/[0.07] bg-[#141414] py-3 pl-10 pr-4 text-sm text-white/35">
                Your Job Listings
              </div>
            </div>
            <button onClick={onNewJob} className="rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-4 py-3 text-sm font-medium text-white shadow-[0_8px_20px_rgba(255,107,0,0.18)] cursor-pointer">
              + New Job
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter job listings by status">
            {jobFilters.map((filter) => {
              const isActive = jobFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    setJobFilter(filter.value);
                    setCurrentPage(1);
                  }}
                  className={`job-filter-chip rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    isActive ? "job-filter-chip-active" : ""
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-white/35">{jobs.length} job{jobs.length === 1 ? "" : "s"} posted</div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-auto custom-scrollbar p-5">
          {isLoadingPage && pageJobs.length === 0 ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-full rounded-2xl border border-white/[0.065] bg-[#141414] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-3 w-2/5 rounded" />
                      <Skeleton className="mt-2 h-4 w-3/5 rounded" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="ml-auto h-3 w-14 rounded" />
                      <Skeleton className="mt-2 ml-auto h-5 w-16 rounded" />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Skeleton className="h-5 w-14 rounded-lg" />
                    <Skeleton className="h-5 w-16 rounded-lg" />
                    <Skeleton className="h-5 w-12 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedJobs.length === 0 ? (
            <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-white/10 px-6 text-center">
              <div>
                <div className="text-sm font-semibold text-white/70">No jobs in this view</div>
                <p className="mt-1 text-xs text-white/35">Try another status filter or create a new job listing.</p>
              </div>
            </div>
          ) : (
          paginatedJobs.map((job) => (
            <motion.div
              key={job.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(job.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(job.id);
                }
              }}
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`w-full rounded-2xl border p-4 text-left cursor-pointer transition-colors duration-150 outline-none ${
                selectedJob?.id === job.id
                  ? "border-orange-500/50 bg-orange-500/[0.055] shadow-[0_0_0_2px_rgba(255,107,0,0.1),8px_8px_18px_rgba(0,0,0,0.22)]"
                  : "border-white/[0.065] bg-[#141414] shadow-[6px_6px_16px_rgba(0,0,0,0.24),-3px_-3px_10px_rgba(255,255,255,0.018)] hover:border-white/10 focus:border-white/20"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-white/35">{job.company} • {job.location} • {job.type}</div>
                  <div className="mt-1 text-base font-semibold">{job.title}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/30">{job.postedAt}</div>
                  <div className="mt-2"><StatusBadge status={job.status} /></div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {job.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-xs text-white/45">{tag}</span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-white/45">{job.salary}</span>
                <div className="flex items-center gap-2">
                  <CopyApplyLinkButton jobId={job.id} compact />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewApplications(job.id);
                    }}
                    className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-2.5 py-1.5 text-xs text-[#FF914D] cursor-pointer hover:bg-orange-500/20 transition-all font-medium"
                  >
                    View Applications ({job.applications})
                  </button>
                </div>
              </div>
            </motion.div>
          ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-3">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/55 cursor-pointer hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <IconChevronLeft size={16} />
            </button>
            <span className="text-xs text-white/35">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/55 cursor-pointer hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <IconChevronRight size={16} />
            </button>
          </div>
        )}
      </section>

      <section className={`${surface} min-h-[38rem] overflow-auto custom-scrollbar p-6 lg:col-span-4 lg:min-h-0`}>
        {!selectedJob ? (
          <div className="grid h-full place-items-center text-center">
            <div>
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-orange-500/10 text-[#FF914D]">◎</div>
              <h2 className="font-semibold text-white/80">Select a job to view details</h2>
              <p className="mt-2 text-sm text-white/35">Choose a job from the list to see applications and manage settings.</p>
            </div>
          </div>
        ) : (
          <motion.div key={selectedJob.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-white/35">{selectedJob.company} • {selectedJob.location} • {selectedJob.type}</div>
                <h1 className="mt-1 text-2xl font-semibold leading-tight">{selectedJob.title}</h1>
              </div>
              <div className="text-right">
                <div className="mb-2 text-xs text-white/30">{selectedJob.postedAt}</div>
                <div className="text-sm font-semibold text-[#FF914D]">{selectedJob.salary}</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <StatusBadge status={selectedJob.status} />
              <div className="flex gap-2">
                <CopyApplyLinkButton jobId={selectedJob.id} />
                <button
                  onClick={() => onUpdate(selectedJob.id, { status: selectedJob.status === "Active" ? "Paused" : "Active" })}
                  className="rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-white/55 cursor-pointer hover:bg-white/[0.05] hover:text-white"
                >
                  {selectedJob.status === "Active" ? "Pause" : "Activate"}
                </button>
                <button
                  onClick={() => onEditJob(selectedJob)}
                  className="rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-white/55 cursor-pointer hover:bg-white/[0.05] hover:text-white"
                >
                  Edit
                </button>
                <button 
                  onClick={() => setJobToDelete(selectedJob.id)} 
                  className="rounded-lg border border-red-500/15 bg-red-500/[0.07] px-3 py-2 text-xs text-red-300 cursor-pointer hover:bg-red-500/10"
                >
                  Archive
                </button>
              </div>
            </div>

            <div className="mt-4 border-t border-white/[0.07] pt-4">
              <button
                onClick={() => onViewApplications(selectedJob.id)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,107,0,0.15)] cursor-pointer hover:from-[#FF7B1A] hover:to-[#FF9D5C] transition-all"
              >
                <IconUsers size={16} />
                View Applications ({selectedJob.applications})
              </button>
            </div>

            <div className="my-6 grid grid-cols-3 gap-2">
              <MiniMetric label="Applications" value={selectedJob.applications} accent="text-[#FF914D]" />
              <MiniMetric label="Views" value={selectedJob.views} accent="text-sky-400" />
              <MiniMetric
                label="Conversion Rate"
                value={`${selectedJob.views ? Math.round((selectedJob.applications / selectedJob.views) * 100) : 0}%`}
                accent="text-emerald-400"
              />
            </div>

            <div className="mb-6">
              <h2 className="mb-3 text-sm font-semibold">Job Description</h2>
              <p className="text-sm leading-relaxed text-white/55">{selectedJob.description}</p>
            </div>

            <div className="mb-6">
              <h2 className="mb-3 text-sm font-semibold">Skills & Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {selectedJob.tags.map((tag) => (
                  <span key={tag} className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-1.5 text-xs text-white/50">{tag}</span>
                ))}
              </div>
            </div>

            {selectedJob.formConfig && (
              <div className="mb-6 border-t border-white/[0.07] pt-6">
                <button
                  type="button"
                  onClick={() => setIsFormPreviewOpen(!isFormPreviewOpen)}
                  className="flex w-full items-center justify-between text-sm font-semibold text-white cursor-pointer select-none hover:text-orange-400 transition-colors"
                >
                  <span>Application Questionnaire ({selectedJob.formConfig.fields.length} questions)</span>
                  {isFormPreviewOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                </button>

                {isFormPreviewOpen && (
                  <div className="mt-3 rounded-xl border border-white/[0.06] bg-[#121212] p-4 space-y-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#FF914D] mb-1">
                      {selectedJob.formConfig.name || "Custom Form"} Template
                    </div>
                    <div className="divide-y divide-white/[0.05]">
                      {selectedJob.formConfig.fields.map((field) => (
                        <div key={field.id} className="py-2 flex items-center justify-between text-xs">
                          <div className="font-medium text-white/80">
                            {field.label} {field.required && <span className="text-orange-400 font-bold">*</span>}
                          </div>
                          <div className="flex gap-2 text-white/30 text-[10px] uppercase font-bold shrink-0 pl-4">
                            <span>{field.type}</span>
                            <span>•</span>
                            <span className="text-sky-400/80">{field.semanticType}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <DetailList title="Responsibilities" items={selectedJob.responsibilities} />
              <DetailList title="Requirements" items={selectedJob.requirements} />
            </div>
          </motion.div>
        )}
      </section>

      <AnimatePresence>
        {jobToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setJobToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${surface} w-full max-w-sm overflow-hidden p-6 text-center`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Remove Job</h3>
              <p className="mb-6 text-sm text-white/50">Archiving removes the job from talent views while preserving company history. Admins may permanently delete it and its dependent data.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setJobToDelete(null)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onRemove(jobToDelete);
                    setJobToDelete(null);
                  }}
                  className="flex-1 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 cursor-pointer"
                >
                  Archive Job
                </button>
                {canHardDelete && <button
                  onClick={() => {
                    if (window.confirm('Permanently delete this job and its dependent data?')) onRemove(jobToDelete, true);
                    setJobToDelete(null);
                  }}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(239,68,68,0.2)] transition-colors hover:bg-red-600 cursor-pointer"
                >
                  Delete
                </button>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ViewMotion>
  );
}
