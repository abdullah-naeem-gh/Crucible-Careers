import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { companyErrorResponse, getEmployerContext } from "@/lib/employer/server/company-context";
import { recordCompanyAudit } from "@/lib/employer/server/company-admin";
import type { CompanyProfile } from "@/types/employer/profile";

export async function GET() {
  try {
    const context = await getEmployerContext();
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.from("company_profiles")
      .select("*").eq("company_id", context.companyId).maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json({
        profile: null,
        name: context.companyName,
        canEdit: context.role === "admin",
        verificationStatus: context.verificationStatus,
      });
    }
    const profile: CompanyProfile = {
      name: context.companyName,
      tagline: data.tagline || "",
      industry: data.industry || "",
      companySize: data.company_size || "",
      founded: data.founded || "",
      website: data.website || "",
      headquarters: data.headquarters || "",
      overview: data.overview || "",
      culture: data.culture || "",
      benefits: data.benefits || "",
      techStack: data.tech_stack || "",
      linkedin: data.linkedin || "",
      twitter: data.twitter || "",
      logoUrl: data.logo_url,
    };
    return NextResponse.json({
      profile,
      canEdit: context.role === "admin",
      verificationStatus: context.verificationStatus,
    });
  } catch (error) {
    return companyErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const context = await getEmployerContext({ requireAdmin: true });
    const body = await req.json() as CompanyProfile;
    const admin = createSupabaseAdminClient();
    const { error: companyError } = await admin.from("companies")
      .update({ name: body.name.trim(), updated_at: new Date().toISOString() })
      .eq("id", context.companyId);
    if (companyError) throw companyError;
    const { error } = await admin.from("company_profiles").upsert({
      company_id: context.companyId,
      tagline: body.tagline,
      industry: body.industry,
      company_size: body.companySize,
      founded: body.founded,
      website: body.website,
      headquarters: body.headquarters,
      overview: body.overview,
      culture: body.culture,
      benefits: body.benefits,
      tech_stack: body.techStack,
      linkedin: body.linkedin,
      twitter: body.twitter,
      logo_url: body.logoUrl,
      updated_at: new Date().toISOString(),
    }, { onConflict: "company_id" });
    if (error) throw error;
    await recordCompanyAudit({
      companyId: context.companyId,
      actorUserId: context.userId,
      action: "company.profile_updated",
      entityType: "company",
      entityId: context.companyId,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return companyErrorResponse(error);
  }
}
