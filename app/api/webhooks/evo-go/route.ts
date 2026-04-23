/**
 * POST /api/webhooks/evo-go
 * Webhook handler for Evo GO events (connection.update, qrcode, messages.upsert)
 *
 * Note: Evolution GO does not support HMAC-SHA256 webhook signatures.
 * - Extracts tenantId from URL query parameter or payload.instance lookup
 * - Returns 200 OK immediately (async processing allowed)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface EvoGoWebhookPayload {
  event:     string;
  instance?: string;
  data?:     Record<string, unknown>;
}

/**
 * POST /api/webhooks/evo-go
 * Handle webhook events from Evo GO
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<{ statusCode: number } | { error: string; statusCode: number }>> {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('[CONFIG ERROR] Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json({ statusCode: 200 }, { status: 200 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    // 1. Extract tenantId from query parameter (fallback; primary lookup is via payload.instance)
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId');

    // 2. Read raw body as text
    const body = await request.text();

    if (!body) {
      console.warn('[Webhook] Empty body', {
        tenantId,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ statusCode: 200 }, { status: 200 });
    }

    // 3. Parse JSON body
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

    const { event: rawEvent, instance, data: rawData } = payload;
    const event = (rawEvent || '').toUpperCase();
    const data = rawData || payload;

    // 6. Resolve tenantId: prefer payload.instance lookup, fallback to URL param
    let resolvedTenantId = tenantId;
    if (instance) {
      const { data: tenantRow, error: tenantError } = await supabase
        .from('tenants')
        .select('id')
        .eq('evolution_instance_name', instance)
        .maybeSingle();

      if (tenantError) {
        console.warn('[Webhook] Tenant lookup error, falling back to URL param', {
          instance,
          error: tenantError.message,
          timestamp: new Date().toISOString(),
        });
      } else if (tenantRow) {
        resolvedTenantId = tenantRow.id;
      } else {
        console.warn('[Webhook] Instance not found in tenants, falling back to URL param', {
          instance,
          timestamp: new Date().toISOString(),
        });
      }
    }

    if (!resolvedTenantId) {
      console.error('[Webhook] Could not resolve tenantId from instance or URL param', {
        instance,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ statusCode: 200 }, { status: 200 });
    }

    // 7. Process event based on type
    console.log('[WebhookEvoGo] Processing event', {
      event,
      instance,
      timestamp: new Date().toISOString(),
      hasData: !!data,
    });

    switch (event) {
      case 'CONNECTION.UPDATE':
      case 'CONNECTED':
      case 'DISCONNECTED':
        await handleConnectionUpdate(supabase, resolvedTenantId, data as Record<string, unknown>);
        break;

      case 'QRCODE':
      case 'PAIRSUCCESS':
      case 'QRCODE_UPDATED':
        await handleQRCodeUpdated(supabase, resolvedTenantId, data as Record<string, unknown>);
        break;

      case 'MESSAGES.UPSERT':
      case 'MESSAGE':
        await handleMessagesUpsert(supabase, resolvedTenantId, data as Record<string, unknown>);
        break;

      default:
        console.log('[Webhook] Unknown event type', {
          tenantId: resolvedTenantId,
          event,
          payload: JSON.stringify(data).substring(0, 500),
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
 * Normalizes status from Evolution GO to match database constraints
 * 
 * Evolution GO Status -> DB connection_status:
 * - 'open'          -> 'connected'
 * - 'connecting'    -> 'connecting'
 * - 'close'/'closed'-> 'disconnected'
 * - 'created'       -> 'pending'
 * - (unknown)       -> 'error'
 */
async function handleConnectionUpdate(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  tenantId: string,
  data?: Record<string, unknown>,
): Promise<void> {
  try {
    const rawStatus = String(data?.status || '').toLowerCase();
    
    // Status Mapping (Evolution GO -> Internal DB)
    const statusMap: Record<string, string> = {
      'open': 'connected',
      'connecting': 'connecting',
      'close': 'disconnected',
      'closed': 'disconnected',
      'created': 'pending',
    };

    const mappedStatus = statusMap[rawStatus] || 'error';

    console.log('[Webhook] CONNECTION_UPDATE mapping', {
      tenantId,
      rawStatus,
      mappedStatus,
      timestamp: new Date().toISOString(),
    });

    const { error } = await supabase
      .from('tenants')
      .update({
        connection_status: mappedStatus,
        ...(mappedStatus === 'connected' && { updated_at: new Date().toISOString() }),
      })
      .eq('id', tenantId);

    if (error) {
      console.error('[Webhook] CONNECTION_UPDATE database error', {
        tenantId,
        rawStatus,
        mappedStatus,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    console.log('[Webhook] CONNECTION_UPDATE processed successfully', {
      tenantId,
      mappedStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Webhook] CONNECTION_UPDATE fatal error', {
      tenantId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Handle QRCODE_UPDATED event
 * Saves QR code to database for frontend polling
 */
async function handleQRCodeUpdated(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  tenantId: string,
  data?: Record<string, unknown>,
): Promise<void> {
  try {
    // DIV-2: Document which field is expected (qrcode per Evo GO docs)
    // Log which field was found for diagnostics
    const qrCode = data?.qrcode || data?.qr_code || '';

    console.log('[EvoGo] webhook QRCODE field found', {
      timestamp: new Date().toISOString(),
      hasQrcode: 'qrcode' in (data || {}),
      hasQr_code: 'qr_code' in (data || {}),
      fieldUsed: 'qrcode' in (data || {}) ? 'qrcode' : 'qr_code',
      dataKeys: Object.keys(data || {}),
    });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('tenants')
      .update({
        qr_code: qrCode,
        qr_code_expires_at: expiresAt,
      })
      .eq('id', tenantId);

    if (error) {
      console.error('[Webhook] QRCODE_UPDATED database error', {
        tenantId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    console.log('[Webhook] QRCODE_UPDATED processed successfully', {
      tenantId,
      qrCodeLength: typeof qrCode === 'string' ? qrCode.length : 0,
      expiresAt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Webhook] QRCODE_UPDATED error', {
      tenantId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Handle MESSAGES_UPSERT event
 * Story 5.1: Auto-register contacts
 * Story 5.2: Auto-create conversations
 */
import { extractContactInfo } from '@/lib/api/webhook-utils';

async function handleMessagesUpsert(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  tenantId: string,
  data?: Record<string, unknown>,
): Promise<void> {
  try {
    if (!data) {
      console.warn('[Webhook] MESSAGES_UPSERT: Empty data payload', { tenantId });
      return;
    }

    // 1. Extract contact information
    const contactInfo = extractContactInfo(data);
    const messageId = contactInfo?.messageId;

    console.log('[Webhook] MESSAGES_UPSERT payload structure', {
      tenantId,
      dataKeys: Object.keys(data),
      pushName: contactInfo?.waName,
      contactExtracted: !!contactInfo,
      messageIdExtracted: !!messageId,
    });

    if (!contactInfo) {
      console.warn('[Webhook] MESSAGES_UPSERT: Could not extract contact info from payload', {
        tenantId,
        payload: JSON.stringify(data).substring(0, 1000),
      });
      return;
    }

    // 2. Upsert Contact via RPC (preserves name on conflict, updates wa_name + is_group)
    const { data: contactId, error: upsertError } = await supabase.rpc('upsert_contact', {
      p_tenant_id: tenantId,
      p_phone:     contactInfo.waPhone,
      p_name:      contactInfo.name,
      p_wa_name:   contactInfo.waName,
      p_is_group:  contactInfo.isGroup,
    });

    if (upsertError) {
      console.error('[Webhook] MESSAGES_UPSERT contact upsert failed', {
        tenantId,
        waPhone: contactInfo.waPhone,
        error: upsertError.message,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Fetch contact record for conversation linkage
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id')
      .eq('id', contactId)
      .single();

    if (contactError || !contact) {
      console.error('[Webhook] Contact fetch after upsert failed', {
        tenantId,
        contactId,
        error: contactError?.message,
      });
      return;
    }

    // 3. Find Main Kanban and its first column (for Story 5.2)
    const { data: kanban, error: kanbanError } = await supabase
      .from('kanbans')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('is_main', true)
      .single();

    if (kanbanError || !kanban) {
      console.warn('[Webhook] No main kanban found for tenant', { tenantId });
      return;
    }

    const { data: column, error: columnError } = await supabase
      .from('columns')
      .select('id')
      .eq('kanban_id', kanban.id)
      .order('order_position', { ascending: true })
      .limit(1)
      .single();

    if (columnError || !column) {
      console.warn('[Webhook] No columns found for main kanban', { tenantId, kanbanId: kanban.id });
      return;
    }

    // 4. Ensure Conversation exists (Story 5.2)
    const { data: existingConv, error: fetchConvError } = await supabase
      .from('conversations')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('contact_id', contact.id)
      .eq('kanban_id', kanban.id)
      .maybeSingle();

    if (fetchConvError) {
      console.error('[Webhook] Conversation fetch error', {
        tenantId,
        contactId: contact.id,
        error: fetchConvError.message,
      });
      return;
    }

    let conversationId: string | null = null;

    if (existingConv) {
      conversationId = existingConv.id;
      // Update existing conversation
      const { error: convError } = await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          evolution_message_id: messageId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingConv.id);

      if (convError) {
        console.error('[Webhook] Conversation update error', {
          tenantId,
          conversationId: existingConv.id,
          error: convError.message,
        });
      }
    } else {
      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          tenant_id: tenantId,
          contact_id: contact.id,
          kanban_id: kanban.id,
          column_id: column.id,
          wa_phone: contactInfo.waPhone,
          last_message_at: new Date().toISOString(),
          evolution_message_id: messageId,
        })
        .select('id')
        .single();

      if (convError || !newConv) {
        console.error('[Webhook] Conversation insert error', {
          tenantId,
          contactId: contact.id,
          error: convError?.message,
        });
      } else {
        conversationId = newConv.id;
      }
    }

    // 5. Persist Message (Story 5.3)
    const message = data.message as Record<string, unknown> | undefined;
    const content = message?.conversation ?? '';
    const fromMe = contactInfo.isFromMe ?? false;

    console.log('[DEBUG] Full message payload', {
      tenantId,
      messageKeys: message ? Object.keys(message) : [],
      messageContent: message ? JSON.stringify(message).substring(0, 500) : 'undefined',
      messageExists: !!message,
      dataKeys: Object.keys(data as Record<string, unknown>),
    });

    console.log('[DEBUG] Message insertion check', {
      tenantId,
      fromMe,
      conversationId,
      shouldInsert: !fromMe && conversationId,
      contentLength: String(content).length,
      messageId: contactInfo.messageId,
      extractedContent: content,
    });

    if (!fromMe && conversationId) {
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'contact',
          content: content,
          evolution_message_id: contactInfo.messageId ?? null,
          sender_jid: contactInfo.remoteJid ?? null,
        });

      // 23505 = unique_violation (idempotency)
      if (msgError && msgError.code !== '23505') {
        console.error('[Webhook] Message insert error', {
          tenantId,
          conversationId,
          error: msgError.message,
          code: msgError.code,
        });
      }
    }

    const messageInserted = !fromMe && conversationId;
    console.log(`[Webhook] MESSAGES_UPSERT processed successfully (Contact + Conversation${messageInserted ? ' + Message' : ''})`, {
      tenantId,
      contactId: contact.id,
      conversationId,
      waPhone: contactInfo.waPhone,
      fromMe,
      messageInserted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Webhook] MESSAGES_UPSERT fatal error', {
      tenantId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
}
