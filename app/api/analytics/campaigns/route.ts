import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID
    
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL environment variable is not set")
    }
    
    if (!tenantId) {
      throw new Error("NEXT_PUBLIC_TENANT_ID environment variable is not set")
    }
    
    const response = await fetch(`${baseUrl}/api/v1/analytics/campaigns`, {
      headers: {
        "Content-Type": "application/json",
        "tenant-id": tenantId,
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`HTTP error! status: ${response.status}`, errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    // Return error response instead of mock data
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to fetch analytics data",
        data: null
      },
      { status: 500 }
    )
  }
}