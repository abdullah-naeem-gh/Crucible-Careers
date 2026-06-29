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
  IconFilter,
  IconArrowsSort,
  IconChevronDown,
  IconCheck,
  IconPlus,
  IconSparkles,
  IconX,
  IconSend,
} from "@tabler/icons-react";
import { EmployerJob } from "@/components/employer/dashboard/OverviewTab";

type ScreeningStatus = "unscreened" | "shortlisted" | "rejected";
type EmailAudience = "all" | "shortlisted" | "rejected" | "manual";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  custom?: boolean;
}

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
  screeningStatus?: ScreeningStatus;
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

const getSortLabel = (val: string) => {
  switch (val) {
    case "ats-desc":
      return "ATS Match: High-Low";
    case "ats-asc":
      return "ATS Match: Low-High";
    case "date-desc":
      return "Applied: Newest First";
    case "date-asc":
      return "Applied: Oldest First";
    case "exp-desc":
      return "Experience: Most-Least";
    case "exp-asc":
      return "Experience: Least-Most";
    default:
      return "ATS Match: High-Low";
  }
};

const statusFilterOptions: { key: ScreeningStatus; label: string }[] = [
  { key: "unscreened", label: "Unscreened" },
  { key: "rejected", label: "Rejected" },
  { key: "shortlisted", label: "Shortlisted" },
];

const emailAudienceOptions: { key: EmailAudience; label: string }[] = [
  { key: "all", label: "Select all" },
  { key: "shortlisted", label: "Select all shortlisted" },
  { key: "rejected", label: "Select all rejected" },
  { key: "manual", label: "Select manually" },
];

const emailTemplates: EmailTemplate[] = [
  {
    id: "shortlist-next-steps",
    name: "Shortlist next steps",
    subject: "Next steps for your application",
    body: "Hi {{name}},\n\nThank you for applying for the {{jobTitle}} role. We reviewed your profile and would like to move you forward to the next stage.\n\nWe will follow up shortly with scheduling details.\n\nBest,\nCrucible Recruiting",
  },
  {
    id: "rejection-professional",
    name: "Professional rejection",
    subject: "Update on your application",
    body: "Hi {{name}},\n\nThank you for applying for the {{jobTitle}} role. After reviewing your profile, we will not be moving forward at this time.\n\nWe appreciate the time you invested and wish you the best in your search.\n\nBest,\nCrucible Recruiting",
  },
  {
    id: "request-info",
    name: "Request more information",
    subject: "A quick follow-up on your application",
    body: "Hi {{name}},\n\nThank you for applying for the {{jobTitle}} role. We would like to learn a little more about your experience before making a decision.\n\nCould you reply with any additional portfolio links, project examples, or availability details you would like us to consider?\n\nBest,\nCrucible Recruiting",
  },
];

export default function JobApplicationsView({ jobId, jobs, onBack }: JobApplicationsViewProps) {
  const [applicants, setApplicants] = useState<CandidateProfile[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<CandidateProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<Record<ScreeningStatus, boolean>>({
    unscreened: false,
    rejected: false,
    shortlisted: false,
  });
  const [expFilter, setExpFilter] = useState("all");
  const [atsFilter, setAtsFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("ats-desc");
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showEmailPanel, setShowEmailPanel] = useState(false);
  const [showAutoShortlist, setShowAutoShortlist] = useState(false);
  const [autoCriteria, setAutoCriteria] = useState({
    atsEnabled: false,
    atsMinimum: 80,
    experienceEnabled: false,
    experienceMinimum: 3,
    matchedSkillsEnabled: false,
    matchedSkillsMinimum: 2,
  });
  const [semanticTerms, setSemanticTerms] = useState<string[]>([""]);
  const [emailAudience, setEmailAudience] = useState<EmailAudience>("all");
  const [manualEmailIds, setManualEmailIds] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState(emailTemplates[0].subject);
  const [emailBody, setEmailBody] = useState(emailTemplates[0].body);
  const [emailTemplateName, setEmailTemplateName] = useState("Custom follow-up");
  const [selectedEmailTemplateId, setSelectedEmailTemplateId] = useState(emailTemplates[0].id);
  const [customEmailTemplates, setCustomEmailTemplates] = useState<EmailTemplate[]>([]);
  const [emailDraftStatus, setEmailDraftStatus] = useState("");

  const allEmailTemplates = useMemo(() => [...emailTemplates, ...customEmailTemplates], [customEmailTemplates]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (expFilter !== "all") count++;
    if (atsFilter !== "all") count++;
    if (locationFilter !== "all") count++;
    return count;
  }, [expFilter, atsFilter, locationFilter]);

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

  const persistApplicants = (nextApplicants: CandidateProfile[]) => {
    setApplicants(nextApplicants);
    localStorage.setItem(`recruiter_job_${jobId}_applicants`, JSON.stringify(nextApplicants));
  };

  const setApplicantStatus = (applicantId: string, status: ScreeningStatus) => {
    const nextApplicants = applicants.map((applicant) => {
      if (applicant.id !== applicantId) return applicant;
      const nextStatus = (applicant.screeningStatus || "unscreened") === status ? undefined : status;
      return { ...applicant, screeningStatus: nextStatus };
    });

    persistApplicants(nextApplicants);
    setSelectedApplicant((current) => {
      if (current?.id !== applicantId) return current;
      const nextStatus = (current.screeningStatus || "unscreened") === status ? undefined : status;
      return { ...current, screeningStatus: nextStatus };
    });
  };

  const toggleStatusFilter = (status: ScreeningStatus) => {
    setStatusFilters((current) => ({
      ...current,
      [status]: !current[status],
    }));
  };

  const applyEmailTemplate = (templateId: string) => {
    const template = allEmailTemplates.find((item) => item.id === templateId);
    if (!template) return;
    setSelectedEmailTemplateId(template.id);
    setEmailTemplateName(template.name);
    setEmailSubject(template.subject);
    setEmailBody(template.body);
    setEmailDraftStatus(`Loaded template: ${template.name}`);
  };

  const saveEmailTemplate = () => {
    const name = emailTemplateName.trim() || "Custom template";
    const existingCustom = customEmailTemplates.find((template) => template.id === selectedEmailTemplateId);

    if (existingCustom) {
      setCustomEmailTemplates((current) =>
        current.map((template) =>
          template.id === existingCustom.id ? { ...template, name, subject: emailSubject, body: emailBody } : template
        )
      );
      setEmailDraftStatus(`Updated template: ${name}`);
      return;
    }

    const nextTemplate: EmailTemplate = {
      id: `custom-${Date.now()}`,
      name,
      subject: emailSubject,
      body: emailBody,
      custom: true,
    };
    setCustomEmailTemplates((current) => [...current, nextTemplate]);
    setSelectedEmailTemplateId(nextTemplate.id);
    setEmailDraftStatus(`Created template: ${name}`);
  };

  const toggleManualEmailRecipient = (applicantId: string) => {
    setManualEmailIds((current) =>
      current.includes(applicantId)
        ? current.filter((id) => id !== applicantId)
        : [...current, applicantId]
    );
  };
  const personalizeEmail = (value: string, applicant: CandidateProfile) =>
    value.replaceAll("{{name}}", applicant.name).replaceAll("{{jobTitle}}", job?.title || "the role");

  const openApplicantEmail = (applicant: CandidateProfile) => {
    const subject = personalizeEmail(emailSubject, applicant);
    const body = personalizeEmail(emailBody, applicant);
    window.location.href = `mailto:${encodeURIComponent(applicant.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  const runAutoShortlist = () => {
    if (!job) return;

    const semanticNeedles = semanticTerms.map((term) => term.trim().toLowerCase()).filter(Boolean);
    const nextApplicants = applicants.map((applicant) => {
      const score = calculateAtsScore(applicant.skills, job.tags);
      const matchedSkills = applicant.skills.filter((skill) =>
        job.tags.some((tag) => tag.toLowerCase() === skill.toLowerCase())
      ).length;
      const semanticMatch =
        semanticNeedles.length === 0 ||
        semanticNeedles.some((term) =>
          [applicant.name, applicant.title, applicant.bio, applicant.education, ...applicant.skills]
            .join(" ")
            .toLowerCase()
            .includes(term)
        );

      const passesCriteria =
        (!autoCriteria.atsEnabled || score >= autoCriteria.atsMinimum) &&
        (!autoCriteria.experienceEnabled || applicant.experienceYears >= autoCriteria.experienceMinimum) &&
        (!autoCriteria.matchedSkillsEnabled || matchedSkills >= autoCriteria.matchedSkillsMinimum) &&
        semanticMatch;

      return passesCriteria ? { ...applicant, screeningStatus: "shortlisted" as ScreeningStatus } : applicant;
    });

    persistApplicants(nextApplicants);
    setSelectedApplicant((current) =>
      current ? nextApplicants.find((applicant) => applicant.id === current.id) || current : current
    );
    setShowAutoShortlist(false);
  };

  // Compute unique locations for the filter
  const uniqueLocations = useMemo(() => {
    const locs = applicants.map((a) => {
      if (a.location.toLowerCase().includes("remote")) return "Remote";
      return a.location;
    });
    return Array.from(new Set(locs));
  }, [applicants]);

  const filteredApplicants = useMemo(() => {
    if (!job) return [];
    const hasStatusFilter = Object.values(statusFilters).some(Boolean);

    return applicants
      .filter((a) => {
        // Search query filter
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          a.name.toLowerCase().includes(q) ||
          a.title.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.skills.some((s) => s.toLowerCase().includes(q));

        // Experience filter
        let matchesExp = true;
        if (expFilter === "junior") matchesExp = a.experienceYears <= 2;
        else if (expFilter === "mid") matchesExp = a.experienceYears >= 3 && a.experienceYears <= 5;
        else if (expFilter === "senior") matchesExp = a.experienceYears >= 6;

        // ATS Match filter
        const score = calculateAtsScore(a.skills, job.tags);
        let matchesAts = true;
        if (atsFilter === "excellent") matchesAts = score >= 85;
        else if (atsFilter === "good") matchesAts = score >= 70 && score < 85;
        else if (atsFilter === "average") matchesAts = score < 70;

        // Location filter
        let matchesLocation = true;
        if (locationFilter !== "all") {
          if (locationFilter === "Remote") {
            matchesLocation = a.location.toLowerCase().includes("remote");
          } else {
            matchesLocation = a.location === locationFilter;
          }
        }

        const currentStatus = a.screeningStatus || "unscreened";
        const matchesStatus = !hasStatusFilter || statusFilters[currentStatus];

        return matchesQuery && matchesExp && matchesAts && matchesLocation && matchesStatus;
      })
      .sort((a, b) => {
        const scoreA = calculateAtsScore(a.skills, job.tags);
        const scoreB = calculateAtsScore(b.skills, job.tags);

        switch (sortBy) {
          case "ats-desc":
            return scoreB - scoreA;
          case "ats-asc":
            return scoreA - scoreB;
          case "date-desc":
            return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
          case "date-asc":
            return new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime();
          case "exp-desc":
            return b.experienceYears - a.experienceYears;
          case "exp-asc":
            return a.experienceYears - b.experienceYears;
          default:
            return 0;
        }
      });
  }, [applicants, searchQuery, statusFilters, expFilter, atsFilter, locationFilter, sortBy, job]);

  const emailRecipients = useMemo(() => {
    switch (emailAudience) {
      case "shortlisted":
        return applicants.filter((applicant) => applicant.screeningStatus === "shortlisted");
      case "rejected":
        return applicants.filter((applicant) => applicant.screeningStatus === "rejected");
      case "manual":
        return applicants.filter((applicant) => manualEmailIds.includes(applicant.id));
      default:
        return applicants;
    }
  }, [applicants, emailAudience, manualEmailIds]);

  const sendEmailDraft = () => {
    const recipientCount = emailRecipients.length;
    if (!recipientCount) {
      setEmailDraftStatus("Select at least one applicant before sending.");
      return;
    }

    if (recipientCount === 1) {
      openApplicantEmail(emailRecipients[0]);
      setEmailDraftStatus(`Opened email draft for ${emailRecipients[0].name}.`);
      return;
    }

    const subject = emailSubject.replaceAll("{{jobTitle}}", job?.title || "the role");
    const body = emailBody.replaceAll("{{jobTitle}}", job?.title || "the role");
    const bcc = emailRecipients.map((recipient) => recipient.email).join(",");

    window.location.href = `mailto:?bcc=${encodeURIComponent(bcc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setEmailDraftStatus(`Opened email draft for ${recipientCount} applicants.`);
  };

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
            <button
              type="button"
              onClick={() => setShowAutoShortlist(true)}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#FF6B00] px-4 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(255,107,0,0.22)] transition-all hover:bg-[#ff7a1a] cursor-pointer"
            >
              <IconSparkles size={15} />
              Auto Shortlist
            </button>
          </div>

          {/* Filters & Sorting Row */}
          <div className="mt-4 flex flex-nowrap items-center gap-3">
            {/* Filters Chip */}
            <button
              type="button"
              onClick={() => {
                setShowFilters(!showFilters);
                setShowSort(false);
                setShowEmailPanel(false);
              }}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium transition-all cursor-pointer ${
                showFilters || activeFiltersCount > 0
                  ? "border-[#FF6B00]/50 bg-[#FF6B00]/10 text-white"
                  : "border-white/[0.08] bg-white/[0.02] text-white/65 hover:bg-white/5 hover:text-white"
              }`}
            >
              <IconFilter size={14} className={showFilters || activeFiltersCount > 0 ? "text-[#FF914D]" : "text-white/45"} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#FF6B00] text-[9px] font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
              <motion.div
                animate={{ rotate: showFilters ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <IconChevronDown size={14} className="text-white/35" />
              </motion.div>
            </button>

            {/* Sort Chip */}
            <button
              type="button"
              onClick={() => {
                setShowSort(!showSort);
                setShowFilters(false);
                setShowEmailPanel(false);
              }}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium transition-all cursor-pointer ${
                showSort
                  ? "border-[#FF6B00]/50 bg-[#FF6B00]/10 text-white"
                  : "border-white/[0.08] bg-white/[0.02] text-white/65 hover:bg-white/5 hover:text-white"
              }`}
            >
              <IconArrowsSort size={14} className={showSort ? "text-[#FF914D]" : "text-white/45"} />
              <span>Sort: {getSortLabel(sortBy)}</span>
              <motion.div
                animate={{ rotate: showSort ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <IconChevronDown size={14} className="text-white/35" />
              </motion.div>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowEmailPanel(true);
                setShowFilters(false);
                setShowSort(false);
              }}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium transition-all cursor-pointer ${
                showEmailPanel
                  ? "border-[#FF6B00]/50 bg-[#FF6B00]/10 text-white"
                  : "border-white/[0.08] bg-white/[0.02] text-white/65 hover:bg-white/5 hover:text-white"
              }`}
            >
              <IconMail size={14} className={showEmailPanel ? "text-[#FF914D]" : "text-white/45"} />
              <span>Email applicants</span>
              <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/45">{emailRecipients.length}</span>
            </button>

            {/* Clear Filters Helper */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setExpFilter("all");
                  setAtsFilter("all");
                  setLocationFilter("all");
                }}
                className="shrink-0 whitespace-nowrap text-xs text-[#FF914D] hover:text-[#ff914d]/80 hover:underline cursor-pointer font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {statusFilterOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => toggleStatusFilter(option.key)}
                className={`rounded-full border px-2.5 py-1.5 text-[11px] font-medium leading-none transition-all cursor-pointer ${
                  statusFilters[option.key]
                    ? "border-[#FF6B00]/45 bg-[#FF6B00]/10 text-[#C2410C] dark:text-[#FF914D]"
                    : "border-gray-200 bg-gray-50 text-gray-400 hover:text-gray-600 dark:border-white/[0.06] dark:bg-transparent dark:text-white/25 dark:hover:text-white/45"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Collapsible Drawers */}
          <AnimatePresence initial={false}>
            {showFilters && (
              <motion.div
                key="filters-drawer"
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3.5 sm:grid-cols-3">
                  {/* Experience level */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/35 mb-1.5 font-medium">Experience Level</label>
                    <select
                      value={expFilter}
                      onChange={(e) => setExpFilter(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.08] bg-[#121212] px-2.5 py-1.5 text-xs text-white/65 outline-none cursor-pointer focus:border-orange-500/40"
                    >
                      <option value="all">All Experience</option>
                      <option value="junior">Junior (0-2 yrs)</option>
                      <option value="mid">Mid-level (3-5 yrs)</option>
                      <option value="senior">Senior (6+ yrs)</option>
                    </select>
                  </div>

                  {/* ATS score match */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/35 mb-1.5 font-medium">ATS Match Score</label>
                    <select
                      value={atsFilter}
                      onChange={(e) => setAtsFilter(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.08] bg-[#121212] px-2.5 py-1.5 text-xs text-white/65 outline-none cursor-pointer focus:border-orange-500/40"
                    >
                      <option value="all">All Match Levels</option>
                      <option value="excellent">Excellent (85%+)</option>
                      <option value="good">Good (70%+)</option>
                      <option value="average">Average (&lt;70%)</option>
                    </select>
                  </div>

                  {/* Location filter */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/35 mb-1.5 font-medium">Location</label>
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.08] bg-[#121212] px-2.5 py-1.5 text-xs text-white/65 outline-none cursor-pointer focus:border-orange-500/40"
                    >
                      <option value="all">All Locations</option>
                      {uniqueLocations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}


            {showSort && (
              <motion.div
                key="sort-drawer"
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3.5">
                  <div className="max-w-xs">
                    <label className="block text-[10px] uppercase tracking-wider text-white/35 mb-1.5 font-medium">Sort Order</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full rounded-lg border border-orange-500/25 bg-[#121212] px-2.5 py-1.5 text-xs text-[#FF914D] font-medium outline-none cursor-pointer focus:border-orange-500/40"
                    >
                      <option value="ats-desc">ATS Match: High-Low</option>
                      <option value="ats-asc">ATS Match: Low-High</option>
                      <option value="date-desc">Applied: Newest First</option>
                      <option value="date-asc">Applied: Oldest First</option>
                      <option value="exp-desc">Experience: Most-Least</option>
                      <option value="exp-asc">Experience: Least-Most</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
              const currentStatus = applicant.screeningStatus || "unscreened";

              // Color classes based on score
              const scoreColor =
                score >= 85
                  ? "text-emerald-400"
                  : score >= 70
                  ? "text-sky-400"
                  : "text-amber-400";

              return (
                <motion.div
                  key={applicant.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedApplicant(applicant)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedApplicant(applicant);
                    }
                  }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`w-full rounded-2xl border p-4 text-left cursor-pointer transition-colors duration-150 ${
                    isSelected && currentStatus === "shortlisted"
                      ? "border-orange-500/60 bg-emerald-500/[0.07] shadow-[0_0_0_2px_rgba(255,107,0,0.18),0_0_26px_rgba(16,185,129,0.16),8px_8px_18px_rgba(0,0,0,0.22)]"
                      : isSelected && currentStatus === "rejected"
                      ? "border-orange-500/60 bg-red-500/[0.045] shadow-[0_0_0_2px_rgba(255,107,0,0.18),8px_8px_18px_rgba(0,0,0,0.22)]"
                      : currentStatus === "shortlisted"
                      ? "border-emerald-500/45 bg-emerald-500/[0.07] shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_0_26px_rgba(16,185,129,0.16),8px_8px_18px_rgba(0,0,0,0.22)]"
                      : currentStatus === "rejected"
                      ? "border-red-500/30 bg-red-500/[0.045] shadow-[8px_8px_18px_rgba(0,0,0,0.22)]"
                      : isSelected
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
                        <div className="flex shrink-0 items-center gap-2">
                          <span className={`text-xs font-semibold ${scoreColor}`}>
                            ATS Match: {score}%
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              title="Shortlist candidate"
                              onClick={(event) => {
                                event.stopPropagation();
                                setApplicantStatus(applicant.id, "shortlisted");
                              }}
                              className={`grid h-7 w-7 place-items-center rounded-lg border transition-all cursor-pointer ${
                                currentStatus === "shortlisted"
                                  ? "border-emerald-700/45 bg-emerald-700/15 text-emerald-800 dark:border-emerald-400/60 dark:bg-emerald-500/20 dark:text-emerald-300"
                                  : "border-white/[0.08] bg-white/[0.025] text-white/45 hover:border-emerald-700/45 hover:text-emerald-800 dark:hover:border-emerald-400/45 dark:hover:text-emerald-300"
                              }`}
                            >
                              <IconCheck size={15} stroke={2.3} />
                            </button>
                            <button
                              type="button"
                              title="Reject candidate"
                              onClick={(event) => {
                                event.stopPropagation();
                                setApplicantStatus(applicant.id, "rejected");
                              }}
                              className={`grid h-7 w-7 place-items-center rounded-lg border transition-all cursor-pointer ${
                                currentStatus === "rejected"
                                  ? "border-red-800/40 bg-red-800/10 text-red-800 dark:border-red-400/60 dark:bg-red-500/20 dark:text-red-300"
                                  : "border-white/[0.08] bg-white/[0.025] text-white/45 hover:border-red-800/45 hover:text-red-800 dark:hover:border-red-400/45 dark:hover:text-red-300"
                              }`}
                            >
                              <IconX size={15} stroke={2.3} />
                            </button>
                            <button
                              type="button"
                              title="Email candidate"
                              onClick={(event) => {
                                event.stopPropagation();
                                openApplicantEmail(applicant);
                              }}
                              className="grid h-7 w-7 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/45 transition-all hover:border-orange-500/40 hover:text-[#FF914D] cursor-pointer"
                            >
                              <IconMail size={15} stroke={2.3} />
                            </button>
                          </div>
                        </div>
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
                </motion.div>
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
            <div className="flex items-start gap-4 border-b border-white/[0.07] pb-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF914D] text-2xl font-bold text-white shadow-[0_8px_24px_rgba(255,107,0,0.24)]">
                {selectedApplicant.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xl font-bold text-white">{selectedApplicant.name}</h2>
                <p className="truncate text-sm text-white/55">{selectedApplicant.title}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${
                    calculateAtsScore(selectedApplicant.skills, job.tags) >= 85
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : calculateAtsScore(selectedApplicant.skills, job.tags) >= 70
                      ? "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300"
                      : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
                  }`}>
                    ATS Match: {calculateAtsScore(selectedApplicant.skills, job.tags)}%
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setApplicantStatus(selectedApplicant.id, "rejected")}
                  className="text-xs font-semibold text-red-800 transition-colors hover:text-red-700 dark:text-red-300 dark:hover:text-red-200 cursor-pointer"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => setApplicantStatus(selectedApplicant.id, "shortlisted")}
                  className="text-xs font-semibold text-emerald-800 transition-colors hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200 cursor-pointer"
                >
                  Shortlist
                </button>
                <button
                  type="button"
                  onClick={() => openApplicantEmail(selectedApplicant)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF914D] transition-colors hover:text-[#ffae73] cursor-pointer"
                >
                  <IconMail size={14} />
                  Email
                </button>
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
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 font-medium"
                          : "border-gray-200 bg-gray-50/50 text-gray-600 dark:border-white/[0.07] dark:bg-white/[0.025] dark:text-white/45"
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

      <AnimatePresence>
        {showEmailPanel && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEmailPanel(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Email applicants composer"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
              className="flex h-[min(86vh,780px)] w-full max-w-6xl flex-col overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#171717] shadow-[18px_18px_44px_rgba(0,0,0,0.42),-8px_-8px_24px_rgba(255,255,255,0.025)]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] p-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">Email applicants</h2>
                  <p className="mt-1 text-sm text-white/45">Compose emails for all, shortlisted, rejected, or manually selected applicants.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailPanel(false)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[0.08] text-white/45 hover:bg-white/[0.04] hover:text-white cursor-pointer"
                  aria-label="Close email composer"
                >
                  <IconX size={18} />
                </button>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-12">
                <aside className="min-h-0 border-b border-white/[0.07] p-5 lg:col-span-4 lg:border-b-0 lg:border-r">
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-white/35">Recipients</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
                    {emailAudienceOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => {
                          setEmailAudience(option.key);
                          setEmailDraftStatus(option.key === "manual" ? "Choose individual recipients in the list below." : "");
                        }}
                        className={`rounded-xl border px-3 py-2.5 text-left text-xs transition-all cursor-pointer ${
                          emailAudience === option.key
                            ? "border-[#FF6B00]/45 bg-[#FF6B00]/10 text-[#FF914D]"
                            : "border-white/[0.07] bg-[#121212] text-white/55 hover:border-white/12 hover:text-white"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#121212] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-medium text-white/65">Selected</span>
                      <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-white/45">
                        {emailRecipients.length} recipient{emailRecipients.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="mt-3 max-h-80 space-y-2 overflow-auto pr-1 custom-scrollbar">
                      {applicants.map((applicant) => {
                        const isManual = manualEmailIds.includes(applicant.id);
                        const isIncluded = emailRecipients.some((recipient) => recipient.id === applicant.id);
                        return (
                          <label
                            key={applicant.id}
                            className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-xs transition-colors ${
                              emailAudience === "manual"
                                ? "cursor-pointer border-white/[0.07] bg-white/[0.02] text-white/65 hover:border-orange-500/35"
                                : isIncluded
                                ? "border-orange-500/20 bg-orange-500/10 text-white/70"
                                : "border-white/[0.04] bg-transparent text-white/25"
                            }`}
                          >
                            <input
                              type="checkbox"
                              disabled={emailAudience !== "manual"}
                              checked={emailAudience === "manual" ? isManual : isIncluded}
                              onChange={() => toggleManualEmailRecipient(applicant.id)}
                              className="h-4 w-4 rounded border-white/20 bg-[#121212] accent-[#FF6B00] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                              aria-label={`Select ${applicant.name} for email`}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium text-white/75">{applicant.name}</span>
                              <span className="block truncate text-white/35">{applicant.email}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </aside>

                <section className="min-h-0 overflow-auto p-5 custom-scrollbar lg:col-span-8">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Templates</label>
                    <div className="flex flex-wrap gap-2">
                      {allEmailTemplates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => applyEmailTemplate(template.id)}
                          className={`rounded-lg border px-2.5 py-1.5 text-[11px] cursor-pointer ${
                            selectedEmailTemplateId === template.id
                              ? "border-orange-500/35 bg-orange-500/10 text-[#FF914D]"
                              : "border-white/[0.08] bg-[#121212] text-white/55 hover:border-orange-500/35 hover:text-[#FF914D]"
                          }`}
                        >
                          {template.name}{template.custom ? " *" : ""}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                    <input
                      type="text"
                      value={emailTemplateName}
                      onChange={(event) => setEmailTemplateName(event.target.value)}
                      placeholder="Template name"
                      className="w-full rounded-xl border border-white/[0.08] bg-[#121212] px-3 py-2.5 text-sm text-white/70 outline-none placeholder:text-white/25 focus:border-orange-500/40"
                    />
                    <button
                      type="button"
                      onClick={saveEmailTemplate}
                      className="rounded-xl border border-orange-500/25 bg-orange-500/10 px-4 py-2.5 text-sm font-semibold text-[#FF914D] hover:bg-orange-500/15 cursor-pointer"
                    >
                      {customEmailTemplates.some((template) => template.id === selectedEmailTemplateId) ? "Update template" : "Create template"}
                    </button>
                  </div>

                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(event) => setEmailSubject(event.target.value)}
                    placeholder="Email subject"
                    className="mb-3 w-full rounded-xl border border-white/[0.08] bg-[#121212] px-3 py-2.5 text-sm text-white/70 outline-none placeholder:text-white/25 focus:border-orange-500/40"
                  />
                  <textarea
                    value={emailBody}
                    onChange={(event) => setEmailBody(event.target.value)}
                    rows={15}
                    placeholder="Write an email or load a template..."
                    className="min-h-[22rem] w-full resize-none rounded-xl border border-white/[0.08] bg-[#121212] px-3 py-3 text-sm leading-relaxed text-white/70 outline-none placeholder:text-white/25 focus:border-orange-500/40"
                  />

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                    <p className="text-xs text-white/35">Use {"{{name}}"} and {"{{jobTitle}}"} for candidate-specific personalization.</p>
                    <button
                      type="button"
                      onClick={sendEmailDraft}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B00] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(255,107,0,0.18)] hover:bg-[#ff7a1a] cursor-pointer"
                    >
                      <IconSend size={16} />
                      Send email
                    </button>
                  </div>
                  {emailDraftStatus && (
                    <div className="mt-3 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2.5 text-xs text-[#FF914D]">
                      {emailDraftStatus}
                    </div>
                  )}
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAutoShortlist && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAutoShortlist(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Auto shortlist criteria"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-2xl rounded-[24px] border border-gray-200 bg-white p-5 shadow-[12px_12px_30px_rgba(15,23,42,0.12),-6px_-6px_18px_rgba(255,255,255,0.8)] dark:border-white/[0.07] dark:bg-[#171717] dark:shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4 dark:border-white/[0.07]">
                <div>
                  <h2 className="text-lg font-semibold text-gray-950 dark:text-white">Auto Shortlist</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-white/45">Configure recruiter criteria and semantic terms for this job.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAutoShortlist(false)}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:border-white/[0.08] dark:text-white/45 dark:hover:bg-white/[0.04] dark:hover:text-white cursor-pointer"
                >
                  <IconX size={18} />
                </button>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-white/35">Criteria</h3>
                  <div className="space-y-3">
                    <AutoCriterionRow
                      label="ATS match"
                      enabled={autoCriteria.atsEnabled}
                      value={autoCriteria.atsMinimum}
                      suffix="% or greater"
                      min={0}
                      max={100}
                      onToggle={() => setAutoCriteria((current) => ({ ...current, atsEnabled: !current.atsEnabled }))}
                      onChange={(value) => setAutoCriteria((current) => ({ ...current, atsMinimum: value }))}
                    />
                    <AutoCriterionRow
                      label="Experience"
                      enabled={autoCriteria.experienceEnabled}
                      value={autoCriteria.experienceMinimum}
                      suffix="years or greater"
                      min={0}
                      max={20}
                      onToggle={() => setAutoCriteria((current) => ({ ...current, experienceEnabled: !current.experienceEnabled }))}
                      onChange={(value) => setAutoCriteria((current) => ({ ...current, experienceMinimum: value }))}
                    />
                    <AutoCriterionRow
                      label="Matched job skills"
                      enabled={autoCriteria.matchedSkillsEnabled}
                      value={autoCriteria.matchedSkillsMinimum}
                      suffix="skills or greater"
                      min={0}
                      max={10}
                      onToggle={() => setAutoCriteria((current) => ({ ...current, matchedSkillsEnabled: !current.matchedSkillsEnabled }))}
                      onChange={(value) => setAutoCriteria((current) => ({ ...current, matchedSkillsMinimum: value }))}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-white/35">Semantics</h3>
                    <button
                      type="button"
                      onClick={() => setSemanticTerms((current) => [...current, ""])}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:border-white/[0.08] dark:bg-white/[0.025] dark:text-white/60 dark:hover:bg-white/[0.05] dark:hover:text-white cursor-pointer"
                    >
                      <IconPlus size={14} />
                      Add term
                    </button>
                  </div>
                  <div className="space-y-2">
                    {semanticTerms.map((term, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={term}
                          onChange={(event) =>
                            setSemanticTerms((current) =>
                              current.map((item, itemIndex) => (itemIndex === index ? event.target.value : item))
                            )
                          }
                          placeholder={index === 0 ? "React, Python, Frontend..." : "Add another semantic term"}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500/45 focus:ring-2 focus:ring-orange-500/10 dark:border-white/[0.08] dark:bg-[#121212] dark:text-white dark:placeholder:text-white/20"
                        />
                        {semanticTerms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setSemanticTerms((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-600 dark:border-white/[0.08] dark:text-white/35 dark:hover:border-red-500/35 dark:hover:text-red-300 cursor-pointer"
                          >
                            <IconX size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-white/30">Semantic vector search will connect here; for now terms are matched across profile text and skills.</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => setShowAutoShortlist(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-950 dark:border-white/[0.08] dark:text-white/55 dark:hover:bg-white/[0.04] dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={runAutoShortlist}
                  className="rounded-xl bg-[#FF6B00] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(255,107,0,0.2)] hover:bg-[#ff7a1a] cursor-pointer"
                >
                  Apply Shortlist
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AutoCriterionRow({
  label,
  enabled,
  value,
  suffix,
  min,
  max,
  onToggle,
  onChange,
}: {
  label: string;
  enabled: boolean;
  value: number;
  suffix: string;
  min: number;
  max: number;
  onToggle: () => void;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3.5 dark:border-white/[0.06] dark:bg-white/[0.015] sm:flex-row sm:items-center sm:justify-between">
      <label className="flex min-w-0 items-center gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={onToggle}
          className="h-4 w-4 rounded border-gray-300 bg-white accent-[#FF6B00] dark:border-white/20 dark:bg-[#121212] cursor-pointer"
        />
        <span className={enabled ? "text-sm font-medium text-gray-800 dark:text-white/75" : "text-sm font-medium text-gray-400 dark:text-white/35"}>{label}</span>
      </label>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-white/35">Greater than</span>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          disabled={!enabled}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-9 w-20 rounded-lg border border-gray-200 bg-white px-2 text-sm font-semibold text-gray-800 outline-none disabled:cursor-not-allowed disabled:opacity-35 focus:border-orange-500/40 dark:border-white/[0.08] dark:bg-[#121212] dark:text-white/70"
        />
        <span className="min-w-[6.5rem] text-xs text-gray-500 dark:text-white/35">{suffix}</span>
      </div>
    </div>
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
