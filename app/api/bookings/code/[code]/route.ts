// app/api/bookings/code/[code]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> | { code: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const bookingCode = params.code;

    if (!bookingCode) {
      return NextResponse.json(
        { message: 'Booking code is required' },
        { status: 400 }
      );
    }

    // Proxy request to backend
    const response = await fetch(`${BACKEND_API_URL}/api/v1/bookings/code/${encodeURIComponent(bookingCode)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching booking by code:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

