import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { recordCompanyAudit } from "@/lib/employer/server/company-admin";
import { sendTransactionalEmail } from "@/lib/shared/email/resend";
import { requireCompanyReviewer } from "@/lib/employer/server/staff";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const reviewer = await requireCompanyReviewer();
  if (!reviewer) return NextResponse.json({ error: "Reviewer access required." }, { status: 403 });
  const { id } = await params;
  const body = await request.json() as { decision?: "verified" | "rejected" | "unverified"; note?: string };
  if (!body.decision || !["verified", "rejected", "unverified"].includes(body.decision)) {
    return NextResponse.json({ error: "Invalid decision." }, { status: 400 });
  }
  const admin = createSupabaseAdminClient();
  const { data: verification } = await admin.from("company_verification_requests")
    .select("*, companies(name, owner_user_id)").eq("id", id).maybeSingle();
  if (!verification) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  const now = new Date().toISOString();
  await Promise.all([
    admin.from("company_verification_requests").update({
      status: body.decision,
      reviewed_by: reviewer.id,
      decision_note: body.note?.trim() || null,
      reviewed_at: now,
    }).eq("id", id),
    admin.from("companies").update({
      verification_status: body.decision,
      verified_at: body.decision === "verified" ? now : null,
      verified_by: body.decision === "verified" ? reviewer.id : null,
      verification_revoked_at: body.decision === "unverified" ? now : null,
    }).eq("id", verification.company_id),
  ]);
  await recordCompanyAudit({
    companyId: verification.company_id,
    actorUserId: reviewer.id,
    action: `verification.${body.decision}`,
    entityType: "verification_request",
    entityId: id,
    metadata: { noteProvided: Boolean(body.note?.trim()) },
  });
  const ownerId = (verification.companies as any)?.owner_user_id;
  if (ownerId) {
    const { data: owner } = await admin.auth.admin.getUserById(ownerId);
    if (owner.user?.email) {
      await sendTransactionalEmail({
        to: owner.user.email,
        subject: `${(verification.companies as any)?.name} verification: ${body.decision}`,
        html: `<p>Your company verification status is now <strong>${body.decision}</strong>.</p>${body.note ? `<p>${body.note}</p>` : ""}`,
      }).catch((error) => console.error("Verification email failed", error));
    }
  }
  return NextResponse.json({ success: true });
}
