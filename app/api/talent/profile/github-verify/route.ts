import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/shared/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const githubIdentity = user.identities?.find((identity) => identity.provider === "github");
  if (!githubIdentity) {
    return NextResponse.json({ error: "No linked GitHub identity found." }, { status: 400 });
  }

  const identityData = githubIdentity.identity_data as Record<string, unknown> | undefined;
  const username = (identityData?.user_name || identityData?.preferred_username || identityData?.login) as string | undefined;

  if (!username) {
    return NextResponse.json({ error: "Could not determine GitHub username." }, { status: 400 });
  }

  const verifiedAt = new Date().toISOString();

  const { error } = await supabase
    .from("talent_profiles")
    .upsert(
      { user_id: user.id, github_verified_username: username, github_verified_at: verifiedAt },
      { onConflict: "user_id" },
    );

  if (error) {
    console.error("Error saving GitHub verification:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ githubVerifiedUsername: username, githubVerifiedAt: verifiedAt });
}
