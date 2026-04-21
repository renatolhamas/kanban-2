import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { createClient } from '@/lib/supabase/client'

export interface KanbanData {
  id: string
  name: string
  is_main: boolean
}

export function useKanbans() {
  const { user, isAuthenticated } = useAuth()
  const [kanbans, setKanbans] = useState<KanbanData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()
  const tenantId = user?.app_metadata?.tenant_id

  const fetchKanbans = async () => {
    if (!tenantId || !isAuthenticated) return

    try {
      setIsLoading(true)
      const { data, error: fetchError } = await supabase
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
    if (!tenantId || !isAuthenticated) {
      setIsLoading(false)
      return
    }
    fetchKanbans()
  }, [tenantId, isAuthenticated])

  return { kanbans, isLoading, error, refetch: fetchKanbans }
}
