'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Loader2 } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useKanbanStructure } from '@/hooks/useKanbanStructure';
import { useToast } from '@/components/ui/molecules/toast';
import { cn } from '@/lib/utils';

export function KanbanTransferDropdown() {
  const { activeConversation, isLoadingConversation } = useChat();
  const { success: showToastSuccess, error: showToastError } = useToast();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');

  // Fetch all available kanbans and columns for the tenant
  const { 
    kanbans, 
    isLoading: isLoadingStructure, 
    error: structureError, 
    refetch: refetchStructure 
  } = useKanbanStructure();
  
  // Sync internal state with conversation's current column
  useEffect(() => {
    if (activeConversation?.column_id) {
      setSelectedColumnId(activeConversation.column_id);
    }
  }, [activeConversation?.column_id]);

  const handleColumnChange = async (newColumnId: string) => {
    if (!activeConversation || !newColumnId || newColumnId === activeConversation.column_id) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/conversations/update-column', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: activeConversation.id,
          column_id: newColumnId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao mover conversa');
      }

      showToastSuccess('Conversa movida com sucesso!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Falha ao mover conversa. Tente novamente.';
      console.error('[KanbanTransferDropdown] Error updating column:', err);
      showToastError(errorMessage, {
        label: 'Tentar novamente',
        onClick: () => handleColumnChange(newColumnId),
      });
      // Revert selection on error
      setSelectedColumnId(activeConversation.column_id || '');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoadingConversation || !activeConversation) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant animate-pulse w-[180px] h-[36px]">
        <div className="w-4 h-4 rounded-full bg-outline-variant" />
        <div className="flex-1 h-4 bg-outline-variant rounded" />
      </div>
    );
  }

  // Handle case where structure fails to load
  if (structureError) {
    return (
      <button 
        onClick={() => refetchStructure()}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-error-container text-on-error-container border border-error/20 hover:bg-error-container/80 transition-colors"
        title="Clique para tentar carregar os quadros novamente"
      >
        <ArrowRightLeft className="w-4 h-4" />
        <span className="text-label-md font-medium">Erro ao carregar</span>
      </button>
    );
  }

  const isLoading = isUpdating || isLoadingStructure;

  return (
    <div className="relative inline-block group">
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant transition-all hover:border-primary/50",
        isLoading && "opacity-70 pointer-events-none"
      )}>
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        ) : (
          <ArrowRightLeft className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors" />
        )}
        
        <select
          value={selectedColumnId}
          onChange={(e) => handleColumnChange(e.target.value)}
          disabled={isLoading}
          aria-label="Selecionar destino da conversa (Quadro e Coluna)"
          className="appearance-none bg-transparent text-label-md font-medium text-text-primary focus:outline-none cursor-pointer pr-4"
        >
          {kanbans.map((kanban) => (
            <optgroup key={kanban.id} label={kanban.name}>
              {kanban.columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  );
}
