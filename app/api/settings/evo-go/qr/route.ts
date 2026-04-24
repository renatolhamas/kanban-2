/**
 * POST /api/settings/evo-go/qr
 * Generate QR code for WhatsApp pairing via Evo GO
 *
 * Protected by: JWT auth + Tenant isolation
 *
 * Implements the complete flow:
 * 1. Get or create instance (handles all scenarios: new, orphaned, reconnect)
 * 2. Connect the instance (initialize WhatsApp session)
 * 3. Fetch QR code (with retry for async generation)
 * 4. Return QR code directly in response
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/middleware/auth";
import { tenantIsolation } from "@/lib/middleware/tenant-isolation";
import {
  getOrCreateInstance,
  callEvoGoConnect,
  getEvoGoQRCode,
  getEvoGoStatus,
} from "@/lib/api/evo-go-client";
import { handleEvoGoError } from "@/lib/api/evo-go-error-handler";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface QRCodeResponse {
  qr_code: string;
  instance_id: string;
  expires_at: string;
}

/**
 * POST /api/settings/evo-go/qr
 * Generate WhatsApp pairing QR code
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<QRCodeResponse | { error: string; code: string; statusCode: number }>> {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("[CONFIG ERROR] Missing required environment variables for Supabase");
      return NextResponse.json(
        { error: "Internal Server Error", code: "INTERNAL_ERROR", statusCode: 500 },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    // 1. Verify JWT and extract user info
    const payload = await auth(request);

    // 2. Extract and validate tenant context
    const { tenantId } = await tenantIsolation(request, payload);

    console.log('[QR] Generating QR code', {
      tenantId,
      timestamp: new Date().toISOString(),
    });

    // 3. Get or create instance (handles Scenarios A, B, C)
    const instanceData = await getOrCreateInstance(tenantId);

    // 4. Check current status in Evo GO (best-effort — errors mean disconnected)
    console.log('[QR] Checking real status in Evo GO', {
      tenantId,
      instance_id: instanceData.instance_id,
      timestamp: new Date().toISOString(),
    });

    let realStatus = { connected: false, logged_in: false };
    try {
      realStatus = await getEvoGoStatus(instanceData.token);

      console.log('[QR] Real status from Evo GO', {
        tenantId,
        connected: realStatus.connected,
        logged_in: realStatus.logged_in,
        timestamp: new Date().toISOString(),
      });
    } catch (statusError) {
      console.log('[QR] Status check failed (treating as disconnected)', {
        tenantId,
        instance_id: instanceData.instance_id,
        error: statusError instanceof Error ? statusError.message : String(statusError),
        timestamp: new Date().toISOString(),
      });
      // "client disconnected" or other errors mean not connected — continue to generate QR
    }

    // 5. If already logged in, sync database and return 409 (Conflict)
    if (realStatus.logged_in === true) {
      console.log('[QR] Already logged in, syncing database and returning 409', {
        tenantId,
        instance_id: instanceData.instance_id,
        timestamp: new Date().toISOString(),
      });

      // Sync database with real status
      await supabase
        .from("tenants")
        .update({
          evolution_instance_id: instanceData.instance_id,
          evolution_instance_token: instanceData.token,
          connection_status: "connected",
        })
        .eq("id", tenantId);

      return NextResponse.json(
        {
          error: "WhatsApp já está conectado. Desconecte primeiro se deseja trocar de conta.",
          code: "ALREADY_CONNECTED",
          statusCode: 409,
        },
        { status: 409 },
      );
    }

    // 6. Save instance info to database
    const { error: updateError } = await supabase
      .from("tenants")
      .update({
        evolution_instance_id: instanceData.instance_id,
        evolution_instance_token: instanceData.token,
        connection_status: "connecting",
      })
      .eq("id", tenantId);

    if (updateError) {
      console.error("[QR] Database update error", {
        tenantId,
        instance_id: instanceData.instance_id,
        error: updateError,
        timestamp: new Date().toISOString(),
      });

      throw new Error("Failed to save instance to database");
    }

    console.log('[QR] Instance saved to database', {
      tenantId,
      instance_id: instanceData.instance_id,
      timestamp: new Date().toISOString(),
    });

    // 7. Connect the instance (initialize WhatsApp session)
    try {
      let appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
      
      // FORCED RULE: Webhooks must never use localhost for Evolution GO integration
      if (!appUrl || appUrl.includes('localhost')) {
        console.warn(`[QR] Localhost or empty URL detected (${appUrl}). Forcing production domain for Evolution GO webhook.`);
        appUrl = 'https://kanban.renatolhamas.com.br';
      }

      const webhookUrl = `${appUrl}/api/webhooks/evo-go?tenantId=${tenantId}`;
      console.log('[QR] Webhook URL configured', { webhookUrl });

      await callEvoGoConnect(instanceData.token, webhookUrl);
    } catch (connectError) {
      console.error('[QR] Connect failed', {
        tenantId,
        instance_id: instanceData.instance_id,
        error: connectError instanceof Error ? connectError.message : String(connectError),
        timestamp: new Date().toISOString(),
      });
      throw connectError;
    }

    // 8. Fetch QR code with retry (QR generation is async)
    let qrCode = '';
    let lastError: Error | null = null;
    const maxRetries = 5;
    const retryDelay = 2000; // 2 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[QR] Fetching QR code (attempt ${attempt}/${maxRetries})`);

        const qrData = await getEvoGoQRCode(instanceData.token);
        qrCode = qrData.qr_code;

        if (qrCode) {
          console.log('[QR] QR code retrieved successfully');
          break; // Success, exit retry loop
        }

        if (attempt < maxRetries) {
          console.log(`[QR] QR code not yet generated, retrying in ${retryDelay}ms`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[QR] Error fetching QR code (attempt ${attempt}/${maxRetries})`, {
          error: lastError.message,
        });

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
    }

    if (!qrCode && lastError) {
      throw lastError;
    }

    // 9. Return success response with QR code
    console.log("[QR] QR code generation successful", {
      tenantId,
      instance_id: instanceData.instance_id,
      qrCodeLength: qrCode.length,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        qr_code: qrCode,
        instance_id: instanceData.instance_id,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    return handleEvoGoError(error);
  }
}
