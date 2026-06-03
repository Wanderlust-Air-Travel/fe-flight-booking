// app/api/booking-state/[flightInstanceId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ flightInstanceId: string }> | { flightInstanceId?: string } }
) {
  try {
    // Handle both Next.js 13-14 (sync params) and Next.js 15+ (async params)
    const resolvedParams = await Promise.resolve(context.params);
    const flightInstanceId = resolvedParams?.flightInstanceId;

    if (!flightInstanceId) {
      return NextResponse.json(
        { message: 'flightInstanceId is required' },
        { status: 400 }
      );
    }

    // Get authorization header (optional - for authenticated users)
    const authHeader = req.headers.get('authorization');
    
    // Get X-Session-Id header (for guest users)
    const sessionId = req.headers.get('x-session-id');

    // Build headers for backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if provided
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Add session ID header if provided (for guest users)
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    // Proxy request to backend
    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/booking-state/${encodeURIComponent(flightInstanceId)}`,
      {
        method: 'GET',
        headers,
      }
    );

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('[booking-state/get] Non-JSON response from backend:', responseText.substring(0, 500));
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
    console.error('[booking-state/get] Error:', error?.message || error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

