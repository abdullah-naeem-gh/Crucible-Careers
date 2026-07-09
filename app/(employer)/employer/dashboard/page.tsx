"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import EmployerSidebar from "@/components/employer/sidebar/EmployerSidebar";
import JobApplicationsView from "@/components/employer/jobs/JobApplicationsView";

// Import modular tab components
import OverviewTab, { EmployerJob, Analytics } from "@/components/employer/dashboard/OverviewTab";
import JobsTab from "@/components/employer/dashboard/JobsTab";
import AnalyticsTab from "@/components/employer/dashboard/AnalyticsTab";
import ProfileTab from "@/components/employer/dashboard/ProfileTab";
import JobForm from "@/components/employer/dashboard/JobForm";
import { getEmployerProfile, saveEmployerProfile } from "@/lib/employer/services/profile.service";
import { CompanyProfile } from "@/types/employer/profile";

type EmployerTab = "overview" | "jobs" | "analytics" | "profile";

const PROFILE_STORAGE_KEY = "recruiter_profile";

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

function EmployerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const onboarded = searchParams.get("onboarded");
  const initialTab: EmployerTab =
    requestedTab === "jobs" || requestedTab === "analytics" || requestedTab === "profile"
      ? (requestedTab as EmployerTab)
      : "overview";

  const [activeTab, setActiveTab] = useState<EmployerTab>(initialTab);
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<EmployerJob | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_PROFILE);
  const [viewingJobApplicantsId, setViewingJobApplicantsId] = useState<string | null>(null);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const company = profile.name || "Your Company";

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
      }
    };
    
    // Fetch profile from API
    const loadProfile = async () => {
      try {
        const dbProfile = await getEmployerProfile();
        if (dbProfile) {
          setProfile(dbProfile);
        } else if (!onboarded) {
          // First visit with no profile → redirect to onboarding
          router.replace("/employer/onboarding");
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

  const saveJob = async (job: Omit<EmployerJob, "id" | "postedAt" | "applications" | "views" | "matchScore">) => {
    try {
      const isEditing = !!editingJob;
      const url = isEditing ? `/api/employer/jobs/${editingJob.id}` : "/api/employer/jobs";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });
      
      if (res.ok) {
        const savedJob = await res.json();
        
        if (isEditing) {
          setJobs((current) => current.map(j => j.id === savedJob.id ? savedJob : j));
        } else {
          setJobs((current) => [savedJob, ...current]);
        }
        
        setSelectedJobId(savedJob.id);
        setIsFormOpen(false);
        setEditingJob(null);
        changeTab("jobs");
      } else {
        console.error("Failed to save job");
      }
    } catch (err) {
      console.error("API error", err);
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
        <div className="mx-auto grid min-h-full max-w-[1720px] grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-7">
          <div className="lg:col-span-3 lg:self-center">
            <EmployerSidebar
              activeTab={activeTab}
              company={company}
              jobCount={analytics.totalJobs}
              applicationCount={analytics.totalApplications}
              onTabChange={changeTab}
              onNewJob={() => { setEditingJob(null); setIsFormOpen(true); }}
            />
          </div>

          <div className="min-h-[70vh] lg:col-span-9 lg:h-[92vh] lg:self-center">
            <AnimatePresence initial={false} mode="wait">
              {activeTab === "overview" && (
                <OverviewTab
                  key="overview"
                  jobs={jobs}
                  analytics={analytics}
                  onOpenJobs={() => changeTab("jobs")}
                  onViewJobApplicants={(jobId) => {
                    setViewingJobApplicantsId(jobId);
                    changeTab("jobs");
                  }}
                  onTabChange={changeTab}
                  onNewJob={() => { setEditingJob(null); setIsFormOpen(true); }}
                />
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
                  <JobsTab
                    key="jobs"
                    jobs={jobs}
                    selectedJob={selectedJob}
                    onSelect={setSelectedJobId}
                    onNewJob={() => { setEditingJob(null); setIsFormOpen(true); }}
                    onEditJob={(job) => { setEditingJob(job); setIsFormOpen(true); }}
                    onUpdate={updateJob}
                    onRemove={removeJob}
                    onViewApplications={setViewingJobApplicantsId}
                  />
                )
              )}
              {activeTab === "analytics" && (
                <AnalyticsTab key="analytics" jobs={jobs} analytics={analytics} />
              )}
              {activeTab === "profile" && (
                <ProfileTab key="profile" profile={profile} onChange={handleProfileChange} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <AnimatePresence initial={false}>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setIsFormOpen(false)}
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
                  <h3 className="text-lg font-semibold text-white">{editingJob ? "Edit Job" : "Create New Job"}</h3>
                  <p className="text-xs text-white/35">{editingJob ? "Update an existing role for TechCorp" : "Draft or publish a job role for TechCorp"}</p>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-white/45 cursor-pointer hover:bg-white/5 hover:text-white">
                  ×
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
                <JobForm defaultCompany={company} initialData={editingJob} onSubmit={saveJob} />
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