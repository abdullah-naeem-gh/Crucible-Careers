import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { companyErrorResponse, getEmployerContext } from "@/lib/employer/server/company-context";
import { recordCompanyAudit } from "@/lib/employer/server/company-admin";

const BOOST_TYPES = ["job-spotlight", "candidate-unlock", "profile-branding"];

export async function GET() {
  try {
    const context = await getEmployerContext();
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.from("employer_boosts")
      .select("boost_type, is_active").eq("company_id", context.companyId);
    if (error) throw error;
    return NextResponse.json({ activeBoosts: (data ?? []).filter((row) => row.is_active).map((row) => row.boost_type) });
  } catch (error) { return companyErrorResponse(error); }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getEmployerContext({ requireAdmin: true });
    const { boostType, isActive } = await request.json();
    if (!BOOST_TYPES.includes(boostType)) return NextResponse.json({ error: "Invalid boost type" }, { status: 400 });
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("employer_boosts").upsert({
      company_id: context.companyId, boost_type: boostType, is_active: Boolean(isActive),
      activated_at: new Date().toISOString(),
    }, { onConflict: "company_id,boost_type" });
    if (error) throw error;
    await recordCompanyAudit({ companyId: context.companyId, actorUserId: context.userId,
      action: "boost.updated", entityType: "boost", entityId: boostType, metadata: { active: Boolean(isActive) } });
    return NextResponse.json({ ok: true });
  } catch (error) { return companyErrorResponse(error); }
}
