/**
 * POST /api/settings/evo-go/disconnect
 * Disconnect WhatsApp instance and cleanup tenant data
 *
 * Protected by: JWT auth + Tenant isolation
 * Response: { success: boolean }
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/lib/middleware/auth';
import { tenantIsolation } from '@/lib/middleware/tenant-isolation';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

interface DisconnectResponse {
  success: boolean;
  message?: string;
}

/**
 * POST /api/settings/evo-go/disconnect
 * Disconnect WhatsApp pairing for current tenant
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<DisconnectResponse | { error: string; statusCode: number }>> {
  try {
    // 1. Verify JWT and extract user info
    const payload = await auth(request);

    // 2. Extract and validate tenant context
    const { tenantId } = await tenantIsolation(request, payload);

    // 3. Fetch current tenant to get instance_id
    const { data: tenant, error: fetchError } = await supabase
      .from('tenants')
      .select('evolution_instance_id, connection_status')
      .eq('id', tenantId)
      .single();

    if (fetchError) {
      console.error('[Disconnect] Tenant fetch error', {
        tenantId,
        error: fetchError,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { error: 'Tenant not found', statusCode: 404 },
        { status: 404 },
      );
    }

    // 4. Check if instance exists
    if (!tenant?.evolution_instance_id) {
      console.warn('[Disconnect] No instance to disconnect', {
        tenantId,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        {
          success: true,
          message: 'No instance connected',
        },
        { status: 200 },
      );
    }

    // 5. Call Evolution API to logout/delete instance
    // Note: This would require Evolution API client implementation
    // For now, we'll proceed with database update
    // TODO: Implement callEvoGoLogoutInstance if needed in future story
    try {
      // await callEvoGoLogoutInstance(tenant.evolution_instance_id);
      console.log('[Disconnect] Evolution API logout call (placeholder)', {
        tenantId,
        instance_id: tenant.evolution_instance_id,
        timestamp: new Date().toISOString(),
      });
    } catch (evoError) {
      console.warn('[Disconnect] Evolution API error (non-blocking)', {
        tenantId,
        instance_id: tenant.evolution_instance_id,
        error: evoError instanceof Error ? evoError.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      // Continue with database cleanup even if Evolution API fails
    }

    // 6. Update tenant to clear instance data
    const { error: updateError } = await supabase
      .from('tenants')
      .update({
        evolution_instance_id: null,
        connection_status: 'disconnected',
      })
      .eq('id', tenantId);

    if (updateError) {
      console.error('[Disconnect] Database update error', {
        tenantId,
        error: updateError,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { error: 'Failed to disconnect', statusCode: 500 },
        { status: 500 },
      );
    }

    // 7. Log successful disconnection
    console.log('[Disconnect] Disconnection successful', {
      tenantId,
      instance_id: tenant.evolution_instance_id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Disconnected successfully',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[Disconnect] Error:', error);

    // Handle auth errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }

    // Handle tenant isolation errors
    if (error instanceof Error && error.message === 'Tenant context not found') {
      return NextResponse.json(
        { error: 'Forbidden', statusCode: 403 },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error', statusCode: 500 },
      { status: 500 },
    );
  }
}
