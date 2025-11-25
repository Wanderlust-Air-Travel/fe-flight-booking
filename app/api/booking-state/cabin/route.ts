// app/api/booking-state/cabin/route.ts
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

    // Lấy body từ request
    const body = await req.json();
    const { flightInstanceId, cabinType, fareClassCode } = body;

    // Validate required fields
    if (!flightInstanceId || !cabinType || !fareClassCode) {
      return NextResponse.json(
        { message: 'flightInstanceId, cabinType, and fareClassCode are required' },
        { status: 400 }
      );
    }

    // Proxy request to backend
    const response = await fetch(`${BACKEND_API_URL}/api/v1/booking-state/cabin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        flightInstanceId,
        cabinType,
        fareClassCode,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error saving cabin selection:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

