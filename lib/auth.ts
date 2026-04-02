// JWT operations moved to lib/jwt.ts to avoid jose import in tests
// Import from lib/jwt.ts when needed in route handlers
export { generateJWT, verifyJWT } from "@/lib/jwt";

// JWT expiration: 1 hour (3600 seconds)
const JWT_EXPIRATION = 3600;

/**
 * Extract JWT from request cookies
 */
export function getJWTFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = decodeURIComponent(value);
      return acc;
    },
    {} as Record<string, string>,
  );

  return cookies.auth_token || null;
}

/**
 * Set JWT cookie (httpOnly, Secure in production)
 */
export function setJWTCookie(
  token: string,
  isProduction: boolean = false,
): string {
  const maxAge = JWT_EXPIRATION;
  const secure = isProduction ? "Secure;" : "";
  const sameSite = "SameSite=Lax";
  const httpOnly = "HttpOnly";

  return `auth_token=${token}; Path=/; Max-Age=${maxAge}; ${secure} ${httpOnly}; ${sameSite}`;
}

/**
 * Clear JWT cookie
 */
export function clearJWTCookie(): string {
  return "auth_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax";
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
