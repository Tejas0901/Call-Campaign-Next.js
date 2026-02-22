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

  // Get the token from cookies (set by the auth context)
  let token = null;
  
  // Check for token in cookies
  token = request.cookies.get('callbot_access_token')?.value;

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