import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    // Construct the backend API URL
    const backendUrl = `${BASE_URL}/api/v1/billing/invoices/${params.id}`;
    
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
      throw new Error(errorData.detail || errorData.error || 'Failed to fetch invoice detail');
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    console.error('Error fetching invoice detail:', error);
    
    return NextResponse.json(
      { 
        success: false,
        detail: error.message || 'Failed to fetch invoice detail'
      },
      { status: 500 }
    );
  }
}