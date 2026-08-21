// app/api/admin/fare-classes/[code]/route.ts
import { type NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> | { code: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const code = params.code;
    const token = req.headers.get("authorization");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/admin/fare-classes/${encodeURIComponent(code)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[Fare Classes API] Error fetching fare class:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ code: string }> | { code: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const code = params.code;
    const token = req.headers.get("authorization");
    const body = await req.json();

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/admin/fare-classes/${encodeURIComponent(code)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
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
    console.error("Error updating fare class:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ code: string }> | { code: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const code = params.code;
    const token = req.headers.get("authorization");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
      `${BACKEND_API_URL}/api/v1/admin/fare-classes/${encodeURIComponent(code)}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error deleting fare class:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
