import { createHash, randomBytes } from "crypto";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createInvitationToken() {
  return randomBytes(32).toString("base64url");
}

export function maskEmail(value: string) {
  const [local, domain = ""] = normalizeEmail(value).split("@");
  const maskedLocal = local.length <= 2
    ? `${local.charAt(0)}*`
    : `${local.charAt(0)}${"*".repeat(Math.min(5, local.length - 2))}${local.at(-1)}`;
  return `${maskedLocal}@${domain}`;
}

export async function recordCompanyAudit(input: {
  companyId: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("company_audit_events").insert({
    company_id: input.companyId,
    actor_user_id: input.actorUserId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? {},
  });
  if (error) console.error("Failed to record company audit event", error);
}

export async function getUserLabel(userId: string) {
  const admin = createSupabaseAdminClient();
  const [{ data: profile }, { data: authData }] = await Promise.all([
    admin.from("profiles").select("first_name, last_name, avatar_url").eq("id", userId).maybeSingle(),
    admin.auth.admin.getUserById(userId),
  ]);
  return {
    name: [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || authData.user?.email || "Crucible user",
    email: authData.user?.email || "",
    avatarUrl: profile?.avatar_url ?? null,
  };
}
