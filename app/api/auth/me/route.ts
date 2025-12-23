import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In a real application, you would:
    // 1. Extract the token from the Authorization header
    // 2. Verify the token
    // 3. Fetch user data from your database using the token payload
    // For this example, we'll just return a dummy user if there's a valid-looking token

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header missing or invalid' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // In a real app, you would verify the JWT token here
    // For this example, we'll just check if it looks like a valid token
    if (!token || token === 'invalid-token') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Return dummy user data
    return NextResponse.json({
      id: 1,
      name: 'Demo User',
      email: 'demo@example.com',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}