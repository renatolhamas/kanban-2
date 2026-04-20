import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { getSupabaseClient } from '@/lib/supabase-client'

export interface KanbanData {
  id: string
  name: string
  is_main: boolean
}

export function useKanbans(tenantId: string) {
  const { token } = useAuth()
  const [kanbans, setKanbans] = useState<KanbanData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchKanbans = async () => {
    if (!tenantId) return

    try {
      setIsLoading(true)
      const client = getSupabaseClient(token)
      const { data, error: fetchError } = await client
        .from('kanbans')
        .select('id, name, is_main')
        .eq('tenant_id', tenantId)
        .order('order_position', { ascending: true })

      if (fetchError) throw fetchError
      setKanbans(data || [])
    } catch (err: any) {
      setError(err)
      console.error('Error fetching kanbans:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!tenantId || !token) {
      setIsLoading(false);
      return;
    }
    fetchKanbans();
  }, [tenantId, token])

  return { kanbans, isLoading, error, refetch: fetchKanbans }
}
