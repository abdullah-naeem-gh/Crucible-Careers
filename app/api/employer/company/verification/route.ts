import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { companyErrorResponse, getEmployerContext } from "@/lib/employer/server/company-context";
import { recordCompanyAudit } from "@/lib/employer/server/company-admin";

export async function GET() {
  try {
    const context = await getEmployerContext({ requireAdmin: true });
    const admin = createSupabaseAdminClient();
    const { data } = await admin.from("company_verification_requests")
      .select("id, legal_name, website, business_email, status, decision_note, created_at, reviewed_at")
      .eq("company_id", context.companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return NextResponse.json({ status: context.verificationStatus, request: data ?? null });
  } catch (error) {
    return companyErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getEmployerContext({ requireAdmin: true });
    if (context.verificationStatus === "verified") {
      return NextResponse.json({ error: "This company is already verified." }, { status: 409 });
    }
    const body = await request.json() as {
      legalName?: string;
      website?: string;
      businessEmail?: string;
      evidencePaths?: string[];
      notes?: string;
    };
    if (!body.legalName?.trim() || !body.website?.trim() || !body.businessEmail?.includes("@") || !body.evidencePaths?.length) {
      return NextResponse.json({ error: "Legal name, website, business email, and evidence are required." }, { status: 400 });
    }
    const admin = createSupabaseAdminClient();
    const { data: pending } = await admin.from("company_verification_requests")
      .select("id").eq("company_id", context.companyId).eq("status", "pending").maybeSingle();
    if (pending) return NextResponse.json({ error: "A verification request is already pending." }, { status: 409 });

    const { data, error } = await admin.from("company_verification_requests").insert({
      company_id: context.companyId,
      submitted_by: context.userId,
      legal_name: body.legalName.trim(),
      website: body.website.trim(),
      business_email: body.businessEmail.trim().toLowerCase(),
      evidence_paths: body.evidencePaths,
      notes: body.notes?.trim() || null,
    }).select("id").single();
    if (error || !data) throw error || new Error("Unable to submit verification.");
    await admin.from("companies").update({ verification_status: "pending" }).eq("id", context.companyId);
    await recordCompanyAudit({
      companyId: context.companyId,
      actorUserId: context.userId,
      action: "verification.submitted",
      entityType: "verification_request",
      entityId: data.id,
    });
    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    return companyErrorResponse(error);
  }
}
