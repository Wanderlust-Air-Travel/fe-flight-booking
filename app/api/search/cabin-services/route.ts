// app/api/search/cabin-services/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const { searchParams } = new URL(req.url);
    const fareClassCode = searchParams.get('fareClassCode');
    const cabinClassCode = searchParams.get('cabinClassCode');

    if (!fareClassCode || !cabinClassCode) {
      return NextResponse.json(
        { message: 'fareClassCode and cabinClassCode are required' },
        { status: 400 }
      );
    }

    const queryParams = new URLSearchParams({ fareClassCode, cabinClassCode });
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/search/cabin-services?${queryParams.toString()}`,
      { method: 'GET', headers }
    );

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching cabin services:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
