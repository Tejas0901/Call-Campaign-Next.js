import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// GET /api/templates/[id] - Fetch a specific template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        { error: "API base URL not configured" },
        { status: 500 }
      );
    }

    const { id } = await params;
    const response = await fetch(`${API_BASE_URL}/api/templates/${id}`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to fetch template: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/templates/[id] - Update a specific template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        { error: "API base URL not configured" },
        { status: 500 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/templates/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to update template: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/[id] - Delete a specific template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        { error: "API base URL not configured" },
        { status: 500 }
      );
    }

    const { id } = await params;
    const response = await fetch(`${API_BASE_URL}/api/templates/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to delete template: ${errorText}` },
        { status: response.status }
      );
    }

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
