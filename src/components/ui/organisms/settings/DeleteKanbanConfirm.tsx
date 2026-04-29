'use client';

import { Modal } from '@/components/ui/molecules/modal';
import { Button } from '@/components/ui/atoms/button';
import { KanbanData } from '@/hooks/useKanbans';
import { AlertTriangle } from 'lucide-react';

interface DeleteKanbanConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kanban: KanbanData | null;
  onConfirm: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function DeleteKanbanConfirm({
  open,
  onOpenChange,
  kanban,
  onConfirm,
  isLoading
}: DeleteKanbanConfirmProps) {
  if (!kanban) return null;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Excluir Kanban"
    >
      <div className="space-y-6">
        <div className="flex items-start gap-4 p-4 bg-error/5 border border-error/10 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-text-primary">Esta ação é irreversível!</p>
            <p className="text-sm text-text-secondary">
              Ao excluir o kanban <span className="font-bold">"{kanban.name}"</span>, todas as colunas associadas serão removidas.
            </p>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-lg">
          <p className="text-sm text-text-secondary">
            <span className="font-medium text-text-primary">Nota Importante:</span> Quaisquer conversas vinculadas a este Kanban serão movidas automaticamente para o Kanban <span className="font-bold">"Main"</span> para que você não perca nenhum atendimento.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="secondary"
            className="bg-error hover:bg-error/90 text-white border-none"
            onClick={() => onConfirm(kanban.id)}
            loading={isLoading}
          >
            Confirmar Exclusão
          </Button>
        </div>
      </div>
    </Modal>
  );
}
