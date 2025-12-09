// app/api/admin/cabin-classes/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization');
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const backendUrl = `${BACKEND_API_URL}/api/v1/admin/cabin-classes`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Ensure we return an array
    const result = Array.isArray(data) ? data : (data?.data || data?.items || []);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[Cabin Classes API] Error fetching cabin classes:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

