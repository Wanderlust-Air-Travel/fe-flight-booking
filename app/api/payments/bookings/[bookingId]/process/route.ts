// app/api/payments/bookings/[bookingId]/process/route.ts
import { type NextRequest, NextResponse } from "next/server";

// Backend API base URL - In Next.js API routes, NEXT_PUBLIC_* env vars are not available
// Use regular env var or fallback to default
const BACKEND_API_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    // Authorization header is optional - for guest users
    const authHeader = req.headers.get("authorization");

    // Lấy bookingId từ URL path: /api/payments/bookings/:bookingId/process
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const bookingsIndex = pathParts.findIndex((part) => part === "bookings");
    const bookingId = bookingsIndex !== -1 ? pathParts[bookingsIndex + 1] : undefined;

    if (!bookingId) {
      return NextResponse.json(
        { message: "bookingId path parameter is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { paymentMethodCode, transactionRef, idempotencyKey, amount } = body ?? {};

    if (!paymentMethodCode) {
      return NextResponse.json({ message: "paymentMethodCode is required" }, { status: 400 });
    }

    // Build headers for backend request
    const backendHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add Authorization header only if present (for authenticated users)
    if (authHeader) {
      backendHeaders.Authorization = authHeader;
    }

    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/payments/bookings/${encodeURIComponent(bookingId)}/process`,
      {
        method: "POST",
        headers: backendHeaders,
        body: JSON.stringify({
          paymentMethodCode,
          transactionRef,
          idempotencyKey,
          amount,
        }),
      }
    );

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error(
        "[payments/process] Non-JSON response from backend:",
        responseText.substring(0, 500)
      );
      return NextResponse.json({ message: "Invalid response from backend" }, { status: 502 });
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("[payments/process] Error:", error?.message || error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
