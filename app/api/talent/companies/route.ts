import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/shared/supabase/server";
import { pickCompanyGradient } from "@/lib/shared/companyGradient";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: companies, error } = await supabase.from("companies")
    .select("id, name, verification_status, company_profiles(*)").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const companyIds = (companies ?? []).map((company) => company.id);
  const { data: jobs } = companyIds.length
    ? await supabase.from("jobs").select("id, company_id, title, type, location, salary_range")
        .eq("status", "Active").is("archived_at", null).in("company_id", companyIds)
    : { data: [] };
  const jobsByCompany = new Map<string, any[]>();
  for (const job of jobs ?? []) jobsByCompany.set(job.company_id, [...(jobsByCompany.get(job.company_id) ?? []), job]);
  return NextResponse.json((companies ?? []).map((company: any) => {
    const profile = Array.isArray(company.company_profiles) ? company.company_profiles[0] : company.company_profiles;
    const openJobs = jobsByCompany.get(company.id) ?? [];
    return {
      id: company.id,
      name: company.name,
      verified: company.verification_status === "verified",
      location: profile?.headquarters || "Remote",
      openRoles: openJobs.length,
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
      openRolesList: openJobs.map((job) => ({
        id: job.id, title: job.title, type: job.type || "Full-time",
        location: job.location || "Remote", salary: job.salary_range || "—",
      })),
    };
  }).filter((company) => company.openRoles > 0));
}
