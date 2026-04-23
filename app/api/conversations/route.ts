import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/conversations?kanbanId=...
 * Returns the list of active conversations for a specific Kanban board,
 * including the last message preview via optimized SQL subquery.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kanbanId = searchParams.get('kanbanId')

    if (!kanbanId) {
      return NextResponse.json({ error: 'Missing kanbanId' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Resolve tenantId from user metadata
    const tenantId = user.app_metadata?.tenant_id
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant context missing' }, { status: 403 })
    }

    // 3. Execute optimized RPC
    const { data, error } = await supabase.rpc('get_conversations_with_last_message', {
      p_kanban_id: kanbanId,
      p_tenant_id: tenantId
    })

    if (error) {
      console.error('[API] Error fetching conversations with last message:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 4. Return results
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('[API] Unexpected error in conversations route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
