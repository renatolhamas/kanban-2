'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/molecules/modal';
import { Button } from '@/components/ui/atoms/button';
import { Input } from '@/components/ui/atoms/input';

interface CreateKanbanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (name: string) => Promise<void>;
  isLoading?: boolean;
}

export function CreateKanbanModal({
  open,
  onOpenChange,
  onSuccess,
  isLoading
}: CreateKanbanModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('O nome é obrigatório');
      return;
    }

    if (name.length > 100) {
      setError('O nome deve ter no máximo 100 caracteres');
      return;
    }

    await onSuccess(name);
    setName('');
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Criar Novo Kanban"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="kanban-name" className="text-sm font-medium text-text-secondary">
            Nome do Kanban
          </label>
          <Input
            id="kanban-name"
            placeholder="Ex: Vendas, Suporte, RH..."
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
            disabled={!name.trim() || isLoading}
          >
            Criar Kanban
          </Button>
        </div>
      </form>
    </Modal>
  );
}
