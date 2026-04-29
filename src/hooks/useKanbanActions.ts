'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/molecules/toast';

export function useKanbanActions() {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const createKanban = async (name: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/kanbans/create', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      addToast('Kanban criado com sucesso! ✅', 'success');
      return result.data;
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao criar Kanban', 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateKanban = async (id: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/kanbans/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      addToast('Kanban atualizado! ✅', 'success');
      return result.data;
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao atualizar Kanban', 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteKanban = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/kanbans/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      const message = result.reassigned_conversations > 0 
        ? `Kanban deletado. ${result.reassigned_conversations} conversas movidas para o Main. ✅`
        : 'Kanban deletado com sucesso! ✅';
        
      addToast(message, 'success');
      return true;
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao deletar Kanban', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const reorderKanban = async (id: string, direction: 'up' | 'down') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/kanbans/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ id, direction }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      // No toast for reorder to keep it clean, unless it's an error
      return true;
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao reordenar', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createKanban,
    updateKanban,
    deleteKanban,
    reorderKanban,
    isLoading
  };
}
