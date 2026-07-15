import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/shared/supabase/server";
import { exchangeGoogleCode, getGoogleUserEmail } from "@/lib/employer/calendar/googleCalendar";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const failureRedirect = new URL("/employer/dashboard?tab=overview&calendar=error", request.url);

  const storedState = request.cookies.get("google_calendar_oauth_state")?.value;
  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(failureRedirect);
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/employer/login", request.url));
  }

  try {
    const tokens = await exchangeGoogleCode(code);
    const email = await getGoogleUserEmail(tokens.accessToken);

    const { error } = await supabase
      .from("employer_calendar_connections")
      .upsert(
        {
          employer_id: user.id,
          provider: "google",
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          token_expires_at: new Date(Date.now() + tokens.expiresIn * 1000).toISOString(),
          provider_account_email: email,
        },
        { onConflict: "employer_id,provider" },
      );
    if (error) throw error;

    const response = NextResponse.redirect(new URL("/employer/dashboard?tab=overview&calendar=connected", request.url));
    response.cookies.delete("google_calendar_oauth_state");
    return response;
  } catch (err) {
    console.error("Google Calendar connection failed:", err);
    return NextResponse.redirect(failureRedirect);
  }
}
