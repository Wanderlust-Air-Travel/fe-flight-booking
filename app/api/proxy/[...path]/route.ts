import { type NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const FORWARD_HEADERS = ["authorization", "content-type", "accept-language"] as const;

const buildBackendHeaders = (req: NextRequest): Record<string, string> => {
  const headers: Record<string, string> = {};
  for (const name of FORWARD_HEADERS) {
    const value = req.headers.get(name);
    if (value) headers[name] = value;
  }
  return headers;
};

const isAuthRoute = (path: string) => path.startsWith("auth/");

type Params = { path: string[] };

export async function GET(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { path } = await params;
  return proxy(req, "GET", path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { path } = await params;
  return proxy(req, "POST", path);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { path } = await params;
  return proxy(req, "PUT", path);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { path } = await params;
  return proxy(req, "PATCH", path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { path } = await params;
  return proxy(req, "DELETE", path);
}

async function proxy(req: NextRequest, method: string, pathSegments: string[]) {
  const path = pathSegments.join("/");
  const url = new URL(req.url);
  const search = url.searchParams.toString();
  const target = `${BACKEND_API_URL}/api/v1/${path}${search ? `?${search}` : ""}`;

  // Auth routes use /api/v1/auth/* - others use the same path
  const backendPath = isAuthRoute(path) ? `/api/v1/${path}` : `/api/v1/${path}`;

  try {
    const body = method === "GET" || method === "DELETE" ? undefined : await req.text();
    const response = await fetch(target, {
      method,
      headers: buildBackendHeaders(req),
      body,
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error(`[API ${method} /${path}] Error:`, error);
    return NextResponse.json(
      { message: "Proxy error", error: "PROXY_ERROR" },
      { status: 502 }
    );
  }
}
