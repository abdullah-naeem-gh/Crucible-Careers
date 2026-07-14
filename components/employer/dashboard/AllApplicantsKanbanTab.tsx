"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconBriefcase,
  IconBrandGithub,
  IconBrandLinkedin,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconExternalLink,
  IconGripVertical,
  IconMail,
  IconMapPin,
  IconPhone,
  IconSchool,
  IconSearch,
  IconUsers,
  IconVideo,
  IconWorld,
  IconX,
} from "@tabler/icons-react";
import { EmployerJob } from "@/types/employer/job";
import { ApplicantPipelineStage, CandidateProfile } from "@/types/employer/applicant";
import {
  calculateAtsScore,
  getApplicantsForJob,
  getPipelineStage,
  updateApplicantNote,
  updateApplicantPipelineStage,
  updateApplicantRating,
} from "@/lib/employer/services/applicants.service";
import StartChatModal from "@/components/shared/chat/StartChatModal";
import { Skeleton } from "@/components/ui/Skeleton";

const surface = "rounded-[24px] border border-white/[0.07] bg-[#171717] shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)]";
const insetSurface = "rounded-2xl border border-white/[0.065] bg-[#141414] shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2),inset_-1px_-1px_3px_rgba(255,255,255,0.025)]";

const STAGES: Array<{ key: ApplicantPipelineStage; label: string; accent: string; description: string }> = [
  { key: "applied", label: "Applied", accent: "text-sky-300", description: "New applicants awaiting review" },
  { key: "shortlisted", label: "Shortlisted", accent: "text-emerald-300", description: "Strong profiles ready for next step" },
  { key: "interviewing", label: "Interviewing", accent: "text-violet-300", description: "Candidates in active loops" },
  { key: "offered", label: "Offered", accent: "text-amber-300", description: "Offers extended" },
  { key: "hired", label: "Hired", accent: "text-green-300", description: "Accepted candidates" },
  { key: "feedback", label: "Feedback", accent: "text-cyan-300", description: "Waiting for panel feedback" },
  { key: "rejected", label: "Rejected", accent: "text-red-300", description: "No longer moving forward" },
];

const DEFAULT_VISIBLE_STAGES: ApplicantPipelineStage[] = ["applied", "shortlisted", "interviewing", "offered", "hired"];

interface AllApplicantsKanbanTabProps {
  jobs: EmployerJob[];
  initialJobId?: string | null;
  initialStage?: ApplicantPipelineStage | null;
  onJobChange?: (jobId: string) => void;
  /** Called when user wants to navigate to Messages tab after starting a chat */
  onOpenMessages?: () => void;
  jobsLoading?: boolean;
}

export default function AllApplicantsKanbanTab({ jobs, initialJobId, initialStage, onJobChange, onOpenMessages, jobsLoading = false }: AllApplicantsKanbanTabProps) {
  const firstJobId = jobs[0]?.id ?? "";
  const [selectedJobId, setSelectedJobId] = useState(initialJobId && jobs.some((job) => job.id === initialJobId) ? initialJobId : firstJobId);
  const [visibleStages, setVisibleStages] = useState<ApplicantPipelineStage[]>(
    initialStage && STAGES.some((stage) => stage.key === initialStage) ? [initialStage] : DEFAULT_VISIBLE_STAGES,
  );
  const [applicants, setApplicants] = useState<CandidateProfile[]>([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(true);
  const isLoading = jobsLoading || isLoadingApplicants;
  const [selectedApplicant, setSelectedApplicant] = useState<CandidateProfile | null>(null);
  const [chatModal, setChatModal] = useState<{ applicant: CandidateProfile; job: EmployerJob } | null>(null);
  const [draggedApplicantId, setDraggedApplicantId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<ApplicantPipelineStage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [noteText, setNoteText] = useState("");

  const selectedJob = useMemo(() => jobs.find((job) => job.id === selectedJobId) ?? null, [jobs, selectedJobId]);

  useEffect(() => {
    if (initialJobId && jobs.some((job) => job.id === initialJobId)) setSelectedJobId(initialJobId);
  }, [initialJobId, jobs]);

  useEffect(() => {
    if (initialStage && STAGES.some((stage) => stage.key === initialStage)) setVisibleStages([initialStage]);
  }, [initialStage]);

  useEffect(() => {
    if (!selectedJob) {
      setApplicants([]);
      setIsLoadingApplicants(false);
      return;
    }
    let cancelled = false;
    setIsLoadingApplicants(true);
    getApplicantsForJob(selectedJob).then((data) => {
      if (!cancelled) setApplicants(data);
    }).finally(() => {
      if (!cancelled) setIsLoadingApplicants(false);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedJob]);

  useEffect(() => setNoteText(selectedApplicant?.note ?? ""), [selectedApplicant]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedApplicant(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredApplicants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return applicants;
    return applicants.filter((candidate) => [candidate.name, candidate.title, candidate.location, candidate.email, candidate.skills.join(" ")].join(" ").toLowerCase().includes(query));
  }, [applicants, searchQuery]);

  const stageCounts = useMemo(() => STAGES.reduce<Record<ApplicantPipelineStage, number>>((acc, stage) => {
    acc[stage.key] = applicants.filter((candidate) => getPipelineStage(candidate) === stage.key).length;
    return acc;
  }, {} as Record<ApplicantPipelineStage, number>), [applicants]);

  const selectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setSelectedApplicant(null);
    onJobChange?.(jobId);
  };

  const moveApplicant = (applicantId: string, stage: ApplicantPipelineStage) => {
    if (!selectedJob) return;
    const next = updateApplicantPipelineStage(selectedJob.id, applicants, applicantId, stage);
    setApplicants(next);
    setSelectedApplicant((current) => (current?.id === applicantId ? next.find((candidate) => candidate.id === applicantId) ?? current : current));
  };

  const saveRating = (applicantId: string, rating: number) => {
    if (!selectedJob) return;
    const next = updateApplicantRating(selectedJob.id, applicants, applicantId, rating);
    setApplicants(next);
    setSelectedApplicant((current) => (current?.id === applicantId ? next.find((candidate) => candidate.id === applicantId) ?? current : current));
  };

  const saveNote = (applicantId: string, note: string) => {
    if (!selectedJob) return;
    const next = updateApplicantNote(selectedJob.id, applicants, applicantId, note);
    setApplicants(next);
    setSelectedApplicant((current) => (current?.id === applicantId ? next.find((candidate) => candidate.id === applicantId) ?? current : current));
  };

  const toggleStage = (stage: ApplicantPipelineStage) => {
    setVisibleStages((current) => {
      if (current.includes(stage)) return current.length === 1 ? current : current.filter((item) => item !== stage);
      return STAGES.map((item) => item.key).filter((item) => [...current, stage].includes(item));
    });
  };

  if (!jobsLoading && !jobs.length) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`${surface} grid h-full place-items-center p-8 text-center`}>
        <div>
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-[#FF914D]"><IconBriefcase size={26} /></div>
          <h1 className="text-xl font-semibold text-white">No jobs available</h1>
          <p className="mt-2 text-sm text-white/40">Create a job listing before managing applicants in Kanban view.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: "easeOut" }} className="h-full">
      <section className={`${surface} flex h-full min-h-[36rem] flex-col overflow-hidden`}>
        <div className="kanban-header border-b border-white/[0.07] p-4 lg:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#FF914D]">Recruitment Pipeline</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">All Applicants</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/45">Move candidates from first application to hire with a focused Kanban board for each role.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="kanban-stat rounded-2xl border px-3 py-2.5 text-right shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2)]">
                    <Skeleton className="ml-auto h-5 w-8 rounded" />
                    <Skeleton className="mt-1.5 ml-auto h-2.5 w-12 rounded" />
                  </div>
                ))
              ) : (
                <>
                  <MiniStat label="Applicants" value={applicants.length} />
                  <MiniStat label="Active" value={applicants.length - (stageCounts.rejected ?? 0)} />
                  <MiniStat label="Offers" value={stageCounts.offered ?? 0} />
                  <MiniStat label="Hired" value={stageCounts.hired ?? 0} />
                </>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(14rem,19rem)_minmax(13rem,17rem)_minmax(13rem,17rem)]">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/35">Job</label>
              <KanbanSelect
                value={selectedJobId}
                options={jobs.map((job) => ({ value: job.id, label: job.title }))}
                onChange={selectJob}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/35">Filters</label>
              <StageVisibilityDropdown
                stages={STAGES}
                visibleStages={visibleStages}
                stageCounts={stageCounts}
                onToggle={toggleStage}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/35">Search</label>
              <div className="relative">
                <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Name, skill, title..." className="h-10 w-full rounded-xl border border-white/[0.08] bg-[#121212] py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-orange-500/45 focus:ring-2 focus:ring-orange-500/10" />
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden p-3 custom-scrollbar lg:p-4">
          <div className="flex h-full min-w-max gap-3">
            {STAGES.filter((stage) => visibleStages.includes(stage.key)).map((stage) => {
              const candidates = filteredApplicants.filter((candidate) => getPipelineStage(candidate) === stage.key);
              const isDragTarget = dragOverStage === stage.key;
              return (
                <section key={stage.key} onDragOver={(event) => { event.preventDefault(); setDragOverStage(stage.key); }} onDragLeave={() => setDragOverStage(null)} onDrop={(event) => { event.preventDefault(); const applicantId = event.dataTransfer.getData("text/plain") || draggedApplicantId; if (applicantId) moveApplicant(applicantId, stage.key); setDraggedApplicantId(null); setDragOverStage(null); }} className={`kanban-column flex h-full w-[16.75rem] flex-col rounded-[20px] border p-2.5 transition-all ${isDragTarget ? "border-orange-500/45 bg-orange-500/[0.07] shadow-[0_0_0_2px_rgba(255,107,0,0.08)]" : "border-white/[0.065]"}`}>
                  <div className="mb-3 flex items-start justify-between gap-3 px-1">
                    <div><div className={`kanban-stage-title text-sm font-bold ${stage.accent}`}>{stage.label}</div><div className="mt-1 text-[10px] leading-snug text-white/30">{stage.description}</div></div>
                    <span className="rounded-full border border-white/[0.07] bg-white/[0.035] px-2 py-0.5 text-xs font-semibold text-white/45">{candidates.length}</span>
                  </div>
                  <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-1 py-1 custom-scrollbar">
                    {isLoading ? (
                      Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="kanban-card w-full rounded-2xl border p-3">
                          <div className="flex items-start gap-2.5">
                            <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                            <div className="min-w-0 flex-1">
                              <Skeleton className="h-3.5 w-3/5 rounded" />
                              <Skeleton className="mt-1.5 h-3 w-2/5 rounded" />
                            </div>
                          </div>
                          <Skeleton className="mt-2.5 h-5 w-full rounded-lg" />
                        </div>
                      ))
                    ) : candidates.length ? candidates.map((candidate) => (
                      <ApplicantKanbanCard key={candidate.id} candidate={candidate} job={selectedJob} onOpen={() => setSelectedApplicant(candidate)} onDragStart={(event) => { setDraggedApplicantId(candidate.id); event.dataTransfer.setData("text/plain", candidate.id); }} onDragEnd={() => { setDraggedApplicantId(null); setDragOverStage(null); }} />
                    )) : (
                      <div className="kanban-empty grid min-h-[9rem] place-items-center rounded-2xl border border-dashed p-3 text-center"><div><div className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full bg-white/[0.035] text-white/20"><IconUsers size={17} /></div><p className="text-xs font-medium text-white/45">No candidates</p><p className="mt-1 text-[10px] text-white/25">Drop a card here or move from the slide-over.</p></div></div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <AnimatePresence>{selectedApplicant && selectedJob && <CandidateSlideOver candidate={selectedApplicant} job={selectedJob} visibleStages={visibleStages} onClose={() => setSelectedApplicant(null)} onMove={moveApplicant} noteText={noteText} onNoteTextChange={setNoteText} onSaveNote={saveNote} onSaveRating={saveRating} onMessageApplicant={(applicant, job) => setChatModal({ applicant, job })} />}</AnimatePresence>
      {chatModal && (
        <StartChatModal
          isOpen={true}
          onClose={() => setChatModal(null)}
          onSuccess={() => { setChatModal(null); onOpenMessages?.() }}
          applicationId={chatModal.applicant.id}
          jobId={chatModal.job.id}
          jobTitle={chatModal.job.title}
          companyName={chatModal.job.company || "Your Company"}
          talentName={chatModal.applicant.name}
          talentEmail={chatModal.applicant.email}
          initiatedBy="employer"
          isDark={true}
        />
      )}
    </motion.div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return <div className="kanban-stat rounded-2xl border px-3 py-2.5 text-right shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2)]"><div className="text-base font-bold text-white">{value}</div><div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/35">{label}</div></div>;
}

function ApplicantKanbanCard({ candidate, job, onOpen, onDragStart, onDragEnd }: { candidate: CandidateProfile; job: EmployerJob | null; onOpen: () => void; onDragStart: (event: React.DragEvent<HTMLButtonElement>) => void; onDragEnd: () => void; }) {
  const score = candidate.atsScore ?? (job ? calculateAtsScore(candidate.skills, job.tags) : 75);
  return (
    <button type="button" draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onOpen} className="kanban-card group w-full rounded-2xl border p-3 text-left outline-none transition-all hover:-translate-y-px hover:border-orange-500/30 hover:shadow-[0_10px_24px_rgba(255,107,0,0.10)] focus:border-orange-500/45 cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF914D] text-xs font-bold text-white shadow-[0_8px_20px_rgba(255,107,0,0.18)]">{candidate.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
          <div className="min-w-0"><h3 className="truncate text-[13px] font-bold text-white group-hover:text-[#FF914D]">{candidate.name}</h3><p className="truncate text-xs text-white/45">{candidate.title}</p></div>
        </div>
        <IconGripVertical size={16} className="mt-1 shrink-0 text-white/20" />
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2 text-[10px]"><span className="rounded-lg border border-emerald-500/15 bg-emerald-500/10 px-2 py-1 font-semibold text-emerald-300">{score}% match</span><span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-white/45">{candidate.experienceYears} yrs exp</span></div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">{candidate.skills.slice(0, 3).map((skill) => <span key={skill} className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-[10px] text-white/45">{skill}</span>)}</div>
      <div className="mt-2.5 flex items-center justify-between gap-3 text-[10px] text-white/35"><span className="flex min-w-0 items-center gap-1 truncate"><IconMapPin size={12} />{candidate.location}</span><span className="flex shrink-0 items-center gap-1"><IconCalendar size={12} />{candidate.appliedDate}</span></div>
      {(candidate.rating || candidate.note) && <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/[0.045] pt-2"><span className="flex items-center gap-0.5 text-amber-400">{candidate.rating ? Array.from({ length: candidate.rating }).map((_, index) => <span key={index} className="text-[10px]">★</span>) : <span className="text-[10px] text-white/25">Unrated</span>}</span>{candidate.note && <span className="truncate text-[10px] italic text-[#FF914D]">Note saved</span>}</div>}
    </button>
  );
}

function CandidateSlideOver({ candidate, job, visibleStages, noteText, onClose, onMove, onNoteTextChange, onSaveNote, onSaveRating, onMessageApplicant }: { candidate: CandidateProfile; job: EmployerJob; visibleStages: ApplicantPipelineStage[]; noteText: string; onClose: () => void; onMove: (applicantId: string, stage: ApplicantPipelineStage) => void; onNoteTextChange: (value: string) => void; onSaveNote: (applicantId: string, note: string) => void; onSaveRating: (applicantId: string, rating: number) => void; onMessageApplicant: (applicant: CandidateProfile, job: EmployerJob) => void }) {
  const currentStage = getPipelineStage(candidate);
  const score = candidate.atsScore ?? calculateAtsScore(candidate.skills, job.tags);
  const stageOptions = STAGES.filter((stage) => visibleStages.includes(stage.key) || stage.key === currentStage || stage.key === "feedback" || stage.key === "rejected");
  const isActive = currentStage !== 'rejected';
  return (
    <motion.div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.aside role="dialog" aria-modal="true" aria-label={`${candidate.name} profile`} initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 260, damping: 30 }} onClick={(event) => event.stopPropagation()} className="ml-auto flex h-full w-full max-w-3xl flex-col border-l border-white/[0.08] bg-[#111111] shadow-[-30px_0_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] p-5">
          <div className="flex min-w-0 items-start gap-4"><div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF914D] text-xl font-bold text-white shadow-[0_8px_24px_rgba(255,107,0,0.24)]">{candidate.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FF914D]">{job.title}</p><h2 className="mt-1 truncate text-2xl font-bold text-white">{candidate.name}</h2><p className="truncate text-sm text-white/50">{candidate.title}</p><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">ATS Match: {score}%</span><span className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-[#FF914D]">{STAGES.find((stage) => stage.key === currentStage)?.label}</span></div></div></div>
          <div className="flex items-center gap-2 shrink-0">
            {isActive && (
              <button type="button" onClick={() => onMessageApplicant(candidate, job)} className="flex items-center gap-1.5 rounded-xl border border-[#FF6B00]/25 bg-[#FF6B00]/10 px-3 py-2 text-xs font-semibold text-[#FF914D] hover:bg-[#FF6B00]/20 transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Message
              </button>
            )}
            <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 text-white/45 hover:bg-white/[0.04] hover:text-white cursor-pointer" aria-label="Close profile"><IconX size={18} /></button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5 custom-scrollbar">
          <div className="mb-5 rounded-2xl border border-white/[0.065] bg-[#171717] p-4"><div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">Move candidate</div><div className="flex flex-wrap gap-2">{stageOptions.map((stage) => <button key={stage.key} type="button" onClick={() => onMove(candidate.id, stage.key)} className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${currentStage === stage.key ? "border-orange-500/45 bg-orange-500/15 text-[#FF914D]" : "border-white/[0.08] bg-white/[0.025] text-white/55 hover:border-orange-500/35 hover:text-white"}`}>{stage.label}</button>)}</div></div>
          <div className="grid grid-cols-1 gap-4 border-b border-white/[0.07] pb-5 sm:grid-cols-2"><QuickFact label="Email" value={candidate.email} icon={<IconMail size={15} />} /><QuickFact label="Phone" value={candidate.phone} icon={<IconPhone size={15} />} /><QuickFact label="Location" value={candidate.location} icon={<IconMapPin size={15} />} /><QuickFact label="Experience" value={`${candidate.experienceYears} Years`} icon={<IconBriefcase size={15} />} /><div className="sm:col-span-2"><QuickFact label="Education" value={candidate.education} icon={<IconSchool size={15} />} /></div></div>
          <div className="my-5 rounded-2xl border border-white/[0.065] bg-[#141414] p-4 shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2)]"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Recruiter Evaluation</span><div className="flex items-center gap-0.5 text-amber-400">{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" onClick={() => onSaveRating(candidate.id, star)} className="text-lg hover:scale-110 transition-transform cursor-pointer" aria-label={`Rate ${star} star`}>{star <= (candidate.rating || 0) ? "★" : "☆"}</button>)}{(candidate.rating || 0) > 0 && <button type="button" onClick={() => onSaveRating(candidate.id, 0)} className="ml-2 text-[10px] text-white/35 hover:text-white underline cursor-pointer">Clear</button>}</div></div><input type="text" maxLength={100} value={noteText} onChange={(event) => onNoteTextChange(event.target.value)} onBlur={() => onSaveNote(candidate.id, noteText)} onKeyDown={(event) => { if (event.key === "Enter") { onSaveNote(candidate.id, noteText); (event.target as HTMLInputElement).blur(); } }} placeholder="Add a quick note about this candidate..." className="mt-3 w-full rounded-xl border border-white/[0.08] bg-[#121212] px-3 py-2 text-xs text-white outline-none placeholder:text-white/20 focus:border-orange-500/45 focus:ring-2 focus:ring-orange-500/10" /></div>
          <ProfileSections candidate={candidate} job={job} />
        </div>
      </motion.aside>
    </motion.div>
  );
}

function QuickFact({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div className="flex items-start gap-2.5"><div className="flex h-7 w-5 shrink-0 items-center justify-center text-white/35">{icon}</div><div className="min-w-0 flex-1"><div className="text-[10px] uppercase tracking-wider text-white/35">{label}</div><div className="truncate text-xs font-medium text-white/70" title={value}>{value}</div></div></div>;
}

function ProfileSections({ candidate, job }: { candidate: CandidateProfile; job: EmployerJob }) {
  return (
    <div className="space-y-6">
      <section><h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Candidate Bio</h3><p className="text-sm leading-relaxed text-white/60">{candidate.bio}</p></section>
      <section><h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Skills & Competency</h3><div className="flex flex-wrap gap-2">{candidate.skills.map((skill) => { const isMatching = job.tags.some((tag) => tag.toLowerCase() === skill.toLowerCase()); return <span key={skill} className={`rounded-lg border px-2.5 py-1 text-xs ${isMatching ? "border-emerald-500/20 bg-emerald-500/10 font-medium text-emerald-300" : "border-white/[0.07] bg-white/[0.025] text-white/45"}`}>{skill} {isMatching && "✓"}</span>; })}</div></section>
      <section><h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Professional Links</h3><div className="flex flex-wrap gap-2">{candidate.linkedin && <ProfileLink href={candidate.linkedin} label="LinkedIn" icon={<IconBrandLinkedin size={14} />} className="text-sky-400" />}{candidate.github && <ProfileLink href={candidate.github} label="GitHub" icon={<IconBrandGithub size={14} />} className="text-white/60" />}{candidate.portfolio && <ProfileLink href={candidate.portfolio} label="Portfolio" icon={<IconWorld size={14} />} className="text-[#FF914D]" />}<a href={`mailto:${candidate.email}`} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-emerald-300 hover:bg-white/[0.05] transition-all"><IconMail size={14} /> Email</a></div></section>
      {candidate.customAnswers && candidate.customAnswers.length > 0 && <section className="border-t border-white/[0.07] pt-5"><h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Questionnaire Answers</h3><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{candidate.customAnswers.map((answer) => <div key={answer.fieldId} className={`${insetSurface} p-4 sm:col-span-2`}><div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">{answer.label}</div><div className="whitespace-pre-line text-sm font-medium text-white/80">{Array.isArray(answer.value) ? answer.value.join(", ") : String(answer.value || "-")}</div></div>)}</div></section>}
      {candidate.experience && candidate.experience.length > 0 && <TimelineSection title="Work Experience" items={candidate.experience.map((item) => ({ id: item.id, title: item.role, meta: item.company, range: `${item.startDate} - ${item.current ? "Present" : item.endDate}`, description: item.description }))} />}
      {candidate.educationList && candidate.educationList.length > 0 && <TimelineSection title="Education" items={candidate.educationList.map((item) => ({ id: item.id, title: item.degree, meta: item.school, range: `${item.startYear ?? ""} - ${item.endYear ?? ""}`, description: item.field }))} />}
      {candidate.projects && candidate.projects.length > 0 && <section className="border-t border-white/[0.07] pt-5"><h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Project Proofs</h3><div className="space-y-3">{candidate.projects.map((project) => <div key={project.id} className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-[13px] font-bold text-white/90">{project.title}</h4>{project.link && <ProfileLink href={project.link} label="View link" icon={<IconExternalLink size={10} />} className="text-[#FF914D]" />}</div>{project.description && <p className="mt-1.5 text-xs leading-relaxed text-white/40">{project.description}</p>}{project.videoUrl && <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-sky-500/10 bg-sky-500/5 p-2 text-xs text-sky-400"><IconVideo size={13} /> <span className="font-medium">Video proof:</span><a href={formatExternalHref(project.videoUrl)} target="_blank" rel="noopener noreferrer" className="hover:underline">Watch demo video</a></div>}</div>)}</div></section>}
    </div>
  );
}

function TimelineSection({ title, items }: { title: string; items: Array<{ id: string; title: string; meta: string; range: string; description?: string }> }) {
  return <section className="border-t border-white/[0.07] pt-5"><h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">{title}</h3><div className="space-y-3">{items.map((item) => <div key={item.id} className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-4"><div className="flex flex-wrap items-center justify-between gap-1"><h4 className="text-[13px] font-bold text-white/90">{item.title}</h4><span className="rounded bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-[#FF914D]">{item.range}</span></div><div className="mt-0.5 text-xs font-medium text-white/50">{item.meta}</div>{item.description && <p className="mt-2 text-xs leading-relaxed text-white/40">{item.description}</p>}</div>)}</div></section>;
}

function ProfileLink({ href, label, icon, className }: { href: string; label: string; icon: React.ReactNode; className: string }) {
  return <a href={formatExternalHref(href)} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs hover:bg-white/[0.05] transition-all ${className}`}>{icon}{label}</a>;
}

function KanbanSelect({ value, options, onChange }: { value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((current) => !current)} onBlur={() => setTimeout(() => setOpen(false), 120)} className="profile-select-trigger flex h-10 w-full items-center justify-between rounded-xl px-3.5 text-left text-sm font-medium shadow-sm outline-none transition-all focus:border-orange-500/45 focus:ring-2 focus:ring-orange-500/10">
        <span className="truncate">{selected?.label ?? "Select job"}</span>
        <IconChevronDown size={15} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.16, ease: "easeOut" }} className="profile-select-menu absolute left-0 right-0 top-[calc(100%+0.45rem)] z-40 max-h-72 overflow-auto rounded-xl p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.16)] custom-scrollbar">
            {options.map((option) => {
              const active = option.value === value;
              return (
                <button key={option.value} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { onChange(option.value); setOpen(false); }} className={`profile-select-option flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${active ? "profile-select-option-active" : ""}`}>
                  <span className="truncate">{option.label}</span>
                  {active && <IconCheck size={14} className="text-[#FF6B00]" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StageVisibilityDropdown({ stages, visibleStages, stageCounts, onToggle }: { stages: typeof STAGES; visibleStages: ApplicantPipelineStage[]; stageCounts: Record<ApplicantPipelineStage, number>; onToggle: (stage: ApplicantPipelineStage) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((current) => !current)} onBlur={() => setTimeout(() => setOpen(false), 120)} className="profile-select-trigger flex h-10 w-full items-center justify-between rounded-xl px-3.5 text-left text-sm font-medium shadow-sm outline-none transition-all focus:border-orange-500/45 focus:ring-2 focus:ring-orange-500/10">
        <span>{visibleStages.length} stages shown</span>
        <IconChevronDown size={15} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.16, ease: "easeOut" }} className="profile-select-menu absolute left-0 right-0 top-[calc(100%+0.45rem)] z-40 max-h-80 overflow-auto rounded-xl p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.16)] custom-scrollbar">
            {stages.map((stage) => {
              const checked = visibleStages.includes(stage.key);
              const disabled = checked && visibleStages.length === 1;
              return (
                <button key={stage.key} type="button" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={() => onToggle(stage.key)} className={`profile-select-option flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-45 ${checked ? "kanban-stage-option-checked" : ""}`}>
                  <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${checked ? "border-[#FF6B00] bg-[#FF6B00] text-white" : "border-gray-300 text-transparent"}`}><IconCheck size={11} /></span>
                  <span className="min-w-0 flex-1 truncate">{stage.label}</span>
                  <span className="rounded-md bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#FF914D]">{stageCounts[stage.key] ?? 0}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
function formatExternalHref(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:") ? href : `https://${href}`;
}
