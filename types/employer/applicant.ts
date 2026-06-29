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
}
