// app/api/booking-state/cabin-services/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const sessionIdHeader = req.headers.get('x-session-id');
    const body = await req.json();
    const { flightInstanceId, services } = body;

    if (!flightInstanceId || !Array.isArray(services)) {
      return NextResponse.json(
        { message: 'flightInstanceId and services array are required' },
        { status: 400 }
      );
    }

    const backendHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) backendHeaders['Authorization'] = authHeader;
    if (sessionIdHeader) backendHeaders['X-Session-Id'] = sessionIdHeader;

    const response = await fetch(`${BACKEND_API_URL}/api/v1/booking-state/cabin-services`, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify({ flightInstanceId, services }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error saving cabin services:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
