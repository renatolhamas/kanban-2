import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'

/**
 * Middleware for protecting routes that require authentication
 *
 * Protected routes: /profile, /dashboard, /settings, etc.
 * Public routes: /login, /register, /
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/', '/api/auth/login', '/api/auth/register']

  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Get JWT from cookie
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    // Redirect to login if no token
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // Verify JWT
  try {
    const payload = await verifyJWT(token)

    if (!payload) {
      // Token is invalid, redirect to login
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }

    // Token is valid, continue
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware JWT verification error:', error)
    // Redirect to login on error
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    // Protect these routes
    '/profile/:path*',
    '/dashboard/:path*',
    '/settings/:path*',
    '/api/auth/profile',

    // Exclude these routes
    '/((?!_next|.*\\..*|login|register).*)',
  ],
}
