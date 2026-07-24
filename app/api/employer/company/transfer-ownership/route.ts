import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { companyErrorResponse, getEmployerContext } from "@/lib/employer/server/company-context";
import { recordCompanyAudit } from "@/lib/employer/server/company-admin";

export async function POST(request: NextRequest) {
  try {
    const context = await getEmployerContext({ requireAdmin: true });
    if (!context.isOwner) return NextResponse.json({ error: "Only the owner can transfer ownership." }, { status: 403 });
    const { membershipId } = await request.json() as { membershipId?: string };
    if (!membershipId) return NextResponse.json({ error: "Select an admin." }, { status: 400 });
    const admin = createSupabaseAdminClient();
    const { data: target } = await admin.from("company_memberships")
      .select("user_id, role").eq("id", membershipId).eq("company_id", context.companyId).eq("status", "active").maybeSingle();
    if (!target || target.role !== "admin") {
      return NextResponse.json({ error: "Ownership can only transfer to an active admin." }, { status: 409 });
    }
    await admin.from("companies").update({ owner_user_id: target.user_id }).eq("id", context.companyId);
    await recordCompanyAudit({
      companyId: context.companyId,
      actorUserId: context.userId,
      action: "ownership.transferred",
      entityType: "company",
      entityId: context.companyId,
      metadata: { newOwnerUserId: target.user_id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return companyErrorResponse(error);
  }
}
