import { type NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Mock booking data for fallback
const generateMockBooking = (bookingId: string) => ({
  id: bookingId,
  code: `BK${bookingId?.slice(-6)?.toUpperCase() || "123456"}`,
  status: "CONFIRMED",
  passengers: [
    {
      id: "pax_001",
      firstName: "Demo",
      lastName: "User",
      dateOfBirth: "1990-01-15",
      nationality: "Vietnam",
      passportNumber: "B1234567",
      passportExpiry: "2030-01-15",
      seatNumber: "12A",
      mealPreference: "REGULAR",
      specialAssistance: null,
    },
  ],
  flights: [
    {
      id: "fl_001",
      flightNumber: "VN123",
      origin: { code: "HAN", name: "Noi Bai International Airport", city: "Hanoi" },
      destination: {
        code: "SGN",
        name: "Tan Son Nhat International Airport",
        city: "Ho Chi Minh City",
      },
      departureTime: "2026-06-15T08:00:00Z",
      arrivalTime: "2026-06-15T10:30:00Z",
      duration: "2h 30m",
      aircraft: "Airbus A321",
      cabin: "ECONOMY",
      price: {
        amount: 1500000,
        currency: "VND",
      },
    },
  ],
  contactInfo: {
    email: "demo@example.com",
    phone: "+84 123 456 789",
  },
  totalAmount: 1500000,
  currency: "VND",
  createdAt: "2026-06-01T10:00:00Z",
  updatedAt: "2026-06-01T10:00:00Z",
});

/**
 * GET /api/bookings/[bookingId]
 *
 * Proxy request to Go backend to get booking details
 * Falls back to mock data if backend is unavailable
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ bookingId?: string }> | { bookingId?: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    let bookingId = params?.bookingId;

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
          error: "MISSING_BOOKING_ID",
        },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization");

    const backendHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authHeader) {
      backendHeaders.Authorization = authHeader;
    }

    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/bookings/${encodeURIComponent(bookingId)}`,
      {
        method: "GET",
        headers: backendHeaders,
      }
    );

    if (response.status === 404) {
      console.log(`[API /api/bookings/${bookingId}] Backend returned 404, returning mock data`);
      return NextResponse.json(
        {
          data: generateMockBooking(bookingId),
          success: true,
          _mock: true,
        },
        { status: 200 }
      );
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[API /api/bookings] Error:", error);
    const params = await Promise.resolve(context.params);
    let bookingId = params?.bookingId;
    if (!bookingId) {
      const url = new URL(req.url);
      const pathParts = url.pathname.split("/");
      const bookingsIndex = pathParts.findIndex((part) => part === "bookings");
      bookingId = bookingsIndex !== -1 ? pathParts[bookingsIndex + 1] : undefined;
    }
    // Return mock data on connection error
    return NextResponse.json(
      {
        data: generateMockBooking(bookingId || "unknown"),
        success: true,
        _mock: true,
      },
      { status: 200 }
    );
  }
}
