import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * GET /api/search/airports
 *
 * Proxy request to NestJS backend to get list of all airports.
 * Returns error if backend is unavailable - no more mock fallback.
 */
export async function GET(req: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/search/airports`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          message: data.message || 'Failed to fetch airports',
          error: data.error || 'Unknown error'
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/search/airports] Error:', error);
    return NextResponse.json(
      {
        message: 'Backend service unavailable',
        error: 'Failed to connect to the backend API. Please ensure the server is running.'
      },
      { status: 503 }
    );
  }
}
