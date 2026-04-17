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

  // Rotas de API públicas — nunca redirecionar, apenas liberar
  const publicApiRoutes = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/resend-confirmation",
    "/api/auth/forgot-password",
    "/api/auth/change-password",
    "/api/auth/me",  // Usado pelo AuthContext client-side para verificar sessão
  ];

  // Rotas de página públicas — redirecionar usuário autenticado para home
  const publicPageRoutes = [
    "/login",
    "/register",
    "/resend-confirmation",
    "/forgot-password",
    "/change-password",
  ];

  // Get JWT from cookie
  const token = request.cookies.get("auth_token")?.value;

  // Rotas de API públicas: sempre liberar, nunca redirecionar
  if (publicApiRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Se autenticado tentando acessar página pública → redireciona para home
  if (publicPageRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Páginas públicas sem autenticação: liberar
  if (publicPageRoutes.includes(pathname)) {
    return NextResponse.next();
  }

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

    // Public routes (needed to redirect authenticated users away)
    "/login",
    "/register",

    // Exclude static files and internals
    "/((?!_next|.*\\..*).*)",
  ],
};
