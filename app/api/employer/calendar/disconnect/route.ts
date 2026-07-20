import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/shared/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const provider = body.provider;
  if (provider !== "google" && provider !== "microsoft") {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const { error } = await supabase
    .from("employer_calendar_connections")
    .delete()
    .eq("employer_id", user.id)
    .eq("provider", provider);

  if (error) {
    console.error("Error disconnecting calendar:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
