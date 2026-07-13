import { SemanticType } from "./job";

export type ScreeningStatus = "unscreened" | "shortlisted" | "rejected";

export interface CustomAnswer {
  fieldId: string;
  label: string;
  value: any;
  semanticType: SemanticType;
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
  customAnswers?: CustomAnswer[];
  rating?: number;
  note?: string;
  atsScore?: number;
  experience?: Array<{
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    current?: boolean;
    description?: string;
  }>;
  educationList?: Array<{
    id: string;
    school: string;
    degree: string;
    field: string;
    startYear?: string;
    endYear?: string;
    description?: string;
  }>;
  projects?: Array<{
    id: string;
    title: string;
    link?: string;
    videoUrl?: string;
    description?: string;
  }>;
}
