import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { createSupabaseServerClient } from "@/lib/shared/supabase/server";

export async function requireCompanyReviewer() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("platform_staff")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("can_review_companies", true)
    .maybeSingle();
  return data ? user : null;
}
