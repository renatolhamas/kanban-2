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
import { getOrCreateInstance } from "@/lib/api/evo-go-client";
import { handleEvoGoError } from "@/lib/api/evo-go-error-handler";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

interface QRCodeResponse {
  instance_id: string;
  status: string;
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

    // 4. Get or create instance (checks if already exists by name)
    const qrData = await getOrCreateInstance(tenantId);

    // 5. Update tenant with new instance info
    const { error: updateError } = await supabase
      .from("tenants")
      .update({
        evolution_instance_id: qrData.instance_id,
        connection_status: "connecting",
      })
      .eq("id", tenantId);

    if (updateError) {
      console.error("[Evo GO] Database update error", {
        tenantId,
        instance_id: qrData.instance_id,
        error: updateError,
        timestamp: new Date().toISOString(),
      });

      throw new Error("Failed to save instance to database");
    }

    // 6. Log successful pairing
    console.log("[Evo GO] Pairing initiated successfully", {
      tenantId,
      instance_id: qrData.instance_id,
      timestamp: new Date().toISOString(),
    });

    // 7. Return success response
    // Note: qr_code will come via polling once webhook QRCODE_UPDATED arrives
    return NextResponse.json(
      {
        instance_id: qrData.instance_id,
        status: "connecting",
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    return handleEvoGoError(error);
  }
}
