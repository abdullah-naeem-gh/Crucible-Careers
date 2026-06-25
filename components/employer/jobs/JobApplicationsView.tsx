"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconMapPin,
  IconCalendar,
  IconChevronLeft,
  IconSearch,
  IconMail,
  IconPhone,
  IconBriefcase,
  IconSchool,
  IconBrandLinkedin,
  IconBrandGithub,
  IconWorld,
  IconUsers,
} from "@tabler/icons-react";
import { EmployerJob } from "@/app/(employer)/employer/dashboard/page";

interface CandidateProfile {
  id: string;
  name: string;
  title: string;
  location: string;
  appliedDate: string;
  email: string;
  phone: string;
  bio: string;
  experienceYears: number;
  skills: string[];
  education: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

const surface = "rounded-[24px] border border-white/[0.07] bg-[#171717] shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)]";
const insetSurface = "rounded-2xl border border-white/[0.065] bg-[#141414] shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2),inset_-1px_-1px_3px_rgba(255,255,255,0.025)]";

// Master mock candidate bank
const MOCK_CANDIDATES_BANK: Record<string, Omit<CandidateProfile, "appliedDate">[]> = {
  // AI Engineer candidates
  "AI Engineer": [
    {
      id: "c1",
      name: "Matthew Brown",
      title: "AI Researcher & Engineer",
      location: "New York, NY",
      email: "matthew.brown@ai-labs.io",
      phone: "+1 (555) 234-5678",
      bio: "Passionate AI engineer specializing in building, training, and deploying large language models and NLP pipelines. Deep experience in Python, PyTorch, and transformer architectures. Love working at the intersection of product and ML research.",
      experienceYears: 4,
      skills: ["Python", "PyTorch", "NLP", "Machine Learning", "Transformers", "Docker"],
      education: "M.S. in Artificial Intelligence, Columbia University",
      linkedin: "linkedin.com/in/matthew-brown-ai",
      github: "github.com/mbrown-ai",
      portfolio: "mbrown.ai"
    },
    {
      id: "c2",
      name: "Melissa Salazar",
      title: "Machine Learning Engineer",
      location: "San Francisco, CA",
      email: "melissa.salazar@techcorp.com",
      phone: "+1 (555) 987-6543",
      bio: "ML Engineer with a focus on computer vision and neural network optimization. Proficient in TensorFlow, Python, and cloud deployments. Committed to clean code and scalable model pipelines.",
      experienceYears: 3,
      skills: ["Python", "TensorFlow", "Computer Vision", "Machine Learning", "AWS", "SQL"],
      education: "B.S. in Computer Science, UC Berkeley",
      linkedin: "linkedin.com/in/melissa-salazar",
      github: "github.com/msalazar"
    },
    {
      id: "c3",
      name: "Emily Morgan",
      title: "Senior AI Engineer",
      location: "London, UK",
      email: "emily.morgan@quant.ai",
      phone: "+44 20 7946 0958",
      bio: "Over 6 years of experience developing deep learning architectures and deploying ML models at scale. Experienced team leader and tech strategist. Focus on NLP and generative AI systems.",
      experienceYears: 6,
      skills: ["Python", "PyTorch", "NLP", "Machine Learning", "TensorFlow", "Kubernetes", "Generative AI"],
      education: "Ph.D. in Computer Science (Deep Learning focus), University of Oxford",
      linkedin: "linkedin.com/in/emily-morgan-ai",
      github: "github.com/emily-m-ai",
      portfolio: "emilymorgan.dev"
    },
    {
      id: "c4",
      name: "Paul Rodgers",
      title: "Junior Data Scientist",
      location: "Boston, MA",
      email: "paul.rodgers@data-science.net",
      phone: "+1 (555) 456-7890",
      bio: "Recent graduate passionate about data science, regression models, and exploratory data analysis. Solid foundation in Python, NumPy, and statistics. Eager to learn and grow in an AI engineering role.",
      experienceYears: 1,
      skills: ["Python", "Machine Learning", "Data Analysis", "SQL", "Git"],
      education: "B.S. in Statistics, Boston University",
      github: "github.com/prodgers-data"
    }
  ],
  // Senior Frontend Engineer candidates
  "Senior Frontend Engineer": [
    {
      id: "c5",
      name: "Sarah Jenkins",
      title: "Senior Frontend Engineer",
      location: "Austin, TX",
      email: "sarah.jenkins@webdev.co",
      phone: "+1 (555) 789-0123",
      bio: "Frontend Specialist with 7+ years of experience crafting pixel-perfect, highly accessible user interfaces. Expert in React, TypeScript, Next.js, and CSS performance optimization. Devoted to design systems and user-centric workflows.",
      experienceYears: 7,
      skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL", "Web Accessibility", "Sass"],
      education: "B.F.A. in Interaction Design, UT Austin",
      linkedin: "linkedin.com/in/sarah-jenkins-dev",
      github: "github.com/sjenk-dev",
      portfolio: "sarahj.dev"
    },
    {
      id: "c6",
      name: "Alex Rivera",
      title: "Frontend Engineer",
      location: "Miami, FL",
      email: "alex.rivera@coders.io",
      phone: "+1 (555) 890-1234",
      bio: "TypeScript enthusiast and React developer. 4 years of professional experience building SaaS frontends. Skilled in state management, testing, and modern build tooling.",
      experienceYears: 4,
      skills: ["React", "TypeScript", "Node.js", "Zustand", "Webpack", "Tailwind CSS"],
      education: "B.S. in Software Engineering, FIU",
      linkedin: "linkedin.com/in/alex-rivera-code",
      github: "github.com/arivera"
    },
    {
      id: "c7",
      name: "David Chen",
      title: "Full Stack Developer",
      location: "Seattle, WA",
      email: "david.chen@stack.net",
      phone: "+1 (555) 345-6789",
      bio: "Full stack engineer with a strong frontend leaning. 5 years of experience deploying React apps on AWS and integrating REST/GraphQL APIs with Node.js backends. Passionate about serverless architectures.",
      experienceYears: 5,
      skills: ["React", "TypeScript", "Node.js", "AWS", "Docker", "PostgreSQL", "Next.js"],
      education: "B.S. in Computer Science, University of Washington",
      linkedin: "linkedin.com/in/davidchen-dev",
      github: "github.com/dchen-stack"
    }
  ],
  // Product Manager candidates
  "Product Manager": [
    {
      id: "c8",
      name: "James Patel",
      title: "Product Manager",
      location: "San Francisco, CA",
      email: "james.patel@productlabs.io",
      phone: "+1 (555) 567-8901",
      bio: "Product leader with 4 years of experience driving roadmap execution for B2B SaaS platforms. Data-driven decision maker skilled in product analytics, user research, agile methodologies, and cross-functional alignment.",
      experienceYears: 4,
      skills: ["Product Management", "Agile", "Analytics", "Mixpanel", "Jira", "SQL", "B2B"],
      education: "B.A. in Economics & Cognitive Science, UC Berkeley",
      linkedin: "linkedin.com/in/james-patel-pm"
    },
    {
      id: "c9",
      name: "Karen White",
      title: "Technical Product Manager",
      location: "Seattle, WA",
      email: "karen.white@techpm.com",
      phone: "+1 (555) 678-9012",
      bio: "Former software engineer turned Product Manager. Specializes in cloud developer tools, API platforms, and backend services. Bridge the gap between engineering complexity and user value.",
      experienceYears: 5,
      skills: ["Product Management", "Agile", "API Design", "Cloud Infrastructure", "Analytics", "System Design"],
      education: "B.S. in Computer Science, Georgia Tech",
      linkedin: "linkedin.com/in/karen-white-techpm",
      github: "github.com/kwhite-dev"
    }
  ]
};

function calculateAtsScore(candidateSkills: string[], jobTags: string[]): number {
  if (!jobTags.length) return 75;
  const matches = candidateSkills.filter(s =>
    jobTags.some(t => t.toLowerCase() === s.toLowerCase())
  ).length;
  const percentage = Math.round((matches / Math.max(jobTags.length, 1)) * 100);
  // Scale between 60% and 97% based on alignment
  return Math.min(Math.max(60 + Math.round(percentage * 0.38), 65), 97);
}

function getJobApplicants(job: EmployerJob): CandidateProfile[] {
  // If we have hardcoded candidates for this specific title
  const candidatesForTitle = MOCK_CANDIDATES_BANK[job.title];
  if (candidatesForTitle) {
    return candidatesForTitle.map((c, index) => ({
      ...c,
      appliedDate: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }));
  }

  // Fallback: generate dynamic candidates based on the job requirements/tags
  const names = [
    { name: "Sarah Jenkins", title: `Lead ${job.title}`, location: "Austin, TX" },
    { name: "Marcus Johnson", title: job.title, location: job.location === "Remote" ? "Chicago, IL" : job.location },
    { name: "Elena Rostova", title: `Junior ${job.title}`, location: "Remote" }
  ];

  return names.map((gn, index) => {
    // Distribute matching skills
    const matchingSkills = job.tags.slice(0, index === 0 ? 4 : index === 1 ? 2 : 1);
    const genericSkills = ["Git", "GitHub", "REST APIs", "Agile", "Communication"];
    const allSkills = [...new Set([...matchingSkills, ...genericSkills])];

    return {
      id: `gen-${job.id}-${index}`,
      name: gn.name,
      title: gn.title,
      location: gn.location,
      appliedDate: new Date(Date.now() - (index + 2) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      email: `${gn.name.toLowerCase().replace(" ", ".")}@example.com`,
      phone: `+1 (555) 321-432${index}`,
      bio: `Experienced specialist in ${job.title.toLowerCase()}. I enjoy collaborating with cross-functional teams and building high-quality, scalable solutions. Passionate about learning new technologies and applying them to solve business needs.`,
      experienceYears: 6 - index * 2,
      skills: allSkills,
      education: index === 0 ? "M.S. in Computer Science, MIT" : "B.S. in Computer Science, University of Illinois",
      linkedin: `linkedin.com/in/${gn.name.toLowerCase().replace(" ", "-")}`,
      github: `github.com/${gn.name.toLowerCase().replace(" ", "")}`
    };
  });
}

interface JobApplicationsViewProps {
  jobId: string;
  jobs: EmployerJob[];
  onBack: () => void;
}

export default function JobApplicationsView({ jobId, jobs, onBack }: JobApplicationsViewProps) {
  const [applicants, setApplicants] = useState<CandidateProfile[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<CandidateProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const job = useMemo(() => jobs.find((j) => j.id === jobId) || null, [jobs, jobId]);

  // Load applicants
  useEffect(() => {
    if (!job) return;
    const key = `recruiter_job_${jobId}_applicants`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setApplicants(parsed);
          setSelectedApplicant(parsed[0]);
        } else {
          const initial = getJobApplicants(job);
          setApplicants(initial);
          setSelectedApplicant(initial[0] || null);
          localStorage.setItem(key, JSON.stringify(initial));
        }
      } catch {
        const initial = getJobApplicants(job);
        setApplicants(initial);
        setSelectedApplicant(initial[0] || null);
        localStorage.setItem(key, JSON.stringify(initial));
      }
    } else {
      const initial = getJobApplicants(job);
      setApplicants(initial);
      setSelectedApplicant(initial[0] || null);
      localStorage.setItem(key, JSON.stringify(initial));
    }
  }, [jobId, job]);

  const filteredApplicants = useMemo(() => {
    return applicants.filter((a) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.skills.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [applicants, searchQuery]);

  // Select first applicant automatically if current selection goes out of filter
  useEffect(() => {
    if (filteredApplicants.length > 0) {
      if (!selectedApplicant || !filteredApplicants.some((a) => a.id === selectedApplicant.id)) {
        setSelectedApplicant(filteredApplicants[0]);
      }
    } else {
      setSelectedApplicant(null);
    }
  }, [filteredApplicants, selectedApplicant]);

  if (!job) {
    return (
      <div className={`${surface} flex h-full items-center justify-center p-6`}>
        <div className="text-center">
          <p className="text-white/45">Job listing not found.</p>
          <button
            onClick={onBack}
            className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="grid h-full grid-cols-1 gap-5 lg:grid-cols-9 lg:gap-7"
    >
      {/* ── Left / Middle Panel: list of applicants ── */}
      <section className={`${surface} flex min-h-[38rem] flex-col overflow-hidden lg:col-span-5 lg:min-h-0`}>
        {/* Search header */}
        <div className="border-b border-white/[0.07] p-5">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              title="Back to Job Listings"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-white/65 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
            >
              <IconChevronLeft size={20} />
            </button>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search applicants by name, title, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#121212] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-orange-500/45 focus:ring-2 focus:ring-orange-500/10"
              />
              <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
            </div>
          </div>
          <div className="mt-3 text-xs text-white/35">
            Viewing applicants for <span className="font-semibold text-white/60">{job.title}</span> • {filteredApplicants.length} found
          </div>
        </div>

        {/* Scrollable applicant card list */}
        <div className="min-h-0 flex-1 space-y-3 overflow-auto p-5 custom-scrollbar">
          {filteredApplicants.length > 0 ? (
            filteredApplicants.map((applicant) => {
              const score = calculateAtsScore(applicant.skills, job.tags);
              const isSelected = selectedApplicant?.id === applicant.id;

              // Color classes based on score
              const scoreColor =
                score >= 85
                  ? "text-emerald-400"
                  : score >= 70
                  ? "text-sky-400"
                  : "text-amber-400";

              return (
                <motion.button
                  key={applicant.id}
                  type="button"
                  onClick={() => setSelectedApplicant(applicant)}
                  whileHover={{ y: -2, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`w-full rounded-2xl border p-4 text-left cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? "border-orange-500/50 bg-orange-500/[0.055] shadow-[0_0_0_2px_rgba(255,107,0,0.1),8px_8px_18px_rgba(0,0,0,0.22)]"
                      : "border-white/[0.065] bg-[#141414] shadow-[6px_6px_16px_rgba(0,0,0,0.24)] hover:border-white/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Profile Photo / Avatar placeholder */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B00]/20 to-[#FF914D]/10 text-base font-bold text-[#FF914D] border border-white/[0.08]">
                      {applicant.name.split(" ").map((n) => n[0]).join("")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate text-base font-semibold leading-tight text-white">
                          {applicant.name}
                        </h3>
                        <span className={`shrink-0 text-xs font-semibold ${scoreColor}`}>
                          ATS Match: {score}%
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-white/60">{applicant.title}</p>
                      
                      <div className="mt-3.5 flex flex-wrap gap-x-3.5 gap-y-1.5 text-xs text-white/45">
                        <span className="flex items-center gap-1">
                          <IconMapPin size={13} className="text-white/30" />
                          {applicant.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconCalendar size={13} className="text-white/30" />
                          Applied {applicant.appliedDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-white/[0.02] text-white/20 border border-white/5">
                <IconSearch size={18} />
              </div>
              <h3 className="font-semibold text-white/80">No applicants found</h3>
              <p className="mt-1 text-xs text-white/30">Try checking your search filters or queries</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Right Panel: Candidate Profile details ── */}
      <section className={`${surface} min-h-[38rem] overflow-auto p-6 lg:col-span-4 lg:min-h-0 custom-scrollbar`}>
        {selectedApplicant ? (
          <motion.div
            key={selectedApplicant.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Header / Avatar */}
            <div className="flex items-center gap-4 border-b border-white/[0.07] pb-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF914D] text-2xl font-bold text-white shadow-[0_8px_24px_rgba(255,107,0,0.24)]">
                {selectedApplicant.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xl font-bold text-white">{selectedApplicant.name}</h2>
                <p className="truncate text-sm text-white/55">{selectedApplicant.title}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${
                    calculateAtsScore(selectedApplicant.skills, job.tags) >= 85
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                      : calculateAtsScore(selectedApplicant.skills, job.tags) >= 70
                      ? "border-sky-500/20 bg-sky-500/10 text-sky-300"
                      : "border-amber-500/20 bg-amber-500/10 text-amber-300"
                  }`}>
                    ATS Match: {calculateAtsScore(selectedApplicant.skills, job.tags)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-1 gap-4 border-b border-white/[0.07] pb-5 sm:grid-cols-2">
              <QuickFactDetail label="Email" value={selectedApplicant.email} icon="mail" />
              <QuickFactDetail label="Phone" value={selectedApplicant.phone} icon="phone" />
              <QuickFactDetail label="Location" value={selectedApplicant.location} icon="map" />
              <QuickFactDetail label="Experience" value={`${selectedApplicant.experienceYears} Years`} icon="experience" />
              <div className="sm:col-span-2">
                <QuickFactDetail label="Education" value={selectedApplicant.education} icon="education" />
              </div>
            </div>

            {/* About / Bio */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Candidate Bio</h3>
              <p className="text-sm leading-relaxed text-white/60">{selectedApplicant.bio}</p>
            </div>

            {/* Skills & tags matching */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Skills & Competency</h3>
              <div className="flex flex-wrap gap-2">
                {selectedApplicant.skills.map((skill) => {
                  const isMatching = job.tags.some((t) => t.toLowerCase() === skill.toLowerCase());
                  return (
                    <span
                      key={skill}
                      className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                        isMatching
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 font-medium"
                          : "border-white/[0.07] bg-white/[0.025] text-white/45"
                      }`}
                    >
                      {skill} {isMatching && "✓"}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Social profiles */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Professional Links</h3>
              <div className="flex flex-wrap gap-2">
                {selectedApplicant.linkedin && (
                  <a
                    href={`https://${selectedApplicant.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-sky-400 hover:bg-white/[0.05] hover:text-sky-300 transition-all"
                  >
                    <IconBrandLinkedin size={14} />
                    LinkedIn
                  </a>
                )}
                {selectedApplicant.github && (
                  <a
                    href={`https://${selectedApplicant.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white transition-all"
                  >
                    <IconBrandGithub size={14} />
                    GitHub
                  </a>
                )}
                {selectedApplicant.portfolio && (
                  <a
                    href={`https://${selectedApplicant.portfolio}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-[#FF914D] hover:bg-white/[0.05] hover:text-[#ff9d61] transition-all"
                  >
                    <IconWorld size={14} />
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid h-full place-items-center text-center">
            <div>
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-orange-500/10 text-[#FF914D]">
                <IconUsers size={24} />
              </div>
              <h2 className="font-semibold text-white/80">No candidate selected</h2>
              <p className="mt-2 text-sm text-white/30">Select a candidate from the left panel to review details.</p>
            </div>
          </div>
        )}
      </section>
    </motion.div>
  );
}

function QuickFactDetail({ label, value, icon }: { label: string; value: string; icon: string }) {
  let renderIcon = null;
  switch (icon) {
    case "mail":
      renderIcon = <IconMail size={15} className="text-white/35" />;
      break;
    case "phone":
      renderIcon = <IconPhone size={15} className="text-white/35" />;
      break;
    case "map":
      renderIcon = <IconMapPin size={15} className="text-white/35" />;
      break;
    case "experience":
      renderIcon = <IconBriefcase size={15} className="text-white/35" />;
      break;
    case "education":
      renderIcon = <IconSchool size={15} className="text-white/35" />;
      break;
  }

  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-7 w-5 items-center justify-center shrink-0">
        {renderIcon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-white/35">{label}</div>
        <div className="truncate text-xs font-medium text-white/70" title={value}>{value}</div>
      </div>
    </div>
  );
}
