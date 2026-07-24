import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/shared/supabase/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { id } = await params;
  const { data: job } = await supabase.from("jobs").select("*")
    .eq("id", id).eq("status", "Active").is("archived_at", null).maybeSingle();
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  const [{ data: company }, { data: profile }] = await Promise.all([
    supabase.from("companies").select("id, name, verification_status").eq("id", job.company_id).single(),
    supabase.from("company_profiles").select("logo_url").eq("company_id", job.company_id).maybeSingle(),
  ]);
  return NextResponse.json({
    id: job.id,
    companyId: job.company_id,
    company: company?.name || "Unknown Company",
    companyLogo: profile?.logo_url || null,
    companyVerified: company?.verification_status === "verified",
    title: job.title,
    location: job.location,
    locationType: job.location_type,
    type: job.type,
    status: job.status,
    salary: job.salary_range || undefined,
    tags: job.tags || [],
    postedAt: new Date(job.created_at).toLocaleDateString(),
    description: job.description || "",
    responsibilities: job.responsibilities || [],
    requirements: job.requirements || [],
    applications: 0, views: 0, hires: 0, matchScore: 0,
    formConfig: job.form_config,
  });
}
