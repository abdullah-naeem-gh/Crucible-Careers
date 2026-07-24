import { CandidateProfile, ApplicantPipelineStage, ScreeningStatus } from "@/types/employer/applicant";
import { EmployerJob } from "@/types/employer/job";

export function getPipelineStage(candidate: Pick<CandidateProfile, "pipelineStage" | "screeningStatus">): ApplicantPipelineStage {
  if (candidate.pipelineStage) return candidate.pipelineStage;
  if (candidate.screeningStatus === "shortlisted") return "shortlisted";
  if (candidate.screeningStatus === "rejected") return "rejected";
  return "applied";
}

function syncScreeningStatus(stage: ApplicantPipelineStage): ScreeningStatus | undefined {
  if (stage === "applied") return undefined;
  if (stage === "rejected") return "rejected";
  return "shortlisted";
}

async function patchApplicant(applicantId: string, patch: { status?: ApplicantPipelineStage; rating?: number | null; note?: string | null }) {
  try {
    await fetch(`/api/employer/applicants/${applicantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  } catch (err) {
    console.error("Failed to update applicant", err);
  }
}

export async function getApplicantsForJob(job: EmployerJob): Promise<CandidateProfile[]> {
  try {
    const res = await fetch(`/api/employer/jobs/${job.id}/applicants`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to load applicants", err);
    return [];
  }
}

export async function getApplicantsByJob(jobs: EmployerJob[]): Promise<Record<string, CandidateProfile[]>> {
  const entries = await Promise.all(jobs.map(async (job) => [job.id, await getApplicantsForJob(job)] as const));
  return Object.fromEntries(entries);
}

export function updateApplicantPipelineStage(jobId: string, applicants: CandidateProfile[], applicantId: string, stage: ApplicantPipelineStage) {
  const next = applicants.map((candidate) =>
    candidate.id === applicantId
      ? { ...candidate, pipelineStage: stage, screeningStatus: syncScreeningStatus(stage) }
      : candidate,
  );
  patchApplicant(applicantId, { status: stage });
  return next;
}

export function updateApplicantRating(jobId: string, applicants: CandidateProfile[], applicantId: string, rating: number) {
  const next = applicants.map((candidate) => (candidate.id === applicantId ? { ...candidate, rating } : candidate));
  patchApplicant(applicantId, { rating });
  return next;
}

export function updateApplicantNote(jobId: string, applicants: CandidateProfile[], applicantId: string, note: string) {
  const next = applicants.map((candidate) => (candidate.id === applicantId ? { ...candidate, note } : candidate));
  patchApplicant(applicantId, { note });
  return next;
}
