import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { companyErrorResponse, getEmployerContext } from "@/lib/employer/server/company-context";
import { getUserLabel, recordCompanyAudit } from "@/lib/employer/server/company-admin";
import { sendTransactionalEmail } from "@/lib/shared/email/resend";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getEmployerContext({ requireAdmin: true });
    const { id } = await params;
    const body = await request.json() as { decision?: "approved" | "rejected"; note?: string };
    if (body.decision !== "approved" && body.decision !== "rejected") {
      return NextResponse.json({ error: "Decision must be approved or rejected." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: affiliation } = await admin
      .from("company_affiliation_requests")
      .select("*")
      .eq("id", id)
      .eq("company_id", context.companyId)
      .eq("status", "pending")
      .maybeSingle();
    if (!affiliation) return NextResponse.json({ error: "Request not found." }, { status: 404 });

    if (body.decision === "approved") {
      const { data: active } = await admin
        .from("company_memberships")
        .select("id")
        .eq("user_id", affiliation.requester_user_id)
        .eq("status", "active")
        .maybeSingle();
      if (active) return NextResponse.json({ error: "This recruiter already belongs to a company." }, { status: 409 });

      const { data: historical } = await admin
        .from("company_memberships")
        .select("id")
        .eq("company_id", context.companyId)
        .eq("user_id", affiliation.requester_user_id)
        .maybeSingle();
      const membershipResult = historical
        ? await admin.from("company_memberships").update({
            role: "recruiter", status: "active", approved_by: context.userId, joined_at: new Date().toISOString(), left_at: null,
          }).eq("id", historical.id).select("id").single()
        : await admin.from("company_memberships").insert({
            company_id: context.companyId,
            user_id: affiliation.requester_user_id,
            role: "recruiter",
            approved_by: context.userId,
          }).select("id").single();
      if (membershipResult.error || !membershipResult.data) {
        return NextResponse.json({ error: membershipResult.error?.message || "Unable to create membership." }, { status: 500 });
      }
      await admin.from("company_member_permissions").upsert({ membership_id: membershipResult.data.id });
    }

    await admin.from("company_affiliation_requests").update({
      status: body.decision,
      decided_by: context.userId,
      decision_note: body.note?.trim() || null,
      decided_at: new Date().toISOString(),
    }).eq("id", id);
    await recordCompanyAudit({
      companyId: context.companyId,
      actorUserId: context.userId,
      action: `affiliation.${body.decision}`,
      entityType: "affiliation_request",
      entityId: id,
      metadata: { requesterUserId: affiliation.requester_user_id },
    });

    const requester = await getUserLabel(affiliation.requester_user_id);
    if (requester.email) {
      await sendTransactionalEmail({
        to: requester.email,
        subject: `Your ${context.companyName} affiliation request was ${body.decision}`,
        html: `<p>Your request to join ${context.companyName} was ${body.decision}.</p>${body.note ? `<p>${body.note}</p>` : ""}`,
      }).catch((sendError) => console.error("Affiliation decision email failed", sendError));
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return companyErrorResponse(error);
  }
}
