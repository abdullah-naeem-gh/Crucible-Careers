"use client";

import React, { useState, useEffect } from "react";
import { FormConfig, FormField, FieldType, SemanticType } from "@/types/employer/job";
import { FORM_TEMPLATES } from "@/lib/shared/formTemplates";
import DarkSelect from "@/components/ui/DarkSelect";
import {
  IconTrash,
  IconPlus,
  IconArrowUp,
  IconArrowDown,
  IconEye,
  IconDeviceMobile,
  IconTemplate,
  IconCheck,
  IconInfoCircle,
  IconChevronDown,
} from "@tabler/icons-react";

interface FormBuilderProps {
  value?: FormConfig;
  onChange: (config: FormConfig) => void;
}

const FIELD_TYPES: Array<{ value: FieldType; label: string }> = [
  { value: "text", label: "Short Text" },
  { value: "paragraph", label: "Paragraph Text" },
  { value: "number", label: "Numeric Answer" },
  { value: "select", label: "Dropdown Select" },
  { value: "multi-select", label: "Multiple Selection" },
  { value: "radio", label: "Radio Buttons (Single Option)" },
  { value: "checkbox", label: "Checkbox (Yes/No)" },
  { value: "file", label: "File Upload" },
];

const SEMANTIC_TYPES: Array<{ value: SemanticType; label: string }> = [
  { value: "name", label: "Candidate Name" },
  { value: "email", label: "Candidate Email" },
  { value: "phone", label: "Candidate Phone" },
  { value: "location", label: "Candidate Location" },
  { value: "experience_years", label: "Years of Experience" },
  { value: "education", label: "Candidate Education" },
  { value: "skills", label: "Candidate Skills/Keywords" },
  { value: "resume", label: "Resume/CV File" },
  { value: "cover_letter", label: "Cover Letter" },
  { value: "linkedin", label: "LinkedIn URL" },
  { value: "github", label: "GitHub URL" },
  { value: "portfolio", label: "Portfolio URL" },
  { value: "custom", label: "Custom Field (Generic Analytics)" },
];

const surface = "rounded-[24px] border border-white/[0.07] bg-[#171717] shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)]";
const insetSurface = "rounded-2xl border border-white/[0.065] bg-[#141414] shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2),inset_-1px_-1px_3px_rgba(255,255,255,0.025)]";
const fieldClass = "w-full rounded-xl border border-white/[0.08] bg-[#121212] px-3 py-2 text-xs text-white outline-none placeholder:text-white/20 focus:border-orange-500/45 focus:ring-2 focus:ring-orange-500/10";

export default function FormBuilder({ value, onChange }: FormBuilderProps) {
  const [config, setConfig] = useState<FormConfig>(
    value || FORM_TEMPLATES.find((t) => t.id === "engineering") || FORM_TEMPLATES[0]
  );
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null);

  useEffect(() => {
    onChange(config);
  }, [config, onChange]);

  const loadTemplate = (templateId: string) => {
    const found = FORM_TEMPLATES.find((t) => t.id === templateId);
    if (found) {
      setConfig({
        ...found,
        id: String(Date.now()),
        fields: found.fields.map(f => ({ ...f, options: f.options ? [...f.options] : undefined }))
      });
      setExpandedFieldId(null);
    }
  };

  const addField = (type: FieldType) => {
    const newFieldId = `field_${Date.now()}`;
    const newField: FormField = {
      id: newFieldId,
      type,
      label: `Untitled ${FIELD_TYPES.find((f) => f.value === type)?.label}`,
      required: false,
      semanticType: type === "file" ? "resume" : "custom",
      options: ["select", "multi-select", "radio"].includes(type) ? ["Option 1", "Option 2"] : undefined,
    };

    setConfig((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
    setExpandedFieldId(newFieldId);
  };

  const removeField = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== id),
    }));
    if (expandedFieldId === id) setExpandedFieldId(null);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setConfig((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= config.fields.length) return;

    const updatedFields = [...config.fields];
    const temp = updatedFields[index];
    updatedFields[index] = updatedFields[nextIndex];
    updatedFields[nextIndex] = temp;

    setConfig((prev) => ({
      ...prev,
      fields: updatedFields,
    }));
  };

  return (
    <div className="flex flex-col gap-4 text-white">
      {/* Top Controls: Template Selector & Tab Switcher */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.07] pb-4">
        <div className="flex items-center gap-2">
          <IconTemplate size={18} className="text-[#FF914D]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Form Template</span>
          <div className="w-48">
            <DarkSelect
              value={FORM_TEMPLATES.find(t => t.name === config.name)?.name || "Custom Form"}
              placeholder="Select Template…"
              options={FORM_TEMPLATES.map((t) => t.name)}
              onChange={(name) => {
                const found = FORM_TEMPLATES.find((t) => t.name === name);
                if (found) {
                  loadTemplate(found.id);
                }
              }}
            />
          </div>
        </div>

        <div className="flex rounded-lg border border-white/[0.07] bg-[#121212] p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === "edit" ? "bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white" : "text-white/45 hover:text-white"
            }`}
          >
            Edit Form
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === "preview" ? "bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white" : "text-white/45 hover:text-white"
            }`}
          >
            <IconEye size={12} />
            Live Preview
          </button>
        </div>
      </div>

      {activeTab === "edit" ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Left panel: Fields list & add triggers */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/35">Form Details</h4>
              <span className="text-[10px] text-white/25 flex items-center gap-1">
                <IconInfoCircle size={10} /> Fields feed into candidate analytics
              </span>
            </div>

            <div className="mb-6 space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider text-white/40 font-semibold">Form Title</label>
              <input 
                type="text" 
                value={config.name} 
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                className={fieldClass} 
                placeholder="e.g. Frontend Engineer Application" 
              />
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-white/35 mb-3">Form Fields ({config.fields.length})</h4>

            <div className="space-y-2.5">
              {config.fields.map((field, index) => {
                const isExpanded = expandedFieldId === field.id;
                const fieldTypeLabel = FIELD_TYPES.find((f) => f.value === field.type)?.label || field.type;
                const semanticLabel = SEMANTIC_TYPES.find((s) => s.value === field.semanticType)?.label || "No Mapping";

                return (
                  <div
                    key={field.id}
                    className={`rounded-xl border transition-all duration-200 bg-[#141414] ${
                      isExpanded ? "border-orange-500/40 shadow-lg shadow-orange-500/5 bg-[#171717]" : "border-white/[0.06] hover:border-white/10"
                    }`}
                  >
                    {/* Field Summary Row */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setExpandedFieldId(isExpanded ? null : field.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setExpandedFieldId(isExpanded ? null : field.id);
                        }
                      }}
                      className="flex items-center justify-between p-3 cursor-pointer select-none"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-xs font-semibold">{field.label || "Untitled Field"}</span>
                          {field.required && (
                            <span className="text-[10px] font-medium text-orange-400 bg-orange-400/10 px-1.5 py-0.2 rounded">Required</span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-white/30">
                          <span className="capitalize">{fieldTypeLabel}</span>
                          <span>•</span>
                          <span className="text-sky-400/80">{semanticLabel}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveField(index, "up")}
                          className="p-1 rounded hover:bg-white/5 disabled:opacity-20 text-white/50 hover:text-white"
                        >
                          <IconArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={index === config.fields.length - 1}
                          onClick={() => moveField(index, "down")}
                          className="p-1 rounded hover:bg-white/5 disabled:opacity-20 text-white/50 hover:text-white"
                        >
                          <IconArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeField(field.id)}
                          className="p-1 rounded hover:bg-red-500/10 text-white/40 hover:text-red-400"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Field Settings Form (Expanded) */}
                    {isExpanded && (
                      <div className="border-t border-white/[0.06] p-4 bg-[#111111]/45 space-y-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/40 font-semibold">Field Label</label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                              className={fieldClass}
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/40 font-semibold">Semantic Analytics Map</label>
                            <DarkSelect
                              value={SEMANTIC_TYPES.find((s) => s.value === field.semanticType)?.label || ""}
                              placeholder="Select…"
                              options={SEMANTIC_TYPES.map((s) => s.label)}
                              onChange={(label) => {
                                const found = SEMANTIC_TYPES.find((s) => s.label === label);
                                if (found) {
                                  updateField(field.id, { semanticType: found.value });
                                }
                              }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/40 font-semibold">Placeholder Hint</label>
                            <input
                              type="text"
                              value={field.placeholder || ""}
                              onChange={(e) => updateField(field.id, { placeholder: e.target.value || undefined })}
                              className={fieldClass}
                              placeholder="Optional placeholder text"
                            />
                          </div>

                          <div className="flex items-center gap-6 pt-3.5">
                            <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                className="rounded border-white/10 bg-[#121212] text-orange-500 focus:ring-0"
                              />
                              Required Field
                            </label>
                          </div>
                        </div>

                        {/* Options editor for choice types */}
                        {["select", "multi-select", "radio"].includes(field.type) && (
                          <div className="rounded-lg border border-white/[0.05] p-3 bg-[#131313]">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Options / Choices</label>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentOptions = field.options || [];
                                  updateField(field.id, { options: [...currentOptions, `Option ${currentOptions.length + 1}`] });
                                }}
                                className="text-[10px] text-orange-400 hover:text-orange-300 font-medium flex items-center gap-0.5 cursor-pointer"
                              >
                                <IconPlus size={10} /> Add Option
                              </button>
                            </div>
                            <div className="space-y-1.5">
                              {(field.options || []).map((opt, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const nextOptions = [...(field.options || [])];
                                      nextOptions[optIndex] = e.target.value;
                                      updateField(field.id, { options: nextOptions });
                                    }}
                                    className={`${fieldClass} py-1.5`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextOptions = (field.options || []).filter((_, i) => i !== optIndex);
                                      updateField(field.id, { options: nextOptions });
                                    }}
                                    className="p-1 text-white/35 hover:text-red-400"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Basic Scoring Rule configuration */}
                        <div className="rounded-lg border border-white/[0.05] p-3 bg-[#131313] space-y-2">
                          <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold block">Applicant ATS Match Evaluation</label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="text-[10px] text-white/30 block mb-1">Field Importance</span>
                              <DarkSelect
                                value={
                                  field.importance === "required"
                                    ? "Required"
                                    : field.importance === "critical"
                                    ? "Critical"
                                    : "Nice to have"
                                }
                                placeholder="Select…"
                                options={["Nice to have", "Required", "Critical"]}
                                onChange={(val) => {
                                  const importanceMap: Record<string, "nice-to-have" | "required" | "critical"> = {
                                    "Nice to have": "nice-to-have",
                                    "Required": "required",
                                    "Critical": "critical",
                                  };
                                  updateField(field.id, { importance: importanceMap[val] });
                                }}
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-white/30 block mb-1">Target Answer (Optional validation/scoring)</span>
                              <input
                                type="text"
                                value={String(field.expectedAnswer ?? "")}
                                onChange={(e) => updateField(field.id, { expectedAnswer: e.target.value || undefined })}
                                className={`${fieldClass} py-1.5`}
                                placeholder="e.g. 3 or Yes or React"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel: Add Field buttons */}
          <div className="lg:col-span-4">
            <div className={`${insetSurface} p-4 space-y-3`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/40">Add New Field</h4>
              <div className="grid grid-cols-1 gap-2">
                {FIELD_TYPES.map((btn) => (
                  <button
                    key={btn.value}
                    type="button"
                    onClick={() => addField(btn.value)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] p-2.5 text-left text-xs font-medium text-white/80 transition-all hover:bg-white/[0.05] hover:border-white/10 cursor-pointer"
                  >
                    <span>{btn.label}</span>
                    <IconPlus size={12} className="text-orange-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Dynamic Live Preview Tab */
        <div className="mx-auto max-w-md w-full border border-white/10 bg-[#121212] rounded-[32px] overflow-hidden p-6 shadow-2xl relative">
          {/* Mock Mobile Header */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-white/10 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white/30 mr-1" />
            <span className="w-8 h-1 rounded-full bg-white/20" />
          </div>

          <div className="mt-4 border-b border-white/[0.07] pb-4 mb-4">
            <span className="text-[10px] font-semibold tracking-wider text-orange-400 uppercase bg-orange-400/10 px-2 py-0.5 rounded-full">Apply Questionnaire Preview</span>
            <h3 className="mt-2 text-base font-bold">{config.name}</h3>
            <p className="text-xs text-white/40">This is how candidates will see this application form.</p>
          </div>

          <div className="space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
            {config.fields.length === 0 ? (
              <div className="text-center py-10 text-xs text-white/30">No questions added yet. Custom forms require at least 1 question.</div>
            ) : (
              config.fields.map((field) => (
                <div key={field.id} className="space-y-1">
                  <label className="text-xs font-semibold text-white/70 block">
                    {field.label}
                    {field.required && <span className="text-orange-400 ml-0.5">*</span>}
                  </label>

                  {field.type === "text" && (
                    <input type="text" disabled className={fieldClass} placeholder={field.placeholder || "Enter answer"} />
                  )}

                  {field.type === "paragraph" && (
                    <textarea disabled rows={3} className={fieldClass} placeholder={field.placeholder || "Write answer here"} />
                  )}

                  {field.type === "number" && (
                    <input type="number" disabled className={fieldClass} placeholder={field.placeholder || "Enter a number"} />
                  )}

                  {field.type === "select" && (
                    <div className="relative">
                      <button
                        type="button"
                        disabled
                        className="w-full rounded-xl border border-white/[0.08] bg-[#121212] px-3.5 py-2.5 text-sm text-left opacity-60 cursor-not-allowed flex items-center justify-between"
                      >
                        <span className="truncate text-white/40">Choose option</span>
                        <span className="shrink-0 ml-2 text-white/20">
                          <IconChevronDown size={15} />
                        </span>
                      </button>
                    </div>
                  )}

                  {field.type === "multi-select" && (
                    <div className="space-y-1 rounded-xl border border-white/[0.07] bg-[#141414] p-2.5">
                      {(field.options || []).map((o) => (
                        <label key={o} className="flex items-center gap-2 text-xs text-white/50">
                          <input type="checkbox" disabled className="rounded border-white/10 bg-[#121212]" />
                          {o}
                        </label>
                      ))}
                    </div>
                  )}

                  {field.type === "radio" && (
                    <div className="space-y-1 pl-1">
                      {(field.options || []).map((o) => (
                        <label key={o} className="flex items-center gap-2 text-xs text-white/50">
                          <input type="radio" disabled className="border-white/10 bg-[#121212] text-orange-500" />
                          {o}
                        </label>
                      ))}
                    </div>
                  )}

                  {field.type === "checkbox" && (
                    <label className="flex items-center gap-2 text-xs text-white/50 pl-1 pt-1">
                      <input type="checkbox" disabled className="rounded border-white/10 bg-[#121212]" />
                      Agree or Confirm
                    </label>
                  )}

                  {field.type === "file" && (
                    <div className="rounded-xl border border-dashed border-white/10 p-3 text-center bg-white/[0.01]">
                      <span className="text-[11px] text-white/40 block">Upload file (.pdf, .docx)</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
