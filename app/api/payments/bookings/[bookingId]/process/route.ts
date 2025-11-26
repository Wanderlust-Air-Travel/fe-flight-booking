// app/api/payments/bookings/[bookingId]/process/route.ts
import { NextRequest, NextResponse } from "next/server";

// Backend API base URL - In Next.js API routes, NEXT_PUBLIC_* env vars are not available
// Use regular env var or fallback to default
const BACKEND_API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 }
      );
    }

    // Lấy bookingId từ URL path: /api/payments/bookings/:bookingId/process
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const bookingsIndex = pathParts.findIndex((part) => part === "bookings");
    const bookingId =
      bookingsIndex !== -1 ? pathParts[bookingsIndex + 1] : undefined;

    if (!bookingId) {
      return NextResponse.json(
        { message: "bookingId path parameter is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { paymentMethodCode, transactionRef, idempotencyKey, amount } = body ?? {};

    if (!paymentMethodCode) {
      return NextResponse.json(
        { message: "paymentMethodCode is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/payments/bookings/${encodeURIComponent(
        bookingId
      )}/process`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          paymentMethodCode,
          transactionRef,
          idempotencyKey,
          amount,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


