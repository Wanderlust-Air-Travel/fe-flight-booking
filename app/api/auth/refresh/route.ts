import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * POST /api/auth/refresh
 * 
 * Proxy request to Go backend to refresh access token
 * Returns mock tokens if backend is unavailable
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, refresh_token } = body;

    if (!userId || !refresh_token) {
      return NextResponse.json(
        { message: 'userId and refresh_token are required', error: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        refresh_token,
      }),
    });

    if (response.status === 404) {
      console.log('[API /api/auth/refresh] Backend returned 404, returning mock tokens');
      return NextResponse.json({
        access_token: `mock_access_token_${Date.now()}`,
        refresh_token: refresh_token,
        expires_in: 3600,
        token_type: 'Bearer',
        success: true,
        _mock: true,
      }, { status: 200 });
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[API /api/auth/refresh] Error:', error);
    // Return mock tokens on connection error
    return NextResponse.json({
      access_token: `mock_access_token_${Date.now()}`,
      refresh_token: `mock_refresh_token_${Date.now()}`,
      expires_in: 3600,
      token_type: 'Bearer',
      success: true,
      _mock: true,
    }, { status: 200 });
  }
}
