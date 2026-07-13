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
  IconExternalLink,
  IconVideo,
} from "@tabler/icons-react";
import { EmployerJob } from "@/components/employer/dashboard/OverviewTab";
import type { CandidateProfile, ScreeningStatus } from "@/types/employer/applicant";

type EmailAudience = "all" | "shortlisted" | "rejected" | "manual";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  custom?: boolean;
}

const surface = "rounded-[24px] border border-white/[0.07] bg-[#171717] shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)]";
const insetSurface = "rounded-2xl border border-white/[0.065] bg-[#141414] shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2),inset_-1px_-1px_3px_rgba(255,255,255,0.025)]";

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
    case "rating-desc":
      return "Rating: High-Low";
    case "rating-asc":
      return "Rating: Low-High";
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
  const [noteText, setNoteText] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  useEffect(() => {
    setNoteText(selectedApplicant?.note || "");
  }, [selectedApplicant]);
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
    if (ratingFilter !== "all") count++;
    return count;
  }, [expFilter, atsFilter, locationFilter, ratingFilter]);

  const job = useMemo(() => jobs.find((j) => j.id === jobId) || null, [jobs, jobId]);

  // Load applicants
  useEffect(() => {
    if (!job) return;
    fetch(`/api/employer/jobs/${jobId}/applicants`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: CandidateProfile[]) => {
        setApplicants(data);
        setSelectedApplicant(data[0] || null);
      })
      .catch((err) => console.error("Failed to load applicants", err));
  }, [jobId, job]);

  const patchApplicant = async (applicantId: string, patch: { status?: string; rating?: number | null; note?: string | null }) => {
    try {
      await fetch(`/api/employer/applicants/${applicantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch (err) {
      console.error("Failed to update applicant", err);
    }
  };

  const screeningStatusToDbStatus = (status?: ScreeningStatus): string =>
    status === "shortlisted" ? "Under Review" : status === "rejected" ? "Rejected" : "Applied";

  const handleSaveRating = (applicantId: string, rating: number) => {
    setApplicants((current) => current.map((app) => (app.id === applicantId ? { ...app, rating } : app)));
    setSelectedApplicant((curr) => (curr?.id === applicantId ? { ...curr, rating } : curr));
    patchApplicant(applicantId, { rating });
  };

  const handleSaveNote = (applicantId: string, note: string) => {
    setApplicants((current) => current.map((app) => (app.id === applicantId ? { ...app, note } : app)));
    setSelectedApplicant((curr) => (curr?.id === applicantId ? { ...curr, note } : curr));
    patchApplicant(applicantId, { note });
  };

  const setApplicantStatus = (applicantId: string, status: ScreeningStatus) => {
    const current = applicants.find((a) => a.id === applicantId);
    const nextStatus = (current?.screeningStatus || "unscreened") === status ? undefined : status;

    setApplicants((prev) =>
      prev.map((applicant) => (applicant.id === applicantId ? { ...applicant, screeningStatus: nextStatus } : applicant))
    );
    setSelectedApplicant((curr) => (curr?.id === applicantId ? { ...curr, screeningStatus: nextStatus } : curr));

    patchApplicant(applicantId, { status: screeningStatusToDbStatus(nextStatus) });
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
      const score = applicant.atsScore ?? 0;
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

    const newlyShortlisted = nextApplicants.filter((applicant, index) =>
      applicant.screeningStatus === "shortlisted" && applicants[index]?.screeningStatus !== "shortlisted"
    );

    setApplicants(nextApplicants);
    setSelectedApplicant((current) =>
      current ? nextApplicants.find((applicant) => applicant.id === current.id) || current : current
    );
    setShowAutoShortlist(false);

    newlyShortlisted.forEach((applicant) => patchApplicant(applicant.id, { status: "Under Review" }));
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
        const score = a.atsScore ?? 0;
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

        // Rating filter
        let matchesRating = true;
        if (ratingFilter !== "all") {
          const rating = a.rating || 0;
          if (ratingFilter === "unrated") {
            matchesRating = rating === 0;
          } else {
            const minStars = parseInt(ratingFilter, 10);
            matchesRating = rating >= minStars;
          }
        }

        return matchesQuery && matchesExp && matchesAts && matchesLocation && matchesStatus && matchesRating;
      })
      .sort((a, b) => {
        const scoreA = a.atsScore ?? 0;
        const scoreB = b.atsScore ?? 0;

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
          case "rating-desc":
            return (b.rating || 0) - (a.rating || 0);
          case "rating-asc":
            return (a.rating || 0) - (b.rating || 0);
          default:
            return 0;
        }
      });
  }, [applicants, searchQuery, statusFilters, expFilter, atsFilter, locationFilter, ratingFilter, sortBy, job]);

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
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3.5 sm:grid-cols-4">
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

                  {/* Rating filter */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/35 mb-1.5 font-medium">Consider Rating</label>
                    <select
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.08] bg-[#121212] px-2.5 py-1.5 text-xs text-white/65 outline-none cursor-pointer focus:border-orange-500/40"
                    >
                      <option value="all">All Ratings</option>
                      <option value="5">5 Stars only</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="2">2+ Stars</option>
                      <option value="1">1+ Stars</option>
                      <option value="unrated">Unrated</option>
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
                      <option value="rating-desc">Rating: High-Low</option>
                      <option value="rating-asc">Rating: Low-High</option>
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
              const score = applicant.atsScore ?? 0;
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
                          </div>
                        </div>
                      </div>
                      <p className="mt-1 truncate text-sm text-white/60">{applicant.title}</p>

                      {applicant.rating && applicant.rating > 0 ? (
                        <div className="flex items-center gap-0.5 text-amber-400 mt-1">
                          {Array.from({ length: applicant.rating }).map((_, i) => (
                            <span key={i} className="text-xs">★</span>
                          ))}
                        </div>
                      ) : null}

                      {applicant.note ? (
                        <p className="mt-1 text-[11px] text-[#FF914D] italic truncate">
                          Note: {applicant.note}
                        </p>
                      ) : null}
                      
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
                    (selectedApplicant.atsScore ?? 0) >= 85
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : (selectedApplicant.atsScore ?? 0) >= 70
                      ? "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300"
                      : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
                  }`}>
                    ATS Match: {selectedApplicant.atsScore ?? 0}%
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

            {/* Rating and custom notes panel */}
            <div className="rounded-2xl border border-white/[0.065] bg-[#141414] p-4 shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Recruiter Evaluation</span>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleSaveRating(selectedApplicant.id, star)}
                      className="text-lg hover:scale-110 transition-transform cursor-pointer"
                    >
                      {star <= (selectedApplicant.rating || 0) ? "★" : "☆"}
                    </button>
                  ))}
                  {(selectedApplicant.rating || 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => handleSaveRating(selectedApplicant.id, 0)}
                      className="text-[10px] text-white/35 hover:text-white ml-2 underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={100}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onBlur={() => handleSaveNote(selectedApplicant.id, noteText)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveNote(selectedApplicant.id, noteText);
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  placeholder="Add a quick note about this candidate (max 100 chars)..."
                  className="w-full rounded-xl border border-white/[0.08] bg-[#121212] px-3 py-2 text-xs text-white outline-none placeholder:text-white/20 focus:border-orange-500/45 focus:ring-2 focus:ring-orange-500/10"
                />
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

            {/* Custom form answers section */}
            {selectedApplicant.customAnswers && selectedApplicant.customAnswers.length > 0 && (
              <div className="border-t border-white/[0.07] pt-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Questionnaire Answers</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {selectedApplicant.customAnswers.map((ans) => (
                    <div key={ans.fieldId} className={`${insetSurface} p-4 sm:col-span-2`}>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/35 mb-1">{ans.label}</div>
                      <div className="text-sm font-medium text-white/80 whitespace-pre-line">
                        {typeof ans.value === "boolean"
                          ? ans.value
                            ? "Yes"
                            : "No"
                          : Array.isArray(ans.value)
                          ? ans.value.join(", ")
                          : ans.value || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work History */}
            {selectedApplicant.experience && selectedApplicant.experience.length > 0 && (
              <div className="border-t border-white/[0.07] pt-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Work Experience</h3>
                <div className="space-y-3">
                  {selectedApplicant.experience.map((exp) => (
                    <div key={exp.id} className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <h4 className="text-sm font-bold text-white/90">{exp.role}</h4>
                        <span className="text-[10px] text-[#FF914D] font-semibold bg-orange-500/10 px-2 py-0.5 rounded">
                          {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      <div className="text-xs text-white/50 font-medium mt-0.5">{exp.company}</div>
                      {exp.description && (
                        <p className="text-xs text-white/40 mt-2 leading-relaxed whitespace-pre-line">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education History */}
            {selectedApplicant.educationList && selectedApplicant.educationList.length > 0 && (
              <div className="border-t border-white/[0.07] pt-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Education</h3>
                <div className="space-y-3">
                  {selectedApplicant.educationList.map((edu) => (
                    <div key={edu.id} className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <h4 className="text-sm font-bold text-white/90">{edu.degree}</h4>
                        {(edu.startYear || edu.endYear) && (
                          <span className="text-[10px] text-white/45 font-medium">
                            {edu.startYear} - {edu.endYear}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-white/55 mt-0.5">{edu.school}</div>
                      {edu.field && <div className="text-[11px] text-white/40">Field: {edu.field}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Proofs */}
            {selectedApplicant.projects && selectedApplicant.projects.length > 0 && (
              <div className="border-t border-white/[0.07] pt-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Project Proofs</h3>
                <div className="space-y-3">
                  {selectedApplicant.projects.map((proj) => (
                    <div key={proj.id} className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-white/90">{proj.title}</h4>
                        {proj.link && (
                          <a
                            href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-[#FF914D] hover:underline"
                          >
                            View link <IconExternalLink size={10} />
                          </a>
                        )}
                      </div>
                      {proj.description && (
                        <p className="text-xs text-white/40 mt-1.5 leading-relaxed">
                          {proj.description}
                        </p>
                      )}
                      {proj.videoUrl && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-sky-400 bg-sky-500/5 border border-sky-500/10 p-2 rounded-lg">
                          <IconVideo size={13} />
                          <span className="font-medium">Video proof:</span>
                          <a
                            href={proj.videoUrl.startsWith('http') ? proj.videoUrl : `https://${proj.videoUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            Watch demo video
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
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

