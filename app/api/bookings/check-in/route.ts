// app/api/bookings/check-in/route.ts
import { type NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingCode, segments } = body;

    // Validate required fields
    if (!bookingCode || !segments || !Array.isArray(segments)) {
      return NextResponse.json(
        { message: "bookingCode and segments array are required" },
        { status: 400 }
      );
    }

    // Proxy request to backend
    const response = await fetch(`${BACKEND_API_URL}/api/v1/bookings/check-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingCode,
        segments,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error checking in booking:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
