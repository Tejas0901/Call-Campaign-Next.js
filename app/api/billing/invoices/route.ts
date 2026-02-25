import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const url = new URL(request.url);
    const year = url.searchParams.get('year');
    const month = url.searchParams.get('month');
    
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    // Construct the backend API URL with query parameters
    let backendUrl = `${BASE_URL}/api/v1/billing/invoices`;
    const params = new URLSearchParams();
    
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    
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
      throw new Error(errorData.detail || errorData.error || 'Failed to fetch invoices');
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    
    return NextResponse.json(
      { 
        success: false,
        detail: error.message || 'Failed to fetch invoices'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Extract query parameters
    const url = new URL(request.url);
    const year = url.searchParams.get('year');
    const month = url.searchParams.get('month');
    
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    // Construct the backend API URL with query parameters
    let backendUrl = `${BASE_URL}/api/v1/billing/invoices/generate`;
    const params = new URLSearchParams();
    
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    
    if (params.toString()) {
      backendUrl += '?' + params.toString();
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Make direct fetch to the backend API
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || 'Failed to generate invoice');
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    console.error('Error generating invoice:', error);
    
    return NextResponse.json(
      { 
        success: false,
        detail: error.message || 'Failed to generate invoice'
      },
      { status: 500 }
    );
  }
}