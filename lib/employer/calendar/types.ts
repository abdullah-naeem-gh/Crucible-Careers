export type CalendarProvider = "google" | "microsoft";

export interface CalendarEventInput {
  summary: string;
  description?: string;
  /** Local wall-clock time, no offset/Z suffix, e.g. 2026-07-20T09:00:00 — interpreted using `timeZone` */
  startDateTime: string;
  endDateTime: string;
  /** IANA time zone name, e.g. Asia/Karachi */
  timeZone: string;
  location?: string;
}

export interface CalendarEventResult {
  eventId: string;
  eventLink?: string;
}

export interface OAuthTokenResult {
  accessToken: string;
  refreshToken?: string;
  /** Seconds until the access token expires */
  expiresIn: number;
}
