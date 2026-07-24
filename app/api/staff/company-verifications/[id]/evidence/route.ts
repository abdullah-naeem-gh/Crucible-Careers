import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { requireCompanyReviewer } from "@/lib/employer/server/staff";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const reviewer = await requireCompanyReviewer();
  if (!reviewer) return NextResponse.json({ error: "Reviewer access required." }, { status: 403 });
  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const { data: verification } = await admin.from("company_verification_requests")
    .select("evidence_paths").eq("id", id).maybeSingle();
  if (!verification) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  const urls = await Promise.all((verification.evidence_paths ?? []).map(async (path: string) => {
    const { data } = await admin.storage.from("company-verification").createSignedUrl(path, 300);
    return data?.signedUrl ?? null;
  }));
  return NextResponse.json({ urls: urls.filter(Boolean) });
}
