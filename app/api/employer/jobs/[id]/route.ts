import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/shared/supabase/server';
import { buildJobEmbeddingText } from '@/lib/employer/services/jobEmbeddingText';
import { embedText } from '@/lib/shared/embeddings/embed';
import { getQdrantClient, COLLECTIONS } from '@/lib/shared/qdrant/client';
import type { EmployerJob } from '@/types/employer/job';

export async function GET() {
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const payload = await request.json();

    const { data, error } = await supabase
      .from('jobs')
      .update({
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
      })
      .eq('id', id)
      .eq('employer_id', user.id)
      .select()
      .single();

    if (error) throw error;

    const { count: applicationCount } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', id);

    const { count: hiresCount } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', id)
      .eq('status', 'hired');

    const updatedJob: EmployerJob = {
      id: data.id,
      title: data.title,
      location: data.location,
      locationType: data.location_type,
      type: data.type,
      status: data.status,
      salary: data.salary_range || undefined,
      tags: data.tags || [],
      description: data.description || '',
      responsibilities: data.responsibilities || [],
      requirements: data.requirements || [],
      postedAt: new Date(data.created_at).toLocaleDateString(),
      applications: applicationCount ?? 0,
      views: 0,
      hires: hiresCount ?? 0,
      formConfig: data.form_config,
    };

    // Best-effort sync to the vector store — a Qdrant/model hiccup must never
    // block or fail the actual job update, since Postgres already has it.
    try {
      const text = buildJobEmbeddingText(updatedJob);
      const vector = await embedText(text);
      const qdrant = await getQdrantClient();
      await qdrant.upsert(COLLECTIONS.jobs, {
        points: [{ id: updatedJob.id, vector, payload: { employer_id: user.id, status: updatedJob.status, updated_at: new Date().toISOString() } }],
      });
    } catch (err) {
      console.error('Failed to update job embedding:', err);
    }

    return NextResponse.json(updatedJob);
  } catch (error: any) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)
      .eq('employer_id', user.id);

    if (error) throw error;

    // Best-effort cleanup — a deleted job shouldn't keep surfacing in future
    // match results just because its vector lingered in Qdrant.
    try {
      const qdrant = await getQdrantClient();
      await qdrant.delete(COLLECTIONS.jobs, { points: [id] });
    } catch (err) {
      console.error('Failed to delete job embedding:', err);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
