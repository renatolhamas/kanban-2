import { jwtVerify, SignJWT } from "jose";
import type { JWTPayload } from "@/lib/types";

/**
 * JWT Secret for signing/verifying tokens
 */
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    (() => {
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "JWT_SECRET environment variable is required in production",
        );
      }
      return "default-dev-secret-change-in-production";
    })(),
);

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
    .setProtectedHeader({ alg: "HS256" })
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode JWT token
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}
