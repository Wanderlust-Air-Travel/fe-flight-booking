// app/api/bookings/my-tickets/route.ts
import { type NextRequest, NextResponse } from "next/server";

// Backend API base URL
const BACKEND_API_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(req: NextRequest) {
  try {
    // Lấy access token từ header
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "Authorization header is required" }, { status: 401 });
    }

    // Lấy query parameters (page, limit)
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    // Proxy request to backend
    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/bookings/my-tickets?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching my tickets:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
