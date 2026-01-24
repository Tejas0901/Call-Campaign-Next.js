import { NextRequest, NextResponse } from "next/server";

/**
 * Audio Proxy Route
 * Fetches audio from the backend API with proper headers (CORS, ngrok-skip-browser-warning)
 * This allows the browser to play audio from ngrok-protected endpoints
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const audioUrl = searchParams.get("url");

    if (!audioUrl) {
      return NextResponse.json(
        { error: "Missing audio URL parameter" },
        { status: 400 }
      );
    }

    // Decode the URL
    const decodedUrl = decodeURIComponent(audioUrl);

    console.log("[Audio Proxy] Fetching audio from:", decodedUrl);

    // Get auth token from request headers
    const authToken = request.headers.get("authorization");
    const tenantId = request.headers.get("x-tenant-id");

    // Get the API base URL
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!API_BASE_URL) {
      return NextResponse.json(
        { error: "API Base URL not configured" },
        { status: 500 }
      );
    }

    // Construct full URL if it's relative
    let fullUrl = decodedUrl;
    if (decodedUrl.startsWith("/")) {
      fullUrl = `${API_BASE_URL.replace(/\/$/, "")}${decodedUrl}`;
    }

    // Fetch the audio file with proper headers
    const audioResponse = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "69420",
        ...(authToken && { Authorization: authToken }),
        ...(tenantId && { "tenant-id": tenantId }),
      },
    });

    if (!audioResponse.ok) {
      console.error(
        "[Audio Proxy] Error fetching audio:",
        audioResponse.status,
        audioResponse.statusText
      );
      return NextResponse.json(
        { error: `Failed to fetch audio: ${audioResponse.statusText}` },
        { status: audioResponse.status }
      );
    }

    // Get the audio data
    const audioBuffer = await audioResponse.arrayBuffer();
    const contentType = audioResponse.headers.get("content-type") || "audio/wav";

    console.log("[Audio Proxy] Successfully fetched audio", {
      url: fullUrl,
      size: audioBuffer.byteLength,
      contentType,
    });

    // Return the audio with proper headers
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error: any) {
    console.error("[Audio Proxy] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to proxy audio" },
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
