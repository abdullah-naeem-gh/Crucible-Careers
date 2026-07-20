import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/shared/supabase/server";

// Re-syncs the verified username from an ALREADY-linked GitHub identity —
// used when the free-text link was edited (clearing our tracking columns)
// but the real Supabase identity link was never removed, so re-running the
// OAuth linkIdentity() flow would fail with "identity_already_exists".
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
  const verifiedUrl = `https://github.com/${username}`;

  // Also overwrite the free-text link to match the real verified account —
  // see the identical comment in app/api/auth/callback/route.ts. A plain
  // update() only touches the columns listed here — upsert() would reset
  // every other profile column to null.
  const { error } = await supabase
    .from("talent_profiles")
    .update({ github: verifiedUrl, github_verified_username: username, github_verified_at: verifiedAt })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error re-syncing GitHub verification:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ github: verifiedUrl, githubVerifiedUsername: username, githubVerifiedAt: verifiedAt });
}

export async function DELETE() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("talent_profiles")
    .update({ github_verified_username: null, github_verified_at: null })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error clearing GitHub verification:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
