import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/shared/supabase/server";
import * as XLSX from "xlsx";

function addSheet(workbook: XLSX.WorkBook, name: string, rows: Record<string, unknown>[]) {
  const sheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{}]);
  XLSX.utils.book_append_sheet(workbook, sheet, name);
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profileRes, talentProfileRes, applicationsRes, savedJobsRes, settingsRes] = await Promise.all([
    supabase.from("profiles").select("first_name, last_name, role").eq("id", user.id).single(),
    supabase
      .from("talent_profiles")
      .select("*, talent_experiences (*), talent_educations (*), talent_projects (*)")
      .eq("user_id", user.id)
      .single(),
    supabase.from("applications").select("*").eq("talent_id", user.id),
    supabase.from("saved_jobs").select("*").eq("talent_id", user.id),
    supabase.from("talent_settings").select("*").eq("user_id", user.id).single(),
  ]);

  const talentProfile = talentProfileRes.data as Record<string, any> | null;
  const { talent_experiences, talent_educations, talent_projects, ...profileFields } = talentProfile ?? {
    talent_experiences: [],
    talent_educations: [],
    talent_projects: [],
  };

  const workbook = XLSX.utils.book_new();

  addSheet(workbook, "Account", [{
    id: user.id,
    email: user.email ?? "",
    firstName: profileRes.data?.first_name ?? "",
    lastName: profileRes.data?.last_name ?? "",
    role: profileRes.data?.role ?? "",
    createdAt: user.created_at ?? "",
    exportedAt: new Date().toISOString(),
  }]);
  addSheet(workbook, "Profile", talentProfile ? [profileFields] : []);
  addSheet(workbook, "Experience", talent_experiences ?? []);
  addSheet(workbook, "Education", talent_educations ?? []);
  addSheet(workbook, "Projects", talent_projects ?? []);
  addSheet(workbook, "Applications", applicationsRes.data ?? []);
  addSheet(workbook, "Saved Jobs", savedJobsRes.data ?? []);
  addSheet(workbook, "Settings", settingsRes.data ? [settingsRes.data] : []);

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=\"crucible-careers-data-export.xlsx\"",
    },
  });
}
