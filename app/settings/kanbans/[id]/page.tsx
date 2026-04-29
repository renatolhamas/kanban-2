'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/molecules/card';
import { Button } from '@/components/ui/atoms/button';
import { Input } from '@/components/ui/atoms/input';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { useColumns, ColumnData } from '@/hooks/useColumns';
import { useColumnActions } from '@/hooks/useColumnActions';
import { useKanbans } from '@/hooks/useKanbans';
import { useKanbanActions } from '@/hooks/useKanbanActions';
import { ColumnTable } from '@/components/ui/organisms/settings/ColumnTable';
import { CreateColumnModal, EditColumnModal, DeleteColumnConfirm } from '@/components/ui/organisms/settings/ColumnModals';

export default function ColumnManagementPage() {
  const router = useRouter();
  const params = useParams();
  const kanbanId = params.id as string;

  const { kanbans, isLoading: isFetchingKanbans } = useKanbans();
  const { updateKanban, isLoading: isSavingKanban } = useKanbanActions();
  const { columns, isLoading: isFetchingColumns, refetch: refetchColumns } = useColumns(kanbanId);
  const { createColumn, updateColumn, deleteColumn, reorderColumn, isLoading: isActing } = useColumnActions(kanbanId);

  const [kanbanName, setKanbanName] = useState('');
  const [originalName, setOriginalName] = useState('');
  
  // Modal States
  const [showCreate, setShowCreate] = useState(false);
  const [editingColumn, setEditingColumn] = useState<ColumnData | null>(null);
  const [deletingColumn, setDeletingColumn] = useState<ColumnData | null>(null);

  // Sync kanban name
  useEffect(() => {
    const kanban = kanbans.find(k => k.id === kanbanId);
    if (kanban) {
      setKanbanName(kanban.name);
      setOriginalName(kanban.name);
    }
  }, [kanbans, kanbanId]);

  const handleSaveKanbanName = async () => {
    if (!kanbanName.trim() || kanbanName === originalName) return;
    const success = await updateKanban(kanbanId, kanbanName);
    if (success) {
      setOriginalName(kanbanName);
    }
  };

  const handleCreateColumn = async (name: string) => {
    const success = await createColumn(name);
    if (success) {
      setShowCreate(false);
      refetchColumns();
    }
  };

  const handleEditColumn = async (id: string, name: string) => {
    const success = await updateColumn(id, name);
    if (success) {
      setEditingColumn(null);
      refetchColumns();
    }
  };

  const handleDeleteColumn = async (id: string) => {
    const success = await deleteColumn(id);
    if (success) {
      setDeletingColumn(null);
      refetchColumns();
    }
  };

  const handleReorderColumn = async (id: string, direction: 'up' | 'down') => {
    const success = await reorderColumn(id, direction);
    if (success) {
      refetchColumns();
    }
  };

  const targetColumnName = columns.find(c => c.id !== deletingColumn?.id)?.name || 'Primeira Coluna';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/settings?tab=kanbans')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-text-primary">Gestão de Colunas</h1>
            <p className="text-sm text-text-secondary">Configure o fluxo do board.</p>
          </div>
        </div>
      </div>

      {/* Kanban Name Section */}
      <Card className="p-6 space-y-4 shadow-ambient">
        <div className="flex items-end gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-text-secondary">Nome do Kanban</label>
            <Input 
              value={kanbanName}
              onChange={(e) => setKanbanName(e.target.value)}
              placeholder="Nome do board"
              disabled={isSavingKanban || isFetchingKanbans}
            />
          </div>
          <Button 
            onClick={handleSaveKanbanName}
            disabled={!kanbanName.trim() || kanbanName === originalName || isSavingKanban}
            loading={isSavingKanban}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        </div>
      </Card>

      {/* Columns List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Colunas ({columns.length})</h2>
          <Button 
            onClick={() => setShowCreate(true)} 
            disabled={columns.length >= 10 || isFetchingColumns}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Coluna
          </Button>
        </div>

        <Card className="p-0 overflow-hidden border-none shadow-ambient">
          <ColumnTable 
            columns={columns}
            isLoading={isFetchingColumns || isActing}
            onEdit={setEditingColumn}
            onDelete={setDeletingColumn}
            onReorder={handleReorderColumn}
          />
        </Card>
      </div>

      {/* Modals */}
      <CreateColumnModal 
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={handleCreateColumn}
        isLoading={isActing}
      />

      <EditColumnModal 
        open={!!editingColumn}
        onOpenChange={(open) => !open && setEditingColumn(null)}
        column={editingColumn}
        onSuccess={handleEditColumn}
        isLoading={isActing}
      />

      <DeleteColumnConfirm 
        open={!!deletingColumn}
        onOpenChange={(open) => !open && setDeletingColumn(null)}
        column={deletingColumn}
        targetColumnName={targetColumnName}
        onConfirm={handleDeleteColumn}
        isLoading={isActing}
      />
    </div>
  );
}
