export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";
export type JobStatus = "Draft" | "Active" | "Paused" | "Closed";

export type FieldType =
  | "text"
  | "paragraph"
  | "select"
  | "multi-select"
  | "checkbox"
  | "radio"
  | "number"
  | "file";

export type SemanticType =
  | "name"
  | "email"
  | "phone"
  | "location"
  | "experience_years"
  | "skills"
  | "portfolio"
  | "linkedin"
  | "github"
  | "resume"
  | "cover_letter"
  | "custom";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, multi-select, checkbox, radio
  semanticType: SemanticType;
  importance?: "nice-to-have" | "required" | "critical";
  expectedAnswer?: string | string[] | boolean | number;
}

export interface FormConfig {
  id: string;
  name: string;
  fields: FormField[];
}

export interface EmployerJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  status: JobStatus;
  salary?: string;
  tags: string[];
  postedAt: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  applications: number;
  views: number;
  matchScore: number;
  formConfig?: FormConfig;
}
