// app/api/payments/webhooks/dev/route.ts
import { type NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${BACKEND_API_URL}/api/v1/payments/webhooks/dev`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error(
        "[payments/webhooks/dev] Non-JSON response from backend:",
        responseText.substring(0, 500)
      );
      return NextResponse.json({ message: "Invalid response from backend" }, { status: 502 });
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("[payments/webhooks/dev] Error:", error?.message || error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
