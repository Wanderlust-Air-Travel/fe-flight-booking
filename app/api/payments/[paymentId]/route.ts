// app/api/payments/[paymentId]/route.ts
import { type NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ paymentId?: string }> | { paymentId?: string } }
) {
  try {
    // Handle both Next.js 13-14 (sync params) and Next.js 15+ (async params)
    const params = await Promise.resolve(context.params);
    let paymentId = params?.paymentId;

    // Fallback: Extract from URL path if params is not available
    if (!paymentId) {
      const url = new URL(req.url);
      const pathParts = url.pathname.split("/");
      const paymentsIndex = pathParts.findIndex((part) => part === "payments");
      paymentId = paymentsIndex !== -1 ? pathParts[paymentsIndex + 1] : undefined;
    }

    if (!paymentId) {
      return NextResponse.json(
        {
          message: "Payment ID is required. Please ensure you have a valid payment ID.",
          error: "MISSING_PAYMENT_ID",
        },
        { status: 400 }
      );
    }

    // Authorization header is optional - for guest users
    const authHeader = req.headers.get("authorization");

    // Build headers for backend request
    const backendHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add Authorization header only if present (for authenticated users)
    if (authHeader) {
      backendHeaders.Authorization = authHeader;
    }

    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/payments/${encodeURIComponent(paymentId)}`,
      {
        method: "GET",
        headers: backendHeaders,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
