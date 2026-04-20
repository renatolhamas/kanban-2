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
  const token = request.cookies.get("auth_token")?.value;

  console.log(`[Middleware] Path: ${pathname} | Token: ${token ? "exists" : "missing"}`);

  // Rotas de API públicas — nunca redirecionar
  const publicApiRoutes = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/resend-confirmation",
    "/api/auth/me",
  ];

  // Rotas de página públicas
  const publicPageRoutes = [
    "/login",
    "/register",
    "/resend-confirmation",
    "/forgot-password",
    "/change-password",
  ];

  if (publicApiRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Se autenticado tentando acessar página pública (login/register) → vai para /home
  if (publicPageRoutes.includes(pathname) && token) {
    console.log(`[Middleware] Redirecting authenticated user from ${pathname} to /home`);
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Se NÃO autenticado tentando acessar página privada → vai para /login
  const isPublicPage = publicPageRoutes.includes(pathname) || pathname === "/";
  if (!isPublicPage && !token) {
    console.log(`[Middleware] Unauthorized access to ${pathname} -> Redirecting to /login`);
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) -> handled by auth middleware internally
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
