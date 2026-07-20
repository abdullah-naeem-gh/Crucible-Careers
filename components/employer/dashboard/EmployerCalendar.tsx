"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useDashboardTheme } from "@/components/shared/theme/DashboardThemeProvider";
import {
  IconBrandGoogle,
  IconBrandWindows,
  IconCalendar,
  IconCalendarEvent,
  IconCalendarPlus,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconMapPin,
  IconPhone,
  IconTrash,
  IconVideo,
  IconX,
} from "@tabler/icons-react";

export interface CalendarCandidate {
  key: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
}

interface EmployerCalendarProps {
  candidates: CalendarCandidate[];
}

type CalendarView = "week" | "today" | "past";
type InterviewFormat = "video" | "phone" | "in-person";

interface CalendarEvent {
  id: string;
  candidateName: string;
  jobTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  format: InterviewFormat;
  location: string;
  calendarProvider?: "google" | "microsoft" | null;
  calendarEventLink?: string | null;
  calendarSyncError?: string | null;
}

interface ProviderConnection {
  connected: boolean;
  email: string | null;
}

interface EventForm {
  candidateKey: string;
  date: string;
  startTime: string;
  endTime: string;
  format: InterviewFormat;
  location: string;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const LONG_WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateFromKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfWeek(date: Date) {
  const result = startOfDay(date);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function monthCells(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = startOfWeek(first);
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

function formatTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(2020, 0, 1, hour, minute));
}

function newForm(date: Date, candidateKey = ""): EventForm {
  return { candidateKey, date: dateKey(date), startTime: "09:00", endTime: "09:30", format: "video", location: "" };
}

function EventCard({ event, onDelete, isDeleting }: { event: CalendarEvent; onDelete: (event: CalendarEvent) => void; isDeleting: boolean }) {
  const FormatIcon = event.format === "video" ? IconVideo : event.format === "phone" ? IconPhone : IconMapPin;
  return (
    <div className="calendar-event-card flex gap-3 rounded-2xl border border-white/[0.07] bg-[#141414] p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-[#FF914D]"><FormatIcon size={18} /></div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div><h4 className="text-sm font-semibold text-white">Interview with {event.candidateName}</h4><p className="mt-0.5 text-xs text-white/38">{event.jobTitle}</p></div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-orange-500/15 bg-orange-500/[0.07] px-2 py-1 text-[10px] font-semibold text-[#FF914D]">{formatTime(event.startTime)}</span>
            <button type="button" onClick={() => onDelete(event)} disabled={isDeleting} aria-label={`Delete interview with ${event.candidateName}`} className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white/30 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
              <IconTrash size={14} />
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/35">
          <span className="inline-flex items-center gap-1.5"><IconClock size={13} />{formatTime(event.startTime)} – {formatTime(event.endTime)}</span>
          <span className="inline-flex items-center gap-1.5"><FormatIcon size={13} />{event.location || (event.format === "video" ? "Video interview" : event.format === "phone" ? "Phone interview" : "In person")}</span>
          {event.calendarEventLink && (
            <a href={event.calendarEventLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[#FF914D] hover:text-white"><IconCalendarEvent size={13} />View in calendar</a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EmployerCalendar({ candidates }: EmployerCalendarProps) {
  const { theme } = useDashboardTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [activeView, setActiveView] = useState<CalendarView>("week");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isFullOpen, setIsFullOpen] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(() => newForm(today, candidates[0]?.key));
  const [formError, setFormError] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [connections, setConnections] = useState<Record<"google" | "microsoft", ProviderConnection>>({
    google: { connected: false, email: null },
    microsoft: { connected: false, email: null },
  });

  useEffect(() => {
    fetch("/api/employer/interviews")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: CalendarEvent[]) => setEvents(data))
      .catch((err) => console.error("Failed to load interviews", err));

    fetch("/api/employer/calendar/connections")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setConnections(data); })
      .catch((err) => console.error("Failed to load calendar connections", err));
  }, []);

  // Reflect the OAuth callback's redirect result, then strip the query param.
  useEffect(() => {
    const calendarStatus = searchParams.get("calendar");
    if (!calendarStatus) return;
    if (calendarStatus === "connected") {
      setNotice("Calendar connected.");
      fetch("/api/employer/calendar/connections")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => { if (data) setConnections(data); })
        .catch(() => {});
    } else if (calendarStatus === "error") {
      setNotice("Failed to connect calendar. Please try again.");
    }
    router.replace("/employer/dashboard?tab=overview", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const cells = useMemo(() => monthCells(visibleMonth), [visibleMonth]);
  const eventDates = useMemo(() => new Set(events.map((event) => event.date)), [events]);
  const selectedDateEvents = events.filter((event) => event.date === dateKey(selectedDate));

  const visibleEvents = useMemo(() => {
    const weekStart = startOfWeek(today);
    const weekEnd = addDays(weekStart, 7);
    return events.filter((event) => {
      const eventDate = dateFromKey(event.date);
      if (activeView === "today") return event.date === dateKey(today);
      if (activeView === "past") return eventDate < today;
      return eventDate >= weekStart && eventDate < weekEnd;
    }).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  }, [activeView, events, today]);

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  useEffect(() => {
    if (!isFullOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isFullOpen]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!isScheduleOpen && !isFullOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setIsScheduleOpen(false); setIsFullOpen(false); }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isFullOpen, isScheduleOpen]);

  const selectDate = (date: Date) => {
    setSelectedDate(startOfDay(date));
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const openScheduler = (date = selectedDate) => {
    if (!candidates.length) {
      setNotice("Move a candidate into the hiring pipeline before scheduling an interview.");
      return;
    }
    setForm(newForm(date, candidates[0].key));
    setFormError("");
    setIsScheduleOpen(true);
  };

  const scheduleEvent = async () => {
    const candidate = candidates.find((item) => item.key === form.candidateKey);
    if (!candidate || !form.date || !form.startTime || !form.endTime) {
      setFormError("Select a candidate, date, and interview time.");
      return;
    }
    if (form.endTime <= form.startTime) {
      setFormError("End time must be later than the start time.");
      return;
    }
    if (form.format === "in-person" && !form.location.trim()) {
      setFormError("Add a location for an in-person interview.");
      return;
    }

    // candidate.key is "<jobId>:<applicationId>" — see calendarCandidates in OverviewTab.tsx
    const applicationId = candidate.key.split(":")[1];

    setIsScheduling(true);
    setFormError("");
    try {
      const res = await fetch("/api/employer/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          format: form.format,
          location: form.location.trim(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || "Failed to schedule interview. Please try again.");
        return;
      }
      const created: CalendarEvent = await res.json();
      setEvents((current) => [...current, created]);
      const eventDate = dateFromKey(form.date);
      selectDate(eventDate);
      setActiveView(eventDate < today ? "past" : form.date === dateKey(today) ? "today" : "week");
      setIsScheduleOpen(false);
      setNotice(
        created.calendarProvider
          ? `Interview with ${candidate.candidateName} scheduled and synced to your ${created.calendarProvider === "google" ? "Google" : "Microsoft"} calendar.`
          : created.calendarSyncError
            ? `Interview scheduled, but calendar sync failed: ${created.calendarSyncError}`
            : `Interview with ${candidate.candidateName} scheduled.`,
      );
    } catch (err) {
      console.error("Failed to schedule interview", err);
      setFormError("Failed to schedule interview. Please try again.");
    } finally {
      setIsScheduling(false);
    }
  };

  const deleteEvent = async (event: CalendarEvent) => {
    setDeletingId(event.id);
    try {
      const res = await fetch(`/api/employer/interviews/${event.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete interview");
      setEvents((current) => current.filter((item) => item.id !== event.id));
      setNotice(`Interview with ${event.candidateName} cancelled.`);
    } catch (err) {
      console.error("Failed to delete interview", err);
      setNotice("Failed to cancel interview. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const disconnectProvider = async (provider: "google" | "microsoft") => {
    try {
      const res = await fetch("/api/employer/calendar/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      if (!res.ok) throw new Error("Failed to disconnect");
      setConnections((current) => ({ ...current, [provider]: { connected: false, email: null } }));
      setNotice(`Disconnected from ${provider === "google" ? "Google Calendar" : "Microsoft Outlook"}.`);
    } catch (err) {
      console.error("Failed to disconnect calendar", err);
      setNotice("Failed to disconnect. Please try again.");
    }
  };

  const shiftMonth = (amount: number) => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  const monthTitle = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(visibleMonth);

  return (
    <section className="employer-calendar mt-6 overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#171717] shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)]">
      <div className="calendar-connect-banner m-4 flex flex-col gap-4 rounded-2xl border border-orange-500/15 bg-gradient-to-r from-orange-500/[0.12] to-orange-400/[0.035] p-4 sm:m-5 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <div className="text-sm font-semibold text-white">
            {connections.google.connected || connections.microsoft.connected ? "Your calendar" : "Your calendar is not connected yet"}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-white/45">Add availability for faster scheduling and manage interviews in one place.</p>
        </div>
        <div className="flex flex-col gap-2 min-[460px]:flex-row">
          {connections.google.connected ? (
            <button type="button" onClick={() => disconnectProvider("google")} className="calendar-provider-button inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 text-xs font-semibold text-emerald-300 hover:border-red-500/25 hover:bg-red-500/[0.07] hover:text-red-300 cursor-pointer">
              <IconBrandGoogle size={17} className="text-[#4285F4]" />
              {connections.google.email || "Connected"}
              <IconX size={13} className="opacity-60" />
            </button>
          ) : (
            <a href="/api/employer/calendar/google/connect" className="calendar-provider-button inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#141414] px-3.5 text-xs font-semibold text-white/75 hover:border-orange-500/30 hover:bg-white/[0.035] hover:text-white cursor-pointer"><IconBrandGoogle size={17} className="text-[#4285F4]" />Google Calendar</a>
          )}
          {connections.microsoft.connected ? (
            <button type="button" onClick={() => disconnectProvider("microsoft")} className="calendar-provider-button inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 text-xs font-semibold text-emerald-300 hover:border-red-500/25 hover:bg-red-500/[0.07] hover:text-red-300 cursor-pointer">
              <IconBrandWindows size={17} className="text-[#00A4EF]" />
              {connections.microsoft.email || "Connected"}
              <IconX size={13} className="opacity-60" />
            </button>
          ) : (
            <a href="/api/employer/calendar/microsoft/connect" className="calendar-provider-button inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#141414] px-3.5 text-xs font-semibold text-white/75 hover:border-orange-500/30 hover:bg-white/[0.035] hover:text-white cursor-pointer"><IconBrandWindows size={17} className="text-[#00A4EF]" />Microsoft Outlook</a>
          )}
        </div>
      </div>

      <div className="grid min-h-[32rem] grid-cols-1 border-t border-white/[0.07] xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0">
          <div className="flex flex-col gap-3 border-b border-white/[0.07] px-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex min-w-0 overflow-x-auto">
              {([{ key: "week", label: "This week" }, { key: "today", label: "Today" }, { key: "past", label: "Past events" }] as const).map((view) => (
                <button key={view.key} type="button" onClick={() => setActiveView(view.key)} className={`calendar-tab-button relative shrink-0 px-3 py-4 text-xs font-semibold cursor-pointer ${activeView === view.key ? "calendar-tab-active text-white" : "text-white/40 hover:text-white/70"}`}>{view.label}{activeView === view.key && <motion.span layoutId="calendar-active-view" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#FF6B00]" />}</button>
              ))}
            </div>
            <span className="hidden items-center gap-1.5 text-[11px] text-white/35 sm:inline-flex"><IconCalendarEvent size={14} />Your recruiting events</span>
          </div>
          <div className="min-h-[27rem] p-4 sm:p-5">
            {visibleEvents.length ? <div className="space-y-3">{visibleEvents.map((event) => <EventCard key={event.id} event={event} onDelete={deleteEvent} isDeleting={deletingId === event.id} />)}</div> : (
              <div className="grid min-h-[24rem] place-items-center text-center"><div className="max-w-sm">
                <div className="relative mx-auto h-28 w-64"><div className="absolute left-3 top-8 h-14 w-36 -rotate-3 rounded-2xl border border-white/[0.07] bg-[#141414] opacity-60" /><div className="absolute right-3 top-5 h-16 w-40 rotate-2 rounded-2xl border border-orange-500/15 bg-orange-500/[0.08]" /><div className="absolute left-1/2 top-0 grid h-16 w-16 -translate-x-1/2 place-items-center rounded-2xl border border-white/10 bg-[#1b1b1b] text-[#FF914D] shadow-lg"><IconCalendarEvent size={29} /></div><div className="absolute bottom-1 left-1/2 h-2 w-32 -translate-x-1/2 rounded-full bg-black/25 blur-md" /></div>
                <h3 className="mt-1 text-base font-semibold text-white">No {activeView === "week" ? "events this week" : activeView === "today" ? "events today" : "past events"}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/38">Schedule a candidate interview and it will appear here for the rest of this dashboard session.</p>
                <button type="button" onClick={() => openScheduler()} className="calendar-primary-button mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-[#FF6B00] px-3.5 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(255,107,0,0.18)] hover:bg-[#ff7a1a] cursor-pointer"><IconCalendarPlus size={16} />Schedule interview</button>
              </div></div>
            )}
          </div>
        </div>

        <aside className="border-t border-white/[0.07] p-4 sm:p-5 xl:border-l xl:border-t-0">
          <div className="flex items-center justify-between"><button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month" className="calendar-icon-button grid h-8 w-8 place-items-center rounded-lg text-white/40 hover:bg-white/[0.04] hover:text-white cursor-pointer"><IconChevronLeft size={17} /></button><h3 className="text-sm font-semibold text-white">{monthTitle}</h3><button type="button" onClick={() => shiftMonth(1)} aria-label="Next month" className="calendar-icon-button grid h-8 w-8 place-items-center rounded-lg text-white/40 hover:bg-white/[0.04] hover:text-white cursor-pointer"><IconChevronRight size={17} /></button></div>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((day) => <div key={day} className="pb-1 text-[10px] font-semibold uppercase text-white/35">{day}</div>)}
            {cells.map((date) => { const key = dateKey(date); const selected = key === dateKey(selectedDate); const isToday = key === dateKey(today); const inMonth = date.getMonth() === visibleMonth.getMonth(); return (
              <button key={key} type="button" onClick={() => selectDate(date)} aria-label={date.toDateString()} className="calendar-date-button flex aspect-square items-center justify-center text-[11px] cursor-pointer"><span className={`calendar-date-value relative grid h-8 w-8 place-items-center rounded-full transition-all ${selected ? "calendar-date-value-selected calendar-selected-date bg-[#FF6B00] font-semibold text-white shadow-[0_6px_14px_rgba(255,107,0,0.22)]" : isToday ? "font-semibold text-[#FF914D] ring-1 ring-orange-500/30" : inMonth ? "text-white/65" : "text-white/18"}`}>{date.getDate()}{eventDates.has(key) && <span className={`absolute bottom-0.5 h-1 w-1 rounded-full ${selected ? "bg-white" : "bg-[#FF6B00]"}`} />}</span></button>
            ); })}
          </div>
          <div className="mt-5 rounded-xl border border-white/[0.07] bg-[#141414] p-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Selected date</p><p className="mt-1 text-sm font-medium text-white">{new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(selectedDate)}</p><p className="mt-1 text-[11px] text-white/30">{selectedDateEvents.length ? `${selectedDateEvents.length} interview${selectedDateEvents.length === 1 ? "" : "s"} scheduled` : "No interviews scheduled"}</p></div>
          <div className="mt-4 space-y-2"><button type="button" onClick={() => setIsFullOpen(true)} className="calendar-secondary-button inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 text-xs font-semibold text-white/65 hover:border-orange-500/25 hover:bg-white/[0.035] hover:text-white cursor-pointer"><IconCalendar size={16} />Open full calendar</button><button type="button" onClick={() => openScheduler(selectedDate)} className="calendar-accent-button inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-orange-500/10 text-xs font-semibold text-[#FF914D] hover:bg-orange-500/15 cursor-pointer"><IconCalendarPlus size={16} />Schedule an interview</button></div>
        </aside>
      </div>

      <AnimatePresence>{notice && <motion.div role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="fixed bottom-5 right-5 z-[70] max-w-sm rounded-xl border border-orange-500/20 bg-[#171717] px-4 py-3 text-xs font-medium text-white shadow-2xl">{notice}</motion.div>}</AnimatePresence>

      <AnimatePresence>{isScheduleOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={() => setIsScheduleOpen(false)}>
          <motion.div role="dialog" aria-modal="true" aria-labelledby="schedule-interview-title" initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} className="solid-popup-modal w-full max-w-xl overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#171717] shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-white/[0.07] px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FF914D]">Recruiting calendar</p><h3 id="schedule-interview-title" className="mt-1 text-lg font-semibold text-white">Schedule an interview</h3></div><button type="button" onClick={() => setIsScheduleOpen(false)} aria-label="Close schedule interview" className="grid h-9 w-9 place-items-center rounded-xl text-white/40 hover:bg-white/[0.05] hover:text-white cursor-pointer"><IconX size={18} /></button></div>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5 custom-scrollbar">
              <label className="block"><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40">Candidate</span><select value={form.candidateKey} onChange={(event) => setForm((current) => ({ ...current, candidateKey: event.target.value }))} className="h-11 w-full rounded-xl border border-white/10 bg-[#141414] px-3 text-sm text-white outline-none focus:border-orange-500/50"><option value="">Select a candidate</option>{candidates.map((candidate) => <option key={candidate.key} value={candidate.key}>{candidate.candidateName} — {candidate.jobTitle}</option>)}</select></label>
              {form.candidateKey && (() => { const candidate = candidates.find((item) => item.key === form.candidateKey); return candidate ? <div className="rounded-xl border border-white/[0.07] bg-[#141414] px-3 py-2.5"><div className="text-xs font-medium text-white/80">{candidate.jobTitle}</div><div className="mt-0.5 text-[11px] text-white/35">{candidate.candidateEmail}</div></div> : null; })()}
              <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40">Date</span><input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className="h-11 w-full rounded-xl border border-white/10 bg-[#141414] px-3 text-sm text-white outline-none focus:border-orange-500/50" /></label><label className="block"><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40">Format</span><select value={form.format} onChange={(event) => setForm((current) => ({ ...current, format: event.target.value as InterviewFormat, location: "" }))} className="h-11 w-full rounded-xl border border-white/10 bg-[#141414] px-3 text-sm text-white outline-none focus:border-orange-500/50"><option value="video">Video interview</option><option value="phone">Phone interview</option><option value="in-person">In person</option></select></label></div>
              <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40">Start time</span><input type="time" value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} className="h-11 w-full rounded-xl border border-white/10 bg-[#141414] px-3 text-sm text-white outline-none focus:border-orange-500/50" /></label><label className="block"><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40">End time</span><input type="time" value={form.endTime} onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))} className="h-11 w-full rounded-xl border border-white/10 bg-[#141414] px-3 text-sm text-white outline-none focus:border-orange-500/50" /></label></div>
              <label className="block"><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40">{form.format === "in-person" ? "Location" : form.format === "phone" ? "Call details (optional)" : "Meeting link (optional)"}</span><input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder={form.format === "in-person" ? "Office or meeting room" : form.format === "phone" ? "Phone number or instructions" : "https://meet.example.com/..."} className="h-11 w-full rounded-xl border border-white/10 bg-[#141414] px-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-orange-500/50" /></label>
              {formError && <p role="alert" className="rounded-xl border border-red-500/15 bg-red-500/[0.07] px-3 py-2.5 text-xs text-red-300">{formError}</p>}
            </div>
            <div className="flex justify-end gap-2 border-t border-white/[0.07] px-5 py-4"><button type="button" onClick={() => setIsScheduleOpen(false)} className="calendar-ghost-button h-10 rounded-xl px-4 text-xs font-semibold text-white/45 hover:bg-white/[0.04] hover:text-white cursor-pointer">Cancel</button><button type="button" disabled={isScheduling} onClick={scheduleEvent} className="calendar-primary-button inline-flex h-10 items-center gap-2 rounded-xl bg-[#FF6B00] px-4 text-xs font-semibold text-white hover:bg-[#ff7a1a] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"><IconCalendarPlus size={16} />{isScheduling ? "Scheduling…" : "Add interview"}</button></div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      {portalRoot && createPortal(<AnimatePresence>{isFullOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`dashboard-theme-${theme} employer-calendar-overlay fixed inset-0 z-[100] flex h-dvh w-screen items-start justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-6 lg:p-8`} onMouseDown={() => setIsFullOpen(false)}>
          <motion.div role="dialog" aria-modal="true" aria-labelledby="full-calendar-title" initial={{ opacity: 0, scale: 0.985, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.99, y: -6 }} className="solid-popup-modal flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[1500px] flex-col overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#171717] shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-[24px] lg:max-h-[calc(100dvh-4rem)]" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FF914D]">Interview schedule</p><h3 id="full-calendar-title" className="mt-1 text-lg font-semibold text-white">{monthTitle}</h3></div><div className="flex items-center"><button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month" className="grid h-9 w-9 place-items-center rounded-xl text-white/40 hover:bg-white/[0.05] hover:text-white cursor-pointer"><IconChevronLeft size={18} /></button><button type="button" onClick={() => shiftMonth(1)} aria-label="Next month" className="grid h-9 w-9 place-items-center rounded-xl text-white/40 hover:bg-white/[0.05] hover:text-white cursor-pointer"><IconChevronRight size={18} /></button><button type="button" onClick={() => setIsFullOpen(false)} aria-label="Close full calendar" className="ml-1 grid h-9 w-9 place-items-center rounded-xl text-white/40 hover:bg-white/[0.05] hover:text-white cursor-pointer"><IconX size={18} /></button></div></div>
            <div className="min-h-0 overflow-auto p-3 custom-scrollbar sm:p-5"><div className="calendar-full-grid grid min-w-[42rem] grid-cols-7 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07]">{LONG_WEEKDAYS.map((day) => <div key={day} className="bg-[#141414] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">{day}</div>)}{cells.map((date) => { const key = dateKey(date); const dayEvents = events.filter((event) => event.date === key); return <button key={key} type="button" onClick={() => { selectDate(date); setIsFullOpen(false); }} className={`min-h-20 bg-[#171717] p-2 text-left hover:bg-white/[0.025] cursor-pointer ${date.getMonth() === visibleMonth.getMonth() ? "" : "opacity-35"}`}><span className={`grid h-6 w-6 place-items-center rounded-lg text-[11px] ${key === dateKey(today) ? "bg-[#FF6B00] font-semibold text-white" : "text-white/55"}`}>{date.getDate()}</span><div className="mt-1 space-y-1">{dayEvents.slice(0, 2).map((event) => <div key={event.id} className="truncate rounded-md bg-orange-500/10 px-1.5 py-1 text-[9px] font-medium text-[#FF914D]">{event.startTime} {event.candidateName}</div>)}{dayEvents.length > 2 && <div className="px-1 text-[9px] text-white/35">+{dayEvents.length - 2} more</div>}</div></button>; })}</div></div>
            <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] px-5 py-4"><p className="text-[11px] text-white/30">{connections.google.connected || connections.microsoft.connected ? "Interviews sync to your connected calendar" : "Connect a calendar above to sync interviews automatically"}</p><button type="button" onClick={() => { setIsFullOpen(false); openScheduler(selectedDate); }} className="calendar-primary-button inline-flex h-9 shrink-0 items-center gap-2 rounded-xl bg-[#FF6B00] px-3.5 text-xs font-semibold text-white hover:bg-[#ff7a1a] cursor-pointer"><IconCalendarPlus size={15} />Schedule interview</button></div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>, portalRoot)}
    </section>
  );
}
