"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AcceptCompanyInvitationPage() {
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Accepting your invitation…");

  useEffect(() => {
    const currentToken = new URLSearchParams(window.location.search).get("token");
    setToken(currentToken);
    if (!currentToken) {
      setState("error");
      setMessage("This invitation link is incomplete.");
      return;
    }
    fetch("/api/employer/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: currentToken }),
    }).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Unable to accept invitation.");
      setState("success");
      setMessage(`You’ve joined ${body.companyName}.`);
    }).catch((error) => {
      setState("error");
      setMessage(error.message);
    });
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-[#101010] px-4 text-white">
      <section className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#171717] p-8 text-center shadow-2xl">
        <div className={`mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full ${
          state === "success" ? "bg-emerald-500/10 text-emerald-400" : state === "error" ? "bg-red-500/10 text-red-400" : "bg-orange-500/10 text-orange-400"
        }`}>
          {state === "success" ? "✓" : state === "error" ? "!" : "…"}
        </div>
        <h1 className="text-xl font-semibold">{state === "success" ? "Invitation accepted" : state === "error" ? "Unable to join" : "Joining company"}</h1>
        <p className="mt-2 text-sm text-white/50">{message}</p>
        <Link href={state === "success" ? "/employer/dashboard" : `/employer/login?next=${encodeURIComponent(`/employer/invitations/accept?token=${token || ""}`)}`} className="mt-6 inline-flex rounded-xl bg-[#FF6B00] px-5 py-2.5 text-sm font-semibold">
          {state === "success" ? "Open dashboard" : "Sign in and try again"}
        </Link>
      </section>
    </main>
  );
}
