import { NextResponse } from "next/server";

const HYREX_LOGIN_URL = "https://api.hyrexai.com/api/v1/users/login/";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const hyrexResponse = await fetch(HYREX_LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      // Avoid caching tokens
      cache: "no-store",
    });

    let data: Record<string, any> = {};
    const contentType = hyrexResponse.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      data = await hyrexResponse.json().catch(() => ({}));
    } else {
      const text = await hyrexResponse.text();
      console.error("[Hyrex Login] Non-JSON response:", text.substring(0, 200));
    }

    console.log("[Hyrex Login Response Status]", hyrexResponse.status);
    console.log("[Hyrex Login Response Data]", JSON.stringify(data));
    console.log("[Hyrex Login Response Keys]", Object.keys(data));

    if (!hyrexResponse.ok) {
      const message =
        data?.message || data?.error || data?.detail || "Hyrex login failed";
      console.error("[Hyrex Login Error]", message, data);
      return NextResponse.json({ message }, { status: hyrexResponse.status });
    }

    // Log successful response for debugging
    console.log("[Hyrex Login Success] Token fields:", Object.keys(data));

    // Extract token - try common field names
    const token =
      data?.token ||
      data?.access_token ||
      data?.access ||
      data?.accessToken ||
      data?.Authorization;

    if (!token) {
      console.error("[Hyrex Login Error] No token in response", data);
      return NextResponse.json(
        { message: "Token not found in login response" },
        { status: 400 }
      );
    }

    console.log("[Hyrex Login Success] Token extracted and returned");
    return NextResponse.json({ token, ...data });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Unable to reach Hyrex login" },
      { status: 500 }
    );
  }
}
