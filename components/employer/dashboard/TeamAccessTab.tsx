"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AffiliationRequest,
  CompanyInvitation,
  CompanyMember,
  CompanyMemberPermissions,
  EmployerContext,
} from "@/types/employer/company";

const surface = "rounded-[24px] border border-white/[0.07] bg-[#171717] shadow-[12px_12px_30px_rgba(0,0,0,0.38)]";
const permissionLabels: Array<[keyof CompanyMemberPermissions, string]> = [
  ["viewAllJobs", "View all jobs"],
  ["manageAllJobs", "Manage all jobs"],
  ["viewAllApplicants", "View all applicants"],
  ["manageAllApplicants", "Manage all applicants"],
  ["viewAllConversations", "View all conversations"],
  ["manageAllConversations", "Manage all conversations"],
  ["viewCompanyAnalytics", "Company analytics"],
];

type Activity = {
  id: string;
  action: string;
  actorName: string;
  entityType: string;
  createdAt: string;
};

export default function TeamAccessTab() {
  const [context, setContext] = useState<EmployerContext | null>(null);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [invitations, setInvitations] = useState<CompanyInvitation[]>([]);
  const [requests, setRequests] = useState<AffiliationRequest[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "recruiter">("recruiter");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [verification, setVerification] = useState<any>(null);
  const [verificationForm, setVerificationForm] = useState({
    legalName: "", website: "", businessEmail: "", notes: "",
  });
  const [evidencePath, setEvidencePath] = useState("");

  const load = useCallback(async () => {
    const [contextRes, membersRes, invitationsRes, requestsRes, activityRes, verificationRes] = await Promise.all([
      fetch("/api/employer/context"),
      fetch("/api/employer/company/members"),
      fetch("/api/employer/company/invitations"),
      fetch("/api/employer/company/affiliation-requests"),
      fetch("/api/employer/company/activity"),
      fetch("/api/employer/company/verification"),
    ]);
    if (contextRes.ok) setContext((await contextRes.json()).context);
    if (membersRes.ok) setMembers(await membersRes.json());
    if (invitationsRes.ok) setInvitations(await invitationsRes.json());
    if (requestsRes.ok) setRequests(await requestsRes.json());
    if (activityRes.ok) setActivity(await activityRes.json());
    if (verificationRes.ok) setVerification(await verificationRes.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const mutate = async (url: string, init: RequestInit) => {
    setBusy(true);
    setError("");
    const response = await fetch(url, init);
    const body = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setError(body.error || "Unable to save this change.");
      return false;
    }
    await load();
    return true;
  };

  const sendInvite = async () => {
    const ok = await mutate("/api/employer/company/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    if (ok) setInviteEmail("");
  };

  const updatePermission = (member: CompanyMember, key: keyof CompanyMemberPermissions, value: boolean) => {
    const permissions = { ...member.permissions, [key]: value };
    if (key === "manageAllJobs" && value) permissions.viewAllJobs = true;
    if (key === "manageAllApplicants" && value) permissions.viewAllApplicants = true;
    if (key === "manageAllConversations" && value) permissions.viewAllConversations = true;
    setMembers((current) => current.map((item) => item.membershipId === member.membershipId ? { ...item, permissions } : item));
    void mutate(`/api/employer/company/members/${member.membershipId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions }),
    });
  };

  const uploadEvidence = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/employer/company/verification/evidence", { method: "POST", body: form });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) setError(body.error || "Evidence upload failed.");
    else setEvidencePath(body.path);
  };

  const submitVerification = async () => {
    await mutate("/api/employer/company/verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...verificationForm, evidencePaths: evidencePath ? [evidencePath] : [] }),
    });
  };

  if (!context) return <div className={`${surface} grid h-full place-items-center text-sm text-white/40`}>Loading team access…</div>;
  if (context.role !== "admin") {
    return (
      <div className={`${surface} flex h-full flex-col justify-center p-8 text-center`}>
        <h1 className="text-xl font-semibold">Your company affiliation</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/45">You are a recruiter at {context.companyName}. Company administrators manage team permissions and invitations.</p>
        <button type="button" onClick={() => mutate("/api/employer/company/leave", { method: "POST" })} className="mx-auto mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300">
          Leave company
        </button>
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-5 overflow-auto lg:grid-cols-12 lg:gap-7">
      <section className={`${surface} p-5 lg:col-span-7`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-400">Team & access</p>
            <h1 className="mt-1 text-xl font-semibold">{context.companyName}</h1>
            <p className="mt-1 text-xs text-white/40">{members.filter((member) => member.status === "active").length} active members</p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${context.verificationStatus === "verified" ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-white/10 text-white/40"}`}>
            {context.verificationStatus}
          </span>
        </div>
        {error && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
        <div className="mt-5 space-y-3">
          {members.map((member) => (
            <article key={member.membershipId} className="rounded-2xl border border-white/[0.07] bg-[#131313] p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-orange-500/10 text-sm font-semibold text-orange-300">
                  {member.avatarUrl ? <img src={member.avatarUrl} alt="" className="h-full w-full object-cover" /> : member.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{member.name} {member.isOwner && <span className="text-[10px] text-orange-400">OWNER</span>}</div>
                  <div className="truncate text-xs text-white/35">{member.email}</div>
                </div>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-white/50">{member.role}</span>
                {context.isOwner && !member.isOwner && member.status === "active" && (
                  <button type="button" disabled={busy} onClick={() => member.role === "admin"
                    ? mutate("/api/employer/company/transfer-ownership", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ membershipId: member.membershipId }) })
                    : mutate(`/api/employer/company/members/${member.membershipId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: "admin" }) })
                  } className="text-xs font-semibold text-orange-300/80 hover:text-orange-300">
                    {member.role === "admin" ? "Make owner" : "Make admin"}
                  </button>
                )}
                {context.isOwner && !member.isOwner && member.role === "admin" && member.status === "active" && (
                  <button type="button" disabled={busy} onClick={() => mutate(`/api/employer/company/members/${member.membershipId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: "recruiter" }) })} className="text-xs font-semibold text-white/40 hover:text-white/70">Make recruiter</button>
                )}
                {!member.isOwner && member.status === "active" && (
                  <button type="button" disabled={busy} onClick={() => mutate(`/api/employer/company/members/${member.membershipId}`, { method: "DELETE" })} className="text-xs font-semibold text-red-300/70 hover:text-red-300">Remove</button>
                )}
              </div>
              {member.role === "recruiter" && member.status === "active" && (
                <div className="mt-4 grid grid-cols-1 gap-2 border-t border-white/[0.06] pt-4 sm:grid-cols-2">
                  {permissionLabels.map(([key, label]) => (
                    <label key={key} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] px-3 py-2 text-xs text-white/55">
                      {label}
                      <input type="checkbox" checked={member.permissions[key]} onChange={(event) => updatePermission(member, key, event.target.checked)} className="accent-orange-500" />
                    </label>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <div className="space-y-5 lg:col-span-5">
        <section className={`${surface} p-5`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Invite HR members</p>
          <div className="mt-3 flex gap-2">
            <input type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="recruiter@company.com" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm outline-none focus:border-orange-500/40" />
            <select value={inviteRole} onChange={(event) => setInviteRole(event.target.value as any)} className="rounded-xl border border-white/10 bg-[#111] px-3 text-xs" disabled={!context.isOwner}>
              <option value="recruiter">Recruiter</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="button" disabled={busy || !inviteEmail.includes("@")} onClick={sendInvite} className="mt-3 w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold disabled:opacity-40">Send 7-day invitation</button>
          {invitations.length > 0 && <div className="mt-4 space-y-2">{invitations.slice(0, 5).map((invite) => (
            <div key={invite.id} className="flex items-center gap-2 text-xs">
              <span className="min-w-0 flex-1 truncate text-white/50">{invite.email}</span>
              <span className="text-white/30">{invite.status}</span>
              {invite.status === "pending" && <button onClick={() => mutate(`/api/employer/company/invitations/${invite.id}`, { method: "DELETE" })} className="text-red-300/70">Revoke</button>}
              {invite.status === "pending" && <button onClick={() => mutate(`/api/employer/company/invitations/${invite.id}/resend`, { method: "POST" })} className="text-orange-300/70">Resend</button>}
            </div>
          ))}</div>}
        </section>

        {requests.length > 0 && (
          <section className={`${surface} p-5`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Affiliation requests</p>
            <div className="mt-3 space-y-3">{requests.map((request) => (
              <div key={request.id} className="rounded-xl border border-white/[0.07] p-3">
                <div className="text-sm font-semibold">{request.requesterName}</div>
                <div className="text-xs text-white/35">{request.requesterEmail}</div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => mutate(`/api/employer/company/affiliation-requests/${request.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision: "approved" }) })} className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300">Approve</button>
                  <button onClick={() => mutate(`/api/employer/company/affiliation-requests/${request.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision: "rejected" }) })} className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300">Reject</button>
                </div>
              </div>
            ))}</div>
          </section>
        )}

        <section className={`${surface} p-5`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Company verification</p>
          {verification?.status === "verified" ? <p className="mt-3 text-sm text-emerald-300">✓ Verified by Crucible Careers</p> : verification?.status === "pending" ? <p className="mt-3 text-sm text-amber-300">Review pending</p> : (
            <div className="mt-3 space-y-2">
              {(["legalName", "website", "businessEmail"] as const).map((field) => (
                <input key={field} value={verificationForm[field]} onChange={(event) => setVerificationForm((current) => ({ ...current, [field]: event.target.value }))} placeholder={field === "legalName" ? "Legal company name" : field === "website" ? "Company website" : "Business email"} className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-xs outline-none" />
              ))}
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(event) => event.target.files?.[0] && uploadEvidence(event.target.files[0])} className="w-full text-xs text-white/40" />
              {evidencePath && <p className="text-[10px] text-emerald-300">Evidence uploaded</p>}
              <button disabled={busy || !evidencePath} onClick={submitVerification} className="w-full rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-300 disabled:opacity-40">Submit for staff review</button>
            </div>
          )}
        </section>

        <section className={`${surface} p-5`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Recent activity</p>
          <div className="mt-3 space-y-2">{activity.slice(0, 8).map((event) => (
            <div key={event.id} className="border-b border-white/[0.05] pb-2 text-xs">
              <span className="font-semibold text-white/65">{event.actorName}</span>
              <span className="text-white/35"> · {event.action.replaceAll(".", " ")}</span>
              <div className="mt-0.5 text-[10px] text-white/20">{new Date(event.createdAt).toLocaleString()}</div>
            </div>
          ))}</div>
        </section>
      </div>
    </div>
  );
}
