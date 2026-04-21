import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { createClient } from '@/lib/supabase/client'

export interface Conversation {
  id: string
  wa_phone: string
  status: string
  last_message_at: string
  contact_name: string | null
  order_position: number
  column_id: string
  last_message_content: string | null
  unread_count: number
}

export interface KanbanColumnData {
  id: string
  name: string
  order_position: number
}

export function useConversations(kanbanId: string) {
  const { user, isAuthenticated } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [columns, setColumns] = useState<KanbanColumnData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()
  const tenantId = user?.app_metadata?.tenant_id

  const fetchData = async () => {
    if (!kanbanId || !tenantId || !isAuthenticated) return

    try {
      setIsLoading(true)

      // 1. Fetch Columns
      const { data: colsData, error: colsError } = await supabase
        .from('columns')
        .select('id, name, order_position')
        .eq('kanban_id', kanbanId)
        .order('order_position', { ascending: true })

      if (colsError) throw colsError
      setColumns(colsData || [])

      // 2. Fetch Conversations
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          wa_phone,
          status,
          last_message_at,
          column_id,
          contacts (name)
        `)
        .eq('kanban_id', kanbanId)
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false })

      if (convError) throw convError

      // Transform data
      const transformed: Conversation[] = (convData || []).map((c: any) => ({
        id: c.id,
        wa_phone: c.wa_phone,
        status: c.status,
        last_message_at: c.last_message_at,
        column_id: c.column_id,
        contact_name: c.contacts?.name || null,
        order_position: 0,
        last_message_content: "Preview indisponível",
        unread_count: 0
      }))

      setConversations(transformed)
    } catch (err: any) {
      setError(err)
      console.error('Error fetching conversations:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!kanbanId || !tenantId || !isAuthenticated) {
      setIsLoading(true)
      if (!isAuthenticated) setIsLoading(false)
      return
    }

    fetchData()

    // 3. Realtime Subscriptions
    const channel = supabase
      .channel(`kanban-realtime-${kanbanId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `kanban_id=eq.${kanbanId}`
        },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => fetchData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [kanbanId, tenantId, isAuthenticated])

  return { conversations, columns, isLoading, error, refetch: fetchData }
}
