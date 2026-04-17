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
import { auth, AuthError } from "@/lib/middleware/auth";
import { tenantIsolation, TenantIsolationError } from "@/lib/middleware/tenant-isolation";
import { getEvoGoStatus } from "@/lib/api/evo-go-client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("[CONFIG ERROR] Missing required environment variables for Supabase");
      return NextResponse.json(
        { error: "Internal Server Error", statusCode: 500 },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    // 1. Verify JWT and extract user info
    const payload = await auth(request);

    // 2. Extract and validate tenant context
    const { tenantId } = await tenantIsolation(request, payload);

    // 3. Fetch tenant connection status (including QR code and token)
    const { data: tenant, error: fetchError } = await supabase
      .from("tenants")
      .select("connection_status, evolution_instance_id, evolution_instance_token, qr_code, qr_code_expires_at")
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

    // 4. Check REAL status in Evo GO — only when waiting for QR scan ("connecting")
    // Avoids false positives: a live instance can return Connected=true even when
    // the user intentionally disconnected.
    let syncedStatus = tenant?.connection_status || "disconnected";

    const dbStatus = tenant?.connection_status || "disconnected";
    const shouldCheck = tenant?.evolution_instance_token &&
      (dbStatus === "connecting" || dbStatus === "connected");

    if (shouldCheck) {
      try {
        console.log("[Status] Checking real status in Evo GO", {
          tenantId,
          dbStatus,
          timestamp: new Date().toISOString(),
        });

        const realStatus = await getEvoGoStatus(tenant!.evolution_instance_token!);

        if (dbStatus === "connecting" && realStatus.logged_in === true) {
          // User scanned QR → Evo GO has active WhatsApp session → mark as connected
          console.log("[Status] Syncing: QR scanned, session active, marking connected", { tenantId });
          await supabase
            .from("tenants")
            .update({ connection_status: "connected" })
            .eq("id", tenantId);
          syncedStatus = "connected";

        } else if (dbStatus === "connected" && realStatus.logged_in === false) {
          // WhatsApp session dropped → mark as disconnected
          console.log("[Status] Syncing: session lost, marking disconnected", { tenantId });
          await supabase
            .from("tenants")
            .update({ connection_status: "disconnected" })
            .eq("id", tenantId);
          syncedStatus = "disconnected";
        }
      } catch (eevoError) {
        const errMsg = eevoError instanceof Error ? eevoError.message : String(eevoError);
        const isUnauthorized = errMsg.includes("not authorized") || errMsg.includes("401") || errMsg.includes("403");

        if (isUnauthorized && dbStatus === "connected") {
          // Token invalid (instance deleted in Evo GO) → clear DB
          console.log("[Status] Token unauthorized, clearing instance from DB", {
            tenantId,
            timestamp: new Date().toISOString(),
          });
          await supabase
            .from("tenants")
            .update({
              connection_status: "disconnected",
              evolution_instance_id: null,
              evolution_instance_token: null,
            })
            .eq("id", tenantId);
          syncedStatus = "disconnected";
        } else {
          // Temporary error — keep DB status
          console.error("[Status] Error checking Evo GO status", {
            tenantId,
            error: errMsg,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    // 5. Log status retrieval
    console.log("[Status] Connection status retrieved", {
      tenantId,
      connection_status: syncedStatus,
      timestamp: new Date().toISOString(),
    });

    // 6. Return status
    return NextResponse.json(
      {
        connection_status: syncedStatus,
        evolution_instance_id: tenant?.evolution_instance_id || null,
        qr_code: tenant?.qr_code || null,
        qr_code_expires_at: tenant?.qr_code_expires_at || null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Status] Error:", error);

    // Handle auth errors (AuthError from @/lib/middleware/auth)
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: "Unauthorized", statusCode: 401 },
        { status: 401 },
      );
    }

    // Handle tenant isolation errors (TenantIsolationError)
    if (error instanceof TenantIsolationError) {
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
