import type { SupabaseClient } from "@supabase/supabase-js";
import { refreshGoogleToken } from "./googleCalendar";
import { refreshMicrosoftToken } from "./microsoftCalendar";
import type { CalendarProvider } from "./types";

/**
 * Returns a valid access token for the employer's connection to `provider`,
 * refreshing (and persisting the refresh) if the stored token has expired.
 * Returns null if there's no connection, or if refreshing fails.
 */
export async function getValidAccessToken(
  supabase: SupabaseClient,
  employerId: string,
  provider: CalendarProvider,
): Promise<string | null> {
  const { data: connection } = await supabase
    .from("employer_calendar_connections")
    .select("access_token, refresh_token, token_expires_at")
    .eq("employer_id", employerId)
    .eq("provider", provider)
    .single();

  if (!connection) return null;

  const expired = connection.token_expires_at && new Date(connection.token_expires_at).getTime() <= Date.now();
  if (!expired) return connection.access_token;

  if (!connection.refresh_token) return null;

  try {
    const refreshed = provider === "google"
      ? await refreshGoogleToken(connection.refresh_token)
      : await refreshMicrosoftToken(connection.refresh_token);

    await supabase
      .from("employer_calendar_connections")
      .update({
        access_token: refreshed.accessToken,
        refresh_token: refreshed.refreshToken || connection.refresh_token,
        token_expires_at: new Date(Date.now() + refreshed.expiresIn * 1000).toISOString(),
      })
      .eq("employer_id", employerId)
      .eq("provider", provider);

    return refreshed.accessToken;
  } catch (err) {
    console.error(`Failed to refresh ${provider} calendar token:`, err);
    return null;
  }
}
