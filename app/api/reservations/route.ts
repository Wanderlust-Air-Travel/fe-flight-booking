// app/api/reservations/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Backend API base URL - In Next.js API routes, NEXT_PUBLIC_* env vars are not available
// Use regular env var or fallback to default
const BACKEND_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    // Lấy access token từ header (optional - for guest bookings)
    const authHeader = req.headers.get('authorization');
    
    // Authorization header is optional - guest bookings are allowed

    // Lấy body từ request
    const body = await req.json();
    const { segments, numberOfPassengers, currencyCode } = body;

    // Validate required fields
    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return NextResponse.json(
        { message: 'segments array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!numberOfPassengers || numberOfPassengers < 1) {
      return NextResponse.json(
        { message: 'numberOfPassengers is required and must be at least 1' },
        { status: 400 }
      );
    }

    // Proxy request to backend
    // Include Authorization header only if provided (for authenticated bookings)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
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

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Lấy access token từ header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Proxy request to backend
    const response = await fetch(`${BACKEND_API_URL}/api/v1/reservations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

