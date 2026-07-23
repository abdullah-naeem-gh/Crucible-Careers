import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { canAccessOwnedResource, companyErrorResponse, getEmployerContext } from "@/lib/employer/server/company-context";
import { recordCompanyAudit } from "@/lib/employer/server/company-admin";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getEmployerContext();
    const admin = createSupabaseAdminClient();
    const { id } = await params;
    const { data: application } = await admin.from("applications")
      .select("id, jobs(company_id, created_by_user_id, assigned_to_user_id)")
      .eq("id", id).maybeSingle();
    const job: any = application?.jobs;
    if (!application || !job || job.company_id !== context.companyId
      || !canAccessOwnedResource(context, job.assigned_to_user_id || job.created_by_user_id, "manageAllApplicants")) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }
    const body = await request.json() as { status?: string; rating?: number | null; note?: string | null };
    const patch: Record<string, unknown> = {};
    if (body.status !== undefined) patch.status = body.status;
    if (body.rating !== undefined) patch.rating = body.rating;
    if (body.note !== undefined) patch.note = body.note;
    if (!Object.keys(patch).length) return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
    const { data, error } = await admin.from("applications").update(patch).eq("id", id).select().single();
    if (error || !data) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    await recordCompanyAudit({
      companyId: context.companyId, actorUserId: context.userId,
      action: "application.updated", entityType: "application", entityId: id,
      metadata: { fields: Object.keys(patch), status: body.status },
    });
    return NextResponse.json(data);
  } catch (error) { return companyErrorResponse(error); }
}
