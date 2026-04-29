'use client';

import { KanbanData } from '@/hooks/useKanbans';
import { Button } from '@/components/ui/atoms/button';
import { Badge } from '@/components/ui/molecules/badge';
import { ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface KanbanTableProps {
  kanbans: KanbanData[];
  onEdit: (kanban: KanbanData) => void;
  onDelete: (kanban: KanbanData) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  isLoading?: boolean;
}

export function KanbanTable({
  kanbans,
  onEdit,
  onDelete,
  onReorder,
  isLoading
}: KanbanTableProps) {
  const router = useRouter();
  if (kanbans.length === 0 && !isLoading) {
    return (
      <div className="py-12 text-center border-2 border-dashed border-color-outline-variant rounded-lg">
        <p className="text-text-secondary">Nenhum Kanban personalizado encontrado.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-color-outline-variant">
      <table className="w-full text-sm text-left">
        <thead className="bg-surface-container-low text-text-secondary uppercase text-xs font-semibold">
          <tr>
            <th className="px-6 py-4">Nome</th>
            <th className="px-6 py-4">Criado em</th>
            <th className="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-color-outline-variant bg-surface-bright">
          {kanbans.map((kanban, index) => (
            <tr key={kanban.id} className="hover:bg-surface-container-lowest transition-colors">
              <td className="px-6 py-4 font-medium text-text-primary">
                <div className="flex items-center gap-2">
                  {kanban.name}
                  {kanban.is_main && (
                    <Badge variant="positive" className="text-[10px] px-1.5 py-0">Main</Badge>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-text-secondary">
                {new Date(kanban.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReorder(kanban.id, 'up')}
                    disabled={index === 0 || isLoading}
                    aria-label="Mover para cima"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReorder(kanban.id, 'down')}
                    disabled={index === kanbans.length - 1 || isLoading}
                    aria-label="Mover para baixo"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-4 bg-color-outline-variant mx-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/settings/kanbans/${kanban.id}`)}
                    disabled={kanban.is_main || isLoading}
                    aria-label="Editar Kanban"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error hover:bg-error/10"
                    onClick={() => onDelete(kanban)}
                    disabled={kanban.is_main || isLoading}
                    aria-label="Deletar Kanban"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
