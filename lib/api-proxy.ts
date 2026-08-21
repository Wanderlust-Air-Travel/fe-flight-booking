import { type NextRequest, NextResponse } from "next/server";

/**
 * Shared helper for proxying API route requests to the NestJS backend.
 *
 * Returns a NextResponse containing the backend's response (body + status).
 * Reads the Authorization header from the incoming request and forwards it.
 */
export async function proxyToBackend(
  req: NextRequest,
  path: string,
  init?: RequestInit
): Promise<NextResponse> {
  const backendUrl =
    process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const url = new URL(req.url);
  const search = url.searchParams.toString();
  const target = `${backendUrl}${path}${search ? `?${search}` : ""}`;

  const authHeader = req.headers.get("authorization");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init?.headers as Record<string, string>) ?? {}),
  };
  if (authHeader) headers.Authorization = authHeader;

  const method = init?.method ?? req.method;
  const body =
    init?.body ?? (method !== "GET" && method !== "HEAD" ? await req.text() : undefined);

  try {
    const response = await fetch(target, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error(`[proxy] ${method} ${path} failed:`, error);
    return NextResponse.json(
      { message: "Proxy error", error: "PROXY_ERROR" },
      { status: 502 }
    );
  }
}
