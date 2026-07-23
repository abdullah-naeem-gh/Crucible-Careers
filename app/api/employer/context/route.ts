import { NextResponse } from "next/server";
import { companyErrorResponse, getEmployerContext } from "@/lib/employer/server/company-context";

export async function GET() {
  try {
    return NextResponse.json({ context: await getEmployerContext() });
  } catch (error) {
    return companyErrorResponse(error);
  }
}
