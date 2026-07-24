import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { companyErrorResponse, getEmployerContext } from "@/lib/employer/server/company-context";
import { getUserLabel } from "@/lib/employer/server/company-admin";

const mapPermissions = (row: any) => ({
  viewAllJobs: row?.view_all_jobs ?? false,
  manageAllJobs: row?.manage_all_jobs ?? false,
  viewAllApplicants: row?.view_all_applicants ?? false,
  manageAllApplicants: row?.manage_all_applicants ?? false,
  viewAllConversations: row?.view_all_conversations ?? false,
  manageAllConversations: row?.manage_all_conversations ?? false,
  viewCompanyAnalytics: row?.view_company_analytics ?? false,
});

export async function GET() {
  try {
    const context = await getEmployerContext();
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("company_memberships")
      .select("id, user_id, role, status, joined_at, company_member_permissions(*)")
      .eq("company_id", context.companyId)
      .eq("status", "active")
      .order("joined_at", { ascending: true });
    if (error) throw error;
    const members = await Promise.all((data ?? []).map(async (row: any) => {
      const person = await getUserLabel(row.user_id);
      const permissionRow = Array.isArray(row.company_member_permissions)
        ? row.company_member_permissions[0]
        : row.company_member_permissions;
      return {
        membershipId: row.id,
        userId: row.user_id,
        name: person.name,
        email: person.email,
        avatarUrl: person.avatarUrl,
        role: row.role,
        status: row.status,
        isOwner: row.user_id === context.userId ? context.isOwner : false,
        joinedAt: row.joined_at,
        ...(context.role === "admin" || row.user_id === context.userId
          ? { permissions: mapPermissions(permissionRow) }
          : {}),
      };
    }));
    // Correct the owner marker for every authorized company member.
    const { data: company } = await admin.from("companies").select("owner_user_id").eq("id", context.companyId).single();
    members.forEach((member) => { member.isOwner = member.userId === company?.owner_user_id; });
    return NextResponse.json(members);
  } catch (error) {
    return companyErrorResponse(error);
  }
}
