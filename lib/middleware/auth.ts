/**
 * Auth Middleware (SSR Compatible)
 * Extracts and verifies session using Supabase SSR
 */

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { JWTPayload } from "@/lib/types";

/**
 * Verify session and extract payload
 * Throws 401 error if session is invalid or missing
 */
export async function auth(_req: NextRequest): Promise<JWTPayload> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("[Middleware Auth] Session verification failed:", error?.message);
    throw new AuthError("Invalid or missing session", 401);
  }

  // Extract from app_metadata (preferred) or user_metadata (fallback)
  const tenant_id = user.app_metadata?.tenant_id || user.user_metadata?.tenant_id;
  const role = user.app_metadata?.role || user.user_metadata?.role;

  console.log(`[Auth Middleware] Verified user: ${user.email} | Tenant: ${tenant_id}`);

  return {
    sub: user.id,
    email: user.email,
    tenant_id: tenant_id as string,
    role: role as string,
    app_metadata: user.app_metadata,
  } as JWTPayload;
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
