import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { createSupabaseServerClient } from "@/lib/shared/supabase/server";
import { hashValue, normalizeEmail, recordCompanyAudit } from "@/lib/employer/server/company-admin";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to accept this invitation." }, { status: 401 });
  if (!user.email_confirmed_at || !user.email) {
    return NextResponse.json({ error: "Verify your email before accepting." }, { status: 403 });
  }
  const body = await request.json().catch(() => null) as { token?: string } | null;
  if (!body?.token) return NextResponse.json({ error: "Invitation token is required." }, { status: 400 });

  const admin = createSupabaseAdminClient();
  const { data: invitation } = await admin
    .from("company_invitations")
    .select("*, companies(name)")
    .eq("token_hash", hashValue(body.token))
    .eq("status", "pending")
    .maybeSingle();
  if (!invitation || new Date(invitation.expires_at) <= new Date()) {
    return NextResponse.json({ error: "This invitation is invalid or expired." }, { status: 410 });
  }
  if (normalizeEmail(invitation.email) !== normalizeEmail(user.email)) {
    return NextResponse.json({ error: "Sign in with the email address that was invited." }, { status: 403 });
  }
  const { data: active } = await admin
    .from("company_memberships")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (active) return NextResponse.json({ error: "Leave your current company before accepting." }, { status: 409 });

  const { data: historical } = await admin
    .from("company_memberships")
    .select("id")
    .eq("company_id", invitation.company_id)
    .eq("user_id", user.id)
    .maybeSingle();
  const membershipResult = historical
    ? await admin.from("company_memberships").update({
        role: invitation.role,
        status: "active",
        invited_by: invitation.invited_by,
        joined_at: new Date().toISOString(),
        left_at: null,
      }).eq("id", historical.id).select("id").single()
    : await admin.from("company_memberships").insert({
        company_id: invitation.company_id,
        user_id: user.id,
        role: invitation.role,
        invited_by: invitation.invited_by,
      }).select("id").single();
  if (membershipResult.error || !membershipResult.data) {
    return NextResponse.json({ error: membershipResult.error?.message || "Unable to join company." }, { status: 500 });
  }

  await Promise.all([
    admin.from("company_member_permissions").upsert({ membership_id: membershipResult.data.id }),
    admin.from("company_invitations").update({
      status: "approved",
      accepted_by: user.id,
      accepted_at: new Date().toISOString(),
    }).eq("id", invitation.id).eq("status", "pending"),
    admin.from("company_affiliation_requests").update({ status: "cancelled" })
      .eq("requester_user_id", user.id).eq("status", "pending"),
  ]);
  await recordCompanyAudit({
    companyId: invitation.company_id,
    actorUserId: user.id,
    action: "invitation.accepted",
    entityType: "membership",
    entityId: membershipResult.data.id,
    metadata: { role: invitation.role },
  });
  return NextResponse.json({
    success: true,
    companyName: (invitation.companies as any)?.name ?? "your company",
  });
}
