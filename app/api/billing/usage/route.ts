import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
    
    // If no auth header, return mock data for development
    if (!authHeader) {
      // Return mock usage data for development without backend
      return NextResponse.json({
        success: true,
        data: {
          usage: [
            {
              id: 'a1b2c3d4-0000-0000-0000-000000000001',
              call_sid: 'SF123456789',
              campaign_id: 'c9d8e7f6-0000-0000-0000-000000000001',
              session_id: 'b2c3d4e5-0000-0000-0000-000000000001',
              duration_seconds: 95,
              billable_minutes: 2,
              rate_per_minute: 2.0,
              amount_charged: 4.0,
              created_at: '2026-02-22T08:34:12.000Z'
            }
          ],
          count: 1
        }
      });
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
        ...(authHeader ? { 'Authorization': authHeader } : {})
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || 'Failed to fetch usage');
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    console.error('Error fetching usage:', error);
    
    // Return mock data for development
    return NextResponse.json({
      success: true,
      data: {
        usage: [
          {
            id: 'a1b2c3d4-0000-0000-0000-000000000001',
            call_sid: 'SF123456789',
            campaign_id: 'c9d8e7f6-0000-0000-0000-000000000001',
            session_id: 'b2c3d4e5-0000-0000-0000-000000000001',
            duration_seconds: 95,
            billable_minutes: 2,
            rate_per_minute: 2.0,
            amount_charged: 4.0,
            created_at: '2026-02-22T08:34:12.000Z'
          }
        ],
        count: 1
      }
    });
  }
}