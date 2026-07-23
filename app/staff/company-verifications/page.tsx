"use client";

import { useEffect, useState } from "react";

export default function StaffCompanyVerificationPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [error, setError] = useState("");
  const load = () => fetch("/api/staff/company-verifications").then(async (response) => {
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Unable to load review queue.");
    setRequests(body);
  }).catch((loadError) => setError(loadError.message));
  useEffect(() => { load(); }, []);

  const decide = async (id: string, decision: "verified" | "rejected" | "unverified") => {
    const note = decision === "verified" ? "" : window.prompt("Decision note") || "";
    const response = await fetch(`/api/staff/company-verifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, note }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) setError(body.error || "Unable to save decision.");
    else load();
  };

  const openEvidence = async (id: string) => {
    const response = await fetch(`/api/staff/company-verifications/${id}/evidence`);
    const body = await response.json();
    if (body.urls?.[0]) window.open(body.urls[0], "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen bg-[#101010] px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-400">Crucible staff</p>
        <h1 className="mt-2 text-3xl font-semibold">Company verification</h1>
        <p className="mt-2 text-sm text-white/45">Review legal identity, company presence, and private evidence before awarding a public check mark.</p>
        {error && <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        <div className="mt-7 space-y-4">
          {requests.map((request) => (
            <article key={request.id} className="rounded-[24px] border border-white/[0.08] bg-[#171717] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">{request.companies?.name}</div>
                  <div className="mt-1 text-sm text-white/45">{request.legal_name} · {request.business_email}</div>
                  <a href={request.website} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-orange-400">{request.website}</a>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase text-white/45">{request.status}</span>
              </div>
              {request.notes && <p className="mt-4 rounded-xl bg-white/[0.03] p-3 text-sm text-white/55">{request.notes}</p>}
              <div className="mt-5 flex flex-wrap gap-2">
                <button onClick={() => openEvidence(request.id)} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-white/65">Open evidence</button>
                {request.status === "pending" && <>
                  <button onClick={() => decide(request.id, "verified")} className="rounded-xl bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-300">Approve</button>
                  <button onClick={() => decide(request.id, "rejected")} className="rounded-xl bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300">Reject</button>
                </>}
                {request.status === "verified" && <button onClick={() => decide(request.id, "unverified")} className="rounded-xl bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300">Revoke</button>}
              </div>
            </article>
          ))}
          {!requests.length && !error && <div className="rounded-[24px] border border-dashed border-white/10 py-16 text-center text-sm text-white/35">No company verification requests.</div>}
        </div>
      </div>
    </main>
  );
}
