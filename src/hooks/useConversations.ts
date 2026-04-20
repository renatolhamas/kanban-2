import { useState, useEffect, useMemo } from 'react'
import { useAuth } from './useAuth'
import { getSupabaseClient } from '@/lib/supabase-client'

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

export function useConversations(kanbanId: string, tenantId: string) {
  const { token } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [columns, setColumns] = useState<KanbanColumnData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Memoize the client to avoid unnecessary re-creations, though getSupabaseClient handles it
  const client = useMemo(() => getSupabaseClient(token), [token])

  const fetchData = async () => {
    if (!kanbanId || !tenantId || !token) return

    try {
      setIsLoading(true)

      // 1. Fetch Columns
      const { data: colsData, error: colsError } = await client
        .from('columns')
        .select('id, name, order_position')
        .eq('kanban_id', kanbanId)
        .order('order_position', { ascending: true })

      if (colsError) throw colsError
      setColumns(colsData || [])

      // 2. Fetch Conversations with subqueries for last message
      const { data: convData, error: convError } = await client
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

      // Transform data to match our interface
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
    if (!kanbanId || !tenantId || !token) {
      setIsLoading(true) // Stay in loading status until we have everything
      
      // If we are sure we won't have it (e.g. not authenticated), we should set to false
      // But HomePage handles redirection, so setIsLoading(false) is safer here to avoid blocking UI if logic fails
      if (tenantId === "" && token === null) {
        setIsLoading(false)
      }
      return;
    }

    fetchData()

    // 3. Realtime Subscriptions using the authenticated client
    const channel = client
      .channel(`kanban-realtime-${kanbanId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `kanban_id=eq.${kanbanId}`
        },
        () => {
          fetchData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchData()
        }
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [kanbanId, tenantId, client, token])

  return { conversations, columns, isLoading, error, refetch: fetchData }
}
