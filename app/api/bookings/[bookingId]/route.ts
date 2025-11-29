// app/api/bookings/[bookingId]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ bookingId?: string }> | { bookingId?: string } }
) {
  try {
    // Handle both Next.js 13-14 (sync params) and Next.js 15+ (async params)
    const params = await Promise.resolve(context.params);
    let bookingId = params?.bookingId;

    // Fallback: Extract from URL path if params is not available
    if (!bookingId) {
      const url = new URL(req.url);
      const pathParts = url.pathname.split("/");
      const bookingsIndex = pathParts.findIndex((part) => part === "bookings");
      bookingId = bookingsIndex !== -1 ? pathParts[bookingsIndex + 1] : undefined;
    }

    if (!bookingId) {
      return NextResponse.json(
        { 
          message: "Booking ID is required. Please ensure you have a valid booking ID.",
          error: "MISSING_BOOKING_ID"
        },
        { status: 400 }
      );
    }

    // Authorization header is optional - for guest users
    const authHeader = req.headers.get("authorization");

    // Build headers for backend request
    const backendHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    // Add Authorization header only if present (for authenticated users)
    if (authHeader) {
      backendHeaders["Authorization"] = authHeader;
    }

    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/bookings/${encodeURIComponent(bookingId)}`,
      {
        method: "GET",
        headers: backendHeaders,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

