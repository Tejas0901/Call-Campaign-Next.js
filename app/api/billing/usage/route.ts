import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const url = new URL(request.url);
    const skip = url.searchParams.get('skip');
    const limit = url.searchParams.get('limit');
    const campaignId = url.searchParams.get('campaign_id');
    const dateFrom = url.searchParams.get('date_from');
    const dateTo = url.searchParams.get('date_to');
    
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    // If no auth header, return error
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        detail: 'Authorization header required'
      }, { status: 401 });
    }
    
    // If no tenant ID, return error
    if (!TENANT_ID) {
      return NextResponse.json({
        success: false,
        detail: 'Tenant ID not configured'
      }, { status: 500 });
    }
    
    // Construct the backend API URL with query parameters
    let backendUrl = `${BASE_URL}/api/v1/billing/usage`;
    const params = new URLSearchParams();
    
    if (skip) params.append('skip', skip);
    if (limit) params.append('limit', limit);
    if (campaignId) params.append('campaign_id', campaignId);
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    
    if (params.toString()) {
      backendUrl += '?' + params.toString();
    }
    
    // Make direct fetch to the backend API
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420',
        'Authorization': authHeader,
        'tenant-id': TENANT_ID
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        detail: errorData.detail || errorData.error || 'Failed to fetch usage'
      }, { status: response.status });
    }
    
    const data = await response.json();
    
    // The backend returns { success: true, data: { usage: [], count: n } }
    // Extract and return just the inner data
    return NextResponse.json(data.data);
  } catch (error: any) {
    console.error('Error fetching usage:', error);
    
    // Return error response instead of mock data
    return NextResponse.json({
      success: false,
      detail: error.message || 'Failed to fetch usage records'
    }, { status: 500 });
  }
}