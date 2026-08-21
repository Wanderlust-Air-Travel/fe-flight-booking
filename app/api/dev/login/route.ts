// app/api/dev/login/route.ts
import { type NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * POST /api/dev/login
 *
 * Proxy to the backend dev-only login endpoint. Issues a real JWT session
 * for the supplied email without verifying a password. The backend hard-gates
 * this route (NODE_ENV + DEV_LOGIN_ENABLED); if it returns 404 here we
 * surface the same status to the FE.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.email !== "string" || body.email.trim() === "") {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const response = await fetch(`${BACKEND_API_URL}/api/v1/dev/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API /api/dev/login] Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
