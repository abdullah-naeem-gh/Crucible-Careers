"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IconLoader2, IconMessageCircle, IconRefresh, IconSend, IconX } from "@tabler/icons-react";
import MessagesTab from "@/components/shared/chat/MessagesTab";
import { useDashboardTheme } from "@/components/shared/theme/DashboardThemeProvider";
import {
  getConversationForApplication,
  openOrCreateConversation,
} from "@/lib/shared/chat/chat.service";
import type { EmployerCandidateChatTarget } from "@/types/employer/applicant";

interface EmployerChatDrawerProps {
  target: EmployerCandidateChatTarget;
  onClose: () => void;
}

export default function EmployerChatDrawer({ target, onClose }: EmployerChatDrawerProps) {
  const { theme } = useDashboardTheme();
  const isDark = theme === "dark";
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialMessage, setInitialMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    setConversationId(null);

    getConversationForApplication(target.applicationId)
      .then((conversation) => {
        if (!cancelled) setConversationId(conversation?.id ?? null);
      })
      .catch((error: Error) => {
        if (!cancelled) setLoadError(error.message || "Could not load this conversation.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [target.applicationId, loadAttempt]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const startConversation = async () => {
    if (!initialMessage.trim() || isCreating) return;

    setIsCreating(true);
    setCreateError(null);
    try {
      const conversation = await openOrCreateConversation({
        ...target,
        initiatedBy: "employer",
        initialMessage: initialMessage.trim(),
      });
      setConversationId(conversation.id);
      setInitialMessage("");
    } catch (error: any) {
      setCreateError(error.message || "Could not start this conversation.");
    } finally {
      setIsCreating(false);
    }
  };

  const divider = isDark ? "border-white/[0.08]" : "border-gray-200";
  const primaryText = isDark ? "text-white" : "text-gray-950";
  const secondaryText = isDark ? "text-white/48" : "text-gray-500";
  const panel = isDark ? "border-white/[0.09] bg-[#151515]" : "border-gray-200 bg-white";
  const overlay = isDark ? "bg-black/60" : "bg-slate-950/25";

  const drawerHeader = (
    <div className={`flex items-center gap-3 border-b px-5 py-4 ${divider}`}>
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF914D] text-sm font-bold text-white shadow-[0_6px_18px_rgba(255,107,0,0.24)]">
        {target.talentName.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${primaryText}`}>{target.talentName}</p>
        <p className={`truncate text-[11px] ${secondaryText}`}>{target.jobTitle}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close conversation"
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-colors ${isDark ? "border-white/10 text-white/45 hover:bg-white/[0.06] hover:text-white" : "border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-700"}`}
      >
        <IconX size={17} />
      </button>
    </div>
  );

  return (
    <motion.div
      className={`fixed inset-0 z-[70] ${overlay} backdrop-blur-sm`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={`Conversation with ${target.talentName}`}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        onClick={(event) => event.stopPropagation()}
        className={`ml-auto flex h-full w-full max-w-[440px] flex-col overflow-hidden border-l shadow-[-24px_0_70px_rgba(15,23,42,0.22)] ${panel}`}
      >
        {conversationId ? (
          <MessagesTab
            key={conversationId}
            role="employer"
            myDisplayName={target.companyName}
            initialConversationId={conversationId}
            variant="thread"
            onClose={onClose}
          />
        ) : (
          <>
            {drawerHeader}
            {isLoading ? (
              <div className="grid flex-1 place-items-center px-6 text-center">
                <div>
                  <IconLoader2 size={26} className="mx-auto animate-spin text-[#FF6B00]" />
                  <p className={`mt-3 text-sm ${secondaryText}`}>Loading conversation…</p>
                </div>
              </div>
            ) : loadError ? (
              <div className="grid flex-1 place-items-center px-6 text-center">
                <div>
                  <div className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${isDark ? "bg-red-500/10 text-red-300" : "bg-red-50 text-red-600"}`}>
                    <IconMessageCircle size={21} />
                  </div>
                  <p className={`mt-4 text-sm font-semibold ${primaryText}`}>Conversation unavailable</p>
                  <p className={`mt-1 text-xs leading-relaxed ${secondaryText}`}>{loadError}</p>
                  <button
                    type="button"
                    onClick={() => setLoadAttempt((attempt) => attempt + 1)}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-orange-500/25 bg-orange-500/10 px-3.5 py-2 text-xs font-semibold text-[#FF7A1A] transition-colors hover:bg-orange-500/15"
                  >
                    <IconRefresh size={14} />
                    Try again
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col">
                <div className="flex-1 overflow-y-auto px-5 py-6">
                  <div className={`rounded-2xl border p-4 ${isDark ? "border-white/[0.07] bg-white/[0.025]" : "border-orange-100 bg-orange-50/60"}`}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#FF6B00]">New conversation</p>
                    <p className={`mt-2 text-sm leading-relaxed ${secondaryText}`}>
                      Send a message request to <strong className={primaryText}>{target.talentName}</strong> about the {target.jobTitle} role.
                    </p>
                  </div>
                </div>

                <div className={`border-t p-4 ${divider}`}>
                  <label htmlFor="employer-chat-opening-message" className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${secondaryText}`}>
                    Opening message
                  </label>
                  <textarea
                    id="employer-chat-opening-message"
                    autoFocus
                    rows={4}
                    value={initialMessage}
                    onChange={(event) => {
                      setInitialMessage(event.target.value);
                      setCreateError(null);
                    }}
                    placeholder="Introduce yourself and share the next step…"
                    className={`custom-scrollbar mt-2 w-full resize-none rounded-xl border px-3.5 py-3 text-sm outline-none transition-colors ${isDark ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 focus:border-orange-500/45" : "border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:bg-white"}`}
                  />
                  {createError && <p className="mt-2 text-xs text-red-500" role="alert">{createError}</p>}
                  <button
                    type="button"
                    onClick={startConversation}
                    disabled={isCreating || !initialMessage.trim()}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(255,107,0,0.22)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {isCreating ? <IconLoader2 size={16} className="animate-spin" /> : <IconSend size={16} />}
                    {isCreating ? "Sending request…" : "Send message request"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.aside>
    </motion.div>
  );
}
