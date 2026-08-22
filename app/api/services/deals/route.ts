import axios from "axios";
import { NextResponse } from "next/server";
import type { ItemServiceProp } from "@/types/item-service-type";

// In Next.js API routes (server-side), NEXT_PUBLIC_* env vars are not available
// Use regular env var or fallback to default
const BACKEND_API_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Next.js API route proxy for /api/v1/services/deals
 * Transforms backend deals response into ItemServiceProp shape expected by frontend components.
 */
export async function GET() {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/v1/services/deals`, {
      timeout: 10000, // 10 seconds timeout
    });

    // Transform backend deals to ItemServiceProp shape
    const deals: ItemServiceProp[] = (response.data ?? []).map((deal: Record<string, unknown>) => ({
      image: `/images/services/deals/${deal.dealId}.jpg`,
      title: String(deal.title ?? ""),
      link: `/search/flights?destinations=${(deal.destinations as string[])?.join(",") ?? ""}`,
      startDate: String(deal.validFrom ?? ""),
      endDate: String(deal.validUntil ?? ""),
      service: String(deal.description ?? ""),
      price: deal.discountPct ? `${deal.discountPct}% OFF` : "",
    }));

    // Cache the response for 5 minutes (300 seconds)
    // This reduces load on backend API
    return NextResponse.json(deals, {
      status: response.status,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    console.error("Error proxying GET /services/deals:", error.response?.data || error.message);

    return NextResponse.json(
      {
        deals: [],
        error: error.response?.data?.message || error.message || "Failed to fetch deals",
      },
      { status: error.response?.status || 500 }
    );
  }
}
