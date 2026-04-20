/**
 * Auth Middleware
 * Extracts and verifies JWT from request
 */

import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getJWTFromCookie } from "@/lib/auth";
import type { JWTPayload } from "@/lib/types";

// Reuse client for verification
let supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (supabase) return supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new AuthError("Missing Supabase configuration", 500);
  }

  supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  return supabase;
}

/**
 * Verify JWT token and extract payload
 * Throws 401 error if token is invalid or missing
 */
export async function auth(req: NextRequest): Promise<JWTPayload> {
  const token = getJWTFromCookie(req.headers.get("cookie"));

  if (!token) {
    throw new AuthError("Missing authorization token", 401);
  }

  const client = getSupabase();
  const { data: { user }, error } = await client.auth.getUser(token);

  if (error || !user) {
    console.error("[Middleware Auth] Session verification failed:", error?.message);
    throw new AuthError("Invalid or expired token", 401);
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
