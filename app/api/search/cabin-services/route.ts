import { type NextRequest, NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/api-proxy";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fareClassCode = searchParams.get("fareClassCode");
  const cabinClassCode = searchParams.get("cabinClassCode");

  if (!fareClassCode || !cabinClassCode) {
    return NextResponse.json(
      { message: "fareClassCode and cabinClassCode are required" },
      { status: 400 }
    );
  }

  return proxyToBackend(req, "/api/v1/search/cabin-services");
}
