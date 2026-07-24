import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/shared/supabase/server";
import type { ScrapedJob } from "@/types/talent/job";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: jobs, error } = await supabase.from("jobs")
    .select("id, company_id, title, location, location_type, type, salary_range, tags, description, responsibilities, requirements, created_at")
    .eq("status", "Active").is("archived_at", null).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const companyIds = [...new Set((jobs ?? []).map((job) => job.company_id).filter(Boolean))];
  const [{ data: companies }, { data: profiles }] = await Promise.all([
    supabase.from("companies").select("id, name, verification_status").in("id", companyIds),
    supabase.from("company_profiles").select("company_id, logo_url").in("company_id", companyIds),
  ]);
  const companyById = new Map((companies ?? []).map((company) => [company.id, company]));
  const logoById = new Map((profiles ?? []).map((profile) => [profile.company_id, profile.logo_url]));
  const jobIds = (jobs ?? []).map((job) => job.id);
  const { data: apps } = jobIds.length
    ? await supabase.from("applications").select("job_id").in("job_id", jobIds)
    : { data: [] };
  const appCounts = new Map<string, number>();
  for (const app of apps ?? []) appCounts.set(app.job_id, (appCounts.get(app.job_id) ?? 0) + 1);
  const result: ScrapedJob[] = (jobs ?? []).map((job) => {
    const company = companyById.get(job.company_id);
    return {
      _id: job.id,
      companyId: job.company_id,
      employerId: job.company_id,
      title: job.title,
      company: company?.name || "Unknown Company",
      companyLogo: logoById.get(job.company_id) || null,
      companyVerified: company?.verification_status === "verified",
      location: job.location,
      locationType: job.location_type?.toLowerCase() as ScrapedJob["locationType"],
      type: job.type?.toLowerCase() as ScrapedJob["type"],
      salary: job.salary_range,
      url: `/apply/${job.id}`,
      source: "Crucible",
      description: job.description,
      responsibilities: job.responsibilities || [],
      requirements: job.requirements || [],
      tags: job.tags || [],
      posted_at: job.created_at,
      applicantCount: appCounts.get(job.id) ?? 0,
    };
  });
  return NextResponse.json(result);
}
