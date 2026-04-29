'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/molecules/card';
import { Button } from '@/components/ui/atoms/button';
import { Plus } from 'lucide-react';
import { useKanbans, KanbanData } from '@/hooks/useKanbans';
import { useKanbanActions } from '@/hooks/useKanbanActions';
import { KanbanTable } from './KanbanTable';
import { CreateKanbanModal } from './CreateKanbanModal';
import { DeleteKanbanConfirm } from './DeleteKanbanConfirm';

export function KanbansSection() {
  const { kanbans, isLoading: isFetching, refetch } = useKanbans();
  const { createKanban, updateKanban, deleteKanban, reorderKanban, isLoading: isActing } = useKanbanActions();

  // Modal States
  const [showCreate, setShowCreate] = useState(false);
  const [deletingKanban, setDeletingKanban] = useState<KanbanData | null>(null);

  const handleCreate = async (name: string) => {
    const success = await createKanban(name);
    if (success) {
      setShowCreate(false);
      refetch();
    }
  };


  const handleDelete = async (id: string) => {
    const success = await deleteKanban(id);
    if (success) {
      setDeletingKanban(null);
      refetch();
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const success = await reorderKanban(id, direction);
    if (success) {
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Gerenciar Kanbans</h2>
          <p className="text-sm text-text-secondary">Crie e organize seus fluxos de atendimento.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Kanban
        </Button>
      </div>

      <Card className="p-0 overflow-hidden border-none shadow-ambient">
        <KanbanTable
          kanbans={kanbans}
          isLoading={isFetching || isActing}
          onEdit={() => {}} // Not used anymore as KanbanTable handles navigation
          onDelete={setDeletingKanban}
          onReorder={handleReorder}
        />
      </Card>

      {/* Modals */}
      <CreateKanbanModal
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={handleCreate}
        isLoading={isActing}
      />


      <DeleteKanbanConfirm
        open={!!deletingKanban}
        onOpenChange={(open) => !open && setDeletingKanban(null)}
        kanban={deletingKanban}
        onConfirm={handleDelete}
        isLoading={isActing}
      />
    </div>
  );
}
