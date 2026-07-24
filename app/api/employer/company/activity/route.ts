import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { companyErrorResponse, getEmployerContext } from "@/lib/employer/server/company-context";
import { getUserLabel } from "@/lib/employer/server/company-admin";

export async function GET() {
  try {
    const context = await getEmployerContext({ requireAdmin: true });
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.from("company_audit_events")
      .select("*").eq("company_id", context.companyId).order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    const actorIds = [...new Set((data ?? []).map((row) => row.actor_user_id).filter(Boolean))];
    const labels = new Map<string, string>();
    await Promise.all(actorIds.map(async (id) => labels.set(id, (await getUserLabel(id)).name)));
    return NextResponse.json((data ?? []).map((row) => ({
      id: row.id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      actorName: row.actor_user_id ? labels.get(row.actor_user_id) ?? "Former member" : "System",
      metadata: row.metadata,
      createdAt: row.created_at,
    })));
  } catch (error) {
    return companyErrorResponse(error);
  }
}
