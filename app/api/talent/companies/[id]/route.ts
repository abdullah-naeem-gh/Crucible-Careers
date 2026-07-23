import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/shared/supabase/server";
import { pickCompanyGradient } from "@/lib/shared/companyGradient";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { id } = await params;
  const { data: company } = await supabase.from("companies")
    .select("id, name, verification_status, company_profiles(*)").eq("id", id).maybeSingle();
  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });
  const profile: any = Array.isArray(company.company_profiles) ? company.company_profiles[0] : company.company_profiles;
  const { data: activeJobs } = await supabase.from("jobs")
    .select("id, title, type, location, salary_range").eq("company_id", id)
    .eq("status", "Active").is("archived_at", null);
  return NextResponse.json({
    id: company.id,
    name: company.name,
    verified: company.verification_status === "verified",
    location: profile?.headquarters || "Remote",
    logo: company.name.charAt(0).toUpperCase(),
    color: pickCompanyGradient(company.id),
    about: profile?.overview || "",
    culture: profile?.culture || "",
    website: profile?.website || "",
    tagline: profile?.tagline || undefined,
    industry: profile?.industry || undefined,
    companySize: profile?.company_size || undefined,
    founded: profile?.founded || undefined,
    benefits: profile?.benefits || undefined,
    techStack: profile?.tech_stack || undefined,
    linkedin: profile?.linkedin || undefined,
    twitter: profile?.twitter || undefined,
    logoDataUrl: profile?.logo_url || null,
    openRoles: (activeJobs ?? []).map((job) => ({
      id: job.id, title: job.title, type: job.type || "Full-time",
      location: job.location || "Remote", salary: job.salary_range || "—",
    })),
  });
}
