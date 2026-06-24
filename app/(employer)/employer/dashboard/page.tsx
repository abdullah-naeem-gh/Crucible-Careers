"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import EmployerSidebar from "@/components/employer/sidebar/EmployerSidebar";

type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";
type JobStatus = "Active" | "Draft" | "Paused" | "Closed";
type EmployerTab = "overview" | "jobs" | "analytics";

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

const STORAGE_KEY = "recruiter_jobs";

const DEMO_JOBS: EmployerJob[] = [
  {
    id: "1",
    title: "AI Engineer",
    company: "Vyro",
    location: "Karachi, Pakistan",
    type: "Full-time",
    status: "Active",
    salary: "PKR 250k - 350k",
    tags: ["Python", "Machine Learning", "TensorFlow", "PyTorch", "NLP"],
    postedAt: "1 day ago",
    description: "Join Vyro's AI team to build cutting-edge machine learning solutions and drive innovation in artificial intelligence.",
    responsibilities: [
      "Develop and deploy machine learning models",
      "Implement AI algorithms and neural networks",
      "Optimize model performance and accuracy",
      "Collaborate with data scientists and engineers",
      "Research and implement latest AI technologies",
    ],
    requirements: [
      "3+ years of experience in AI/ML development",
      "Strong Python programming skills",
      "Experience with TensorFlow, PyTorch, or similar frameworks",
      "Knowledge of deep learning and neural networks",
      "Experience with NLP and computer vision",
      "Strong mathematical and statistical background",
    ],
    applications: 18,
    views: 89,
    matchScore: 92,
  },
  {
    id: "2",
    title: "Senior Frontend Engineer",
    company: "TechCorp",
    location: "Remote",
    type: "Full-time",
    status: "Active",
    salary: "USD 120k - 150k",
    tags: ["React", "TypeScript", "Node.js", "AWS"],
    postedAt: "2 days ago",
    description: "We are looking for a Senior Frontend Engineer to join our growing team and help build amazing user experiences.",
    responsibilities: [
      "Lead frontend development initiatives",
      "Mentor junior developers",
      "Architect scalable solutions",
      "Collaborate with design and product teams",
    ],
    requirements: [
      "5+ years of React experience",
      "Strong TypeScript skills",
      "Experience with modern build tools",
      "Excellent communication skills",
    ],
    applications: 24,
    views: 156,
    matchScore: 85,
  },
  {
    id: "3",
    title: "Product Manager",
    company: "TechCorp",
    location: "San Francisco, CA",
    type: "Full-time",
    status: "Active",
    salary: "USD 130k - 160k",
    tags: ["Product Management", "Agile", "Analytics", "B2B"],
    postedAt: "1 week ago",
    description: "Join our product team to drive innovation and deliver exceptional user experiences.",
    responsibilities: [
      "Define product strategy and roadmap",
      "Work with engineering and design teams",
      "Analyze user feedback and metrics",
      "Drive product launches",
    ],
    requirements: [
      "3+ years of product management experience",
      "Experience with B2B SaaS products",
      "Strong analytical skills",
      "Excellent stakeholder management",
    ],
    applications: 18,
    views: 89,
    matchScore: 72,
  },
  {
    id: "4",
    title: "DevOps Engineer",
    company: "TechCorp",
    location: "Remote",
    type: "Contract",
    status: "Draft",
    salary: "USD 100k - 130k",
    tags: ["Docker", "Kubernetes", "AWS", "CI/CD"],
    postedAt: "Draft",
    description: "Help us build and maintain our cloud infrastructure and deployment pipelines.",
    responsibilities: [
      "Manage cloud infrastructure",
      "Implement CI/CD pipelines",
      "Monitor system performance",
      "Ensure security best practices",
    ],
    requirements: [
      "3+ years of DevOps experience",
      "Strong AWS knowledge",
      "Experience with Docker and Kubernetes",
      "Scripting skills (Python/Bash)",
    ],
    applications: 0,
    views: 0,
    matchScore: 0,
  },
];

const surface = "rounded-[24px] border border-white/[0.07] bg-[#171717] shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)]";
const insetSurface = "rounded-2xl border border-white/[0.065] bg-[#141414] shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2),inset_-1px_-1px_3px_rgba(255,255,255,0.025)]";

export default function EmployerDashboard() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#101010] text-white/45">Loading...</div>}>
      <EmployerDashboardContent />
    </Suspense>
  );
}

function EmployerDashboardContent() {
  const company = "TechCorp";
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab: EmployerTab = requestedTab === "jobs" || requestedTab === "analytics" ? requestedTab : "overview";

  const [activeTab, setActiveTab] = useState<EmployerTab>(initialTab);
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      const initialJobs = Array.isArray(parsed) && parsed.length ? parsed : DEMO_JOBS;
      setJobs(initialJobs);
      setSelectedJobId(initialJobs[0]?.id ?? null);
    } catch {
      setJobs(DEMO_JOBS);
      setSelectedJobId(DEMO_JOBS[0].id);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }, [hydrated, jobs]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && jobs.some((job) => job.id === hash)) {
      setSelectedJobId(hash);
      setActiveTab("jobs");
    }
  }, [jobs]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFormOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
    setActiveTab(tab);
    router.replace(tab === "overview" ? "/employer/dashboard" : `/employer/dashboard?tab=${tab}`, { scroll: false });
  };

  const addJob = (job: Omit<EmployerJob, "id" | "postedAt" | "applications" | "views" | "matchScore">) => {
    const newJob: EmployerJob = {
      ...job,
      id: String(Date.now()),
      postedAt: "Just now",
      applications: 0,
      views: 0,
      matchScore: 0,
    };
    setJobs((current) => [newJob, ...current]);
    setSelectedJobId(newJob.id);
    setIsFormOpen(false);
    changeTab("jobs");
  };

  const updateJob = (id: string, updates: Partial<EmployerJob>) => {
    setJobs((current) => current.map((job) => (job.id === id ? { ...job, ...updates } : job)));
  };

  const removeJob = (id: string) => {
    setJobs((current) => current.filter((job) => job.id !== id));
    if (selectedJobId === id) setSelectedJobId(null);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#101010] text-white">
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

      <section className="relative z-10 min-h-screen px-4 py-5 sm:px-6 lg:h-screen lg:py-0">
        <div className="mx-auto grid min-h-full max-w-[1500px] grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-7">
          <div className="lg:col-span-3 lg:self-center">
            <EmployerSidebar
              activeTab={activeTab}
              company={company}
              jobCount={analytics.totalJobs}
              applicationCount={analytics.totalApplications}
              onTabChange={changeTab}
              onNewJob={() => setIsFormOpen(true)}
            />
          </div>

          <div className="min-h-[70vh] lg:col-span-9 lg:h-[92vh] lg:self-center">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <OverviewView key="overview" jobs={jobs} analytics={analytics} onOpenJobs={() => changeTab("jobs")} />
              )}
              {activeTab === "jobs" && (
                <JobsView
                  key="jobs"
                  jobs={jobs}
                  selectedJob={selectedJob}
                  onSelect={setSelectedJobId}
                  onNewJob={() => setIsFormOpen(true)}
                  onUpdate={updateJob}
                  onRemove={removeJob}
                />
              )}
              {activeTab === "analytics" && (
                <AnalyticsView key="analytics" jobs={jobs} analytics={analytics} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-4 backdrop-blur-md"
            onClick={() => setIsFormOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              className={`${surface} mx-auto my-6 w-full max-w-4xl overflow-hidden`}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
                <div>
                  <h3 className="text-lg font-semibold">Create New Job</h3>
                  <p className="mt-1 text-xs text-white/35">Add the role details and choose whether to publish or save a draft.</p>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-white/45 hover:bg-white/5 hover:text-white">
                  ×
                </button>
              </div>
              <div className="p-6">
                <JobForm defaultCompany={company} onSubmit={addJob} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

interface Analytics {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalViews: number;
  avgApplications: number;
  avgViews: number;
}

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

function OverviewView({ jobs, analytics, onOpenJobs }: { jobs: EmployerJob[]; analytics: Analytics; onOpenJobs: () => void }) {
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
          <button onClick={onOpenJobs} className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-white/60 transition hover:bg-white/[0.06] hover:text-white">
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

      <section className={`${surface} overflow-auto p-5 lg:col-span-4`}>
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
              whileHover={{ y: -2 }}
              className={`${insetSurface} w-full p-4 text-left transition hover:border-orange-500/25`}
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

function JobsView({
  jobs,
  selectedJob,
  onSelect,
  onNewJob,
  onUpdate,
  onRemove,
}: {
  jobs: EmployerJob[];
  selectedJob: EmployerJob | null;
  onSelect: (id: string) => void;
  onNewJob: () => void;
  onUpdate: (id: string, updates: Partial<EmployerJob>) => void;
  onRemove: (id: string) => void;
}) {
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
            <button onClick={onNewJob} className="rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-4 py-3 text-sm font-medium text-white shadow-[0_8px_20px_rgba(255,107,0,0.18)]">
              + New Job
            </button>
          </div>
          <div className="mt-3 text-xs text-white/35">{jobs.length} job{jobs.length === 1 ? "" : "s"} posted</div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-auto p-5">
          {jobs.map((job) => (
            <motion.button
              key={job.id}
              type="button"
              onClick={() => onSelect(job.id)}
              whileHover={{ y: -2 }}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                selectedJob?.id === job.id
                  ? "border-orange-500/50 bg-orange-500/[0.055] shadow-[0_0_0_2px_rgba(255,107,0,0.1),8px_8px_18px_rgba(0,0,0,0.22)]"
                  : "border-white/[0.065] bg-[#141414] shadow-[6px_6px_16px_rgba(0,0,0,0.24),-3px_-3px_10px_rgba(255,255,255,0.018)] hover:border-white/10"
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
                <span className="text-[#FF914D]">{job.applications} applications</span>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <section className={`${surface} min-h-[38rem] overflow-auto p-6 lg:col-span-4 lg:min-h-0`}>
        {!selectedJob ? (
          <div className="grid h-full place-items-center text-center">
            <div>
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-orange-500/10 text-[#FF914D]">◎</div>
              <h2 className="font-semibold">Select a job to view details</h2>
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
                <button
                  onClick={() => onUpdate(selectedJob.id, { status: selectedJob.status === "Active" ? "Paused" : "Active" })}
                  className="rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-white/55 hover:bg-white/[0.05] hover:text-white"
                >
                  {selectedJob.status === "Active" ? "Pause" : "Activate"}
                </button>
                <button onClick={() => onRemove(selectedJob.id)} className="rounded-lg border border-red-500/15 bg-red-500/[0.07] px-3 py-2 text-xs text-red-300 hover:bg-red-500/10">
                  Delete
                </button>
              </div>
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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <DetailList title="Responsibilities" items={selectedJob.responsibilities} />
              <DetailList title="Requirements" items={selectedJob.requirements} />
            </div>
          </motion.div>
        )}
      </section>
    </ViewMotion>
  );
}

function AnalyticsView({ jobs, analytics }: { jobs: EmployerJob[]; analytics: Analytics }) {
  return (
    <ViewMotion className="grid h-full grid-cols-1 gap-5 lg:grid-cols-9 lg:gap-7">
      <section className={`${surface} overflow-auto p-6 lg:col-span-5`}>
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

      <section className={`${surface} overflow-auto p-6 lg:col-span-4`}>
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

function StatusBadge({ status }: { status: JobStatus }) {
  const styles = {
    Active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    Draft: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    Paused: "border-orange-500/20 bg-orange-500/10 text-orange-300",
    Closed: "border-red-500/20 bg-red-500/10 text-red-300",
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] ${styles[status]}`}>{status}</span>;
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

function AnalyticsRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.055] pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-white/45">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

interface JobFormProps {
  defaultCompany: string;
  onSubmit: (job: Omit<EmployerJob, "id" | "postedAt" | "applications" | "views" | "matchScore">) => void;
}

function JobForm({ defaultCompany, onSubmit }: JobFormProps) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState(defaultCompany);
  const [location, setLocation] = useState("Remote");
  const [type, setType] = useState<JobType>("Full-time");
  const [status, setStatus] = useState<JobStatus>("Draft");
  const [currency, setCurrency] = useState("PKR");
  const [salary, setSalary] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requirements, setRequirements] = useState("");

  const fieldClass = "w-full rounded-xl border border-white/[0.08] bg-[#121212] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-orange-500/45 focus:ring-2 focus:ring-orange-500/10";
  const labelClass = "mb-1.5 block text-xs font-medium text-white/50";

  const reset = () => {
    setTitle("");
    setCompany(defaultCompany);
    setLocation("Remote");
    setType("Full-time");
    setStatus("Draft");
    setCurrency("PKR");
    setSalary("");
    setTags("");
    setDescription("");
    setResponsibilities("");
    setRequirements("");
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          title,
          company,
          location,
          type,
          status,
          salary: `${currency} ${salary}`,
          tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          description,
          responsibilities: responsibilities.split("\n").map((item) => item.trim()).filter(Boolean),
          requirements: requirements.split("\n").map((item) => item.trim()).filter(Boolean),
        });
        reset();
      }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <label className={labelClass}>Job title</label>
        <input required value={title} onChange={(event) => setTitle(event.target.value)} className={fieldClass} placeholder="e.g., Senior Frontend Engineer" />
      </div>
      <FormField label="Company"><input value={company} onChange={(event) => setCompany(event.target.value)} className={fieldClass} /></FormField>
      <FormField label="Location"><input value={location} onChange={(event) => setLocation(event.target.value)} className={fieldClass} placeholder="Remote / City, Country" /></FormField>
      <FormField label="Type">
        <select value={type} onChange={(event) => setType(event.target.value as JobType)} className={fieldClass}>
          {(["Full-time", "Part-time", "Contract", "Internship"] as JobType[]).map((item) => <option key={item}>{item}</option>)}
        </select>
      </FormField>
      <FormField label="Status">
        <select value={status} onChange={(event) => setStatus(event.target.value as JobStatus)} className={fieldClass}>
          {(["Draft", "Active", "Paused", "Closed"] as JobStatus[]).map((item) => <option key={item}>{item}</option>)}
        </select>
      </FormField>
      <FormField label="Currency">
        <select value={currency} onChange={(event) => setCurrency(event.target.value)} className={fieldClass}>
          {["USD", "EUR", "GBP", "PKR", "CAD", "AUD"].map((item) => <option key={item}>{item}</option>)}
        </select>
      </FormField>
      <FormField label="Salary"><input value={salary} onChange={(event) => setSalary(event.target.value)} className={fieldClass} placeholder="120k - 150k" /></FormField>
      <div className="sm:col-span-2">
        <label className={labelClass}>Tags (comma separated)</label>
        <input value={tags} onChange={(event) => setTags(event.target.value)} className={fieldClass} placeholder="React, TypeScript, Node.js" />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>Short description</label>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} className={fieldClass} placeholder="What makes this role exciting?" />
      </div>
      <FormField label="Responsibilities (one per line)">
        <textarea value={responsibilities} onChange={(event) => setResponsibilities(event.target.value)} rows={4} className={fieldClass} />
      </FormField>
      <FormField label="Requirements (one per line)">
        <textarea value={requirements} onChange={(event) => setRequirements(event.target.value)} rows={4} className={fieldClass} />
      </FormField>
      <div className="flex justify-end gap-3 sm:col-span-2">
        <button type="button" onClick={reset} className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-sm text-white/55 hover:bg-white/[0.05] hover:text-white">Reset</button>
        <button type="submit" className="rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-5 py-2.5 text-sm font-medium text-white">
          {status === "Draft" ? "Save Draft" : "Publish Job"}
        </button>
      </div>
    </form>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-white/50">{label}</label>
      {children}
    </div>
  );
}
