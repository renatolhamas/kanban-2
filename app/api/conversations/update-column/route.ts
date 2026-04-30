import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * PUT /api/conversations/update-column
 * Updates a conversation's column with strict tenant and kanban validation.
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversation_id, column_id } = body

    if (!conversation_id || !column_id) {
      return NextResponse.json({ error: 'Missing conversation_id or column_id' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Resolve tenantId from JWT
    const tenantId = user.app_metadata?.tenant_id
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant context missing' }, { status: 403 })
    }

    // 3. Validate that the column exists and belongs to the user's tenant
    // We join with kanbans to check the tenant_id
    const { data: columnData, error: columnError } = await supabase
      .from('columns')
      .select(`
        id,
        kanban_id,
        kanban:kanbans (
          tenant_id
        )
      `)
      .eq('id', column_id)
      .single()

    if (columnError || !columnData) {
      return NextResponse.json({ error: 'Column not found' }, { status: 404 })
    }

    // Supabase may return kanban as an array or a single object depending on schema inference
    const kanbanData = columnData.kanban as unknown
    const columnTenantId = Array.isArray(kanbanData) 
      ? (kanbanData[0] as { tenant_id: string })?.tenant_id 
      : (kanbanData as { tenant_id: string })?.tenant_id

    if (columnTenantId !== tenantId) {
      return NextResponse.json({ error: 'Unauthorized column access' }, { status: 403 })
    }

    // 4. Update the conversation
    // We update BOTH column_id and kanban_id to maintain referential integrity
    // We include tenant_id in the eq filter for defense-in-depth
    const { data: updatedConversation, error: updateError } = await supabase
      .from('conversations')
      .update({ 
        column_id: column_id,
        kanban_id: columnData.kanban_id
      })
      .eq('id', conversation_id)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (updateError) {
      console.error('[API] Error updating conversation column:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      conversation: updatedConversation
    })
  } catch (error) {
    console.error('[API] Unexpected error in update-column route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
