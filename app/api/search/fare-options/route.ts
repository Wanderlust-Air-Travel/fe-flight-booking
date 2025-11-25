// app/api/search/fare-options/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Backend API base URL - In Next.js API routes, NEXT_PUBLIC_* env vars are not available
// Use regular env var or fallback to default
const BACKEND_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(req: NextRequest) {
  try {
    // Lấy access token từ header (optional - backend supports optional auth)
    const authHeader = req.headers.get('authorization');

    // Lấy query parameters
    const { searchParams } = new URL(req.url);
    const flightInstanceId = searchParams.get('flightInstanceId');
    const cabinType = searchParams.get('cabinType');

    // Validate required field
    if (!flightInstanceId) {
      return NextResponse.json(
        { message: 'flightInstanceId is required' },
        { status: 400 }
      );
    }

    // Build query string
    const queryParams = new URLSearchParams({ flightInstanceId });
    if (cabinType) {
      queryParams.append('cabinType', cabinType);
    }

    // Proxy request to backend
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if provided
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/search/fare-options?${queryParams.toString()}`,
      {
        method: 'GET',
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching fare options:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

