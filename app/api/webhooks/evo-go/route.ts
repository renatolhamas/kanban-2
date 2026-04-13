/**
 * POST /api/webhooks/evo-go
 * Webhook handler for Evo GO events (CONNECTION_UPDATE, QRCODE_UPDATED, MESSAGES_UPSERT)
 *
 * Security:
 * - Validates HMAC-SHA256 signature via X-Signature header
 * - Extracts tenantId from URL query parameter
 * - Returns 200 OK immediately (async processing allowed)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateEvoGoSignature, parseSignatureHeader } from '@/lib/api/evo-go-signature';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const evoGoWebhookSecret = process.env.EVO_GO_WEBHOOK_SECRET;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase credentials');
}

if (!evoGoWebhookSecret) {
  throw new Error('Missing EVO_GO_WEBHOOK_SECRET');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

interface EvoGoWebhookPayload {
  event: string;
  data?: Record<string, unknown>;
}

/**
 * POST /api/webhooks/evo-go
 * Handle webhook events from Evo GO
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<{ statusCode: number } | { error: string; statusCode: number }>> {
  try {
    // 1. Extract tenantId from query parameter
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId');

    if (!tenantId) {
      console.warn('[Webhook] Missing tenantId in query parameter', {
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { error: 'Missing tenantId', statusCode: 400 },
        { status: 400 },
      );
    }

    // 2. Read raw body as text (CRITICAL for HMAC validation)
    const body = await request.text();

    if (!body) {
      console.warn('[Webhook] Empty body', {
        tenantId,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ statusCode: 200 }, { status: 200 });
    }

    // 3. Extract and validate X-Signature header
    const signatureHeader = request.headers.get('x-signature');
    const signature = parseSignatureHeader(signatureHeader);

    if (!signature) {
      console.warn('[Webhook] Invalid or missing X-Signature header', {
        tenantId,
        provided: signatureHeader ? 'present' : 'missing',
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ statusCode: 401 }, { status: 401 });
    }

    // 4. Validate HMAC-SHA256 signature
    const isValid = validateEvoGoSignature(body, signature, evoGoWebhookSecret);

    if (!isValid) {
      console.warn('[Webhook] Invalid signature', {
        tenantId,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ statusCode: 401 }, { status: 401 });
    }

    // 5. Parse JSON body (safe after validation)
    let payload: EvoGoWebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch (error) {
      console.warn('[Webhook] Malformed JSON body', {
        tenantId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ statusCode: 200 }, { status: 200 });
    }

    const { event, data } = payload;

    // 6. Process event based on type
    switch (event) {
      case 'CONNECTION_UPDATE':
        await handleConnectionUpdate(tenantId, data);
        break;

      case 'QRCODE_UPDATED':
        handleQRCodeUpdated(tenantId, data);
        break;

      case 'MESSAGES_UPSERT':
        handleMessagesUpsert(tenantId, data);
        break;

      default:
        console.log('[Webhook] Unknown event type', {
          tenantId,
          event,
          timestamp: new Date().toISOString(),
        });
    }

    // 7. Respond 200 OK immediately (async processing allowed)
    return NextResponse.json({ statusCode: 200 }, { status: 200 });
  } catch (error) {
    console.error('[Webhook] Unexpected error:', error);
    // Always return 200 OK for webhooks (Evo GO shouldn't retry)
    return NextResponse.json({ statusCode: 200 }, { status: 200 });
  }
}

/**
 * Handle CONNECTION_UPDATE event
 * Updates tenant connection_status in database
 */
async function handleConnectionUpdate(
  tenantId: string,
  data?: Record<string, unknown>,
): Promise<void> {
  try {
    const status = data?.status || 'disconnected';

    const { error } = await supabase
      .from('tenants')
      .update({
        connection_status: status,
        ...(status === 'connected' && { updated_at: new Date().toISOString() }),
      })
      .eq('id', tenantId);

    if (error) {
      console.error('[Webhook] CONNECTION_UPDATE database error', {
        tenantId,
        status,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    console.log('[Webhook] CONNECTION_UPDATE processed successfully', {
      tenantId,
      status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Webhook] CONNECTION_UPDATE error', {
      tenantId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Handle QRCODE_UPDATED event
 * Currently logs only (handler will be implemented in Story 3.3)
 */
function handleQRCodeUpdated(tenantId: string, data?: Record<string, unknown>): void {
  console.log('[Webhook] QRCODE_UPDATED event logged', {
    tenantId,
    data: data || {},
    timestamp: new Date().toISOString(),
  });
}

/**
 * Handle MESSAGES_UPSERT event
 * Currently logs only (handler will be implemented in Story 3.5)
 */
function handleMessagesUpsert(tenantId: string, data?: Record<string, unknown>): void {
  console.log('[Webhook] MESSAGES_UPSERT event logged', {
    tenantId,
    dataKeys: data ? Object.keys(data) : [],
    timestamp: new Date().toISOString(),
  });
}
