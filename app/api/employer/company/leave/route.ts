import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { companyErrorResponse, getEmployerContext } from "@/lib/employer/server/company-context";
import { recordCompanyAudit } from "@/lib/employer/server/company-admin";

export async function POST() {
  try {
    const context = await getEmployerContext();
    if (context.isOwner) {
      return NextResponse.json({ error: "Transfer ownership before leaving the company." }, { status: 409 });
    }
    const admin = createSupabaseAdminClient();
    await Promise.all([
      admin.from("company_memberships").update({
        status: "left", left_at: new Date().toISOString(),
      }).eq("id", context.membershipId),
      admin.from("jobs").update({ assigned_to_user_id: null })
        .eq("company_id", context.companyId).eq("assigned_to_user_id", context.userId),
      admin.from("conversations").update({ assigned_to_user_id: null })
        .eq("company_id", context.companyId).eq("assigned_to_user_id", context.userId),
    ]);
    await recordCompanyAudit({
      companyId: context.companyId,
      actorUserId: context.userId,
      action: "membership.left",
      entityType: "membership",
      entityId: context.membershipId,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return companyErrorResponse(error);
  }
}
