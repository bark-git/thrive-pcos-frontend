import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/mood',
  '/symptoms',
  '/cycles',
  '/labs',
  '/medications',
  '/profile',
  '/export',
  '/onboarding',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only check protected routes
  const isProtected = PROTECTED_ROUTES.some(
    route => pathname === route || pathname.startsWith(route + '/')
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for Supabase auth cookies (sb-*-auth-token)
  const hasAuthCookie = request.cookies.getAll().some(
    cookie => cookie.name.includes('-auth-token')
  );

  if (!hasAuthCookie) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/mood/:path*',
    '/symptoms/:path*',
    '/cycles/:path*',
    '/labs/:path*',
    '/medications/:path*',
    '/profile/:path*',
    '/export/:path*',
    '/onboarding/:path*',
  ],
};
