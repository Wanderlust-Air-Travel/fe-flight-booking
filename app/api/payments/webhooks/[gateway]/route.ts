// app/api/payments/webhooks/[gateway]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ gateway: string }> }
) {
  try {
    const { gateway } = await context.params;

    if (!gateway) {
      return NextResponse.json(
        { message: "gateway path parameter is required" },
        { status: 400 }
      );
    }

    const signature = req.headers.get("x-signature") || "";
    const body = await req.json();

    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/payments/webhooks/${encodeURIComponent(
        gateway
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-signature": signature,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error proxying payment webhook:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


