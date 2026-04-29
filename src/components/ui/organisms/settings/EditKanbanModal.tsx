'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/molecules/modal';
import { Button } from '@/components/ui/atoms/button';
import { Input } from '@/components/ui/atoms/input';
import { KanbanData } from '@/hooks/useKanbans';

interface EditKanbanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kanban: KanbanData | null;
  onSuccess: (id: string, name: string) => Promise<void>;
  isLoading?: boolean;
}

export function EditKanbanModal({
  open,
  onOpenChange,
  kanban,
  onSuccess,
  isLoading
}: EditKanbanModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (kanban) {
      setName(kanban.name);
    }
  }, [kanban]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kanban) return;
    setError('');

    if (!name.trim()) {
      setError('O nome é obrigatório');
      return;
    }

    await onSuccess(kanban.id, name);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Kanban"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="edit-kanban-name" className="text-sm font-medium text-text-secondary">
            Nome do Kanban
          </label>
          <Input
            id="edit-kanban-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
          {error && <p className="text-xs text-error">{error}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={!name.trim() || name === kanban?.name || isLoading}
          >
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}
