import type { ApplicantPipelineStage } from '@/types/employer/applicant'

export const PIPELINE_STAGE_LABELS: Record<ApplicantPipelineStage, string> = {
  applied: 'Applied',
  shortlisted: 'Shortlisted',
  interviewing: 'Interviewing',
  offered: 'Offered',
  hired: 'Hired',
  feedback: 'Feedback',
  rejected: 'Rejected',
}

export function pipelineStageLabel(stage: string): string {
  return PIPELINE_STAGE_LABELS[stage as ApplicantPipelineStage] || stage
}
