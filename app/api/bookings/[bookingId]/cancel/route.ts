import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * POST /api/bookings/[bookingId]/cancel
 * 
 * Proxy request to Go backend to cancel a booking
 * Falls back to mock response if backend is unavailable
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ bookingId: string }> | { bookingId?: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const bookingId = resolvedParams?.bookingId;

    if (!bookingId) {
      return NextResponse.json(
        { message: "Booking ID is required", error: "MISSING_BOOKING_ID" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header is required", error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/bookings/${encodeURIComponent(bookingId)}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(body),
      }
    );

    if (response.status === 404) {
      console.log(`[API /api/bookings/cancel] Backend returned 404 for booking ${bookingId}, returning mock response`);
      return NextResponse.json({
        success: true,
        message: "Booking cancelled successfully (mock)",
        bookingId: bookingId,
        status: "CANCELLED",
        refundAmount: 1350000,
        refundCurrency: "VND",
        refundStatus: "PENDING",
        _mock: true,
      }, { status: 200 });
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to cancel booking", error: data.error },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("[API /api/bookings/cancel] Error:", error);
    const resolvedParams = await Promise.resolve(context.params);
    const bookingId = resolvedParams?.bookingId;
    // Return mock response on connection error
    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully (mock)",
      bookingId: bookingId || "unknown",
      status: "CANCELLED",
      refundAmount: 1350000,
      refundCurrency: "VND",
      refundStatus: "PENDING",
      _mock: true,
    }, { status: 200 });
  }
}
