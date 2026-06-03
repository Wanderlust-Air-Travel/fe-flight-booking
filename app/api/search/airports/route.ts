import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Mock airport data for fallback
const MOCK_AIRPORTS = [
  { iata: "HAN", name: "Noi Bai International", city: "Hanoi", value: "hanoi" },
  { iata: "SGN", name: "Tan Son Nhat International", city: "Ho Chi Minh City", value: "ho-chi-minh-city" },
  { iata: "DAD", name: "Da Nang International", city: "Da Nang", value: "da-nang" },
  { iata: "CXR", name: "Cam Ranh International", city: "Nha Trang", value: "nha-trang" },
  { iata: "PQC", name: "Phu Quoc International", city: "Phu Quoc", value: "phu-quoc" },
  { iata: "HUI", name: "Phu Bai International", city: "Hue", value: "hue" },
  { iata: "VCA", name: "Can Tho International", city: "Can Tho", value: "can-tho" },
  { iata: "HPH", name: "Cat Bi International", city: "Hai Phong", value: "hai-phong" },
  { iata: "DLI", name: "Lien Khuong", city: "Da Lat", value: "da-lat" },
];

/**
 * GET /api/search/airports
 *
 * Proxy request to NestJS backend to get list of all airports
 * Falls back to mock data if backend is unavailable
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

    if (response.status === 404) {
      console.log('[API /api/search/airports] Backend returned 404, returning mock data');
      return NextResponse.json({ airports: MOCK_AIRPORTS }, { status: 200 });
    }

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
    // Return mock data on connection error
    return NextResponse.json({ airports: MOCK_AIRPORTS }, { status: 200 });
  }
}
