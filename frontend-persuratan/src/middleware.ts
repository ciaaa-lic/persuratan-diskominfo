import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // We can only check cookies in middleware easily since localStorage is client-side.
  // Assuming Zustand token is NOT in cookies by default unless manually synced.
  // For internship template, we demonstrate the middleware logic but we won't strictly
  // block since Zustand uses localStorage.
  // A true robust solution requires sending token via cookies.

  // Example of redirecting if trying to access admin from root
  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Example of redirecting root to login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
