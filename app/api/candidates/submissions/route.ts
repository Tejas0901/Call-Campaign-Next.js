import { NextRequest, NextResponse } from "next/server";

const HYREX_API_BASE =
  process.env.NEXT_PUBLIC_HYREX_API_BASE_URL ||
  "https://api.hyrexai.com/api/v1";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get("job_id");
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("page_size") || "10";

    if (!jobId) {
      return NextResponse.json(
        { error: "job_id is required" },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("authorization");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const url = `${HYREX_API_BASE}/candidates/tag-candidates/?job_id=${jobId}&page=${page}&page_size=${pageSize}`;
    console.log("[API Route] Fetching from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    console.log("[API Route] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[API Route] Error:",
        response.status,
        errorText.substring(0, 500)
      );

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      return NextResponse.json(
        {
          error:
            errorData?.message ||
            errorData?.detail ||
            "Failed to fetch candidates",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[API Route] Success:", {
      count: data.count,
      results_length: data.results?.length || 0,
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
