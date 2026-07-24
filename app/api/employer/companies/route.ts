import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { createSupabaseServerClient } from "@/lib/shared/supabase/server";
import { normalizeEmail, recordCompanyAudit } from "@/lib/employer/server/company-admin";

export async function GET(request: NextRequest) {
  const name = new URL(request.url).searchParams.get("name")?.trim() || "";
  if (name.length < 3) return NextResponse.json({ matches: [] });
  const safeName = name.replace(/[%_,]/g, " ").replace(/\s+/g, " ").trim();
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("companies")
    .select("id, name, verification_status")
    .ilike("name", `%${safeName}%`).limit(5);
  return NextResponse.json({ matches: (data ?? []).map((company) => ({
    id: company.id, name: company.name, verified: company.verification_status === "verified",
  })) });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.email_confirmed_at) {
    return NextResponse.json({ error: "Verify your email before creating a company." }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as { name?: string; joinEmail?: string } | null;
  const name = body?.name?.trim() ?? "";
  const joinEmail = normalizeEmail(body?.joinEmail || user.email || "");
  if (name.length < 2 || !joinEmail.includes("@")) {
    return NextResponse.json({ error: "A company name and valid join email are required." }, { status: 400 });
  }
  if (joinEmail !== normalizeEmail(user.email || "")) {
    return NextResponse.json({ error: "The initial company join email must match your verified account email." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: active } = await admin
    .from("company_memberships")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (active) return NextResponse.json({ error: "You already belong to a company." }, { status: 409 });

  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({ name, join_email: joinEmail, owner_user_id: user.id })
    .select("id")
    .single();
  if (companyError || !company) {
    const duplicate = companyError?.code === "23505";
    return NextResponse.json(
      { error: duplicate ? "That company join email is already in use." : companyError?.message || "Unable to create company." },
      { status: duplicate ? 409 : 500 },
    );
  }

  const { data: membership, error: membershipError } = await admin
    .from("company_memberships")
    .insert({ company_id: company.id, user_id: user.id, role: "admin" })
    .select("id")
    .single();
  if (membershipError || !membership) {
    await admin.from("companies").delete().eq("id", company.id);
    return NextResponse.json({ error: membershipError?.message || "Unable to create company membership." }, { status: 500 });
  }

  await Promise.all([
    admin.from("company_profiles").insert({ company_id: company.id }),
    admin.from("company_member_permissions").insert({ membership_id: membership.id }),
    admin.from("profiles").update({ company: name }).eq("id", user.id),
  ]);
  await recordCompanyAudit({
    companyId: company.id,
    actorUserId: user.id,
    action: "company.created",
    entityType: "company",
    entityId: company.id,
  });

  return NextResponse.json({ companyId: company.id }, { status: 201 });
}
