import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * GET /api/bookings/code/[code]
 *
 * Proxy request to Go backend to get booking by confirmation code
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> | { code: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const bookingCode = params.code;

    if (!bookingCode) {
      return NextResponse.json(
        { message: 'Booking code is required', error: 'MISSING_CODE' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_API_URL}/api/v1/bookings/code/${encodeURIComponent(bookingCode)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('[bookings/code] Non-JSON response from backend:', responseText.substring(0, 500));
      return NextResponse.json(
        { message: 'Invalid response from backend' },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('[bookings/code] Error:', error?.message || error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
