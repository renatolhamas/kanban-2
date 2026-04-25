/**
 * Tenant Isolation Middleware
 * Ensures request is scoped to authenticated user's tenant
 */

import { NextRequest } from "next/server";
import type { JWTPayload } from "@/lib/types";

export interface TenantContext {
  tenantId: string;
  userId: string;
}

/**
 * Extract and validate tenant context from JWT payload
 * Throws 403 error if tenant_id is missing
 */
export async function tenantIsolation(
  _req: NextRequest,
  payload: JWTPayload,
): Promise<TenantContext> {
  const tenantId = payload.tenant_id;
  const userId = payload.sub;

  if (!tenantId) {
    throw new TenantIsolationError("Tenant context not found in token", 403);
  }

  return {
    tenantId,
    userId,
  };
}

/**
 * Custom error class for tenant isolation
 */
export class TenantIsolationError extends Error {
  constructor(
    message: string,
    // eslint-disable-next-line no-unused-vars
    public statusCode: number,
  ) {
    super(message);
    this.name = "TenantIsolationError";
  }
}
