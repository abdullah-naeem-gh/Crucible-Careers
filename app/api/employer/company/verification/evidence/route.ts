import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/shared/supabase/admin";
import { companyErrorResponse, getEmployerContext } from "@/lib/employer/server/company-context";

const ALLOWED_TYPES = new Set(["application/pdf", "image/png", "image/jpeg"]);
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const context = await getEmployerContext({ requireAdmin: true });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose a file." }, { status: 400 });
    if (!ALLOWED_TYPES.has(file.type) || file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Evidence must be a PDF, PNG, or JPG up to 8 MB." }, { status: 400 });
    }
    const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
    const path = `${context.companyId}/${crypto.randomUUID()}.${extension}`;
    const admin = createSupabaseAdminClient();
    const { error } = await admin.storage.from("company-verification").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw error;
    return NextResponse.json({ path }, { status: 201 });
  } catch (error) {
    return companyErrorResponse(error);
  }
}
