import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/shared/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("employer_calendar_connections")
    .select("provider, provider_account_email")
    .eq("employer_id", user.id);

  const google = (data ?? []).find((c) => c.provider === "google");
  const microsoft = (data ?? []).find((c) => c.provider === "microsoft");

  return NextResponse.json({
    google: { connected: !!google, email: google?.provider_account_email ?? null },
    microsoft: { connected: !!microsoft, email: microsoft?.provider_account_email ?? null },
  });
}
