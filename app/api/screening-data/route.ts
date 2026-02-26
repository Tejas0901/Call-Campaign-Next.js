import { NextRequest, NextResponse } from "next/server";

/**
 * Screening Data Proxy Route
 * Fetches screening/call records from the backend API
 * Endpoint: GET /api/v1/screening-data?campaign_id={id}
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaign_id");
    const recommendation = searchParams.get("recommendation");
    const minExperience = searchParams.get("min_experience");
    const maxCtc = searchParams.get("max_ctc");
    const isImmediateJoiner = searchParams.get("is_immediate_joiner");
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("page_size") || "50";

    if (!campaignId) {
      return NextResponse.json(
        { error: "Missing campaign_id parameter" },
        { status: 400 }
      );
    }

    // Get the API base URL
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!API_BASE_URL) {
      return NextResponse.json(
        { error: "API Base URL not configured" },
        { status: 500 }
      );
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.set("campaign_id", campaignId);
    
    if (recommendation) queryParams.set("recommendation", recommendation);
    if (minExperience) queryParams.set("min_experience", minExperience);
    if (maxCtc) queryParams.set("max_ctc", maxCtc);
    if (isImmediateJoiner) queryParams.set("is_immediate_joiner", isImmediateJoiner);
    queryParams.set("page", page);
    queryParams.set("page_size", pageSize);

    // Get auth token from request headers
    const authToken = request.headers.get("authorization");
    const tenantId = request.headers.get("tenant-id");

    // Construct full URL
    const fullUrl = `${API_BASE_URL.replace(/\/$/, "")}/api/v1/screening-data?${queryParams.toString()}`;

    console.log("[Screening Data Proxy] Fetching from:", fullUrl);
    console.log("[Screening Data Proxy] Auth token present:", !!authToken);
    console.log("[Screening Data Proxy] Tenant ID:", tenantId);

    // Fetch the data with proper headers
    const apiResponse = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
        ...(authToken && { Authorization: authToken }),
        ...(tenantId && { "tenant-id": tenantId }),
      },
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      console.error(
        "[Screening Data Proxy] Error fetching data:",
        apiResponse.status,
        apiResponse.statusText,
        errorData
      );
      
      // Forward the backend error with more details
      return NextResponse.json(
        { 
          error: errorData?.detail || errorData?.message || `Failed to fetch screening data: ${apiResponse.statusText}`,
          backendError: errorData,
          requestUrl: fullUrl
        },
        { status: apiResponse.status }
      );
    }

    const data = await apiResponse.json();

    console.log("[Screening Data Proxy] Successfully fetched data", {
      campaignId,
      recordCount: data?.data?.count || 0,
    });

    // Return the data with CORS headers
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error: any) {
    console.error("[Screening Data Proxy] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to proxy screening data" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
