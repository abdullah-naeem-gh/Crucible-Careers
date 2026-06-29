"use client";

import React, { useState } from "react";
import { EmployerJob, JobType, JobStatus, FormConfig } from "@/types/employer/job";
import FormBuilder from "./FormBuilder";
import { FORM_TEMPLATES } from "@/lib/shared/formTemplates";

interface JobFormProps {
  defaultCompany: string;
  onSubmit: (job: Omit<EmployerJob, "id" | "postedAt" | "applications" | "views" | "matchScore">) => void;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-white/50">{label}</label>
      {children}
    </div>
  );
}

export default function JobForm({ defaultCompany, onSubmit }: JobFormProps) {
  // Navigation steps
  const [activeStep, setActiveStep] = useState<"details" | "form">("details");

  // Step 1 states: Role Details
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState(defaultCompany);
  const [location, setLocation] = useState("Remote");
  const [type, setType] = useState<JobType>("Full-time");
  const [status, setStatus] = useState<JobStatus>("Draft");
  const [currency, setCurrency] = useState("PKR");
  const [salary, setSalary] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requirements, setRequirements] = useState("");

  // Step 2 states: Form Builder config
  const [formConfig, setFormConfig] = useState<FormConfig>(
    FORM_TEMPLATES.find((t) => t.id === "engineering") || FORM_TEMPLATES[0]
  );

  const fieldClass = "w-full rounded-xl border border-white/[0.08] bg-[#121212] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-orange-500/45 focus:ring-2 focus:ring-orange-500/10";
  const labelClass = "mb-1.5 block text-xs font-medium text-white/50";

  const reset = () => {
    setTitle("");
    setCompany(defaultCompany);
    setLocation("Remote");
    setType("Full-time");
    setStatus("Draft");
    setCurrency("PKR");
    setSalary("");
    setTags("");
    setDescription("");
    setResponsibilities("");
    setRequirements("");
    setFormConfig(FORM_TEMPLATES.find((t) => t.id === "engineering") || FORM_TEMPLATES[0]);
    setActiveStep("details");
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (activeStep === "details") {
      // Validate step 1 and proceed to step 2
      if (!title.trim()) return;
      setActiveStep("form");
      return;
    }

    // Submit full job payload
    onSubmit({
      title,
      company,
      location,
      type,
      status,
      salary: salary ? `${currency} ${salary}` : undefined,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      description,
      responsibilities: responsibilities.split("\n").map((item) => item.trim()).filter(Boolean),
      requirements: requirements.split("\n").map((item) => item.trim()).filter(Boolean),
      formConfig,
    });
    reset();
  };

  return (
    <div className="space-y-5">
      {/* Wizard Step Indicators */}
      <div className="flex border-b border-white/[0.07] pb-2">
        <button
          type="button"
          onClick={() => setActiveStep("details")}
          className={`flex-1 pb-2 text-center text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
            activeStep === "details" ? "border-orange-500 text-orange-400" : "border-transparent text-white/30 hover:text-white"
          }`}
        >
          1. Role Details
        </button>
        <button
          type="button"
          onClick={() => {
            if (title.trim()) {
              setActiveStep("form");
            }
          }}
          disabled={!title.trim()}
          className={`flex-1 pb-2 text-center text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 disabled:opacity-30 disabled:cursor-not-allowed ${
            activeStep === "form" ? "border-orange-500 text-orange-400" : "border-transparent text-white/30 hover:text-white"
          }`}
        >
          2. Candidates Questionnaire
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {activeStep === "details" ? (
          /* Step 1: Role Details Fields */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Job title</label>
              <input required value={title} onChange={(event) => setTitle(event.target.value)} className={fieldClass} placeholder="e.g., Senior Frontend Engineer" />
            </div>
            <FormField label="Company"><input value={company} onChange={(event) => setCompany(event.target.value)} className={fieldClass} /></FormField>
            <FormField label="Location"><input value={location} onChange={(event) => setLocation(event.target.value)} className={fieldClass} placeholder="Remote / City, Country" /></FormField>
            <FormField label="Type">
              <select value={type} onChange={(event) => setType(event.target.value as JobType)} className={`${fieldClass} cursor-pointer`}>
                {(["Full-time", "Part-time", "Contract", "Internship"] as JobType[]).map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
            <FormField label="Status">
              <select value={status} onChange={(event) => setStatus(event.target.value as JobStatus)} className={`${fieldClass} cursor-pointer`}>
                {(["Draft", "Active", "Paused", "Closed"] as JobStatus[]).map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
            <FormField label="Currency">
              <select value={currency} onChange={(event) => setCurrency(event.target.value)} className={`${fieldClass} cursor-pointer`}>
                {["USD", "EUR", "GBP", "PKR", "CAD", "AUD"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
            <FormField label="Salary"><input value={salary} onChange={(event) => setSalary(event.target.value)} className={fieldClass} placeholder="120k - 150k" /></FormField>
            <div className="sm:col-span-2">
              <label className={labelClass}>Tags (comma separated)</label>
              <input value={tags} onChange={(event) => setTags(event.target.value)} className={fieldClass} placeholder="React, TypeScript, Node.js" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Short description</label>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} className={fieldClass} placeholder="What makes this role exciting?" />
            </div>
            <FormField label="Responsibilities (one per line)">
              <textarea value={responsibilities} onChange={(event) => setResponsibilities(event.target.value)} rows={3} className={fieldClass} />
            </FormField>
            <FormField label="Requirements (one per line)">
              <textarea value={requirements} onChange={(event) => setRequirements(event.target.value)} rows={3} className={fieldClass} />
            </FormField>
            <div className="flex justify-end gap-3 sm:col-span-2 pt-2">
              <button type="button" onClick={reset} className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-xs text-white/55 cursor-pointer hover:bg-white/[0.05] hover:text-white">Reset</button>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-5 py-2.5 text-xs font-semibold text-white cursor-pointer"
              >
                Next: Configure Application Form
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Form Builder integration */
          <div className="space-y-4">
            <FormBuilder value={formConfig} onChange={setFormConfig} />

            <div className="flex justify-between items-center border-t border-white/[0.07] pt-4">
              <button
                type="button"
                onClick={() => setActiveStep("details")}
                className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-xs text-white/55 cursor-pointer hover:bg-white/[0.05] hover:text-white"
              >
                Back to Details
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={reset} className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-xs text-white/55 cursor-pointer hover:bg-white/[0.05] hover:text-white">Reset</button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-5 py-2.5 text-xs font-semibold text-white cursor-pointer"
                >
                  {status === "Draft" ? "Save Draft Job" : "Publish Job Listing"}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
