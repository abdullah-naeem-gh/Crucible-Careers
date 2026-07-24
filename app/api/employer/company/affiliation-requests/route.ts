import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { companyErrorResponse, getEmployerContext } from "@/lib/employer/server/company-context";
import { getUserLabel } from "@/lib/employer/server/company-admin";

export async function GET() {
  try {
    const context = await getEmployerContext({ requireAdmin: true });
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("company_affiliation_requests")
      .select("id, requester_user_id, target_email_masked, status, created_at, expires_at")
      .eq("company_id", context.companyId)
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    if (error) throw error;

    const rows = await Promise.all((data ?? []).map(async (row) => {
      const requester = await getUserLabel(row.requester_user_id);
      return {
        id: row.id,
        requesterName: requester.name,
        requesterEmail: requester.email,
        targetEmailMasked: row.target_email_masked,
        status: row.status,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
      };
    }));
    return NextResponse.json(rows);
  } catch (error) {
    return companyErrorResponse(error);
  }
}
