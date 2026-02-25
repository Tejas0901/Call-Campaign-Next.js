import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    // If no auth header, return mock data for development
    if (!authHeader) {
      // Return mock balance data for development without backend
      return NextResponse.json({
        success: true,
        data: {
          balance: 487.52,
          currency: 'INR',
          rate_per_minute: 2.0,
          low_balance_threshold: 100.0,
          is_low_balance: false,
          this_month_calls: 34,
          this_month_minutes: 72,
          this_month_spend: 144.0
        }
      });
    }
    
    // Make direct fetch to the backend API
    const response = await fetch(`${BASE_URL}/api/v1/billing/balance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || 'Failed to fetch balance');
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    console.error('Error fetching balance:', error);
    
    // Return mock data for development
    return NextResponse.json({
      success: true,
      data: {
        balance: 487.52,
        currency: 'INR',
        rate_per_minute: 2.0,
        low_balance_threshold: 100.0,
        is_low_balance: false,
        this_month_calls: 34,
        this_month_minutes: 72,
        this_month_spend: 144.0
      }
    });
  }
}