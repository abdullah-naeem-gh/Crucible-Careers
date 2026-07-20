import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/shared/supabase/server";
import { getValidAccessToken } from "@/lib/employer/calendar/tokens";
import { deleteGoogleEvent } from "@/lib/employer/calendar/googleCalendar";
import { deleteMicrosoftEvent } from "@/lib/employer/calendar/microsoftCalendar";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: interview, error: fetchError } = await supabase
    .from("interviews")
    .select("id, calendar_provider, calendar_event_id")
    .eq("id", id)
    .eq("employer_id", user.id)
    .single();

  if (fetchError || !interview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }

  const { error: deleteError } = await supabase
    .from("interviews")
    .delete()
    .eq("id", id)
    .eq("employer_id", user.id);

  if (deleteError) {
    console.error("Error deleting interview:", deleteError);
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // Best-effort cleanup on the external calendar — a failed remote delete
  // must never undo the local delete already committed above.
  if (interview.calendar_provider && interview.calendar_event_id) {
    try {
      const provider = interview.calendar_provider as "google" | "microsoft";
      const accessToken = await getValidAccessToken(supabase, user.id, provider);
      if (accessToken) {
        if (provider === "google") {
          await deleteGoogleEvent(accessToken, interview.calendar_event_id);
        } else {
          await deleteMicrosoftEvent(accessToken, interview.calendar_event_id);
        }
      }
    } catch (err) {
      console.error("Failed to delete interview from external calendar:", err);
    }
  }

  return NextResponse.json({ success: true });
}
