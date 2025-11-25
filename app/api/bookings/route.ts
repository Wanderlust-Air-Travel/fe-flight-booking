// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Backend API base URL - In Next.js API routes, NEXT_PUBLIC_* env vars are not available
// Use regular env var or fallback to default
const BACKEND_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    // Lấy access token từ header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Lấy reservationId từ query parameter
    const { searchParams } = new URL(req.url);
    const reservationId = searchParams.get('reservationId');

    if (!reservationId) {
      return NextResponse.json(
        { message: 'reservationId query parameter is required' },
        { status: 400 }
      );
    }

    // Lấy body từ request
    const body = await req.json();
    const { passengers, contactFullname, contactEmail, contactPhone, channel } = body;

    // Validate required fields
    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return NextResponse.json(
        { message: 'passengers array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Proxy request to backend
    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/bookings?reservationId=${encodeURIComponent(reservationId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          passengers,
          contactFullname,
          contactEmail,
          contactPhone,
          channel: channel || 'web',
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

