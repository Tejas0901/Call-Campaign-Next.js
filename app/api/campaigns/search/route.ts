import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const tenantId = request.headers.get("tenant-id");

    if (!authHeader || !tenantId) {
      return NextResponse.json(
        { error: "Missing authorization or tenant-id header" },
        { status: 401 }
      );
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!API_BASE_URL) {
      return NextResponse.json(
        { error: "Missing API configuration" },
        { status: 500 }
      );
    }

    // Get all query parameters from the request
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    console.log(
      "[API] Searching campaigns:",
      `${API_BASE_URL}/api/v1/campaigns/search?${queryString}`
    );

    const response = await fetch(
      `${API_BASE_URL}/api/v1/campaigns/search?${queryString}`,
      {
        method: "GET",
        headers: {
          "tenant-id": tenantId,
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      }
    );

    const contentType = response.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("[API] Response is not JSON:", text.substring(0, 300));
      return NextResponse.json(
        {
          error: "API returned non-JSON response",
          detail: text.substring(0, 200),
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (!response.ok) {
      console.error("[API] Search failed:", data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API] Error searching campaigns:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to search campaigns" },
      { status: 500 }
    );
  }
}
