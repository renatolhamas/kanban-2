import { ColumnData } from '@/hooks/useColumns';
import { Button } from '@/components/ui/atoms/button';
import { ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react';

interface ColumnTableProps {
  columns: ColumnData[];
  onEdit: (column: ColumnData) => void;
  onDelete: (column: ColumnData) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  isLoading?: boolean;
}

export function ColumnTable({
  columns,
  onEdit,
  onDelete,
  onReorder,
  isLoading
}: ColumnTableProps) {
  if (columns.length === 0 && !isLoading) {
    return (
      <div className="py-12 text-center border-2 border-dashed border-color-outline-variant rounded-lg">
        <p className="text-text-secondary">Nenhuma coluna configurada para este Kanban.</p>
      </div>
    );
  }

  // Skeleton rows for loading state
  if (isLoading && columns.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg border border-color-outline-variant animate-pulse">
        <div className="h-10 bg-surface-container-low w-full mb-px" />
        <div className="h-16 bg-surface-bright w-full mb-px" />
        <div className="h-16 bg-surface-bright w-full" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-color-outline-variant">
      <table className="w-full text-sm text-left">
        <thead className="bg-surface-container-low text-text-secondary uppercase text-xs font-semibold">
          <tr>
            <th className="px-6 py-4">Nome da Coluna</th>
            <th className="px-6 py-4 text-center">Posição</th>
            <th className="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-color-outline-variant bg-surface-bright">
          {columns.map((column, index) => (
            <tr key={column.id} className="hover:bg-surface-container-lowest transition-colors">
              <td className="px-6 py-4 font-medium text-text-primary">
                {column.name}
              </td>
              <td className="px-6 py-4 text-center text-text-secondary">
                {index + 1}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReorder(column.id, 'up')}
                    disabled={index === 0 || isLoading}
                    aria-label="Mover para cima"
                    title="Mover para cima"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReorder(column.id, 'down')}
                    disabled={index === columns.length - 1 || isLoading}
                    aria-label="Mover para baixo"
                    title="Mover para baixo"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-4 bg-color-outline-variant mx-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(column)}
                    disabled={isLoading}
                    aria-label="Editar nome da coluna"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error hover:bg-error/10"
                    onClick={() => onDelete(column)}
                    disabled={columns.length <= 1 || isLoading}
                    aria-label="Deletar coluna"
                    title={columns.length <= 1 ? "Não é possível deletar a única coluna" : "Deletar"}
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
