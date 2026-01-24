import { NextRequest, NextResponse } from "next/server";

const HYREX_API_BASE = process.env.NEXT_PUBLIC_HYREX_API_BASE_URL || "https://api.hyrexai.com/api/v1";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get("job_id");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("page_size") || "10");

    if (!jobId) {
      return NextResponse.json(
        { error: "job_id is required" },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("authorization");

    console.log("[API Route] Authorization header received:", !!authHeader);
    if (authHeader) {
      console.log("[API Route] Auth format:", authHeader.split(' ')[0]);
      console.log("[API Route] Auth token length:", authHeader.split(' ')[1]?.length || 0);
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
      console.log("[API Route] Forwarding auth header to Hyrex API");
    } else {
      console.warn("[API Route] No authorization header provided! This will cause 401 from Hyrex API.");
      // Still try to forward empty if somehow it exists
    }

    // Note: X-Tenant-ID not required for Hyrex ATS API
    // If your API requires it, add: headers["X-Tenant-ID"] = process.env.NEXT_PUBLIC_TENANT_ID || "";

    // Try page-based pagination first (most common)
    console.log("[API Route] Fetching from:", `${HYREX_API_BASE}/candidates/submissions/list/?job_id=${jobId}&page=${page}&page_size=${pageSize}`);

    let response = await fetch(
      `${HYREX_API_BASE}/candidates/submissions/list/?job_id=${jobId}&page=${page}&page_size=${pageSize}`,
      {
        method: "GET",
        headers,
      }
    );

    console.log("[API Route] Response status:", response.status);

    // If page-based fails with 404, try offset-based pagination as fallback
    if (response.status === 404) {
      const offset = (page - 1) * pageSize;
      console.log("[API Route] Page-based returned 404, trying offset-based pagination with offset:", offset);
      
      let offsetResponse = await fetch(
        `${HYREX_API_BASE}/candidates/submissions/list/?job_id=${jobId}&offset=${offset}&limit=${pageSize}`,
        {
          method: "GET",
          headers,
        }
      );
      
      console.log("[API Route] Offset-based response status:", offsetResponse.status);
      
      // If that also fails, try with start parameter
      if (!offsetResponse.ok) {
        const start = (page - 1) * pageSize + 1; // 1-based start
        console.log("[API Route] Offset-based also failed, trying with start parameter:", start);
        offsetResponse = await fetch(
          `${HYREX_API_BASE}/candidates/submissions/list/?job_id=${jobId}&start=${start}&limit=${pageSize}`,
          {
            method: "GET",
            headers,
          }
        );
        console.log("[API Route] Start-based response status:", offsetResponse.status);
      }
      
      response = offsetResponse;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API Route] Error status:", response.status);
      console.error("[API Route] Error response body:", errorText.substring(0, 500));
      
      // If still 404, try another common pagination format
      if (response.status === 404) {
        console.log("[API Route] Both pagination methods returned 404, attempting to extract pagination info");
        
        let paginationData: any = { count: null, results: [] };
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.count !== undefined) {
            paginationData.count = errorJson.count;
          }
        } catch (e) {
          // Response wasn't JSON
        }
        
        console.log("[API Route] Returning empty results with count:", paginationData.count);
        return NextResponse.json(paginationData);
      }
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      return NextResponse.json(
        { error: errorData?.message || errorData?.detail || "Failed to fetch candidates" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[API Route] Success response data:", {
      count: data.count,
      results_length: data.results?.length || 0,
      total_count: data.total_count,
      next: data.next,
      previous: data.previous,
    });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API Route] Error fetching candidates:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
