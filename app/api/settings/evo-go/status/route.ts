/**
 * GET /api/settings/evo-go/status
 * Get current WhatsApp connection status
 *
 * Protected by: JWT auth + Tenant isolation
 * Response: { connection_status, evolution_instance_id }
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/middleware/auth";
import { tenantIsolation } from "@/lib/middleware/tenant-isolation";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

interface StatusResponse {
  connection_status: string;
  evolution_instance_id: string | null;
  qr_code: string | null;
  qr_code_expires_at: string | null;
}

/**
 * GET /api/settings/evo-go/status
 * Get WhatsApp connection status for current tenant
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<StatusResponse | { error: string; statusCode: number }>> {
  try {
    // 1. Verify JWT and extract user info
    const payload = await auth(request);

    // 2. Extract and validate tenant context
    const { tenantId } = await tenantIsolation(request, payload);

    // 3. Fetch tenant connection status (including QR code)
    const { data: tenant, error: fetchError } = await supabase
      .from("tenants")
      .select("connection_status, evolution_instance_id, qr_code, qr_code_expires_at")
      .eq("id", tenantId)
      .single();

    if (fetchError) {
      console.error("[Status] Tenant fetch error", {
        tenantId,
        error: fetchError,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { error: "Tenant not found", statusCode: 404 },
        { status: 404 },
      );
    }

    // 4. Log status retrieval
    console.log("[Status] Connection status retrieved", {
      tenantId,
      connection_status: tenant?.connection_status,
      timestamp: new Date().toISOString(),
    });

    // 5. Return status
    return NextResponse.json(
      {
        connection_status: tenant?.connection_status || "disconnected",
        evolution_instance_id: tenant?.evolution_instance_id || null,
        qr_code: tenant?.qr_code || null,
        qr_code_expires_at: tenant?.qr_code_expires_at || null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Status] Error:", error);

    // Handle auth errors (AuthError from @/lib/middleware/auth)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized", statusCode: 401 },
        { status: 401 },
      );
    }

    // Handle tenant isolation errors (TenantIsolationError)
    if (error instanceof Error && error.message === "Tenant context not found") {
      return NextResponse.json(
        { error: "Forbidden", statusCode: 403 },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", statusCode: 500 },
      { status: 500 },
    );
  }
}
