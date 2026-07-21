"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EmployerJob, JobType, JobStatus, FormConfig } from "@/types/employer/job";
import FormBuilder from "./FormBuilder";
import { FORM_TEMPLATES } from "@/lib/shared/formTemplates";
import DarkSelect from "@/components/ui/DarkSelect";
import {
  IconBriefcase,
  IconMapPin,
  IconCoin,
  IconTags,
  IconFileDescription,
  IconListCheck,
  IconClipboardCheck,
  IconChevronRight,
  IconChevronLeft,
  IconRotate,
  IconSparkles,
  IconLoader2,
} from "@tabler/icons-react";

interface JobFormProps {
  defaultCompany?: string;
  initialData?: EmployerJob | null;
  onSubmit: (job: Omit<EmployerJob, "id" | "postedAt" | "applications" | "views" | "hires" | "matchScore">) => void;
}

// ─── Animation variants ────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};

const fieldAppear = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

// ─── Shared field classes ──────────────────────────────────────────────────────

const fieldClass =
  "w-full rounded-xl border border-white/[0.08] bg-[#121212] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-orange-500/45 focus:ring-2 focus:ring-orange-500/10 transition-all duration-200";
const labelClass =
  "mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40";

// ─── SVG decorative header for step 1 ──────────────────────────────────────────

function StepOneHeader() {
  return (
    <div className="relative flex items-center justify-center py-5 mb-2 overflow-visible">
      {/* Ambient glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="absolute flex items-center justify-center"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.18, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-24 h-24 rounded-full bg-orange-500 blur-2xl"
        />
      </motion.div>

      {/* Concentric ring */}
      <motion.svg
        className="absolute"
        width={120}
        height={120}
        viewBox="0 0 120 120"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <motion.circle
          cx={60}
          cy={60}
          r={55}
          fill="none"
          stroke="#FF6B00"
          strokeWidth={0.75}
          strokeOpacity={0.15}
          strokeDasharray="5 8"
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "60px 60px" }}
        />
      </motion.svg>

      {/* Central icon */}
      <motion.div
        initial={{ scale: 0, rotate: -12 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
        className="relative w-14 h-14"
      >
        {/* Pulse */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-orange-500"
          animate={{ scale: [1, 1.6], opacity: [0.25, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF914D] flex items-center justify-center shadow-[0_10px_28px_rgba(255,107,0,0.4)]">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Briefcase SVG that draws itself */}
            <motion.rect
              x="2"
              y="7"
              width="20"
              height="14"
              rx="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
            />
            <motion.path
              d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7, ease: "easeOut" }}
            />
            <motion.line
              x1="2"
              y1="13"
              x2="22"
              y2="13"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.95, ease: "easeOut" }}
            />
          </svg>
        </div>
      </motion.div>

      {/* Sparkles */}
      {[
        { x: 12, y: 15, size: 6, delay: 0.6, dur: 2.6 },
        { x: 85, y: 20, size: 5, delay: 0.9, dur: 2.3 },
        { x: 90, y: 75, size: 7, delay: 1.2, dur: 2.8 },
        { x: 8, y: 78, size: 5, delay: 1.0, dur: 3.0 },
      ].map((s, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ delay: s.delay, duration: s.dur, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 16 16" fill="none">
            <path
              d="M8 0 L9.2 6.8 L16 8 L9.2 9.2 L8 16 L6.8 9.2 L0 8 L6.8 6.8 Z"
              fill="#FF6B00"
              opacity="0.55"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Section wrapper ───────────────────────────────────────────────────────────

function FormSection({
  icon,
  title,
  children,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fieldAppear}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 space-y-3"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[#FF6B00]/70">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/35">{title}</span>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Step progress dots ────────────────────────────────────────────────────────

const STEPS = [
  { id: "details" as const, label: "Role Details" },
  { id: "form" as const, label: "Questionnaire" },
];

function StepDots({ activeStep }: { activeStep: "details" | "form" }) {
  const activeIdx = STEPS.findIndex((s) => s.id === activeStep);

  return (
    <div className="flex flex-col items-center gap-2 mb-5">
      {/* Dot track */}
      <div className="flex items-center gap-1.5">
        {STEPS.map((step, i) => {
          const isActive = i === activeIdx;
          const isComplete = i < activeIdx;
          return (
            <motion.div
              key={step.id}
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`rounded-full transition-colors duration-300 ${
                isActive
                  ? "w-6 h-1.5 bg-[#FF6B00]"
                  : isComplete
                  ? "w-1.5 h-1.5 bg-[#FF6B00]/60"
                  : "w-1.5 h-1.5 bg-white/20"
              }`}
            />
          );
        })}
      </div>
      {/* Label */}
      <p className="text-[10px] font-medium tracking-widest uppercase text-white/30">
        Step {activeIdx + 1} of {STEPS.length} — {STEPS[activeIdx].label}
      </p>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function JobForm({ defaultCompany, initialData, onSubmit }: JobFormProps) {
  const [activeStep, setActiveStep] = useState<"details" | "form">("details");
  const [dir, setDir] = useState<1 | -1>(1);

  // Step 1 states: Role Details
  const [title, setTitle] = useState(initialData?.title || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [locationType, setLocationType] = useState<"On-Site" | "Remote" | "Hybrid">(initialData?.locationType || "On-Site");
  const [type, setType] = useState<JobType>(initialData?.type || "Full-time");
  const [status, setStatus] = useState<JobStatus>(initialData?.status || "Draft");

  const parsedSalary = initialData?.salary ? initialData.salary.split(" ") : [];
  const [currency, setCurrency] = useState(parsedSalary.length > 1 ? parsedSalary[0] : "PKR");
  const [salary, setSalary] = useState(parsedSalary.length > 1 ? parsedSalary.slice(1).join(" ") : (initialData?.salary || ""));

  const [tags, setTags] = useState(initialData?.tags?.join(", ") || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [responsibilities, setResponsibilities] = useState(initialData?.responsibilities?.join("\n") || "");
  const [requirements, setRequirements] = useState(initialData?.requirements?.join("\n") || "");

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ type: "error" | "info"; text: string } | null>(null);

  const generateWithAi = async () => {
    if (!title.trim() || isGeneratingAi) return;
    setIsGeneratingAi(true);
    setAiMessage(null);
    try {
      const res = await fetch("/api/employer/jobs/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't generate suggestions right now.");

      let filledAny = false;
      if (!description.trim() && data.description) {
        setDescription(data.description);
        filledAny = true;
      }
      if (!responsibilities.trim() && Array.isArray(data.responsibilities) && data.responsibilities.length > 0) {
        setResponsibilities(data.responsibilities.join("\n"));
        filledAny = true;
      }
      if (!requirements.trim() && Array.isArray(data.requirements) && data.requirements.length > 0) {
        setRequirements(data.requirements.join("\n"));
        filledAny = true;
      }
      if (!tags.trim() && Array.isArray(data.tags) && data.tags.length > 0) {
        setTags(data.tags.join(", "));
        filledAny = true;
      }

      if (!filledAny) {
        setAiMessage({ type: "info", text: "All fields already have content — clear a field to regenerate it." });
      }
    } catch (err) {
      setAiMessage({ type: "error", text: err instanceof Error ? err.message : "Couldn't generate suggestions right now." });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Step 2 states: Form Builder config
  const [formConfig, setFormConfig] = useState<FormConfig>(
    initialData?.formConfig || FORM_TEMPLATES.find((t) => t.id === "engineering") || FORM_TEMPLATES[0]
  );

  const reset = () => {
    setTitle(initialData?.title || "");
    setLocation(initialData?.location || "");
    setLocationType(initialData?.locationType || "On-Site");
    setType(initialData?.type || "Full-time");
    setStatus(initialData?.status || "Draft");
    setCurrency(parsedSalary.length > 1 ? parsedSalary[0] : "PKR");
    setSalary(parsedSalary.length > 1 ? parsedSalary.slice(1).join(" ") : (initialData?.salary || ""));
    setTags(initialData?.tags?.join(", ") || "");
    setDescription(initialData?.description || "");
    setResponsibilities(initialData?.responsibilities?.join("\n") || "");
    setRequirements(initialData?.requirements?.join("\n") || "");
    setFormConfig(initialData?.formConfig || FORM_TEMPLATES.find((t) => t.id === "engineering") || FORM_TEMPLATES[0]);
    setAiMessage(null);
    setDir(-1);
    setActiveStep("details");
  };

  const goToForm = () => {
    if (!title.trim()) return;
    setDir(1);
    setActiveStep("form");
  };

  const goToDetails = () => {
    setDir(-1);
    setActiveStep("details");
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (activeStep === "details") {
      goToForm();
      return;
    }

    onSubmit({
      title,
      location,
      locationType,
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
    <div className="space-y-2">
      {/* Animated step progress */}
      <StepDots activeStep={activeStep} />

      <form onSubmit={handleFormSubmit}>
        <div className="relative overflow-hidden -m-2 p-2">
          <AnimatePresence mode="popLayout" custom={dir}>
            <motion.div
              key={activeStep}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full"
            >
              {activeStep === "details" ? (
                /* ═══════════════ Step 1: Role Details ═══════════════ */
                <div className="space-y-4">
                  {/* Decorative header */}
                  <StepOneHeader />

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.35 }}
                    className="text-center mb-3"
                  >
                    <h3 className="text-base font-bold text-white">Define the Role</h3>
                    <p className="text-xs text-white/35 mt-0.5">Fill in the details to create your job listing</p>
                  </motion.div>

                  {/* Section: Basic Info */}
                  <FormSection icon={<IconBriefcase size={14} />} title="Basic Information" index={0}>
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <label className={labelClass}>
                          Job Title <span className="text-[#FF6B00]">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={generateWithAi}
                          disabled={title.trim().length < 3 || isGeneratingAi}
                          className={`mb-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                            title.trim().length < 3 || isGeneratingAi
                              ? "text-white/20 cursor-not-allowed"
                              : "text-[#FF6B00] hover:bg-[#FF6B00]/10 cursor-pointer"
                          }`}
                        >
                          {isGeneratingAi ? <IconLoader2 size={12} className="animate-spin" /> : <IconSparkles size={12} />}
                          Generate with AI
                        </button>
                      </div>
                      <input
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={fieldClass}
                        placeholder="e.g., Senior Frontend Engineer"
                      />
                      {aiMessage && (
                        <p className={`mt-1.5 text-[11px] ${aiMessage.type === "error" ? "text-red-400" : "text-white/40"}`}>
                          {aiMessage.text}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Type</label>
                        <DarkSelect
                          value={type}
                          placeholder="Select…"
                          options={["Full-time", "Part-time", "Contract", "Internship"]}
                          onChange={(v) => setType(v as JobType)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Status</label>
                        <DarkSelect
                          value={status}
                          placeholder="Select…"
                          options={["Draft", "Active", "Paused", "Closed"]}
                          onChange={(v) => setStatus(v as JobStatus)}
                        />
                      </div>
                    </div>
                  </FormSection>

                  {/* Section: Location */}
                  <FormSection icon={<IconMapPin size={14} />} title="Location" index={1}>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>City / Region</label>
                        <input value={location} onChange={(e) => setLocation(e.target.value)} className={fieldClass} placeholder="e.g., Lahore" />
                      </div>
                      <div>
                        <label className={labelClass}>Work Model</label>
                        <DarkSelect
                          value={locationType}
                          placeholder="Select…"
                          options={["On-Site", "Remote", "Hybrid"]}
                          onChange={(v) => setLocationType(v as "On-Site" | "Remote" | "Hybrid")}
                        />
                      </div>
                    </div>
                  </FormSection>

                  {/* Section: Compensation */}
                  <FormSection icon={<IconCoin size={14} />} title="Compensation" index={2}>
                    <div className="grid grid-cols-5 gap-3">
                      <div className="col-span-2">
                        <label className={labelClass}>Currency</label>
                        <DarkSelect
                          value={currency}
                          placeholder="Select…"
                          options={["USD", "EUR", "GBP", "PKR", "CAD", "AUD"]}
                          onChange={setCurrency}
                        />
                      </div>
                      <div className="col-span-3">
                        <label className={labelClass}>Salary Range</label>
                        <input value={salary} onChange={(e) => setSalary(e.target.value)} className={fieldClass} placeholder="120k – 150k" />
                      </div>
                    </div>
                  </FormSection>

                  {/* Section: Tags */}
                  <FormSection icon={<IconTags size={14} />} title="Tags & Skills" index={3}>
                    <div>
                      <label className={labelClass}>Tags (comma separated)</label>
                      <input value={tags} onChange={(e) => setTags(e.target.value)} className={fieldClass} placeholder="React, TypeScript, Node.js" />
                    </div>
                  </FormSection>

                  {/* Section: Description */}
                  <FormSection icon={<IconFileDescription size={14} />} title="Job Description" index={4}>
                    <div>
                      <label className={labelClass}>Short Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        className={fieldClass}
                        placeholder="What makes this role exciting?"
                      />
                    </div>
                  </FormSection>

                  {/* Section: Requirements */}
                  <FormSection icon={<IconListCheck size={14} />} title="Responsibilities & Requirements" index={5}>
                    <div>
                      <label className={labelClass}>Responsibilities (one per line)</label>
                      <textarea
                        value={responsibilities}
                        onChange={(e) => setResponsibilities(e.target.value)}
                        rows={3}
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Requirements (one per line)</label>
                      <textarea
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        rows={3}
                        className={fieldClass}
                      />
                    </div>
                  </FormSection>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.07]">
                    <button
                      type="button"
                      onClick={reset}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-xs text-white/45 cursor-pointer hover:bg-white/[0.05] hover:text-white transition-colors"
                    >
                      <IconRotate size={12} />
                      Reset
                    </button>
                    <motion.button
                      type="submit"
                      whileHover={title.trim() ? { scale: 1.02 } : {}}
                      whileTap={title.trim() ? { scale: 0.97 } : {}}
                      disabled={!title.trim()}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                        title.trim()
                          ? "bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white shadow-md shadow-orange-900/40 hover:shadow-orange-800/50"
                          : "bg-white/[0.06] text-white/25 cursor-not-allowed"
                      }`}
                    >
                      Configure Questionnaire
                      <IconChevronRight size={14} />
                    </motion.button>
                  </div>
                </div>
              ) : (
                /* ═══════════════ Step 2: Form Builder ═══════════════ */
                <div className="space-y-4">
                  {/* Step 2 mini header */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3 pb-3 border-b border-white/[0.07]"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6B00]/20 to-[#FF914D]/10 border border-[#FF6B00]/20 flex items-center justify-center">
                      <IconClipboardCheck size={16} className="text-[#FF6B00]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Application Questionnaire</h3>
                      <p className="text-[11px] text-white/30">Configure the form candidates will fill out</p>
                    </div>
                  </motion.div>

                  <FormBuilder value={formConfig} onChange={setFormConfig} />

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.07]">
                    <button
                      type="button"
                      onClick={goToDetails}
                      className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors"
                    >
                      <IconChevronLeft size={14} />
                      Back to Details
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={reset}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-xs text-white/45 cursor-pointer hover:bg-white/[0.05] hover:text-white transition-colors"
                      >
                        <IconRotate size={12} />
                        Reset
                      </button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white shadow-md shadow-orange-900/40 hover:shadow-orange-800/50 transition-all"
                      >
                        {status === "Draft" ? "Save Draft Job" : (initialData ? "Update Job Listing" : "Publish Job Listing")}
                        <IconChevronRight size={14} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
}
