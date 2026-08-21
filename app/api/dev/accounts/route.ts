// app/api/dev/accounts/route.ts
import { type NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * GET /api/dev/accounts
 *
 * Proxy to backend dev-only endpoint that lists one active user per role.
 * The backend hard-gates this route (NODE_ENV + DEV_LOGIN_ENABLED); if it
 * returns 404 here we surface the same status to the FE.
 */
export async function GET(_req: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/dev/accounts`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      // Disable Next.js fetch caching: list reflects live DB state.
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API /api/dev/accounts] Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
