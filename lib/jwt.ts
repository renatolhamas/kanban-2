import { jwtVerify, SignJWT } from "jose";
import type { JWTPayload } from "@/lib/types";

/**
 * Get JWT Secret for signing/verifying tokens
 */
function getJWTSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      // During build time, credentials might be missing but we shouldn't throw at module load
      // We log but provide a dummy for the build process to complete page data collection
      console.warn("[CONFIG WARNING] JWT_SECRET is missing. This is okay during build but FATAL in production runtime.");
    }
    return new TextEncoder().encode("default-dev-secret-change-in-production");
  }
  return new TextEncoder().encode(secret);
}

const JWT_EXPIRATION = 3600; // 1 hour in seconds

/**
 * Generate JWT token with payload
 */
export async function generateJWT(
  payload: Omit<JWTPayload, "iat" | "exp">,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + JWT_EXPIRATION;

  const token = await new SignJWT({
    ...payload,
    iat: now,
    exp: exp,
  })
    .setProtectedHeader({ alg: "HS256", zip: undefined })
    .sign(getJWTSecret());

  return token;
}

/**
 * Verify and decode JWT token
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
  const JWT_SECRET = getJWTSecret();
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}
