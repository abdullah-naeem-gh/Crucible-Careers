import { CandidateProfile, ApplicantPipelineStage, ScreeningStatus } from "@/types/employer/applicant";
import { EmployerJob } from "@/types/employer/job";

const applicantStorageKey = (jobId: string) => `recruiter_job_${jobId}_applicants`;

const mockExperience = [
  {
    id: "mexp-1",
    company: "InnovateTech Corp",
    role: "Software Developer",
    startDate: "2023",
    endDate: "2026",
    current: true,
    description: "Led feature delivery, improved frontend performance, and collaborated with product teams on release planning.",
  },
  {
    id: "mexp-2",
    company: "CodeBase LLC",
    role: "Junior Developer",
    startDate: "2021",
    endDate: "2023",
    current: false,
    description: "Maintained production systems, wrote integration tests, and supported client-facing product launches.",
  },
];

const mockEducation = [
  {
    id: "medu-1",
    school: "State University of Technology",
    degree: "B.S. Computer Science",
    field: "Computer Science",
    startYear: "2017",
    endYear: "2021",
  },
];

const mockProjects = [
  {
    id: "mproj-1",
    title: "Real-time Collaboration App",
    link: "github.com/example/collab",
    videoUrl: "youtube.com/watch?v=demo",
    description: "A real-time product collaboration workspace with presence, comments, and persistent history.",
  },
];

const candidateBank: Record<string, Omit<CandidateProfile, "appliedDate">[]> = {
  "AI Engineer": [
    {
      id: "c1",
      name: "Matthew Brown",
      title: "AI Researcher & Engineer",
      location: "New York, NY",
      email: "matthew.brown@ai-labs.io",
      phone: "+1 (555) 234-5678",
      bio: "AI engineer specializing in training and deploying language models, NLP pipelines, and production ML systems.",
      experienceYears: 4,
      skills: ["Python", "PyTorch", "NLP", "Machine Learning", "Transformers", "Docker"],
      education: "M.S. in Artificial Intelligence, Columbia University",
      linkedin: "linkedin.com/in/matthew-brown-ai",
      github: "github.com/mbrown-ai",
      portfolio: "mbrown.ai",
    },
    {
      id: "c2",
      name: "Melissa Salazar",
      title: "Machine Learning Engineer",
      location: "San Francisco, CA",
      email: "melissa.salazar@techcorp.com",
      phone: "+1 (555) 987-6543",
      bio: "ML engineer focused on computer vision, TensorFlow, cloud deployments, and scalable model pipelines.",
      experienceYears: 3,
      skills: ["Python", "TensorFlow", "Computer Vision", "Machine Learning", "AWS", "SQL"],
      education: "B.S. in Computer Science, UC Berkeley",
      linkedin: "linkedin.com/in/melissa-salazar",
      github: "github.com/msalazar",
    },
    {
      id: "c3",
      name: "Emily Morgan",
      title: "Senior AI Engineer",
      location: "London, UK",
      email: "emily.morgan@quant.ai",
      phone: "+44 20 7946 0958",
      bio: "Senior AI engineer experienced in deep learning architecture, model deployment, NLP, and generative AI systems.",
      experienceYears: 6,
      skills: ["Python", "PyTorch", "NLP", "Machine Learning", "TensorFlow", "Kubernetes", "Generative AI"],
      education: "Ph.D. in Computer Science, University of Oxford",
      linkedin: "linkedin.com/in/emily-morgan-ai",
      github: "github.com/emily-m-ai",
      portfolio: "emilymorgan.dev",
    },
    {
      id: "c4",
      name: "Paul Rodgers",
      title: "Junior Data Scientist",
      location: "Boston, MA",
      email: "paul.rodgers@data-science.net",
      phone: "+1 (555) 456-7890",
      bio: "Early-career data scientist with a foundation in Python, statistics, exploratory analysis, and ML workflows.",
      experienceYears: 1,
      skills: ["Python", "Machine Learning", "Data Analysis", "SQL", "Git"],
      education: "B.S. in Statistics, Boston University",
      github: "github.com/prodgers-data",
    },
  ],
  "Senior Frontend Engineer": [
    {
      id: "c5",
      name: "Sarah Jenkins",
      title: "Senior Frontend Engineer",
      location: "Austin, TX",
      email: "sarah.jenkins@webdev.co",
      phone: "+1 (555) 789-0123",
      bio: "Frontend specialist with deep React, TypeScript, accessibility, design systems, and product UI experience.",
      experienceYears: 7,
      skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL", "Web Accessibility", "Sass"],
      education: "B.F.A. in Interaction Design, UT Austin",
      linkedin: "linkedin.com/in/sarah-jenkins-dev",
      github: "github.com/sjenk-dev",
      portfolio: "sarahj.dev",
    },
    {
      id: "c6",
      name: "Alex Rivera",
      title: "Frontend Engineer",
      location: "Miami, FL",
      email: "alex.rivera@coders.io",
      phone: "+1 (555) 890-1234",
      bio: "TypeScript-focused React engineer experienced in SaaS frontends, testing, and modern build tooling.",
      experienceYears: 4,
      skills: ["React", "TypeScript", "Node.js", "Zustand", "Webpack", "Tailwind CSS"],
      education: "B.S. in Software Engineering, FIU",
      linkedin: "linkedin.com/in/alex-rivera-code",
      github: "github.com/arivera",
    },
    {
      id: "c7",
      name: "David Chen",
      title: "Full Stack Developer",
      location: "Seattle, WA",
      email: "david.chen@stack.net",
      phone: "+1 (555) 345-6789",
      bio: "Full stack engineer with a frontend leaning, strong React experience, AWS deployment knowledge, and API integration skills.",
      experienceYears: 5,
      skills: ["React", "TypeScript", "Node.js", "AWS", "Docker", "PostgreSQL", "Next.js"],
      education: "B.S. in Computer Science, University of Washington",
      linkedin: "linkedin.com/in/davidchen-dev",
      github: "github.com/dchen-stack",
    },
  ],
  "Product Manager": [
    {
      id: "c8",
      name: "James Patel",
      title: "Product Manager",
      location: "San Francisco, CA",
      email: "james.patel@productlabs.io",
      phone: "+1 (555) 567-8901",
      bio: "Product leader driving B2B SaaS roadmap execution through analytics, user research, and cross-functional delivery.",
      experienceYears: 4,
      skills: ["Product Management", "Agile", "Analytics", "Mixpanel", "Jira", "SQL", "B2B"],
      education: "B.A. in Economics & Cognitive Science, UC Berkeley",
      linkedin: "linkedin.com/in/james-patel-pm",
    },
    {
      id: "c9",
      name: "Karen White",
      title: "Technical Product Manager",
      location: "Seattle, WA",
      email: "karen.white@techpm.com",
      phone: "+1 (555) 678-9012",
      bio: "Former engineer turned PM specializing in developer tools, API platforms, cloud infrastructure, and technical discovery.",
      experienceYears: 5,
      skills: ["Product Management", "Agile", "API Design", "Cloud Infrastructure", "Analytics", "System Design"],
      education: "B.S. in Computer Science, Georgia Tech",
      linkedin: "linkedin.com/in/karen-white-techpm",
      github: "github.com/kwhite-dev",
    },
  ],
};

export function calculateAtsScore(candidateSkills: string[], jobTags: string[]): number {
  if (!jobTags.length) return 75;
  const matches = candidateSkills.filter((skill) =>
    jobTags.some((tag) => tag.toLowerCase() === skill.toLowerCase()),
  ).length;
  const percentage = Math.round((matches / Math.max(jobTags.length, 1)) * 100);
  return Math.min(Math.max(60 + Math.round(percentage * 0.38), 65), 97);
}

export function getPipelineStage(candidate: Pick<CandidateProfile, "pipelineStage" | "screeningStatus">): ApplicantPipelineStage {
  if (candidate.pipelineStage) return candidate.pipelineStage;
  if (candidate.screeningStatus === "shortlisted") return "shortlisted";
  if (candidate.screeningStatus === "rejected") return "rejected";
  return "applied";
}

function syncScreeningStatus(stage: ApplicantPipelineStage): ScreeningStatus | undefined {
  if (stage === "shortlisted") return "shortlisted";
  if (stage === "rejected") return "rejected";
  return stage === "applied" ? undefined : "shortlisted";
}

function enrichCandidate(candidate: CandidateProfile, index: number): CandidateProfile {
  const stage = getPipelineStage(candidate);
  return {
    ...candidate,
    pipelineStage: stage,
    screeningStatus: candidate.screeningStatus ?? syncScreeningStatus(stage),
    experience: candidate.experience?.length ? candidate.experience : mockExperience,
    educationList: candidate.educationList?.length ? candidate.educationList : mockEducation,
    projects: candidate.projects?.length ? candidate.projects : mockProjects,
    rating: candidate.rating ?? (index % 4 === 0 ? 4 : undefined),
  };
}

function generateApplicants(job: EmployerJob): CandidateProfile[] {
  const candidatesForTitle = candidateBank[job.title];
  if (candidatesForTitle) {
    return candidatesForTitle.map((candidate, index) =>
      enrichCandidate(
        {
          ...candidate,
          appliedDate: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          pipelineStage: index === 1 ? "shortlisted" : index === 2 ? "interviewing" : "applied",
        },
        index,
      ),
    );
  }

  const generated = [
    { name: "Sarah Jenkins", title: `Lead ${job.title}`, location: "Austin, TX" },
    { name: "Marcus Johnson", title: job.title, location: job.location === "Remote" ? "Chicago, IL" : job.location },
    { name: "Elena Rostova", title: `Junior ${job.title}`, location: "Remote" },
  ];

  return generated.map((candidate, index) => {
    const matchingSkills = job.tags.slice(0, index === 0 ? 4 : index === 1 ? 2 : 1);
    const allSkills = [...new Set([...matchingSkills, "Git", "REST APIs", "Agile", "Communication"])];
    return enrichCandidate(
      {
        id: `gen-${job.id}-${index}`,
        name: candidate.name,
        title: candidate.title,
        location: candidate.location,
        appliedDate: new Date(Date.now() - (index + 2) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        email: `${candidate.name.toLowerCase().replace(" ", ".")}@example.com`,
        phone: `+1 (555) 321-432${index}`,
        bio: `Experienced specialist in ${job.title.toLowerCase()} with strong collaboration habits and a track record of delivering reliable work.`,
        experienceYears: 6 - index * 2,
        skills: allSkills,
        education: index === 0 ? "M.S. in Computer Science, MIT" : "B.S. in Computer Science, University of Illinois",
        linkedin: `linkedin.com/in/${candidate.name.toLowerCase().replace(" ", "-")}`,
        github: `github.com/${candidate.name.toLowerCase().replace(" ", "")}`,
        pipelineStage: index === 0 ? "shortlisted" : "applied",
      },
      index,
    );
  });
}

export function saveApplicantsForJob(jobId: string, applicants: CandidateProfile[]) {
  localStorage.setItem(applicantStorageKey(jobId), JSON.stringify(applicants));
}

export function getApplicantsForJob(job: EmployerJob): CandidateProfile[] {
  const key = applicantStorageKey(job.id);
  const saved = localStorage.getItem(key);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const enriched = parsed.map((candidate, index) => enrichCandidate(candidate, index));
        saveApplicantsForJob(job.id, enriched);
        return enriched;
      }
    } catch {
      // Fall back to generated demo applicants below.
    }
  }

  const generated = generateApplicants(job);
  saveApplicantsForJob(job.id, generated);
  return generated;
}

export function getApplicantsByJob(jobs: EmployerJob[]) {
  return jobs.reduce<Record<string, CandidateProfile[]>>((acc, job) => {
    acc[job.id] = getApplicantsForJob(job);
    return acc;
  }, {});
}

export function updateApplicantPipelineStage(jobId: string, applicants: CandidateProfile[], applicantId: string, stage: ApplicantPipelineStage) {
  const next = applicants.map((candidate) =>
    candidate.id === applicantId
      ? { ...candidate, pipelineStage: stage, screeningStatus: syncScreeningStatus(stage) }
      : candidate,
  );
  saveApplicantsForJob(jobId, next);
  return next;
}

export function updateApplicantRating(jobId: string, applicants: CandidateProfile[], applicantId: string, rating: number) {
  const next = applicants.map((candidate) => (candidate.id === applicantId ? { ...candidate, rating } : candidate));
  saveApplicantsForJob(jobId, next);
  return next;
}

export function updateApplicantNote(jobId: string, applicants: CandidateProfile[], applicantId: string, note: string) {
  const next = applicants.map((candidate) => (candidate.id === applicantId ? { ...candidate, note } : candidate));
  saveApplicantsForJob(jobId, next);
  return next;
}
