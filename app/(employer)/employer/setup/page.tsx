"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/shared/supabase/client";

type Mode = "company" | "recruiter";

export default function EmployerWorkspaceSetupPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [joinEmail, setJoinEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingLabel, setLoadingLabel] = useState("Loading your account…");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [similarCompanies, setSimilarCompanies] = useState<Array<{ id: string; name: string; verified: boolean }>>([]);

  useEffect(() => {
    const load = async () => {
      const contextResponse = await fetch("/api/employer/context");
      if (contextResponse.ok) {
        router.replace("/employer/dashboard");
        return;
      }
      const supabase = createBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/employer/login");
        return;
      }
      const intent = user.user_metadata?.employer_intent;
      const savedCompanyName = String(user.user_metadata?.company || "").trim();
      setMode(intent === "join_company" ? "recruiter" : intent === "create_company" ? "company" : null);
      setCompanyName(savedCompanyName);
      setJoinEmail(user.user_metadata?.company_join_email || user.email || "");

      if (intent === "create_company" && savedCompanyName && user.email) {
        setLoadingLabel("Creating your company workspace…");
        const createResponse = await fetch("/api/employer/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: savedCompanyName, joinEmail: user.email }),
        });
        const createBody = await createResponse.json().catch(() => ({}));
        if (createResponse.ok) {
          router.replace(`/employer/onboarding?name=${encodeURIComponent(savedCompanyName)}`);
          return;
        }
        setError(createBody.error || "Unable to create the company workspace automatically.");
      }

      const pending = await fetch("/api/employer/affiliation-requests");
      if (pending.ok) {
        const rows = await pending.json();
        if (rows.some((row: any) => row.status === "pending")) setSubmitted(true);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  useEffect(() => {
    if (mode !== "company" || companyName.trim().length < 3) {
      setSimilarCompanies([]);
      return;
    }
    const timer = window.setTimeout(() => {
      fetch(`/api/employer/companies?name=${encodeURIComponent(companyName.trim())}`)
        .then((response) => response.ok ? response.json() : { matches: [] })
        .then((body) => setSimilarCompanies(body.matches ?? []));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [companyName, mode]);

  const submit = async () => {
    if (!mode) return;
    setSaving(true);
    setError("");
    const response = mode === "company"
      ? await fetch("/api/employer/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: companyName, joinEmail }),
        })
      : await fetch("/api/employer/affiliation-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyEmail: joinEmail }),
        });
    const body = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(body.error || "Unable to complete setup.");
      return;
    }
    if (mode === "company") router.push(`/employer/onboarding?name=${encodeURIComponent(companyName)}`);
    else setSubmitted(true);
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#101010] px-4 py-12 text-white">
      <section className="w-full max-w-xl rounded-[28px] border border-white/[0.08] bg-[#171717] p-7 shadow-2xl">
        {loading ? (
          <p className="py-16 text-center text-sm text-white/45">{loadingLabel}</p>
        ) : submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-orange-500/10 text-xl text-orange-400">✓</div>
            <h1 className="mt-5 text-2xl font-semibold">Affiliation request submitted</h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/45">
              A company admin must approve your request before company jobs, applicants, or messages become available.
            </p>
            <button type="button" onClick={() => { setSubmitted(false); setMode("recruiter"); }} className="mt-6 text-sm font-semibold text-orange-400">
              Request a different company
            </button>
          </div>
        ) : (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-400">Employer setup</p>
            <h1 className="mt-2 text-2xl font-semibold">How are you joining Crucible?</h1>
            <p className="mt-2 text-sm text-white/45">Your login represents you. Company branding and hiring data live in a shared workspace.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setMode("company")} className={`rounded-2xl border p-4 text-left ${mode === "company" ? "border-orange-500/50 bg-orange-500/10" : "border-white/10 bg-white/[0.025]"}`}>
                <span className="text-sm font-semibold">Create a company</span>
                <span className="mt-1 block text-xs text-white/40">Become the owner-admin.</span>
              </button>
              <button type="button" onClick={() => setMode("recruiter")} className={`rounded-2xl border p-4 text-left ${mode === "recruiter" ? "border-orange-500/50 bg-orange-500/10" : "border-white/10 bg-white/[0.025]"}`}>
                <span className="text-sm font-semibold">Join a company</span>
                <span className="mt-1 block text-xs text-white/40">Request recruiter access.</span>
              </button>
            </div>
            {mode && (
              <div className="mt-6 space-y-4">
                {mode === "company" && (
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-white/65">Company name</span>
                    <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none focus:border-orange-500/50" />
                    {similarCompanies.length > 0 && <span className="mt-2 block rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-[11px] leading-relaxed text-amber-200">
                      Similar companies already exist: {similarCompanies.map((company) => `${company.name}${company.verified ? " ✓" : ""}`).join(", ")}. If this is your workplace, choose “Join a company” instead. You may still continue because company names are not unique.
                    </span>}
                  </label>
                )}
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-white/65">
                    {mode === "company" ? "Company join email" : "Company Crucible account email"}
                  </span>
                  <input type="email" value={joinEmail} onChange={(event) => setJoinEmail(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none focus:border-orange-500/50" />
                  <span className="mt-1.5 block text-[11px] text-white/30">
                    {mode === "company" ? "Recruiters will use this verified address to request affiliation." : "Entering this email sends a request; it does not grant access automatically."}
                  </span>
                </label>
              </div>
            )}
            {error && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            <button type="button" onClick={submit} disabled={!mode || saving || (mode === "company" && !companyName.trim()) || !joinEmail.includes("@")} className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">
              {saving ? "Saving…" : mode === "company" ? "Create company workspace" : "Submit affiliation request"}
            </button>
          </>
        )}
      </section>
    </main>
  );
}
