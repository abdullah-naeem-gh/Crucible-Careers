"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconShieldCheck, IconCheck, IconX, IconLoader2, IconMapPin, IconBriefcase } from "@tabler/icons-react";
import type { ExperienceVerificationRequest } from "@/types/employer/verification";
import {
  getExperienceVerificationRequests,
  approveExperienceVerification,
  rejectExperienceVerification,
} from "@/lib/employer/services/experienceVerification.service";

const surface =
  "rounded-[24px] border border-white/[0.07] bg-[#171717] shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)]";
const insetSurface =
  "rounded-2xl border border-white/[0.065] bg-[#141414] shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2),inset_-1px_-1px_3px_rgba(255,255,255,0.025)]";

const STATUS_STYLES: Record<string, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  verified: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  rejected: "border-red-500/30 bg-red-500/10 text-red-300",
};

export default function VerificationRequestsTab() {
  const [requests, setRequests] = useState<ExperienceVerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ExperienceVerificationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectBlacklist, setRejectBlacklist] = useState(false);
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    getExperienceVerificationRequests().then((data) => {
      setRequests(data);
      setIsLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id: string) => {
    setActioningId(id);
    try {
      await approveExperienceVerification(id);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  const openReject = (request: ExperienceVerificationRequest) => {
    setRejectTarget(request);
    setRejectReason("");
    setRejectBlacklist(false);
    setRejectError(null);
  };

  const submitReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      setRejectError("A rejection reason is required.");
      return;
    }
    setRejectSubmitting(true);
    setRejectError(null);
    try {
      await rejectExperienceVerification(rejectTarget.id, rejectReason.trim(), rejectBlacklist);
      setRejectTarget(null);
      load();
    } catch (err) {
      setRejectError(err instanceof Error ? err.message : "Failed to reject request");
    } finally {
      setRejectSubmitting(false);
    }
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className={`${surface} p-5 flex flex-col gap-4`}>
      <div className="flex items-center gap-2">
        <IconShieldCheck size={18} className="text-[#FF914D]" />
        <div>
          <h2 className="text-sm font-semibold text-white">Experience Verification Requests</h2>
          <p className="text-[10px] text-white/30">
            {pendingCount > 0 ? `${pendingCount} awaiting your review` : "All caught up"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-sm text-white/30">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className={`${insetSurface} p-6 text-center text-sm text-white/35`}>
          No talent has listed your company as an employer yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((r) => (
            <div key={r.id} className={`${insetSurface} p-4 flex flex-col gap-3`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">{r.talent.name}</div>
                  <div className="text-xs text-white/40">{r.talent.email}</div>
                  {(r.talent.headline || r.talent.location) && (
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-white/30">
                      {r.talent.headline && <span>{r.talent.headline}</span>}
                      {r.talent.location && (
                        <span className="inline-flex items-center gap-1"><IconMapPin size={11} /> {r.talent.location}</span>
                      )}
                    </div>
                  )}
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${STATUS_STYLES[r.status]}`}>
                  {r.status}
                </span>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 flex flex-col gap-3">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                  <IconBriefcase size={12} className="text-[#FF914D]" /> Experience Being Verified
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <ExperienceField label="Company" value={r.experience.company} />
                  <ExperienceField label="Role" value={r.experience.role} />
                  <ExperienceField label="Duration" value={`${r.experience.startDate} – ${r.experience.current ? "Present" : r.experience.endDate}`} />
                  <ExperienceField label="Location" value={r.experience.location} />
                  <ExperienceField label="Previous Salary" value={r.experience.previousSalary} />
                </div>
                <ExperienceField label="Description" value={r.experience.description} block />
              </div>

              {r.status === "rejected" && r.rejectionReason && (
                <p className="text-[11px] text-red-300/80">Rejection reason: {r.rejectionReason}</p>
              )}

              {r.status === "pending" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={actioningId === r.id}
                    onClick={() => handleApprove(r.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(255,107,0,0.2)] disabled:opacity-60"
                  >
                    {actioningId === r.id ? <IconLoader2 size={13} className="animate-spin" /> : <IconCheck size={13} />}
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => openReject(r)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-white/60 hover:bg-white/[0.06] hover:text-white"
                  >
                    <IconX size={13} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {rejectTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => !rejectSubmitting && setRejectTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className={`${surface} w-full max-w-md p-5 flex flex-col gap-3`}
            >
              <h3 className="text-sm font-semibold text-white">
                Reject {rejectTarget.talent.name}&rsquo;s experience at {rejectTarget.experience.company}
              </h3>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40">
                  Reason <span className="text-[#FF6B00]">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#121212] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-orange-500/45 focus:ring-2 focus:ring-orange-500/10"
                  placeholder="Explain why this experience couldn't be verified..."
                />
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-white/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rejectBlacklist}
                  onChange={(e) => setRejectBlacklist(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-white/20 bg-transparent text-[#FF6B00] focus:ring-orange-500"
                />
                Also block this talent from sending future verification requests to us
              </label>
              {rejectError && <p className="text-[11px] text-red-400">{rejectError}</p>}
              <div className="mt-1 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={rejectSubmitting}
                  onClick={() => setRejectTarget(null)}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/60 hover:bg-white/[0.06]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={rejectSubmitting}
                  onClick={submitReject}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {rejectSubmitting && <IconLoader2 size={13} className="animate-spin" />}
                  Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExperienceField({ label, value, block = false }: { label: string; value: string; block?: boolean }) {
  if (!value) return null;
  return (
    <div className={block ? "col-span-full" : ""}>
      <div className="text-[9px] font-semibold uppercase tracking-wider text-white/30">{label}</div>
      <div className="mt-0.5 text-xs text-white/70 leading-relaxed">{value}</div>
    </div>
  );
}
