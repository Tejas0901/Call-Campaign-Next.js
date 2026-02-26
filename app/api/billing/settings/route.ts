import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function PATCH(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    // Make direct fetch to the backend API
    const response = await fetch(`${BASE_URL}/api/v1/billing/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || 'Failed to update billing settings');
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    console.error('Error updating billing settings:', error);
    
    return NextResponse.json(
      { 
        success: false,
        detail: error.message || 'Failed to update billing settings'
      },
      { status: 500 }
    );
  }
}