import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { createSupabaseServerClient } from "@/lib/shared/supabase/server";
import { hashValue, maskEmail, normalizeEmail, getUserLabel } from "@/lib/employer/server/company-admin";
import { sendTransactionalEmail } from "@/lib/shared/email/resend";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("company_affiliation_requests")
    .select("id, target_email_masked, status, created_at, expires_at, companies(name)")
    .eq("requester_user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json((data ?? []).map((row: any) => ({
    id: row.id,
    targetEmailMasked: row.target_email_masked,
    status: row.status,
    companyName: row.status === "approved" ? row.companies?.name ?? null : null,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  })));
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.email_confirmed_at) {
    return NextResponse.json({ error: "Verify your email before requesting affiliation." }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as { companyEmail?: string } | null;
  const targetEmail = normalizeEmail(body?.companyEmail || "");
  if (!targetEmail.includes("@")) {
    return NextResponse.json({ error: "Enter a valid company join email." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: active } = await admin
    .from("company_memberships")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (active) return NextResponse.json({ error: "Leave your current company before requesting another." }, { status: 409 });

  const { data: existing } = await admin
    .from("company_affiliation_requests")
    .select("id")
    .eq("requester_user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();
  if (existing) return NextResponse.json({ error: "You already have a pending affiliation request." }, { status: 409 });

  const { data: company } = await admin
    .from("companies")
    .select("id, name")
    .eq("join_email", targetEmail)
    .maybeSingle();
  const { error } = await admin.from("company_affiliation_requests").insert({
    requester_user_id: user.id,
    company_id: company?.id ?? null,
    target_email_hash: hashValue(targetEmail),
    target_email_masked: maskEmail(targetEmail),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (company) {
    const [{ data: memberships }, requester] = await Promise.all([
      admin.from("company_memberships").select("user_id").eq("company_id", company.id).eq("role", "admin").eq("status", "active"),
      getUserLabel(user.id),
    ]);
    for (const membership of memberships ?? []) {
      const { data: adminUser } = await admin.auth.admin.getUserById(membership.user_id);
      if (adminUser.user?.email) {
        await sendTransactionalEmail({
          to: adminUser.user.email,
          subject: `${requester.name} requested to join ${company.name}`,
          html: `<p>${requester.name} (${requester.email}) requested recruiter access to ${company.name}.</p><p>Review the request in Team &amp; access.</p>`,
        }).catch((sendError) => console.error("Affiliation notification failed", sendError));
      }
    }
  }

  // Always use the same response whether the join address resolved or not.
  return NextResponse.json({ submitted: true }, { status: 202 });
}
