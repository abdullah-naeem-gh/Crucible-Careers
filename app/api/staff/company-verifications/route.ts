import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { requireCompanyReviewer } from "@/lib/employer/server/staff";

export async function GET() {
  const reviewer = await requireCompanyReviewer();
  if (!reviewer) return NextResponse.json({ error: "Reviewer access required." }, { status: 403 });
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("company_verification_requests")
    .select("*, companies(name, verification_status)")
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
