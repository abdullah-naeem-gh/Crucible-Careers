import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { companyErrorResponse, getEmployerContext } from "@/lib/employer/server/company-context";
import { recordCompanyAudit } from "@/lib/employer/server/company-admin";
import type { EmployerJob } from "@/types/employer/job";

function mapJob(job: any, companyName: string, verified: boolean, counts?: { applications?: number; views?: number; hires?: number }): EmployerJob {
  return {
    id: job.id,
    companyId: job.company_id,
    company: companyName,
    companyVerified: verified,
    createdByUserId: job.created_by_user_id,
    assignedToUserId: job.assigned_to_user_id,
    title: job.title,
    location: job.location,
    locationType: job.location_type,
    type: job.type,
    status: job.status,
    salary: job.salary_range || undefined,
    tags: job.tags || [],
    description: job.description || "",
    responsibilities: job.responsibilities || [],
    requirements: job.requirements || [],
    postedAt: new Date(job.created_at).toLocaleDateString(),
    applications: counts?.applications ?? 0,
    views: counts?.views ?? 0,
    hires: counts?.hires ?? 0,
    matchScore: 0,
    formConfig: job.form_config,
  };
}

export async function GET(request: NextRequest) {
  try {
    const context = await getEmployerContext();
    const admin = createSupabaseAdminClient();
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get("page");
    const statusFilter = searchParams.get("status");
    const isPaginated = pageParam !== null;
    let query = admin.from("jobs").select("*", { count: "exact" })
      .eq("company_id", context.companyId)
      .order("created_at", { ascending: false });
    query = statusFilter === "archived" ? query.not("archived_at", "is", null) : query.is("archived_at", null);
    if (context.role !== "admin" && !context.permissions.viewAllJobs) {
      query = query.or(`created_by_user_id.eq.${context.userId},assigned_to_user_id.eq.${context.userId}`);
    }
    if (statusFilter === "active") query = query.eq("status", "Active");
    if (statusFilter === "inactive") query = query.in("status", ["Paused", "Closed", "Draft"]);
    let page = 1;
    let limit = 10;
    if (isPaginated) {
      page = Math.max(1, Number.parseInt(pageParam || "1", 10) || 1);
      limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limit") || "10", 10) || 10));
      query = query.range((page - 1) * limit, page * limit - 1);
    }
    const { data, error, count } = await query;
    if (error) throw error;
    const rows = data ?? [];
    const jobIds = rows.map((job) => job.id);
    const appCounts = new Map<string, number>();
    const hireCounts = new Map<string, number>();
    const viewCounts = new Map<string, number>();
    if (jobIds.length) {
      const [{ data: apps }, { data: views }] = await Promise.all([
        admin.from("applications").select("job_id, status").in("job_id", jobIds),
        admin.from("job_views").select("job_id").in("job_id", jobIds),
      ]);
      for (const app of apps ?? []) {
        appCounts.set(app.job_id, (appCounts.get(app.job_id) ?? 0) + 1);
        if (app.status === "hired") hireCounts.set(app.job_id, (hireCounts.get(app.job_id) ?? 0) + 1);
      }
      for (const view of views ?? []) viewCounts.set(view.job_id, (viewCounts.get(view.job_id) ?? 0) + 1);
    }
    const jobs = rows.map((job) => mapJob(job, context.companyName, context.verificationStatus === "verified", {
      applications: appCounts.get(job.id), views: viewCounts.get(job.id), hires: hireCounts.get(job.id),
    }));
    if (!isPaginated) return NextResponse.json(jobs);
    const total = count ?? jobs.length;
    return NextResponse.json({ jobs, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    return companyErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getEmployerContext();
    const payload = await request.json();
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.from("jobs").insert({
      company_id: context.companyId,
      created_by_user_id: context.userId,
      assigned_to_user_id: context.userId,
      title: payload.title,
      location: payload.location,
      location_type: payload.locationType,
      type: payload.type,
      status: payload.status,
      salary_range: payload.salary,
      tags: payload.tags,
      description: payload.description,
      responsibilities: payload.responsibilities,
      requirements: payload.requirements,
      form_config: payload.formConfig,
    }).select().single();
    if (error || !data) throw error || new Error("Unable to create job.");
    await recordCompanyAudit({
      companyId: context.companyId, actorUserId: context.userId,
      action: "job.created", entityType: "job", entityId: data.id,
      metadata: { title: data.title, status: data.status },
    });
    return NextResponse.json(mapJob(data, context.companyName, context.verificationStatus === "verified"), { status: 201 });
  } catch (error) {
    return companyErrorResponse(error);
  }
}
