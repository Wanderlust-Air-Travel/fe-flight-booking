import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Mock reservation/booking data for fallback
const MOCK_RESERVATION = {
  id: `rsv_mock_${Date.now()}`,
  code: `BK${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  status: "PENDING_PAYMENT",
  passengers: [],
  flights: [
    {
      id: "fl_001",
      flightNumber: "VN123",
      origin: { code: "HAN", name: "Noi Bai International Airport", city: "Hanoi" },
      destination: { code: "SGN", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City" },
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
  totalAmount: 1500000,
  currency: "VND",
  expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
  createdAt: new Date().toISOString(),
};

/**
 * POST /api/reservations
 * 
 * Proxy request to Go backend to create a reservation
 * Falls back to mock response if backend is unavailable
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const sessionIdHeader = req.headers.get('x-session-id');
    
    const body = await req.json();
    const { segments, numberOfPassengers, currencyCode } = body;

    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return NextResponse.json(
        { message: 'segments array is required and must not be empty', error: 'INVALID_SEGMENTS' },
        { status: 400 }
      );
    }

    if (!numberOfPassengers || numberOfPassengers < 1) {
      return NextResponse.json(
        { message: 'numberOfPassengers is required and must be at least 1', error: 'INVALID_PASSENGERS' },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    if (sessionIdHeader) {
      headers['X-Session-Id'] = sessionIdHeader;
    }
    
    const response = await fetch(`${BACKEND_API_URL}/api/v1/reservations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        segments,
        numberOfPassengers,
        currencyCode: currencyCode || 'VND',
      }),
    });

    if (response.status === 404) {
      console.log('[API /api/reservations] Backend returned 404, returning mock reservation');
      return NextResponse.json({
        data: {
          ...MOCK_RESERVATION,
          id: `rsv_mock_${Date.now()}`,
          code: `BK${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        },
        success: true,
        _mock: true,
      }, { status: 200 });
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[API /api/reservations] Error:', error);
    // Return mock reservation on connection error
    return NextResponse.json({
      data: {
        ...MOCK_RESERVATION,
        id: `rsv_mock_${Date.now()}`,
        code: `BK${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      },
      success: true,
      _mock: true,
    }, { status: 200 });
  }
}

/**
 * GET /api/reservations
 * 
 * Proxy request to Go backend to get user's reservations
 * Falls back to mock response if backend is unavailable
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Authorization header is required', error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_API_URL}/api/v1/reservations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    if (response.status === 404) {
      console.log('[API /api/reservations] Backend returned 404, returning mock reservations');
      return NextResponse.json({
        data: [MOCK_RESERVATION],
        pagination: {
          page: 1,
          pageSize: 10,
          totalItems: 1,
          totalPages: 1,
        },
        success: true,
        _mock: true,
      }, { status: 200 });
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[API /api/reservations] Error:', error);
    // Return mock reservations on connection error
    return NextResponse.json({
      data: [MOCK_RESERVATION],
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
      },
      success: true,
      _mock: true,
    }, { status: 200 });
  }
}
