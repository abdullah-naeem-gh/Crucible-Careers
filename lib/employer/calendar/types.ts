export type CalendarProvider = "google" | "microsoft";

export interface CalendarEventInput {
  summary: string;
  description?: string;
  /** ISO 8601 with offset, e.g. 2026-07-20T09:00:00-05:00 */
  startDateTime: string;
  endDateTime: string;
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
