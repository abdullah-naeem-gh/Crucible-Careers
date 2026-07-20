import type { CalendarEventInput, CalendarEventResult, OAuthTokenResult } from "./types";

const tenant = () => process.env.MICROSOFT_TENANT_ID || "common";
const AUTH_URL = () => `https://login.microsoftonline.com/${tenant()}/oauth2/v2.0/authorize`;
const TOKEN_URL = () => `https://login.microsoftonline.com/${tenant()}/oauth2/v2.0/token`;
const EVENTS_URL = "https://graph.microsoft.com/v1.0/me/events";
const ME_URL = "https://graph.microsoft.com/v1.0/me";

const SCOPES = "offline_access User.Read Calendars.ReadWrite";

function redirectUri() {
  return `${process.env.NEXT_PUBLIC_SITE_URL}/api/employer/calendar/microsoft/callback`;
}

export function getMicrosoftAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID || "",
    redirect_uri: redirectUri(),
    response_type: "code",
    response_mode: "query",
    scope: SCOPES,
    state,
  });
  return `${AUTH_URL()}?${params.toString()}`;
}

export async function exchangeMicrosoftCode(code: string): Promise<OAuthTokenResult> {
  const res = await fetch(TOKEN_URL(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.MICROSOFT_CLIENT_ID || "",
      client_secret: process.env.MICROSOFT_CLIENT_SECRET || "",
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
      scope: SCOPES,
    }),
  });
  if (!res.ok) throw new Error(`Microsoft token exchange failed: ${await res.text()}`);
  const data = await res.json();
  return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresIn: data.expires_in };
}

export async function refreshMicrosoftToken(refreshToken: string): Promise<OAuthTokenResult> {
  const res = await fetch(TOKEN_URL(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.MICROSOFT_CLIENT_ID || "",
      client_secret: process.env.MICROSOFT_CLIENT_SECRET || "",
      grant_type: "refresh_token",
      scope: SCOPES,
    }),
  });
  if (!res.ok) throw new Error(`Microsoft token refresh failed: ${await res.text()}`);
  const data = await res.json();
  return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresIn: data.expires_in };
}

export async function getMicrosoftUserEmail(accessToken: string): Promise<string | null> {
  const res = await fetch(ME_URL, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return null;
  const data = await res.json();
  return data.mail ?? data.userPrincipalName ?? null;
}

export async function createMicrosoftEvent(accessToken: string, event: CalendarEventInput): Promise<CalendarEventResult> {
  const res = await fetch(EVENTS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      subject: event.summary,
      body: { contentType: "text", content: event.description || "" },
      start: { dateTime: event.startDateTime, timeZone: event.timeZone },
      end: { dateTime: event.endDateTime, timeZone: event.timeZone },
      location: event.location ? { displayName: event.location } : undefined,
    }),
  });
  if (!res.ok) throw new Error(`Microsoft event creation failed: ${await res.text()}`);
  const data = await res.json();
  return { eventId: data.id, eventLink: data.webLink };
}

export async function deleteMicrosoftEvent(accessToken: string, eventId: string): Promise<void> {
  const res = await fetch(`${EVENTS_URL}/${eventId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  // 404 means it was already deleted on Microsoft's side — not an error for us.
  if (!res.ok && res.status !== 404) {
    throw new Error(`Microsoft event deletion failed: ${await res.text()}`);
  }
}
