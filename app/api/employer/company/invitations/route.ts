import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { companyErrorResponse, getEmployerContext } from "@/lib/employer/server/company-context";
import {
  createInvitationToken,
  getUserLabel,
  hashValue,
  normalizeEmail,
  recordCompanyAudit,
} from "@/lib/employer/server/company-admin";
import { companyInvitationEmail, sendTransactionalEmail } from "@/lib/shared/email/resend";

export async function GET() {
  try {
    const context = await getEmployerContext({ requireAdmin: true });
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("company_invitations")
      .select("id, email, role, status, expires_at, delivery_error, created_at")
      .eq("company_id", context.companyId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json((data ?? []).map((row) => ({
      id: row.id,
      email: row.email,
      role: row.role,
      status: row.status,
      expiresAt: row.expires_at,
      deliveryError: row.delivery_error,
      createdAt: row.created_at,
    })));
  } catch (error) {
    return companyErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getEmployerContext({ requireAdmin: true });
    const body = await request.json() as { email?: string; role?: "admin" | "recruiter" };
    const email = normalizeEmail(body.email || "");
    const role = body.role === "admin" ? "admin" : "recruiter";
    if (!email.includes("@")) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    if (role === "admin" && !context.isOwner) {
      return NextResponse.json({ error: "Only the company owner can invite another admin." }, { status: 403 });
    }

    const admin = createSupabaseAdminClient();
    const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existingUser = users.users.find((candidate) => normalizeEmail(candidate.email || "") === email);
    if (existingUser) {
      const { data: active } = await admin
        .from("company_memberships")
        .select("id")
        .eq("user_id", existingUser.id)
        .eq("status", "active")
        .maybeSingle();
      if (active) return NextResponse.json({ error: "That person already belongs to a company." }, { status: 409 });
    }

    const token = createInvitationToken();
    const { data: invitation, error } = await admin.from("company_invitations").insert({
      company_id: context.companyId,
      email,
      role,
      token_hash: hashValue(token),
      invited_by: context.userId,
    }).select("id").single();
    if (error || !invitation) {
      return NextResponse.json(
        { error: error?.code === "23505" ? "A pending invitation already exists for that email." : error?.message || "Unable to invite." },
        { status: error?.code === "23505" ? 409 : 500 },
      );
    }

    const inviter = await getUserLabel(context.userId);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const emailContent = companyInvitationEmail({
      companyName: context.companyName,
      inviterName: inviter.name,
      role,
      acceptUrl: `${baseUrl}/employer/invitations/accept?token=${encodeURIComponent(token)}`,
    });
    try {
      const providerMessageId = await sendTransactionalEmail({ to: email, ...emailContent });
      await admin.from("company_invitations").update({
        provider_message_id: providerMessageId,
        delivery_error: null,
      }).eq("id", invitation.id);
    } catch (sendError) {
      await admin.from("company_invitations").update({
        delivery_error: sendError instanceof Error ? sendError.message : "Email delivery failed",
      }).eq("id", invitation.id);
    }

    await recordCompanyAudit({
      companyId: context.companyId,
      actorUserId: context.userId,
      action: "invitation.created",
      entityType: "invitation",
      entityId: invitation.id,
      metadata: { email, role },
    });
    return NextResponse.json({ id: invitation.id }, { status: 201 });
  } catch (error) {
    return companyErrorResponse(error);
  }
}
