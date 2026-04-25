// Supabase Edge Function: poll-message-status
// Story 6.3: Fallback polling for message status

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EVOGO_API_URL = Deno.env.get('EVOGO_API_URL') || 'https://evogo.renatop.com.br'

serve(async (req) => {
  try {
    const { record } = await req.json()
    
    // Only process outgoing agent messages that have a remote ID
    if (!record || record.sender_type !== 'agent' || !record.evolution_message_id) {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 })
    }

    const messageId = record.id
    const evoMessageId = record.evolution_message_id
    const conversationId = record.conversation_id

    // 1. Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Wait 20 seconds (AC 8)
    console.log(`[Poll] Waiting 20s before checking status for message ${messageId}`)
    await new Promise(resolve => setTimeout(resolve, 20000))

    // 3. Check if status is still 'sent' or 'sending'
    const { data: currentMsg } = await supabase
      .from('messages')
      .select('status, conversation_id')
      .eq('id', messageId)
      .single()

    if (!currentMsg || (currentMsg.status !== 'sent' && currentMsg.status !== 'sending')) {
      console.log(`[Poll] Message ${messageId} already updated to ${currentMsg?.status}. Skipping poll.`)
      return new Response(JSON.stringify({ skipped: true, status: currentMsg?.status }), { status: 200 })
    }

    // 4. Get instance token via conversation -> tenant
    const { data: conv } = await supabase
      .from('conversations')
      .select('tenant_id')
      .eq('id', conversationId)
      .single()

    if (!conv) return new Response('Conversation not found', { status: 404 })

    const { data: tenant } = await supabase
      .from('tenants')
      .select('evolution_instance_token')
      .eq('id', conv.tenant_id)
      .single()

    if (!tenant?.evolution_instance_token) return new Response('Token not found', { status: 404 })

    // 5. Query Evolution GO API
    console.log(`[Poll] Querying Evo GO for message ${evoMessageId}`)
    const response = await fetch(`${EVOGO_API_URL}/message/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': tenant.evolution_instance_token,
      },
      body: JSON.stringify({ id: evoMessageId }),
    })

    if (!response.ok) {
      console.error(`[Poll] Evo GO API failed: ${response.status}`)
      return new Response('Evo GO API Error', { status: 502 })
    }

    const result = await response.json()
    const rawStatus = result.status // whatsmeow status code

    // 6. Map status
    let newStatus = 'sent'
    if (rawStatus === 2) newStatus = 'delivered'
    else if (rawStatus === 3 || rawStatus === 4) newStatus = 'read'
    else if (rawStatus === 5) newStatus = 'error'

    // 7. Update database if changed
    if (newStatus !== currentMsg.status) {
      console.log(`[Poll] Updating message ${messageId} status to ${newStatus}`)
      await supabase
        .from('messages')
        .update({ status: newStatus })
        .eq('id', messageId)
    }

    return new Response(JSON.stringify({ success: true, newStatus }), { status: 200 })

  } catch (error) {
    console.error('[Poll] Fatal error:', error)
    return new Response(error.message, { status: 500 })
  }
})
