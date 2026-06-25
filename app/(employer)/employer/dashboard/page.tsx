"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import EmployerSidebar from "@/components/employer/sidebar/EmployerSidebar";
import {
  IconMapPin,
  IconWorld,
  IconBrandLinkedin,
  IconBrandX,
  IconCalendar,
  IconChevronLeft,
  IconSearch,
  IconMail,
  IconPhone,
  IconBriefcase,
  IconSchool,
  IconBrandGithub,
  IconUsers,
} from "@tabler/icons-react";
import JobApplicationsView from "@/components/employer/jobs/JobApplicationsView";

type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";
type JobStatus = "Active" | "Draft" | "Paused" | "Closed";
type EmployerTab = "overview" | "jobs" | "analytics" | "profile";

// ─── Company Profile Types ───────────────────────────────────────────────────
export interface CompanyProfile {
  name: string;
  tagline: string;
  industry: string;
  companySize: string;
  founded: string;
  website: string;
  headquarters: string;
  overview: string;
  culture: string;
  benefits: string;
  techStack: string;
  linkedin: string;
  twitter: string;
  logoDataUrl: string | null;
}

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

const PROFILE_STORAGE_KEY = "recruiter_profile";

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
  logoDataUrl: null,
};

function EmployerDashboardContent() {
  const company = "TechCorp";
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab: EmployerTab =
    requestedTab === "jobs" || requestedTab === "analytics" || requestedTab === "profile"
      ? (requestedTab as EmployerTab)
      : "overview";

  const [activeTab, setActiveTab] = useState<EmployerTab>(initialTab);
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_PROFILE);
  const [viewingJobApplicantsId, setViewingJobApplicantsId] = useState<string | null>(null);

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
    }

    try {
      const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (savedProfile) setProfile(JSON.parse(savedProfile));
    } catch {
      /* use default */
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }, [hydrated, jobs]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }, [hydrated, profile]);

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
    setViewingJobApplicantsId(null);
    router.replace(
      tab === "overview" ? "/employer/dashboard" : `/employer/dashboard?tab=${tab}`,
      { scroll: false },
    );
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
                viewingJobApplicantsId ? (
                  <JobApplicationsView
                    key="job-applicants"
                    jobId={viewingJobApplicantsId}
                    jobs={jobs}
                    onBack={() => setViewingJobApplicantsId(null)}
                  />
                ) : (
                  <JobsView
                    key="jobs"
                    jobs={jobs}
                    selectedJob={selectedJob}
                    onSelect={setSelectedJobId}
                    onNewJob={() => setIsFormOpen(true)}
                    onUpdate={updateJob}
                    onRemove={removeJob}
                    onViewApplications={setViewingJobApplicantsId}
                  />
                )
              )}
              {activeTab === "analytics" && (
                <AnalyticsView key="analytics" jobs={jobs} analytics={analytics} />
              )}
              {activeTab === "profile" && (
                <ProfileView key="profile" profile={profile} onChange={setProfile} />
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
                <button onClick={() => setIsFormOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-white/45 cursor-pointer hover:bg-white/5 hover:text-white">
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

function JobsView({
  jobs,
  selectedJob,
  onSelect,
  onNewJob,
  onUpdate,
  onRemove,
  onViewApplications,
}: {
  jobs: EmployerJob[];
  selectedJob: EmployerJob | null;
  onSelect: (id: string) => void;
  onNewJob: () => void;
  onUpdate: (id: string, updates: Partial<EmployerJob>) => void;
  onRemove: (id: string) => void;
  onViewApplications: (id: string) => void;
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
            <button onClick={onNewJob} className="rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-4 py-3 text-sm font-medium text-white shadow-[0_8px_20px_rgba(255,107,0,0.18)] cursor-pointer">
              + New Job
            </button>
          </div>
          <div className="mt-3 text-xs text-white/35">{jobs.length} job{jobs.length === 1 ? "" : "s"} posted</div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-auto custom-scrollbar p-5">
          {jobs.map((job) => (
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
            </motion.div>
          ))}
        </div>
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
                <button
                  onClick={() => onUpdate(selectedJob.id, { status: selectedJob.status === "Active" ? "Paused" : "Active" })}
                  className="rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-white/55 cursor-pointer hover:bg-white/[0.05] hover:text-white"
                >
                  {selectedJob.status === "Active" ? "Pause" : "Activate"}
                </button>
                <button onClick={() => onRemove(selectedJob.id)} className="rounded-lg border border-red-500/15 bg-red-500/[0.07] px-3 py-2 text-xs text-red-300 cursor-pointer hover:bg-red-500/10">
                  Delete
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

// ─── Profile View ────────────────────────────────────────────────────────────

const INDUSTRY_OPTIONS = [
  "Software & Technology",
  "Fintech",
  "Healthcare & Biotech",
  "E-Commerce & Retail",
  "Media & Entertainment",
  "Education & EdTech",
  "Gaming",
  "Consulting & Services",
  "Manufacturing",
  "Other",
];

const SIZE_OPTIONS = [
  "1–10 employees",
  "11–50 employees",
  "51–200 employees",
  "201–500 employees",
  "501–1 000 employees",
  "1 000+ employees",
];

function ProfileView({
  profile,
  onChange,
}: {
  profile: CompanyProfile;
  onChange: (updated: CompanyProfile) => void;
}) {
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formState, setFormState] = useState<CompanyProfile>(profile);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setFormState(profile);
  }, [profile]);

  const set = <K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) =>
    setFormState((prev) => ({ ...prev, [key]: value }));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("logoDataUrl", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onChange(formState);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const fieldClass =
    "w-full rounded-xl border border-white/[0.08] bg-[#121212] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-orange-500/45 focus:ring-2 focus:ring-orange-500/10";
  const labelClass = "mb-1.5 block text-xs font-medium text-white/50";

  return (
    <ViewMotion className="grid h-full grid-cols-1 gap-5 lg:grid-cols-9 lg:gap-7">
      {/* ── Left: editor ── */}
      <section className={`${surface} flex flex-col overflow-hidden lg:col-span-5`}>
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#FF914D]">Company Profile</p>
            <h1 className="mt-1 text-2xl font-semibold">Build your profile</h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSave}
            className="rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-4 py-2 text-sm font-medium text-white shadow-[0_8px_20px_rgba(255,107,0,0.18)] cursor-pointer"
          >
            {saved ? "✓ Saved" : "Save"}
          </motion.button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto custom-scrollbar p-5">
          {/* Profile Photo upload */}
          <div className="mb-6">
            <p className={labelClass}>Profile Photo</p>
            <div className="flex items-center gap-4">
              <div
                className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                {formState.logoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formState.logoDataUrl}
                    alt="Profile photo"
                    className="h-full w-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-200"
                    onClick={() => setIsLightboxOpen(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2 text-white/20 select-none">
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-white/55 cursor-pointer hover:bg-white/[0.05] hover:text-white"
                >
                  {formState.logoDataUrl ? "Change Photo" : "Upload Photo"}
                </button>
                {formState.logoDataUrl && (
                  <button
                    type="button"
                    onClick={() => set("logoDataUrl", null)}
                    className="ml-2 rounded-lg border border-red-500/15 bg-red-500/[0.07] px-3 py-2 text-xs text-red-300 cursor-pointer hover:bg-red-500/10"
                  >
                    Remove
                  </button>
                )}
                <p className="mt-1.5 text-[11px] text-white/30">PNG, JPG or SVG · max 2 MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Company name */}
            <div className="sm:col-span-2">
              <label className={labelClass}>Company name</label>
              <input
                value={formState.name}
                onChange={(e) => set("name", e.target.value)}
                className={fieldClass}
                placeholder="e.g., TechCorp"
              />
            </div>

            {/* Tagline */}
            <div className="sm:col-span-2">
              <label className={labelClass}>Tagline</label>
              <input
                value={formState.tagline}
                onChange={(e) => set("tagline", e.target.value)}
                className={fieldClass}
                placeholder="A short sentence that captures your mission"
              />
            </div>

            {/* Industry */}
            <div>
              <label className={labelClass}>Industry</label>
              <select
                value={formState.industry}
                onChange={(e) => set("industry", e.target.value)}
                className={`${fieldClass} cursor-pointer`}
              >
                {INDUSTRY_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Company size */}
            <div>
              <label className={labelClass}>Company size</label>
              <select
                value={formState.companySize}
                onChange={(e) => set("companySize", e.target.value)}
                className={`${fieldClass} cursor-pointer`}
              >
                {SIZE_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Founded */}
            <div>
              <label className={labelClass}>Founded</label>
              <input
                value={formState.founded}
                onChange={(e) => set("founded", e.target.value)}
                className={fieldClass}
                placeholder="2018"
              />
            </div>

            {/* Headquarters */}
            <div>
              <label className={labelClass}>Headquarters</label>
              <input
                value={formState.headquarters}
                onChange={(e) => set("headquarters", e.target.value)}
                className={fieldClass}
                placeholder="San Francisco, CA"
              />
            </div>

            {/* Website */}
            <div className="sm:col-span-2">
              <label className={labelClass}>Website</label>
              <input
                value={formState.website}
                onChange={(e) => set("website", e.target.value)}
                className={fieldClass}
                placeholder="https://yourcompany.com"
              />
            </div>

            {/* Overview */}
            <div className="sm:col-span-2">
              <label className={labelClass}>Company overview</label>
              <textarea
                value={formState.overview}
                onChange={(e) => set("overview", e.target.value)}
                rows={3}
                className={fieldClass}
                placeholder="What does your company do? What problems do you solve?"
              />
            </div>

            {/* Culture */}
            <div className="sm:col-span-2">
              <label className={labelClass}>Culture & values</label>
              <textarea
                value={formState.culture}
                onChange={(e) => set("culture", e.target.value)}
                rows={3}
                className={fieldClass}
                placeholder="Describe your team culture, values, and how you work"
              />
            </div>

            {/* Benefits */}
            <div className="sm:col-span-2">
              <label className={labelClass}>Perks & benefits</label>
              <textarea
                value={formState.benefits}
                onChange={(e) => set("benefits", e.target.value)}
                rows={2}
                className={fieldClass}
                placeholder="Health insurance, remote work, equity, …"
              />
            </div>

            {/* Tech stack */}
            <div className="sm:col-span-2">
              <label className={labelClass}>Tech stack (comma separated)</label>
              <input
                value={formState.techStack}
                onChange={(e) => set("techStack", e.target.value)}
                className={fieldClass}
                placeholder="React, Node.js, PostgreSQL, …"
              />
            </div>

            {/* Social links */}
            <div>
              <label className={labelClass}>LinkedIn URL</label>
              <input
                value={formState.linkedin}
                onChange={(e) => set("linkedin", e.target.value)}
                className={fieldClass}
                placeholder="https://linkedin.com/company/…"
              />
            </div>
            <div>
              <label className={labelClass}>Twitter / X URL</label>
              <input
                value={formState.twitter}
                onChange={(e) => set("twitter", e.target.value)}
                className={fieldClass}
                placeholder="https://twitter.com/…"
              />
            </div>
          </div>

          <p className="mt-6 text-[11px] text-white/25">
            {/* TODO: Wire up public profile page so job seekers can view this profile at /company/[slug] */}
            Public visibility coming soon — your profile will be viewable by job seekers once published.
          </p>
        </div>
      </section>

      {/* ── Right: live preview ── */}
      <section className={`${surface} overflow-auto custom-scrollbar p-5 lg:col-span-4`}>
        <p className="mb-4 text-xs uppercase tracking-[0.18em] text-white/30">Live preview</p>
        <ProfilePreview profile={profile} />
      </section>

      {/* Lightbox modal for enlarged profile photo */}
      <AnimatePresence>
        {isLightboxOpen && formState.logoDataUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={() => setIsLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-h-[85vh] max-w-[85vw] overflow-hidden rounded-2xl border border-white/10 bg-[#121212] p-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formState.logoDataUrl}
                alt="Enlarged profile photo"
                className="max-h-[80vh] max-w-[80vw] object-contain rounded-lg"
              />
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white/80 cursor-pointer hover:bg-black hover:text-white"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ViewMotion>
  );
}

function ProfilePreview({ profile }: { profile: CompanyProfile }) {
  const techTags = profile.techStack
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const benefits = profile.benefits
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <motion.div
      key={JSON.stringify(profile)}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Header card */}
      <div className={`${insetSurface} p-4`}>
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#FF6B00]/20 to-[#FF914D]/10">
            {profile.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.logoDataUrl} alt="logo" className="h-full w-full object-cover" />
            ) : (
              <span className="absolute inset-0 grid place-items-center text-xl font-bold text-[#FF914D]">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold leading-tight">
              {profile.name || <span className="text-white/25">Company name</span>}
            </h2>
            <p className="mt-0.5 text-sm text-white/45">
              {profile.tagline || <span className="italic text-white/20">Tagline…</span>}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {profile.industry && (
                <InfoChip>{profile.industry}</InfoChip>
              )}
              {profile.companySize && (
                <InfoChip>{profile.companySize}</InfoChip>
              )}
              {profile.founded && (
                <InfoChip>Est. {profile.founded}</InfoChip>
              )}
            </div>
          </div>
        </div>

        {/* Quick facts row */}
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3.5 border-t border-white/[0.06] pt-4">
          <QuickFact icon={<IconMapPin size={16} className="text-white/40" />} label="HQ" value={profile.headquarters || "—"} />
          <QuickFact
            icon={<IconWorld size={16} className="text-white/40" />}
            label="Website"
            value={
              profile.website
                ? profile.website.replace(/^https?:\/\//, "")
                : "—"
            }
          />
          {profile.linkedin && (
            <QuickFact icon={<IconBrandLinkedin size={16} className="text-white/40" />} label="LinkedIn" value="View profile" />
          )}
          {profile.twitter && (
            <QuickFact icon={<IconBrandX size={16} className="text-white/40" />} label="Twitter" value="View profile" />
          )}
        </div>
      </div>

      {/* Overview */}
      {profile.overview && (
        <PreviewSection title="About us">
          <p className="text-sm leading-relaxed text-white/55">{profile.overview}</p>
        </PreviewSection>
      )}

      {/* Culture */}
      {profile.culture && (
        <PreviewSection title="Culture & values">
          <p className="text-sm leading-relaxed text-white/55">{profile.culture}</p>
        </PreviewSection>
      )}

      {/* Benefits */}
      {benefits.length > 0 && (
        <PreviewSection title="Perks & benefits">
          <div className="flex flex-wrap gap-2">
            {benefits.map((b) => (
              <span
                key={b}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.07] px-2.5 py-1 text-xs text-emerald-300"
              >
                <span className="text-[10px]">✓</span> {b}
              </span>
            ))}
          </div>
        </PreviewSection>
      )}

      {/* Tech stack */}
      {techTags.length > 0 && (
        <PreviewSection title="Tech stack">
          <div className="flex flex-wrap gap-1.5">
            {techTags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-xs text-white/50"
              >
                {tag}
              </span>
            ))}
          </div>
        </PreviewSection>
      )}

      {/* Placeholder CTA — public page */}
      <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/[0.07] to-transparent p-4">
        <p className="text-xs font-medium text-[#FF914D]">Public profile</p>
        <p className="mt-1 text-xs leading-relaxed text-white/35">
          {/* TODO: Replace with real URL once /company/[slug] route is implemented */}
          This is a preview of how job seekers will see your company profile.
        </p>
      </div>
    </motion.div>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={`${insetSurface} p-4`}>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">{title}</h3>
      {children}
    </div>
  );
}

function InfoChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/40">
      {children}
    </span>
  );
}

function QuickFact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-7 w-5 items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-white/35">{label}</div>
        <div className="truncate text-xs font-medium text-white/60">{value}</div>
      </div>
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
        <select value={type} onChange={(event) => setType(event.target.value as JobType)} className={`${fieldClass} cursor-pointer`}>
          {(["Full-time", "Part-time", "Contract", "Internship"] as JobType[]).map((item) => <option key={item}>{item}</option>)}
        </select>
      </FormField>
      <FormField label="Status">
        <select value={status} onChange={(event) => setStatus(event.target.value as JobStatus)} className={`${fieldClass} cursor-pointer`}>
          {(["Draft", "Active", "Paused", "Closed"] as JobStatus[]).map((item) => <option key={item}>{item}</option>)}
        </select>
      </FormField>
      <FormField label="Currency">
        <select value={currency} onChange={(event) => setCurrency(event.target.value)} className={`${fieldClass} cursor-pointer`}>
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
        <button type="button" onClick={reset} className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-sm text-white/55 cursor-pointer hover:bg-white/[0.05] hover:text-white">Reset</button>
        <button type="submit" className="rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-5 py-2.5 text-sm font-medium text-white cursor-pointer">
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