import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { companyErrorResponse, getEmployerContext } from "@/lib/employer/server/company-context";
import { recordCompanyAudit } from "@/lib/employer/server/company-admin";

const permissionColumns = {
  viewAllJobs: "view_all_jobs",
  manageAllJobs: "manage_all_jobs",
  viewAllApplicants: "view_all_applicants",
  manageAllApplicants: "manage_all_applicants",
  viewAllConversations: "view_all_conversations",
  manageAllConversations: "manage_all_conversations",
  viewCompanyAnalytics: "view_company_analytics",
} as const;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ membershipId: string }> }) {
  try {
    const context = await getEmployerContext({ requireAdmin: true });
    const { membershipId } = await params;
    const body = await request.json() as {
      role?: "admin" | "recruiter";
      permissions?: Partial<Record<keyof typeof permissionColumns, boolean>>;
    };
    const admin = createSupabaseAdminClient();
    const { data: target } = await admin
      .from("company_memberships")
      .select("id, user_id, role")
      .eq("id", membershipId)
      .eq("company_id", context.companyId)
      .eq("status", "active")
      .maybeSingle();
    if (!target) return NextResponse.json({ error: "Member not found." }, { status: 404 });
    if (target.user_id === context.userId && context.isOwner && body.role === "recruiter") {
      return NextResponse.json({ error: "Transfer ownership before changing the owner’s role." }, { status: 409 });
    }
    if (body.role && body.role !== target.role) {
      if (!context.isOwner) return NextResponse.json({ error: "Only the owner can change admin roles." }, { status: 403 });
      await admin.from("company_memberships").update({ role: body.role }).eq("id", membershipId);
    }
    if (body.permissions) {
      const patch: Record<string, boolean | string> = { updated_by: context.userId };
      for (const [key, column] of Object.entries(permissionColumns)) {
        const value = body.permissions[key as keyof typeof permissionColumns];
        if (typeof value === "boolean") patch[column] = value;
      }
      if (patch.manage_all_jobs === true) patch.view_all_jobs = true;
      if (patch.manage_all_applicants === true) patch.view_all_applicants = true;
      if (patch.manage_all_conversations === true) patch.view_all_conversations = true;
      await admin.from("company_member_permissions").upsert({ membership_id: membershipId, ...patch });
    }
    await recordCompanyAudit({
      companyId: context.companyId,
      actorUserId: context.userId,
      action: "membership.updated",
      entityType: "membership",
      entityId: membershipId,
      metadata: { role: body.role ?? target.role, permissionsChanged: Boolean(body.permissions) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return companyErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ membershipId: string }> }) {
  try {
    const context = await getEmployerContext({ requireAdmin: true });
    const { membershipId } = await params;
    const admin = createSupabaseAdminClient();
    const { data: target } = await admin
      .from("company_memberships")
      .select("id, user_id, role")
      .eq("id", membershipId)
      .eq("company_id", context.companyId)
      .eq("status", "active")
      .maybeSingle();
    if (!target) return NextResponse.json({ error: "Member not found." }, { status: 404 });
    if (target.user_id === context.userId) {
      return NextResponse.json({ error: "Use Leave company to remove your own affiliation." }, { status: 400 });
    }
    if (target.role === "admin" && !context.isOwner) {
      return NextResponse.json({ error: "Only the owner can remove another admin." }, { status: 403 });
    }
    const { data: company } = await admin.from("companies").select("owner_user_id").eq("id", context.companyId).single();
    if (company?.owner_user_id === target.user_id) {
      return NextResponse.json({ error: "Transfer ownership before removing the owner." }, { status: 409 });
    }

    await Promise.all([
      admin.from("company_memberships").update({
        status: "removed", left_at: new Date().toISOString(),
      }).eq("id", membershipId),
      admin.from("jobs").update({ assigned_to_user_id: null })
        .eq("company_id", context.companyId).eq("assigned_to_user_id", target.user_id),
      admin.from("conversations").update({ assigned_to_user_id: null })
        .eq("company_id", context.companyId).eq("assigned_to_user_id", target.user_id),
    ]);
    await recordCompanyAudit({
      companyId: context.companyId,
      actorUserId: context.userId,
      action: "membership.removed",
      entityType: "membership",
      entityId: membershipId,
      metadata: { userId: target.user_id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return companyErrorResponse(error);
  }
}
