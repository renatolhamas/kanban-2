/**
 * POST /api/settings/evo-go/qr
 * Generate QR code for WhatsApp pairing via Evo GO
 *
 * Protected by: JWT auth + Tenant isolation
 *
 * Response: { qr_code, instance_id, expires_at }
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/middleware/auth";
import { tenantIsolation } from "@/lib/middleware/tenant-isolation";
import { callEvoGoCreateInstance } from "@/lib/api/evo-go-client";
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

    // 3. Check if instance already exists (prevent re-pairing)
    const { data: existingTenant, error: fetchError } = await supabase
      .from("tenants")
      .select("evolution_instance_id")
      .eq("id", tenantId)
      .single();

    if (fetchError) {
      console.error("[Evo GO] Tenant fetch error", {
        tenantId,
        error: fetchError,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { error: "Tenant not found", code: "TENANT_NOT_FOUND", statusCode: 404 },
        { status: 404 },
      );
    }

    if (existingTenant?.evolution_instance_id) {
      return NextResponse.json(
        {
          error: "Instance already exists. Please disconnect first.",
          code: "INSTANCE_ALREADY_EXISTS",
          statusCode: 409,
        },
        { status: 409 },
      );
    }

    // 4. Call Evo GO API to create instance
    const qrData = await callEvoGoCreateInstance(tenantId);

    // 5. Update tenant with new instance info
    const { error: updateError } = await supabase
      .from("tenants")
      .update({
        evolution_instance_id: qrData.instanceId,
        connection_status: "connecting",
      })
      .eq("id", tenantId);

    if (updateError) {
      console.error("[Evo GO] Database update error", {
        tenantId,
        instance_id: qrData.instanceId,
        error: updateError,
        timestamp: new Date().toISOString(),
      });

      throw new Error("Failed to save instance to database");
    }

    // 6. Log successful pairing
    console.log("[Evo GO] Pairing initiated successfully", {
      tenantId,
      instance_id: qrData.instanceId,
      timestamp: new Date().toISOString(),
    });

    // 7. Return success response
    return NextResponse.json(
      {
        qr_code: qrData.qrCode,
        instance_id: qrData.instanceId,
        expires_at: qrData.expires_at || new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    return handleEvoGoError(error);
  }
}
