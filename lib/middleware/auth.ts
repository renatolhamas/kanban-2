/**
 * Auth Middleware
 * Extracts and verifies JWT from request
 */

import { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { getJWTFromCookie } from "@/lib/auth";
import type { JWTPayload } from "@/lib/types";

/**
 * Verify JWT token and extract payload
 * Throws 401 error if token is invalid or missing
 */
export async function auth(req: NextRequest): Promise<JWTPayload> {
  const token = getJWTFromCookie(req.headers.get("cookie"));

  if (!token) {
    throw new AuthError("Missing authorization token", 401);
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    throw new AuthError("Invalid or expired token", 401);
  }

  return payload;
}

/**
 * Custom error class for auth middleware
 */
export class AuthError extends Error {
  constructor(
    message: string,
    // eslint-disable-next-line no-unused-vars
    public statusCode: number,
  ) {
    super(message);
    this.name = "AuthError";
  }
}
