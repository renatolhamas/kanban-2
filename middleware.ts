import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware for protecting routes that require authentication
 *
 * Protected routes: /profile, /dashboard, /settings, etc.
 * Public routes: /login, /register, /
 *
 * NOTE: JWT verification is handled in API routes (server-side),
 * not in middleware (Edge Runtime). This avoids importing jose
 * which has dependencies (CompressionStream) incompatible with Edge.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/register",
    "/resend-confirmation",
    "/forgot-password",
    "/change-password",
    "/",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/resend-confirmation",
    "/api/auth/forgot-password",
    "/api/auth/change-password",
  ];

  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Get JWT from cookie
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    // Redirect to login if no token
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Token exists, continue to route (API will verify it)
  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    // Protect these routes
    "/profile/:path*",
    "/dashboard/:path*",
    "/settings/:path*",
    "/api/auth/profile",

    // Exclude these routes
    "/((?!_next|.*\\..*|login|register).*)",
  ],
};
