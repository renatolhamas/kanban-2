/**
 * Evo GO Error Handler
 * Handles various error scenarios from Evo GO API
 */

import { NextResponse } from "next/server";
import { EvoGoError } from "@/lib/api/evo-go-client";
import { AuthError } from "@/lib/middleware/auth";
import { TenantIsolationError } from "@/lib/middleware/tenant-isolation";

export interface ErrorResponse {
  error: string;
  code: string;
  statusCode: number;
}

/**
 * Handle errors from Evo GO or middleware
 * Returns appropriate HTTP response
 */
export function handleEvoGoError(
  error: unknown,
  tenantId?: string,
): NextResponse<ErrorResponse> {
  // Evo GO API Error
  if (error instanceof EvoGoError) {
    console.error("[Evo GO Error]", {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      tenantId,
      timestamp: new Date().toISOString(),
    });

    const statusCode = error.statusCode;
    const messageMap: Record<string, string> = {
      INVALID_TOKEN: "Invalid Evo GO API token. Please check your configuration.",
      RATE_LIMIT:
        "Evo GO rate limit exceeded. Please try again in a few moments.",
      TIMEOUT: "Request to Evo GO timed out. The service may be unavailable.",
      MALFORMED_RESPONSE: "Received invalid response from Evo GO.",
      SERVER_ERROR: "Evo GO server error. Please try again later.",
      API_ERROR: "Failed to create WhatsApp instance.",
      UNKNOWN_ERROR: "An unknown error occurred while creating instance.",
    };

    return NextResponse.json(
      {
        error: messageMap[error.code] || error.message,
        code: error.code,
        statusCode,
      },
      { status: statusCode },
    );
  }

  // Auth Error
  if (error instanceof AuthError) {
    console.error("[Auth Error]", {
      message: error.message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: "Unauthorized. Please login again.",
        code: "UNAUTHORIZED",
        statusCode: 401,
      },
      { status: 401 },
    );
  }

  // Tenant Isolation Error
  if (error instanceof TenantIsolationError) {
    console.error("[Tenant Isolation Error]", {
      message: error.message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: "Invalid tenant context.",
        code: "FORBIDDEN",
        statusCode: 403,
      },
      { status: 403 },
    );
  }

  // Generic error
  console.error("[Unhandled Error]", {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    tenantId,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(
    {
      error: "An error occurred. Please try again later.",
      code: "INTERNAL_SERVER_ERROR",
      statusCode: 500,
    },
    { status: 500 },
  );
}
