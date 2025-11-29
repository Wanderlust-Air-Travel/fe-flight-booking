// app/api/booking-state/seat/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Backend API base URL - In Next.js API routes, NEXT_PUBLIC_* env vars are not available
// Use regular env var or fallback to default
const BACKEND_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    // Lấy access token từ header (optional - for guest users)
    const authHeader = req.headers.get('authorization');
    const sessionIdHeader = req.headers.get('x-session-id');

    // Lấy body từ request
    const body = await req.json();
    const { flightInstanceId, flightSeatId, seatNumber } = body;

    // Validate required fields
    if (!flightInstanceId || !flightSeatId || !seatNumber) {
      return NextResponse.json(
        { message: 'flightInstanceId, flightSeatId, and seatNumber are required' },
        { status: 400 }
      );
    }

    // Build headers for backend request
    const backendHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if present (for authenticated users)
    if (authHeader) {
      backendHeaders['Authorization'] = authHeader;
    }
    
    // Add X-Session-Id header if present (for guest users)
    if (sessionIdHeader) {
      backendHeaders['X-Session-Id'] = sessionIdHeader;
    }

    // Proxy request to backend
    const response = await fetch(`${BACKEND_API_URL}/api/v1/booking-state/seat`, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify({
        flightInstanceId,
        flightSeatId,
        seatNumber,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error saving seat selection:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

