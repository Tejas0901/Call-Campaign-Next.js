import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Simple validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // In a real application, you would validate credentials against your database
    // For this example, we'll just check for a valid email format and non-empty password
    if (email && password) {
      // Simulate successful login
      // In a real app, you would generate a JWT token here
      return NextResponse.json({
        success: true,
        user: {
          id: 1,
          name: email.split('@')[0],
          email: email,
        },
        token: 'dummy-jwt-token-for-demo',
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}