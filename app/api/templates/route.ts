import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// GET /api/templates - Fetch all templates
export async function GET(request: NextRequest) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        { error: "API base URL not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/templates`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to fetch templates: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create a new template
export async function POST(request: NextRequest) {
  try {
    if (!API_BASE_URL) {
      console.error("API_BASE_URL is not configured");
      return NextResponse.json(
        { error: "API base URL not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log("Creating template with payload:", JSON.stringify(body, null, 2));
    console.log("Sending to:", `${API_BASE_URL}/api/templates`);

    const response = await fetch(`${API_BASE_URL}/api/templates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(body),
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error response:", errorText);
      return NextResponse.json(
        { error: `Failed to create template: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Template created successfully:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating template:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
