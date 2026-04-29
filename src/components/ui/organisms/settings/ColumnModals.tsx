import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/molecules/modal';
import { Button } from '@/components/ui/atoms/button';
import { Input } from '@/components/ui/atoms/input';
import { ColumnData } from '@/hooks/useColumns';
import { AlertCircle } from 'lucide-react';

// --- Create Column Modal ---
interface CreateColumnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (name: string) => Promise<void>;
  isLoading?: boolean;
}

export function CreateColumnModal({
  open,
  onOpenChange,
  onSuccess,
  isLoading
}: CreateColumnModalProps) {
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
      title="Criar Nova Coluna"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="column-name" className="text-sm font-medium text-text-secondary">
            Nome da Coluna
          </label>
          <Input
            id="column-name"
            placeholder="Ex: Novo, Em Atendimento, Concluído..."
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
            Criar Coluna
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// --- Edit Column Modal ---
interface EditColumnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: ColumnData | null;
  onSuccess: (id: string, name: string) => Promise<void>;
  isLoading?: boolean;
}

export function EditColumnModal({
  open,
  onOpenChange,
  column,
  onSuccess,
  isLoading
}: EditColumnModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (column) {
      setName(column.name);
      setError('');
    }
  }, [column]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!column) return;
    setError('');

    if (!name.trim()) {
      setError('O nome é obrigatório');
      return;
    }

    await onSuccess(column.id, name);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Coluna"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="edit-column-name" className="text-sm font-medium text-text-secondary">
            Nome da Coluna
          </label>
          <Input
            id="edit-column-name"
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
            disabled={!name.trim() || isLoading || name === column?.name}
          >
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// --- Delete Column Confirmation ---
interface DeleteColumnConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: ColumnData | null;
  targetColumnName: string;
  onConfirm: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function DeleteColumnConfirm({
  open,
  onOpenChange,
  column,
  targetColumnName,
  onConfirm,
  isLoading
}: DeleteColumnConfirmProps) {
  if (!column) return null;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Deletar Coluna"
    >
      <div className="space-y-6">
        <div className="p-4 bg-error/5 border border-error/10 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-error shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-text-primary">Atenção</p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Você está prestes a deletar a coluna <span className="font-semibold text-text-primary">"{column.name}"</span>. 
              Todas as conversas nela serão movidas automaticamente para a coluna 
              <span className="font-semibold text-text-primary"> "{targetColumnName}"</span>.
            </p>
          </div>
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
            variant="destructive"
            loading={isLoading}
            onClick={() => onConfirm(column.id)}
          >
            Confirmar e Deletar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
