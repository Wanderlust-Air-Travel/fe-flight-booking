import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = 'http://localhost:8080';

// Mock airport data for fallback
const MOCK_AIRPORTS = [
  { code: "HAN", name: "Noi Bai International Airport", city: "Hanoi", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },
  { code: "SGN", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },
  { code: "DAD", name: "Da Nang International Airport", city: "Da Nang", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },
  { code: "CXR", name: "Cam Ranh International Airport", city: "Cam Ranh", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },
  { code: "HUI", name: "Phu Bai International Airport", city: "Hue", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },
  { code: "PQC", name: "Phu Quoc International Airport", city: "Phu Quoc", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },
  { code: "VDH", name: "Dong Hoi Airport", city: "Dong Hoi", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },
  { code: "VII", name: "Vinh Airport", city: "Vinh", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },
  { code: "THD", name: "Tho Xuan Airport", city: "Thanh Hoa", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },
  { code: "BMV", name: "Buon Ma Thuot Airport", city: "Buon Ma Thuot", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },
];

/**
 * GET /api/search/airports
 * 
 * Proxy request to Go backend to get list of all airports
 * Falls back to mock data if backend is unavailable
 */
export async function GET(req: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/airports`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (response.status === 404) {
      console.log('[API /api/search/airports] Backend returned 404, returning mock data');
      return NextResponse.json({
        data: MOCK_AIRPORTS,
        success: true,
      }, { status: 200 });
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
    return NextResponse.json({
      data: MOCK_AIRPORTS,
      success: true,
      _mock: true,
    }, { status: 200 });
  }
}
