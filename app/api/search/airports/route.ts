import { type NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api-proxy";

/**
 * GET /api/search/airports
 *
 * Proxy request to NestJS backend to get list of all airports.
 */
export async function GET(req: NextRequest) {
  return proxyToBackend(req, "/api/v1/search/airports");
}
