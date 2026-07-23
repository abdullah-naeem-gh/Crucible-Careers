"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import EmployerSidebar from "@/components/employer/sidebar/EmployerSidebar";
import JobApplicationsView from "@/components/employer/jobs/JobApplicationsView";

// Import modular tab components
import OverviewTab, { EmployerJob, Analytics } from "@/components/employer/dashboard/OverviewTab";
import { ApplicantPipelineStage, EmployerCandidateChatTarget } from "@/types/employer/applicant";
import JobsTab from "@/components/employer/dashboard/JobsTab";
import AllApplicantsKanbanTab from "@/components/employer/dashboard/AllApplicantsKanbanTab";
import AnalyticsTab from "@/components/employer/dashboard/AnalyticsTab";
import ProfileTab from "@/components/employer/dashboard/ProfileTab";
import JobForm from "@/components/employer/dashboard/JobForm";
import MessagesTab from "@/components/shared/chat/MessagesTab";
import EmployerChatDrawer from "@/components/employer/chat/EmployerChatDrawer";
import RankingTab from "@/components/employer/dashboard/RankingTab";
import VerificationRequestsTab from "@/components/employer/dashboard/VerificationRequestsTab";
import { getEmployerProfile, saveEmployerProfile } from "@/lib/employer/services/profile.service";
import { CompanyProfile } from "@/types/employer/profile";
import { IconCircleCheck, IconEye, IconPlus } from "@tabler/icons-react";

type EmployerTab = "overview" | "jobs" | "applicants" | "analytics" | "profile" | "messages" | "ranking" | "verification";

const DEFAULT_PROFILE: CompanyProfile = {
  name: "TechCorp",
  tagline: "Building the future, one line at a time",
  industry: "Software & Technology",
  companySize: "51–200 employees",
  founded: "2018",
  website: "https://techcorp.io",
  headquarters: "San Francisco, CA",
  overview:
    "TechCorp is a product-led software company focused on building developer tools and AI-powered platforms. We believe in shipping fast, learning faster, and creating products that developers love.",
  culture:
    "We operate as a high-trust, remote-first team. Everyone owns their work end-to-end. We celebrate curiosity, direct feedback, and building things that matter.",
  benefits:
    "Competitive salary, equity, health insurance, flexible hours, home office stipend, annual learning budget, team retreats",
  techStack: "React, TypeScript, Node.js, PostgreSQL, AWS, Docker, Kubernetes",
  linkedin: "https://linkedin.com/company/techcorp",
  twitter: "https://twitter.com/techcorp",
  logoUrl: null,
};

const surface = "rounded-[24px] border border-white/[0.07] bg-[#171717] shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)]";

function PersistentTabPanel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div className={active ? "h-full" : "hidden"} aria-hidden={!active}>
      {children}
    </div>
  );
}

function EmployerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const requestedJobId = searchParams.get("job");
  const requestedStage = searchParams.get("stage") as ApplicantPipelineStage | null;
  const onboarded = searchParams.get("onboarded");
  const initialTab: EmployerTab =
    requestedTab === "jobs" || requestedTab === "applicants" || requestedTab === "analytics" || requestedTab === "profile" || requestedTab === "messages" || requestedTab === "ranking" || requestedTab === "verification"
      ? (requestedTab as EmployerTab)
      : "overview";

  const [activeTab, setActiveTab] = useState<EmployerTab>(initialTab);
  const [visitedTabs, setVisitedTabs] = useState<Set<EmployerTab>>(() => new Set([initialTab]));
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<EmployerJob | null>(null);
  const [isSavingJob, setIsSavingJob] = useState(false);
  const [jobSaveError, setJobSaveError] = useState<string | null>(null);
  const [savedJob, setSavedJob] = useState<EmployerJob | null>(null);
  const [jobSaveKind, setJobSaveKind] = useState<"created" | "updated" | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_PROFILE);
  const [viewingJobApplicantsId, setViewingJobApplicantsId] = useState<string | null>(null);
  const [candidateChatTarget, setCandidateChatTarget] = useState<EmployerCandidateChatTarget | null>(null);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDesktopLayout, setIsDesktopLayout] = useState(false);
  const [expandedSidebarWidth, setExpandedSidebarWidth] = useState(360);
  const company = profile.name || "Your Company";

  const closeJobForm = () => {
    if (isSavingJob) return;
    setIsFormOpen(false);
    setEditingJob(null);
    setSavedJob(null);
    setJobSaveError(null);
    setJobSaveKind(null);
  };

  const openNewJobForm = () => {
    setEditingJob(null);
    setSavedJob(null);
    setJobSaveError(null);
    setJobSaveKind(null);
    setIsFormOpen(true);
  };

  const openEditJobForm = (job: EmployerJob) => {
    setEditingJob(job);
    setSavedJob(null);
    setJobSaveError(null);
    setJobSaveKind(null);
    setIsFormOpen(true);
  };

  useEffect(() => {
    const updateSidebarMetrics = () => {
      const desktop = window.innerWidth >= 1024;
      const availableWidth = Math.min(window.innerWidth - 32, 1720);

      setIsDesktopLayout(desktop);
      setExpandedSidebarWidth(Math.min(430, Math.max(280, Math.round(availableWidth * 0.25))));
    };

    updateSidebarMetrics();
    window.addEventListener("resize", updateSidebarMetrics);
    return () => window.removeEventListener("resize", updateSidebarMetrics);
  }, []);

  useEffect(() => {
    setVisitedTabs((current) => {
      if (current.has(activeTab)) return current;
      const next = new Set(current);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await fetch("/api/employer/jobs");
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
          if (data.length > 0 && !selectedJobId) {
            setSelectedJobId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load jobs", err);
      } finally {
        setJobsLoading(false);
      }
    };

    // Fetch profile from API
    const loadProfile = async () => {
      try {
        const { profile: dbProfile, name } = await getEmployerProfile();
        if (dbProfile) {
          setProfile(dbProfile);
        } else {
          // No employer_profiles row yet, but the company name was already
          // captured at signup — show it instead of the "TechCorp" placeholder.
          if (name) setProfile((prev) => ({ ...prev, name }));
          if (!onboarded) {
            // First visit with no profile → redirect to onboarding
            router.replace("/employer/onboarding");
          }
        }
      } catch (err) {
        console.error("Failed to fetch employer profile", err);
      } finally {
        setHydrated(true);
      }
    };

    loadJobs();
    loadProfile();

    if (onboarded) {
      setShowWelcomeBanner(true);
      setTimeout(() => setShowWelcomeBanner(false), 4000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle profile updates from ProfileTab
  const handleProfileChange = async (updated: CompanyProfile) => {
    setProfile(updated);
    try {
      await saveEmployerProfile(updated);
    } catch (err) {
      console.error("Failed to save employer profile", err);
    }
  };

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && jobs.some((job) => job.id === hash)) {
      setSelectedJobId(hash);
      setActiveTab("jobs");
    }
  }, [jobs]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSavingJob) {
        setIsFormOpen(false);
        setEditingJob(null);
        setSavedJob(null);
        setJobSaveError(null);
        setJobSaveKind(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSavingJob]);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) ?? null,
    [jobs, selectedJobId],
  );

  const analytics = useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((job) => job.status === "Active").length;
    const totalApplications = jobs.reduce((sum, job) => sum + job.applications, 0);
    const totalViews = jobs.reduce((sum, job) => sum + job.views, 0);

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      totalViews,
      avgApplications: totalJobs ? Math.round(totalApplications / totalJobs) : 0,
      avgViews: totalJobs ? Math.round(totalViews / totalJobs) : 0,
    };
  }, [jobs]);


  const changeTab = (tab: EmployerTab) => {
    setCandidateChatTarget(null);
    setActiveTab(tab);
    setViewingJobApplicantsId(null);
    router.replace(
      tab === "overview" ? "/employer/dashboard" : `/employer/dashboard?tab=${tab}`,
      { scroll: false },
    );
  };

  const openApplicantsKanban = (jobId?: string | null, stage?: ApplicantPipelineStage) => {
    setActiveTab("applicants");
    setViewingJobApplicantsId(null);
    if (jobId) setSelectedJobId(jobId);
    const params = new URLSearchParams({ tab: "applicants" });
    if (jobId) params.set("job", jobId);
    if (stage) params.set("stage", stage);
    router.replace(
      `/employer/dashboard?${params.toString()}`,
      { scroll: false },
    );
  };

  const openJob = (jobId?: string) => {
    if (jobId) setSelectedJobId(jobId);
    changeTab("jobs");
  };

  const saveJob = async (job: Omit<EmployerJob, "id" | "postedAt" | "applications" | "views" | "hires" | "matchScore">) => {
    const isEditing = !!editingJob;
    setIsSavingJob(true);
    setJobSaveError(null);

    try {
      const url = isEditing ? "/api/employer/jobs/" + editingJob.id : "/api/employer/jobs";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });

      const responseData = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(responseData?.error || "Unable to save the job. Please try again.");
      } else {
        const nextSavedJob = responseData as EmployerJob;

        if (isEditing) {
          setJobs((current) => current.map((currentJob) => currentJob.id === nextSavedJob.id ? nextSavedJob : currentJob));
        } else {
          setJobs((current) => [nextSavedJob, ...current]);
        }

        setSelectedJobId(nextSavedJob.id);
        setSavedJob(nextSavedJob);
        setJobSaveKind(isEditing ? "updated" : "created");
        setEditingJob(null);
      }
    } catch (err) {
      console.error("API error", err);
      setJobSaveError(err instanceof Error ? err.message : "Unable to save the job. Please try again.");
    } finally {
      setIsSavingJob(false);
    }
  };

  const updateJob = async (id: string, updates: Partial<EmployerJob>) => {
    setJobs((current) => current.map((job) => (job.id === id ? { ...job, ...updates } : job)));

    try {
      const res = await fetch(`/api/employer/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        console.error("Failed to update job");
      }
    } catch (err) {
      console.error("API error", err);
    }
  };

  const removeJob = async (id: string) => {
    setJobs((current) => current.filter((job) => job.id !== id));
    if (selectedJobId === id) setSelectedJobId(null);

    try {
      const res = await fetch(`/api/employer/jobs/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        console.error("Failed to delete job");
      }
    } catch (err) {
      console.error("API error", err);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#101010] text-white">
      {/* Welcome banner after onboarding */}
      <AnimatePresence>
        {showWelcomeBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-2xl border border-[#FF6B00]/20 bg-[#FF6B00]/10 px-5 py-3 text-sm text-[#FF914D] backdrop-blur-md shadow-lg"
          >
            🎉 <span>Welcome to Crucible Careers — your profile is live!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,107,0,0.09),transparent_30%),radial-gradient(circle_at_85%_90%,rgba(255,145,77,0.05),transparent_28%)]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <section className="relative z-10 min-h-screen px-2 py-5 sm:px-4 lg:px-4 lg:h-screen lg:py-0">
        <div className="mx-auto flex min-h-full max-w-[1720px] flex-col gap-5 lg:flex-row lg:gap-7">
          <motion.div
            initial={false}
            animate={{ width: isDesktopLayout ? (isSidebarCollapsed ? 68 : expandedSidebarWidth) : "100%" }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0 shrink-0 overflow-visible lg:self-center"
          >
            <EmployerSidebar
              activeTab={activeTab}
              company={company}
              logoUrl={profile.logoUrl}
              jobCount={analytics.totalJobs}
              applicationCount={analytics.totalApplications}
              onTabChange={changeTab}
              onNewJob={openNewJobForm}
              collapsed={isSidebarCollapsed}
              onCollapsedChange={setIsSidebarCollapsed}
              isLoading={!hydrated}
            />
          </motion.div>

          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="min-h-[70vh] min-w-0 flex-1 lg:h-[92vh] lg:self-center"
          >
            {(visitedTabs.has("overview") || activeTab === "overview") && (
              <PersistentTabPanel active={activeTab === "overview"}>
                <OverviewTab
                  jobs={jobs}
                  company={company}
                  onOpenJob={openJob}
                  onOpenApplicants={openApplicantsKanban}
                  onNewJob={openNewJobForm}
                  jobsLoading={jobsLoading}
                />
              </PersistentTabPanel>
            )}
            {(visitedTabs.has("jobs") || activeTab === "jobs") && (
              <PersistentTabPanel active={activeTab === "jobs"}>
                {viewingJobApplicantsId ? (
                  <JobApplicationsView
                    jobId={viewingJobApplicantsId}
                    jobs={jobs}
                    onBack={() => setViewingJobApplicantsId(null)}
                    onOpenKanban={(jobId) => openApplicantsKanban(jobId)}
                    onOpenCandidateChat={setCandidateChatTarget}
                  />
                ) : (
                  <JobsTab
                    jobs={jobs}
                    selectedJob={selectedJob}
                    onSelect={setSelectedJobId}
                    onNewJob={openNewJobForm}
                    onEditJob={openEditJobForm}
                    onUpdate={updateJob}
                    onRemove={removeJob}
                    onViewApplications={setViewingJobApplicantsId}
                  />
                )}
              </PersistentTabPanel>
            )}
            {(visitedTabs.has("applicants") || activeTab === "applicants") && (
              <PersistentTabPanel active={activeTab === "applicants"}>
                <AllApplicantsKanbanTab
                  jobs={jobs}
                  initialJobId={requestedJobId}
                  initialStage={requestedStage}
                  onJobChange={(jobId) => {
                    const stageParam = requestedStage ? `&stage=${requestedStage}` : "";
                    router.replace(`/employer/dashboard?tab=applicants&job=${jobId}${stageParam}`, { scroll: false });
                  }}
                  onOpenCandidateChat={setCandidateChatTarget}
                  jobsLoading={jobsLoading}
                />
              </PersistentTabPanel>
            )}
            {(visitedTabs.has("analytics") || activeTab === "analytics") && (
              <PersistentTabPanel active={activeTab === "analytics"}>
                <AnalyticsTab jobs={jobs} analytics={analytics} jobsLoading={jobsLoading} />
              </PersistentTabPanel>
            )}
            {(visitedTabs.has("profile") || activeTab === "profile") && (
              <PersistentTabPanel active={activeTab === "profile"}>
                <ProfileTab profile={profile} onChange={handleProfileChange} isLoading={!hydrated} />
              </PersistentTabPanel>
            )}
            {(visitedTabs.has("messages") || activeTab === "messages") && (
              <PersistentTabPanel active={activeTab === "messages"}>
                <MessagesTab
                  role="employer"
                  myDisplayName={company}
                  isDark={true}
                />
              </PersistentTabPanel>
            )}
            {(visitedTabs.has("ranking") || activeTab === "ranking") && (
              <PersistentTabPanel active={activeTab === "ranking"}>
                <RankingTab jobs={jobs} company={company} />
              </PersistentTabPanel>
            )}
            {(visitedTabs.has("verification") || activeTab === "verification") && (
              <PersistentTabPanel active={activeTab === "verification"}>
                <VerificationRequestsTab />
              </PersistentTabPanel>
            )}
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {candidateChatTarget && (
          <EmployerChatDrawer
            key={`${candidateChatTarget.applicationId}-${candidateChatTarget.jobId}`}
            target={candidateChatTarget}
            onClose={() => setCandidateChatTarget(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={closeJobForm}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${surface} w-full max-w-5xl overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {savedJob ? "Job Saved" : editingJob ? "Edit Job" : "Create New Job"}
                  </h3>
                  <p className="text-xs text-white/35">
                    {savedJob ? "Your changes are safely stored" : editingJob ? "Update an existing role for " + company : "Draft or publish a job role for " + company}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeJobForm}
                  disabled={isSavingJob}
                  aria-label="Close job form"
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-white/45 cursor-pointer hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ×
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
                {savedJob ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto flex min-h-[24rem] max-w-xl flex-col items-center justify-center py-8 text-center"
                  >
                    <div className="grid h-20 w-20 place-items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                      <IconCircleCheck size={42} stroke={1.6} />
                    </div>
                    <h4 className="mt-6 text-2xl font-semibold text-white">
                      {jobSaveKind === "updated"
                        ? "Job updated successfully"
                        : savedJob.status === "Draft"
                          ? "Draft saved successfully"
                          : "Job published successfully"}
                    </h4>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-white/45">
                      {savedJob.title} is ready in your job listings. You can review the listing and manage its applications from the Jobs tab.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedJobId(savedJob.id);
                          closeJobForm();
                          changeTab("jobs");
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-900/40 transition-all hover:shadow-orange-800/50"
                      >
                        <IconEye size={16} />
                        View Job
                      </button>
                      {jobSaveKind === "created" ? (
                        <button
                          type="button"
                          onClick={openNewJobForm}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-5 py-2.5 text-sm font-semibold text-white/65 transition-colors hover:bg-white/[0.05] hover:text-white"
                        >
                          <IconPlus size={16} />
                          Create Another
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={closeJobForm}
                          className="rounded-full border border-white/10 bg-white/[0.025] px-5 py-2.5 text-sm font-semibold text-white/65 transition-colors hover:bg-white/[0.05] hover:text-white"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <JobForm
                    defaultCompany={company}
                    initialData={editingJob}
                    onSubmit={saveJob}
                    isSubmitting={isSavingJob}
                    submitError={jobSaveError}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function EmployerDashboard() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#101010] text-white/45">Loading...</div>}>
      <EmployerDashboardContent />
    </Suspense>
  );
}
