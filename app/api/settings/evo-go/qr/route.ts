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
} from "@/lib/api/evo-go-client";
import { handleEvoGoError } from "@/lib/api/evo-go-error-handler";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

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

    // 4. Save instance info to database
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

    // 5. Connect the instance (initialize WhatsApp session)
    try {
      await callEvoGoConnect(instanceData.token);
    } catch (connectError) {
      console.error('[QR] Connect failed', {
        tenantId,
        instance_id: instanceData.instance_id,
        error: connectError instanceof Error ? connectError.message : String(connectError),
        timestamp: new Date().toISOString(),
      });
      throw connectError;
    }

    // 6. Fetch QR code with retry (QR generation is async)
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

    // 7. Return success response with QR code
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
