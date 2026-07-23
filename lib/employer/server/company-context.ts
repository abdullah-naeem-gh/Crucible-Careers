import { createSupabaseServerClient } from "@/lib/shared/supabase/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import type { CompanyMemberPermissions, EmployerContext } from "@/types/employer/company";

function mapPermissions(row: Record<string, boolean> | null | undefined): CompanyMemberPermissions {
  return {
    viewAllJobs: row?.view_all_jobs ?? false,
    manageAllJobs: row?.manage_all_jobs ?? false,
    viewAllApplicants: row?.view_all_applicants ?? false,
    manageAllApplicants: row?.manage_all_applicants ?? false,
    viewAllConversations: row?.view_all_conversations ?? false,
    manageAllConversations: row?.manage_all_conversations ?? false,
    viewCompanyAnalytics: row?.view_company_analytics ?? false,
  };
}

export class CompanyAccessError extends Error {
  status: number;

  constructor(message: string, status = 403) {
    super(message);
    this.name = "CompanyAccessError";
    this.status = status;
  }
}

export async function getEmployerContext(options?: { requireAdmin?: boolean }): Promise<EmployerContext> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new CompanyAccessError("Unauthorized", 401);

  const admin = createSupabaseAdminClient();

  const { data: membership, error } = await admin
    .from("company_memberships")
    .select(`
      id, company_id, role,
      companies!inner(id, name, owner_user_id, verification_status, company_profiles(logo_url)),
      company_member_permissions(*)
    `)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw new CompanyAccessError(error.message, 500);
  if (!membership) throw new CompanyAccessError("No active company affiliation", 409);
  if (options?.requireAdmin && membership.role !== "admin") {
    throw new CompanyAccessError("Admin access required");
  }

  const company = membership.companies as unknown as {
    id: string;
    name: string;
    owner_user_id: string;
    verification_status: EmployerContext["verificationStatus"];
    company_profiles?: { logo_url: string | null } | { logo_url: string | null }[];
  };
  const profile = Array.isArray(company.company_profiles)
    ? company.company_profiles[0]
    : company.company_profiles;
  const permissionRow = Array.isArray(membership.company_member_permissions)
    ? membership.company_member_permissions[0]
    : membership.company_member_permissions;
  const isAdmin = membership.role === "admin";

  return {
    userId: user.id,
    companyId: membership.company_id,
    membershipId: membership.id,
    role: membership.role,
    isOwner: company.owner_user_id === user.id,
    companyName: company.name,
    companyLogoUrl: profile?.logo_url ?? null,
    verificationStatus: company.verification_status,
    permissions: isAdmin
      ? {
          viewAllJobs: true,
          manageAllJobs: true,
          viewAllApplicants: true,
          manageAllApplicants: true,
          viewAllConversations: true,
          manageAllConversations: true,
          viewCompanyAnalytics: true,
        }
      : mapPermissions(permissionRow as Record<string, boolean> | null),
  };
}

export function canAccessOwnedResource(
  context: EmployerContext,
  ownerUserId: string | null,
  permission: keyof CompanyMemberPermissions,
) {
  return context.role === "admin" || ownerUserId === context.userId || context.permissions[permission];
}

export function companyErrorResponse(error: unknown) {
  const status = error instanceof CompanyAccessError ? error.status : 500;
  const message = error instanceof Error ? error.message : "Unexpected error";
  return Response.json({ error: message }, { status });
}
