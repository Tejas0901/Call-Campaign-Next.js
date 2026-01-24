import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: campaignId } = await params;
    const url = `${API_BASE_URL}/api/v1/campaigns/${campaignId}`;
    
    console.log("[API] Fetching campaign from URL:", url);
    console.log("[API] Headers:", {
      "tenant-id": tenantId,
      Authorization: authHeader?.substring(0, 20) + "...",
    });

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "tenant-id": tenantId,
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    console.log("[API] Response status:", response.status, response.statusText);
    
    const contentType = response.headers.get("content-type");
    console.log("[API] Content-Type:", contentType);

    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("[API] Response is not JSON. First 300 chars:", text.substring(0, 300));
      return NextResponse.json(
        {
          error: "API returned non-JSON response",
          detail: text.substring(0, 200),
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    console.log("[API] Response data:", data);

    if (!response.ok) {
      console.error("[API] API returned error:", data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log("[API] Successfully fetched campaign");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API] Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign", message: error.message },
      { status: 500 }
    );
  }
}
