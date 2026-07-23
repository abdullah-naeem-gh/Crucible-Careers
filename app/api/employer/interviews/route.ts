import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { canAccessOwnedResource, getEmployerContext } from "@/lib/employer/server/company-context";
import { recordCompanyAudit } from "@/lib/employer/server/company-admin";
import { getValidAccessToken } from "@/lib/employer/calendar/tokens";
import { createGoogleEvent } from "@/lib/employer/calendar/googleCalendar";
import { createMicrosoftEvent } from "@/lib/employer/calendar/microsoftCalendar";
import type { CalendarProvider } from "@/lib/employer/calendar/types";

export async function GET() {
  const context = await getEmployerContext();
  const supabase = createSupabaseAdminClient();

  let query = supabase
    .from("interviews")
    .select("id, scheduled_date, start_time, end_time, format, location, calendar_event_link, applications(profile_snapshot, jobs(title))")
    .eq("company_id", context.companyId)
    .order("scheduled_date", { ascending: true });
  if (context.role !== 'admin' && !context.permissions.viewAllApplicants) query = query.eq('organizer_user_id', context.userId)
  const { data, error } = await query;

  if (error) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const events = (data ?? []).map((row) => {
    const application = row.applications as any;
    return {
      id: row.id,
      candidateName: application?.profile_snapshot?.name || "Candidate",
      jobTitle: application?.jobs?.title || "",
      date: row.scheduled_date,
      startTime: row.start_time,
      endTime: row.end_time,
      format: row.format,
      location: row.location || "",
      calendarEventLink: row.calendar_event_link || null,
    };
  });

  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const context = await getEmployerContext();
  const supabase = createSupabaseAdminClient();

  const body = await request.json().catch(() => ({}));
  const { applicationId, date, startTime, endTime, format, location, timeZone } = body;

  if (!applicationId || !date || !startTime || !endTime || !format) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (endTime <= startTime) {
    return NextResponse.json({ error: "End time must be later than the start time." }, { status: 400 });
  }

  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .select("id, profile_snapshot, jobs(id, title, company_id, created_by_user_id, assigned_to_user_id)")
    .eq("id", applicationId)
    .single();

  const job = application?.jobs as any;
  if (applicationError || !application || !job || job.company_id !== context.companyId
    || !canAccessOwnedResource(context, job.assigned_to_user_id || job.created_by_user_id, 'manageAllApplicants')) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const { data: interview, error: insertError } = await supabase
    .from("interviews")
    .insert({
      application_id: applicationId,
      company_id: context.companyId,
      organizer_user_id: context.userId,
      scheduled_date: date,
      start_time: startTime,
      end_time: endTime,
      format,
      location: location || null,
    })
    .select()
    .single();

  if (insertError || !interview) {
    console.error("Error creating interview:", insertError);
    return NextResponse.json({ error: insertError?.message || "Failed to schedule interview" }, { status: 500 });
  }

  const candidateName = (application.profile_snapshot as any)?.name || "Candidate";

  // Best-effort push to whichever calendar the employer has connected — a
  // failed external sync must never undo the interview already saved above.
  let calendarProvider: CalendarProvider | null = null;
  let calendarEventLink: string | null = null;
  let calendarSyncError: string | null = null;
  let hadConnection = false;

  try {
    for (const provider of ["google", "microsoft"] as const) {
      const accessToken = await getValidAccessToken(supabase, context.userId, provider);
      if (!accessToken) continue;
      hadConnection = true;

      const eventInput = {
        summary: `Interview with ${candidateName}`,
        description: `${job.title} — interview scheduled via Crucible Careers`,
        startDateTime: `${date}T${startTime}:00`,
        endDateTime: `${date}T${endTime}:00`,
        timeZone: timeZone || "UTC",
        location: location || undefined,
      };

      const result = provider === "google"
        ? await createGoogleEvent(accessToken, eventInput)
        : await createMicrosoftEvent(accessToken, eventInput);

      calendarProvider = provider;
      calendarEventLink = result.eventLink || null;

      await supabase
        .from("interviews")
        .update({ calendar_provider: provider, calendar_event_id: result.eventId, calendar_event_link: result.eventLink })
        .eq("id", interview.id);

      break; // only push to the first connected provider
    }
  } catch (err) {
    console.error("Failed to push interview to external calendar:", err);
    if (hadConnection) calendarSyncError = err instanceof Error ? err.message : "Failed to sync to your connected calendar.";
  }

  await recordCompanyAudit({ companyId: context.companyId, actorUserId: context.userId, action: 'interview.scheduled', entityType: 'interview', entityId: interview.id, metadata: { jobId: job.id } });
  return NextResponse.json(
    {
      id: interview.id,
      candidateName,
      jobTitle: job.title,
      date: interview.scheduled_date,
      startTime: interview.start_time,
      endTime: interview.end_time,
      format: interview.format,
      location: interview.location || "",
      calendarProvider,
      calendarEventLink,
      calendarSyncError,
    },
    { status: 201 },
  );
}
