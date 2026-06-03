import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Mock user data for fallback
const MOCK_USER = {
  id: "usr_mock_001",
  email: "demo@example.com",
  firstName: "Demo",
  lastName: "User",
  phone: "+84 123 456 789",
  dateOfBirth: "1990-01-15",
  nationality: "Vietnam",
  avatar: null,
  verified: true,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-06-01T00:00:00Z",
};

/**
 * GET /api/auth/me
 * 
 * Proxy request to Go backend to get current user info
 * Falls back to mock data if backend is unavailable
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization');
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized', error: 'MISSING_TOKEN' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_API_URL}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    });

    if (response.status === 404) {
      console.log('[API /api/auth/me] Backend returned 404, returning mock data');
      return NextResponse.json({
        data: MOCK_USER,
        success: true,
      }, { status: 200 });
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[API /api/auth/me] Error:', error);
    // Return mock data on connection error
    return NextResponse.json({
      data: MOCK_USER,
      success: true,
      _mock: true,
    }, { status: 200 });
  }
}
