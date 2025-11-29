import { NextRequest, NextResponse } from "next/server";
import axiosInstance from "@/lib/axios-instance";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, bookingId, otp } = body;

    if (!userId || !bookingId || !otp) {
      return NextResponse.json(
        { message: "userId, bookingId, and otp are required" },
        { status: 400 }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 }
      );
    }

    // Call backend API
    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/auth/otp/cancellation/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({ userId, bookingId, otp }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to verify OTP" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Verify cancellation OTP error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

