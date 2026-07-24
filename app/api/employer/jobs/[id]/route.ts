import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { canAccessOwnedResource, companyErrorResponse, getEmployerContext } from "@/lib/employer/server/company-context";
import { recordCompanyAudit } from "@/lib/employer/server/company-admin";
import { buildJobEmbeddingText } from "@/lib/employer/services/jobEmbeddingText";
import { embedText } from "@/lib/shared/embeddings/embed";
import { getQdrantClient, COLLECTIONS } from "@/lib/shared/qdrant/client";

function formatJob(job: any, context: Awaited<ReturnType<typeof getEmployerContext>>) {
  return {
    id: job.id,
    companyId: context.companyId,
    company: context.companyName,
    companyVerified: context.verificationStatus === "verified",
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
    applications: 0,
    views: 0,
    hires: 0,
    formConfig: job.form_config,
  };
}

async function getAuthorizedJob(id: string, manage = false) {
  const context = await getEmployerContext();
  const admin = createSupabaseAdminClient();
  const { data: job } = await admin.from("jobs").select("*")
    .eq("id", id).eq("company_id", context.companyId).maybeSingle();
  if (!job) return { context, admin, job: null };
  const permission = manage ? "manageAllJobs" : "viewAllJobs";
  if (!canAccessOwnedResource(context, job.assigned_to_user_id || job.created_by_user_id, permission)) {
    return { context, admin, job: null };
  }
  return { context, admin, job };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { context, job } = await getAuthorizedJob(id);
    if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });
    return NextResponse.json(formatJob(job, context));
  } catch (error) { return companyErrorResponse(error); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { context, admin, job } = await getAuthorizedJob(id, true);
    if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });
    const payload = await request.json();
    const patch: Record<string, unknown> = {};
    const fields: Record<string, string> = {
      title: "title", location: "location", locationType: "location_type", type: "type", status: "status",
      salary: "salary_range", tags: "tags", description: "description", responsibilities: "responsibilities",
      requirements: "requirements", formConfig: "form_config", assignedToUserId: "assigned_to_user_id",
    };
    for (const [source, target] of Object.entries(fields)) {
      if (payload[source] !== undefined) patch[target] = payload[source];
    }
    const { data, error } = await admin.from("jobs").update(patch).eq("id", id).select().single();
    if (error) throw error;
    await recordCompanyAudit({
      companyId: context.companyId, actorUserId: context.userId,
      action: "job.updated", entityType: "job", entityId: id,
      metadata: { fields: Object.keys(patch) },
    });

    const updatedJob = formatJob(data, context);

    // Best-effort sync to the vector store — a Qdrant/model hiccup must never
    // block or fail the actual job update, since Postgres already has it.
    try {
      const text = buildJobEmbeddingText(updatedJob);
      const vector = await embedText(text);
      const qdrant = await getQdrantClient();
      await qdrant.upsert(COLLECTIONS.jobs, {
        points: [{ id: updatedJob.id, vector, payload: { company_id: context.companyId, status: updatedJob.status, updated_at: new Date().toISOString() } }],
      });
    } catch (err) {
      console.error("Failed to update job embedding:", err);
    }

    return NextResponse.json(updatedJob);
  } catch (error) { return companyErrorResponse(error); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { context, admin, job } = await getAuthorizedJob(id, true);
    if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });
    const hard = new URL(request.url).searchParams.get("hard") === "true";
    if (hard && context.role !== "admin") return NextResponse.json({ error: "Only admins can permanently delete jobs." }, { status: 403 });
    if (hard) await admin.from("jobs").delete().eq("id", id);
    else await admin.from("jobs").update({ archived_at: new Date().toISOString(), status: "Closed" }).eq("id", id);
    await recordCompanyAudit({
      companyId: context.companyId, actorUserId: context.userId,
      action: hard ? "job.deleted" : "job.archived", entityType: "job", entityId: id,
      metadata: { title: job.title },
    });

    // Best-effort cleanup — a permanently deleted job shouldn't keep
    // surfacing in future match results just because its vector lingered.
    if (hard) {
      try {
        const qdrant = await getQdrantClient();
        await qdrant.delete(COLLECTIONS.jobs, { points: [id] });
      } catch (err) {
        console.error("Failed to delete job embedding:", err);
      }
    }

    return NextResponse.json({ success: true, archived: !hard });
  } catch (error) { return companyErrorResponse(error); }
}
