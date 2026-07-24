import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { companyErrorResponse, getEmployerContext } from "@/lib/employer/server/company-context";
import { recordCompanyAudit } from "@/lib/employer/server/company-admin";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getEmployerContext({ requireAdmin: true });
    const { id } = await params;
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("company_invitations")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("company_id", context.companyId)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (!data) return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    await recordCompanyAudit({
      companyId: context.companyId,
      actorUserId: context.userId,
      action: "invitation.revoked",
      entityType: "invitation",
      entityId: id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return companyErrorResponse(error);
  }
}
