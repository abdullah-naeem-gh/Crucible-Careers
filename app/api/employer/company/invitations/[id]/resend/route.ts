import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { companyErrorResponse, getEmployerContext } from "@/lib/employer/server/company-context";
import { companyInvitationEmail, sendTransactionalEmail } from "@/lib/shared/email/resend";
import { createInvitationToken, getUserLabel, hashValue, recordCompanyAudit } from "@/lib/employer/server/company-admin";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getEmployerContext({ requireAdmin: true });
    const { id } = await params;
    const admin = createSupabaseAdminClient();
    const { data: invitation } = await admin.from("company_invitations")
      .select("id, email, role").eq("id", id).eq("company_id", context.companyId).eq("status", "pending").maybeSingle();
    if (!invitation) return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    if (invitation.role === "admin" && !context.isOwner) {
      return NextResponse.json({ error: "Only the owner can resend an admin invitation." }, { status: 403 });
    }
    const token = createInvitationToken();
    await admin.from("company_invitations").update({
      token_hash: hashValue(token),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      delivery_error: null,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    const inviter = await getUserLabel(context.userId);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const content = companyInvitationEmail({
      companyName: context.companyName,
      inviterName: inviter.name,
      role: invitation.role,
      acceptUrl: `${baseUrl}/employer/invitations/accept?token=${encodeURIComponent(token)}`,
    });
    try {
      const providerMessageId = await sendTransactionalEmail({ to: invitation.email, ...content });
      await admin.from("company_invitations").update({ provider_message_id: providerMessageId }).eq("id", id);
    } catch (error) {
      await admin.from("company_invitations").update({
        delivery_error: error instanceof Error ? error.message : "Email delivery failed",
      }).eq("id", id);
      throw error;
    }
    await recordCompanyAudit({
      companyId: context.companyId,
      actorUserId: context.userId,
      action: "invitation.resent",
      entityType: "invitation",
      entityId: id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return companyErrorResponse(error);
  }
}
