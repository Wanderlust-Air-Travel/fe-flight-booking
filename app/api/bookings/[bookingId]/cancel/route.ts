import { NextRequest, NextResponse } from "next/server";
import axiosInstance from "@/lib/axios-instance";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function PATCH(
  req: NextRequest,
  context: { params: { bookingId?: string } }
) {
  try {
    // Handle both Next.js 13-14 (sync params) and Next.js 15+ (async params)
    const params = await Promise.resolve(context.params);
    const bookingId = params?.bookingId;

    if (!bookingId) {
      return NextResponse.json(
        { message: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 }
      );
    }

    // Call backend API
    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/bookings/${encodeURIComponent(bookingId)}/cancel`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to cancel booking" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

