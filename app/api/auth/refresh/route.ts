// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Backend API base URL - In Next.js API routes, NEXT_PUBLIC_* env vars are not available
// Use regular env var or fallback to default
const BACKEND_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    // Lấy body từ request
    const body = await req.json();
    const { userId, refresh_token } = body;

    // Validate required fields
    if (!userId || !refresh_token) {
      return NextResponse.json(
        { message: 'userId and refresh_token are required' },
        { status: 400 }
      );
    }

    // Proxy request to backend
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

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

