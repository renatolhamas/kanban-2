import { jwtVerify, SignJWT } from 'jose'
import type { JWTPayload } from '@/lib/types'

/**
 * JWT Secret for signing/verifying tokens
 */
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET environment variable is required in production')
      }
      return 'default-dev-secret-change-in-production'
    })()
)

const JWT_EXPIRATION = 3600 // 1 hour in seconds

/**
 * Generate JWT token with payload
 */
export async function generateJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const exp = now + JWT_EXPIRATION

  const token = await new SignJWT({
    ...payload,
    iat: now,
    exp: exp,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(JWT_SECRET)

  return token
}

/**
 * Verify and decode JWT token
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload as unknown as JWTPayload
  } catch {
    return null
  }
}

/**
 * Extract JWT from request cookies
 */
export function getJWTFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = decodeURIComponent(value)
      return acc
    },
    {} as Record<string, string>
  )

  return cookies.auth_token || null
}

/**
 * Set JWT cookie (httpOnly, Secure in production)
 */
export function setJWTCookie(token: string, isProduction: boolean = false): string {
  const maxAge = JWT_EXPIRATION
  const secure = isProduction ? 'Secure;' : ''
  const sameSite = 'SameSite=Lax'
  const httpOnly = 'HttpOnly'

  return `auth_token=${token}; Path=/; Max-Age=${maxAge}; ${secure} ${httpOnly}; ${sameSite}`
}

/**
 * Clear JWT cookie
 */
export function clearJWTCookie(): string {
  return 'auth_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax'
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
