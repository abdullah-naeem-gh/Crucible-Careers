import { SemanticType, EmployerJob } from "./job";

export type ScreeningStatus = "unscreened" | "shortlisted" | "rejected";

export type ApplicantPipelineStage =
  | "applied"
  | "shortlisted"
  | "interviewing"
  | "offered"
  | "hired"
  | "feedback"
  | "rejected";

export interface CustomAnswer {
  fieldId: string;
  label: string;
  value: any;
  semanticType: SemanticType;
}

export interface CandidateExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  description?: string;
}

export interface CandidateEducation {
  id: string;
  school: string;
  degree: string;
  field: string;
  startYear?: string;
  endYear?: string;
  description?: string;
}

export interface CandidateProject {
  id: string;
  title: string;
  link?: string;
  videoUrl?: string;
  description?: string;
}

export interface CandidateProfile {
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
  pipelineStage?: ApplicantPipelineStage;
  customAnswers?: CustomAnswer[];
  rating?: number;
  note?: string;
  atsScore?: number;
  experience?: CandidateExperience[];
  educationList?: CandidateEducation[];
  projects?: CandidateProject[];
}

export interface ApplicantsByJob {
  job: EmployerJob;
  applicants: CandidateProfile[];
}
