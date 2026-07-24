import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/shared/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("companies")
    .select("id, name, verification_status, company_profiles(logo_url)").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const seen = new Set<string>();
  const companies = (data ?? []).flatMap((company: any) => {
    const name = company.name?.trim();
    if (!name || seen.has(name)) return [];
    seen.add(name);
    const profile = Array.isArray(company.company_profiles) ? company.company_profiles[0] : company.company_profiles;
    return [{ name, logo: profile?.logo_url || null, verified: company.verification_status === "verified" }];
  });
  return NextResponse.json({ companies });
}
