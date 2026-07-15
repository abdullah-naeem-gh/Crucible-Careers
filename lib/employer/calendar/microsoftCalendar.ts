import type { CalendarEventInput, CalendarEventResult, OAuthTokenResult } from "./types";

const tenant = () => process.env.MICROSOFT_TENANT_ID || "common";
const AUTH_URL = () => `https://login.microsoftonline.com/${tenant()}/oauth2/v2.0/authorize`;
const TOKEN_URL = () => `https://login.microsoftonline.com/${tenant()}/oauth2/v2.0/token`;
const EVENTS_URL = "https://graph.microsoft.com/v1.0/me/events";
const ME_URL = "https://graph.microsoft.com/v1.0/me";

const SCOPES = "offline_access User.Read Calendars.ReadWrite";

function redirectUri() {
  return `${process.env.FRONTEND_URL}/api/employer/calendar/microsoft/callback`;
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
  // Graph wants a bare local dateTime + separate IANA timeZone rather than an
  // offset-suffixed ISO string — callers pass UTC ISO ("...Z"), stripped here.
  const toGraphDateTime = (iso: string) => iso.replace("Z", "");

  const res = await fetch(EVENTS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      subject: event.summary,
      body: { contentType: "text", content: event.description || "" },
      start: { dateTime: toGraphDateTime(event.startDateTime), timeZone: "UTC" },
      end: { dateTime: toGraphDateTime(event.endDateTime), timeZone: "UTC" },
      location: event.location ? { displayName: event.location } : undefined,
    }),
  });
  if (!res.ok) throw new Error(`Microsoft event creation failed: ${await res.text()}`);
  const data = await res.json();
  return { eventId: data.id, eventLink: data.webLink };
}
