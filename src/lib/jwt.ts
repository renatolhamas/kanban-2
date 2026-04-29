import { jwtVerify, SignJWT } from "jose";
import type { JWTPayload } from "@/lib/types";

/**
 * Get JWT Secret for signing/verifying tokens
 */
function getJWTSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    const isProduction = process.env.NODE_ENV === "production";
    const msg = "[JWT ERROR] JWT_SECRET is missing from .env! Internal authentication and Supabase RLS will FAIL.";

    if (isProduction) {
      throw new Error(msg);
    } else {
      console.warn(msg);
      return new TextEncoder().encode("default-dev-secret-change-in-production");
    }
  }

  return new TextEncoder().encode(secret);
}

const JWT_EXPIRATION = 3600; // 1 hour in seconds

/**
 * Generate JWT token for testing and internal service authentication
 */
export async function generateJWT(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  const secret = getJWTSecret();

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setAudience("authenticated")
    .setExpirationTime(`${JWT_EXPIRATION}s`)
    .sign(secret);
}

/**
 * Verify and decode JWT token
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, getJWTSecret(), {
      algorithms: ["HS256"],
      audience: "authenticated",
    });

    const payload = verified.payload as unknown as JWTPayload;

    // Map Supabase app_metadata to our flat payload structure
    return {
      ...payload,
      tenant_id: payload.app_metadata?.tenant_id || payload.tenant_id,
      role: payload.app_metadata?.role || payload.role,
    } as JWTPayload;
  } catch (_error) {
    return null;
  }
}
