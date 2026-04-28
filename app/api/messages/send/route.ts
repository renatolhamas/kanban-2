import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { evolutionService } from '@/lib/services/evolution';

/**
 * POST /api/messages/send
 * Sends a message via Evolution GO and persists it in the database.
 */
export async function POST(request: NextRequest) {
  try {
    const { conversationId, text, id } = await request.json();

    if (!conversationId || !text) {
      return NextResponse.json({ error: 'Missing conversationId or text' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Resolve tenantId from app_metadata (populated by Supabase Auth)
    const tenantId = user.app_metadata?.tenant_id;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant context missing' }, { status: 403 });
    }

    // 3. Get tenant's Evolution info
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('evolution_instance_id, evolution_instance_token')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenant) {
      console.error('[API] Error fetching tenant data:', tenantError);
      return NextResponse.json({ error: 'Tenant configuration not found' }, { status: 404 });
    }

    // 4. Resolve instance info
    const instanceToken = tenant.evolution_instance_token;
    if (!instanceToken) {
      console.error('[API] Missing evolution_instance_token for tenant:', tenantId);
      return NextResponse.json({ error: 'WhatsApp instance not configured for this tenant.' }, { status: 400 });
    }

    // 5. Get conversation's remote target (wa_phone)
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('wa_phone')
      .eq('id', conversationId)
      .eq('tenant_id', tenantId)
      .single();

    if (convError || !conversation) {
      console.error('[API] Error fetching conversation data:', convError);
      return NextResponse.json({ error: 'Conversation not found or access denied.' }, { status: 404 });
    }

    // 6. Save message to DB first (Optimistic approach)
    const messageInsertData: any = {
      conversation_id: conversationId,
      sender_type: 'agent',
      content: text,
      status: 'sending'
    };
    
    // Use client-provided UUID to avoid realtime duplicate UI issues
    if (id) {
      messageInsertData.id = id;
    }

    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert(messageInsertData)
      .select()
      .single();

    if (insertError || !message) {
      console.error('[API] Error saving message to DB:', insertError);
      return NextResponse.json({ error: 'Failed to persist message' }, { status: 500 });
    }

    // 7. Send message via Evolution GO
    try {
      const evoResponse = await evolutionService.sendText(instanceToken, conversation.wa_phone, text);
      
      // 8. Update message with remote ID and mark as sent
      await supabase
        .from('messages')
        .update({ 
          status: 'sent',
          evolution_message_id: evoResponse.key?.id 
        })
        .eq('id', message.id);

      return NextResponse.json({ 
        messageId: message.id, 
        evolutionMessageId: evoResponse.key?.id 
      });
    } catch (evoError: unknown) {
      const errorMessage = evoError instanceof Error ? evoError.message : 'Failed to send message via WhatsApp';
      console.error('[API] Evolution API error details:', {
        error: errorMessage,
        tenantId,
        conversationId,
        messageId: message.id
      });
      
      // Update DB to mark as error so UI reflects failure
      await supabase
        .from('messages')
        .update({ status: 'error' })
        .eq('id', message.id);

      return NextResponse.json({ 
        error: errorMessage,
        messageId: message.id
      }, { status: 502 });
    }
  } catch (error) {
    console.error('[API] Unexpected error in send message route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
