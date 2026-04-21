import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // This will refresh the session if it's expired
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  
  // Define public paths that don't require authentication
  const isPublicPage = [
    "/login",
    "/register",
    "/resend-confirmation",
    "/forgot-password",
    "/change-password",
    "/",
  ].includes(pathname)

  const isPublicApi = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/resend-confirmation",
    "/api/auth/forgot-password",
    "/api/auth/change-password",
    "/api/auth/logout",
    "/api/webhooks/evo-go",
  ].includes(pathname)

  const isNextInternal = pathname.startsWith('/_next') || pathname === '/favicon.ico'

  const isPublicPath = isPublicPage || isPublicApi || isNextInternal

  // Se autenticado tentando acessar página pública de auth (login/register) → vai para /home
  if (isPublicPage && user && pathname !== "/") {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  // Se NÃO autenticado tentando acessar caminho privado → vai para /login
  if (!isPublicPath && !user) {
    // Para chamadas de API, retornar 401 em vez de redirecionar para HTML
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
