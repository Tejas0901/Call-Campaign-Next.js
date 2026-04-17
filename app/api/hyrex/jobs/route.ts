import { NextRequest, NextResponse } from "next/server";

const HYREX_API_BASE =
  process.env.NEXT_PUBLIC_HYREX_API_BASE_URL ||
  "https://api.hyrexai.com/api/v1";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const size = searchParams.get("size") || "100";
  const jobCode = searchParams.get("job_code");

  // Build upstream URL
  const params = new URLSearchParams({ page, size });
  if (jobCode) params.append("job_code", jobCode);

  // Forward auth token from request header
  const authHeader = request.headers.get("Authorization");

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const url = `${HYREX_API_BASE}/jobs/jobview/?${params.toString()}`;

  try {
    let response = await fetch(url, { method: "GET", headers, cache: "no-store" });

    // If 401 with Bearer, retry with Token format (and vice versa)
    if (response.status === 401 && authHeader) {
      const currentFormat = authHeader.startsWith("Bearer") ? "Bearer" : "Token";
      const alternateFormat = currentFormat === "Bearer" ? "Token" : "Bearer";
      const token = authHeader.replace(/^(Bearer|Token)\s+/, "");
      headers["Authorization"] = `${alternateFormat} ${token}`;

      response = await fetch(url, { method: "GET", headers, cache: "no-store" });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(
          { ...data, _authFormat: alternateFormat },
          { status: 200 }
        );
      }
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return NextResponse.json(
        { error: `HTTP ${response.status}`, detail: errorText.substring(0, 300) },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("[Hyrex Jobs Proxy] Error:", error?.message);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch jobs from Hyrex" },
      { status: 500 }
    );
  }
}
