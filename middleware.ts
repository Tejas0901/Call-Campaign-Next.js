import { NextRequest, NextResponse } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/auth/login', '/auth/signup'];

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/campaigns', '/analytics', '/billing', '/settings', '/usage'];

export function middleware(request: NextRequest) {
  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(route + '/')
  );
  
  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(route + '/')
  );

  // Get the token from localStorage (stored as a cookie in the browser)
  // Since Next.js middleware runs on the server, we can't directly access localStorage
  // Instead, we'll look for the token in the Authorization header or cookie
  const authHeader = request.headers.get('authorization');
  const cookieHeader = request.headers.get('cookie');
  
  // Check for token in Authorization header
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  
  // If not in header, check for token in cookies
  if (!token && cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>);
    
    // Check for auth-token cookie (this would be set by client-side code)
    token = cookies['auth-token'];
  }
  
  // As a fallback, we can check for a custom header that the client sets
  if (!token) {
    token = request.headers.get('x-auth-token') || request.cookies.get('auth-token')?.value;
  }

  // Only redirect to login if accessing a protected route without authentication
  if (!token && isProtectedRoute) {
    // Redirect to login page
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (token && (request.nextUrl.pathname === '/auth/login' || request.nextUrl.pathname === '/auth/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Apply middleware to all routes except static assets
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};