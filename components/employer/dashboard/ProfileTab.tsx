"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconMapPin, IconWorld, IconBrandLinkedin, IconBrandX, IconCheck, IconChevronDown } from "@tabler/icons-react";
import ImageCropModal from "@/components/ui/ImageCropModal";

import { createBrowserSupabaseClient } from "@/lib/shared/supabase/client";
import { CompanyProfile } from "@/types/employer/profile";
import { Skeleton } from "@/components/ui/Skeleton";

const surface = "rounded-[24px] border border-white/[0.07] bg-[#171717] shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)]";
const insetSurface = "rounded-2xl border border-white/[0.065] bg-[#141414] shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2),inset_-1px_-1px_3px_rgba(255,255,255,0.025)]";

const INDUSTRY_OPTIONS = [
  "Software & Technology",
  "Fintech",
  "Healthcare & Biotech",
  "E-Commerce & Retail",
  "Media & Entertainment",
  "Education & EdTech",
  "Gaming",
  "Consulting & Services",
  "Manufacturing",
  "Other",
];

const SIZE_OPTIONS = [
  "1–10 employees",
  "11–50 employees",
  "51–200 employees",
  "201–500 employees",
  "501–1 000 employees",
  "1 000+ employees",
];

function CustomSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="profile-select-trigger flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10"
      >
        <span>{value || options[0]}</span>
        <IconChevronDown size={16} className={`text-white/35 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 6, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="profile-select-menu absolute left-0 right-0 top-full z-30 max-h-60 overflow-y-auto rounded-xl shadow-[0_18px_45px_rgba(0,0,0,0.4)] ring-1 ring-white/[0.04] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15 hover:[&::-webkit-scrollbar-thumb]:bg-white/25 [&::-webkit-scrollbar-track]:bg-transparent"
          >
            {options.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={option === value}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`profile-select-option flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left text-sm ${option === value ? "profile-select-option-active font-semibold" : ""}`}
              >
                <span>{option}</span>
                {option === value && <IconCheck size={15} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ViewMotion({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={`${insetSurface} p-4`}>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">{title}</h3>
      {children}
    </div>
  );
}

function InfoChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/40">
      {children}
    </span>
  );
}

function QuickFact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-7 w-5 items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-white/35">{label}</div>
        <div className="truncate text-xs font-medium text-white/60">{value}</div>
      </div>
    </div>
  );
}

function ProfilePreview({ profile }: { profile: CompanyProfile }) {
  const techTags = profile.techStack
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const benefits = profile.benefits
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <motion.div
      key={JSON.stringify(profile)}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <div className={`${insetSurface} p-4`}>
        <div className="flex items-start gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#FF6B00]/20 to-[#FF914D]/10">
            {profile.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.logoUrl} alt="logo" className="h-full w-full object-cover" />
            ) : (
              <span className="absolute inset-0 grid place-items-center text-xl font-bold text-[#FF914D]">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold leading-tight">
              {profile.name || <span className="text-white/25">Company name</span>}
            </h2>
            <p className="mt-0.5 text-sm text-white/45">
              {profile.tagline || <span className="italic text-white/20">Tagline…</span>}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {profile.industry && (
                <InfoChip>{profile.industry}</InfoChip>
              )}
              {profile.companySize && (
                <InfoChip>{profile.companySize}</InfoChip>
              )}
              {profile.founded && (
                <InfoChip>Est. {profile.founded}</InfoChip>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3.5 border-t border-white/[0.06] pt-4">
          <QuickFact icon={<IconMapPin size={16} className="text-white/40" />} label="HQ" value={profile.headquarters || "—"} />
          <QuickFact
            icon={<IconWorld size={16} className="text-white/40" />}
            label="Website"
            value={
              profile.website
                ? profile.website.replace(/^https?:\/\//, "")
                : "—"
            }
          />
          {profile.linkedin && (
            <QuickFact icon={<IconBrandLinkedin size={16} className="text-white/40" />} label="LinkedIn" value="View profile" />
          )}
          {profile.twitter && (
            <QuickFact icon={<IconBrandX size={16} className="text-white/40" />} label="Twitter" value="View profile" />
          )}
        </div>
      </div>

      <PreviewSection title="About us">
        {profile.overview ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/55">{profile.overview}</p>
        ) : (
          <p className="text-xs italic text-white/20">No company overview provided.</p>
        )}
      </PreviewSection>

      <PreviewSection title="Culture & values">
        {profile.culture ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/55">{profile.culture}</p>
        ) : (
          <p className="text-xs italic text-white/20">No culture & values details specified.</p>
        )}
      </PreviewSection>

      <PreviewSection title="Perks & benefits">
        {benefits.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {benefits.map((b) => (
              <span
                key={b}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/15 dark:bg-emerald-500/[0.07] dark:text-emerald-300 px-2.5 py-1 text-xs font-medium"
              >
                <span className="text-[10px]">✓</span> {b}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-white/20">No perks & benefits specified.</p>
        )}
      </PreviewSection>

      <PreviewSection title="Tech stack">
        {techTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {techTags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-xs text-white/50"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-white/20">No technologies specified.</p>
        )}
      </PreviewSection>

      <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/[0.07] to-transparent p-4">
        <p className="text-xs font-medium text-[#FF914D]">Public profile</p>
        <p className="mt-1 text-xs leading-relaxed text-white/35">
          This is a preview of how job seekers will see your company profile.
        </p>
      </div>
    </motion.div>
  );
}

interface ProfileTabProps {
  profile: CompanyProfile;
  onChange: (updated: CompanyProfile) => void;
  isLoading?: boolean;
  readOnly?: boolean;
  companyId?: string;
}

function ProfileSkeleton() {
  return (
    <div className="grid lg:h-full lg:min-h-0 grid-cols-1 gap-5 lg:grid-cols-9 lg:gap-7">
      <section className={`${surface} flex flex-col overflow-hidden p-5 lg:col-span-5 lg:h-full lg:min-h-0`}>
        <div className="flex items-center gap-4 border-b border-white/[0.07] pb-5">
          <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="mt-2 h-5 w-40 rounded" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="mt-2 h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </section>
      <section className={`${surface} p-5 lg:col-span-4 lg:h-full lg:min-h-0`}>
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="mt-4 h-48 w-full rounded-xl" />
      </section>
    </div>
  );
}

export default function ProfileTab({ profile, onChange, isLoading = false, readOnly = false, companyId }: ProfileTabProps) {
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formState, setFormState] = useState<CompanyProfile>(profile);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [pendingLogoImage, setPendingLogoImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createBrowserSupabaseClient();

  const uploadToStorage = async (fileOrBlob: File | Blob) => {
    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext = fileOrBlob.type.split('/')[1] || 'png';
      const filename = `logo-${crypto.randomUUID()}.${ext}`;
      const filePath = `${companyId || user.id}/${filename}`;

      const { data, error } = await supabase.storage.from('employer-assets').upload(filePath, fileOrBlob, {
        cacheControl: '3600',
        upsert: false
      });
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('employer-assets').getPublicUrl(filePath);
      return publicUrl;
    } catch (e) {
      console.error("Upload error", e);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    setFormState(profile);
  }, [profile]);

  const set = <K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) =>
    setFormState((prev) => ({ ...prev, [key]: value }));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPendingLogoImage(ev.target?.result as string);
      // Reset input value so same file can be selected again
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (readOnly) return;
    onChange(formState);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const fieldClass =
    "w-full rounded-xl border border-white/[0.08] bg-[#121212] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-orange-500/45 focus:ring-2 focus:ring-orange-500/10";
  const labelClass = "mb-1.5 block text-xs font-medium text-white/50";

  if (isLoading) return <ProfileSkeleton />;

  return (
    <ViewMotion className="grid lg:h-full lg:min-h-0 grid-cols-1 gap-5 lg:grid-cols-9 lg:gap-7">
      {/* Editor */}
      <section className={`${surface} flex flex-col overflow-hidden lg:col-span-5 lg:h-full lg:min-h-0 ${readOnly ? 'pointer-events-none opacity-75' : ''}`}>
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#FF914D]">Company Profile</p>
            <h1 className="mt-1 text-2xl font-semibold">Build your profile</h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSave}
            disabled={readOnly}
            className="rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-4 py-2 text-sm font-medium text-white shadow-[0_8px_20px_rgba(255,107,0,0.18)] cursor-pointer"
          >
            {saved ? "✓ Saved" : "Save"}
          </motion.button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto custom-scrollbar p-5">
          <div className="mb-6">
            <p className={labelClass}>Profile Photo</p>
            <div className="flex items-center gap-4">
              <div
                className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                {formState.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formState.logoUrl}
                    alt="Profile photo"
                    className="h-full w-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-200"
                    onClick={() => setIsLightboxOpen(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2 text-white/20 select-none">
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-white/55 cursor-pointer hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
                >
                  {isUploading ? "Uploading..." : formState.logoUrl ? "Change Photo" : "Upload Photo"}
                </button>
                {formState.logoUrl && (
                  <button
                    type="button"
                    onClick={() => set("logoUrl", null)}
                    className="ml-2 rounded-lg border border-red-500/15 bg-red-500/[0.07] px-3 py-2 text-xs text-red-300 cursor-pointer hover:bg-red-500/10"
                  >
                    Remove
                  </button>
                )}
                <p className="mt-1.5 text-[11px] text-white/30">PNG, JPG or SVG · max 2 MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Company name <span className="text-red-500">*</span></label>
              <input
                value={formState.name}
                onChange={(e) => set("name", e.target.value)}
                className={fieldClass}
                placeholder="e.g., TechCorp"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Tagline</label>
              <input
                value={formState.tagline}
                onChange={(e) => set("tagline", e.target.value)}
                className={fieldClass}
                placeholder="A short sentence that captures your mission"
              />
            </div>

            <div>
              <label className={labelClass}>Industry <span className="text-red-500">*</span></label>
              <CustomSelect
                value={formState.industry}
                options={INDUSTRY_OPTIONS}
                onChange={(value) => set("industry", value)}
              />
            </div>

            <div>
              <label className={labelClass}>Company size <span className="text-red-500">*</span></label>
              <CustomSelect
                value={formState.companySize}
                options={SIZE_OPTIONS}
                onChange={(value) => set("companySize", value)}
              />
            </div>

            <div>
              <label className={labelClass}>Founded</label>
              <input
                value={formState.founded}
                onChange={(e) => set("founded", e.target.value)}
                className={fieldClass}
                placeholder="2018"
              />
            </div>

            <div>
              <label className={labelClass}>Headquarters <span className="text-red-500">*</span></label>
              <input
                value={formState.headquarters}
                onChange={(e) => set("headquarters", e.target.value)}
                className={fieldClass}
                placeholder="San Francisco, CA"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Website <span className="text-red-500">*</span></label>
              <input
                value={formState.website}
                onChange={(e) => set("website", e.target.value)}
                className={fieldClass}
                placeholder="https://yourcompany.com"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Company overview <span className="text-red-500">*</span></label>
              <textarea
                value={formState.overview}
                onChange={(e) => set("overview", e.target.value)}
                rows={3}
                className={fieldClass}
                placeholder="What does your company do? What problems do you solve?"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Culture & values</label>
              <textarea
                value={formState.culture}
                onChange={(e) => set("culture", e.target.value)}
                rows={3}
                className={fieldClass}
                placeholder="Describe your team culture, values, and how you work"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Perks & benefits</label>
              <textarea
                value={formState.benefits}
                onChange={(e) => set("benefits", e.target.value)}
                rows={2}
                className={fieldClass}
                placeholder="Health insurance, remote work, equity, …"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Tech stack (comma separated) <span className="text-red-500">*</span></label>
              <input
                value={formState.techStack}
                onChange={(e) => set("techStack", e.target.value)}
                className={fieldClass}
                placeholder="React, Node.js, PostgreSQL, …"
              />
            </div>

            <div>
              <label className={labelClass}>LinkedIn URL</label>
              <input
                value={formState.linkedin}
                onChange={(e) => set("linkedin", e.target.value)}
                className={fieldClass}
                placeholder="https://linkedin.com/company/…"
              />
            </div>
            <div>
              <label className={labelClass}>Twitter / X URL</label>
              <input
                value={formState.twitter}
                onChange={(e) => set("twitter", e.target.value)}
                className={fieldClass}
                placeholder="https://twitter.com/…"
              />
            </div>
          </div>

          <p className="mt-6 text-[11px] text-white/25">
            Public visibility coming soon — your profile will be viewable by job seekers once published.
          </p>
        </div>
      </section>

      {/* Live preview */}
      <section className={`${surface} overflow-auto custom-scrollbar p-5 lg:col-span-4 lg:h-full lg:min-h-0`}>
        <p className="mb-4 text-xs uppercase tracking-[0.18em] text-white/30">Live preview</p>
        <ProfilePreview profile={profile} />
      </section>

      {/* Lightbox modal for enlarged logo */}
      <AnimatePresence>
        {isLightboxOpen && formState.logoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={() => setIsLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-h-[85vh] max-w-[85vw] overflow-hidden rounded-2xl border border-white/10 bg-[#121212] p-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formState.logoUrl}
                alt="Enlarged profile photo"
                className="max-h-[80vh] max-w-[80vw] object-contain rounded-lg"
              />
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white/80 cursor-pointer hover:bg-black hover:text-white"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ImageCropModal
        imageSrc={pendingLogoImage}
        onCancel={() => setPendingLogoImage(null)}
        onApply={async (dataUrl) => {
          setPendingLogoImage(null);
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const publicUrl = await uploadToStorage(blob);
          if (publicUrl) set("logoUrl", publicUrl);
        }}
      />
    </ViewMotion>
  );
}
