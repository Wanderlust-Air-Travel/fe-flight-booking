import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * GET /api/search/airports
 * 
 * Proxy request to backend API Gateway to get list of all airports
 * This is a public endpoint that doesn't require authentication
 */
export async function GET(req: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/search/airports`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store', // Don't cache airport list as it may change
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
        message: error.message || 'Failed to fetch airports',
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

