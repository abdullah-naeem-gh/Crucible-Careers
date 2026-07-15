import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/shared/supabase/server";
import { getMicrosoftAuthUrl } from "@/lib/employer/calendar/microsoftCalendar";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/employer/login", request.url));
  }

  const state = crypto.randomUUID();
  const response = NextResponse.redirect(getMicrosoftAuthUrl(state));
  response.cookies.set("microsoft_calendar_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
