import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KanbanTransferDropdown } from '@/components/ui/organisms/chat/KanbanTransferDropdown';
import { useChat } from '@/context/ChatContext';
import { useKanbanStructure } from '@/hooks/useKanbanStructure';
import { ToastProvider } from '@/components/ui/molecules/toast';

// Mock hooks
vi.mock('@/context/ChatContext', () => ({
  useChat: vi.fn(),
}));

vi.mock('@/hooks/useKanbanStructure', () => ({
  useKanbanStructure: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('KanbanTransferDropdown', () => {
  const mockActiveConversation = {
    id: 'conv-1',
    column_id: 'col-1',
  };

  const mockKanbans = [
    {
      id: 'kanban-1',
      name: 'Quadro Principal',
      columns: [
        { id: 'col-1', name: 'Novo' },
        { id: 'col-2', name: 'Em Atendimento' },
        { id: 'col-3', name: 'Finalizado' },
      ]
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useChat).mockReturnValue({
      activeConversation: mockActiveConversation as any,
      isLoadingConversation: false,
    } as any);
    
    vi.mocked(useKanbanStructure).mockReturnValue({
      kanbans: mockKanbans,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);
  });

  const SELECT_LABEL = 'Selecionar destino da conversa (Quadro e Coluna)';

  it('renders correctly with current column selected', () => {
    render(
      <ToastProvider>
        <KanbanTransferDropdown />
      </ToastProvider>
    );

    const select = screen.getByLabelText(SELECT_LABEL) as HTMLSelectElement;
    expect(select.value).toBe('col-1');
    
    const optgroup = select.querySelector('optgroup');
    expect(optgroup?.label).toBe('Quadro Principal');

    expect(screen.getByText('Novo')).toBeDefined();
    expect(screen.getByText('Em Atendimento')).toBeDefined();
  });

  it('triggers API call when column is changed', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    } as Response);

    render(
      <ToastProvider>
        <KanbanTransferDropdown />
      </ToastProvider>
    );

    const select = screen.getByLabelText(SELECT_LABEL);
    fireEvent.change(select, { target: { value: 'col-2' } });

    expect(global.fetch).toHaveBeenCalledWith('/api/conversations/update-column', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({
        conversation_id: 'conv-1',
        column_id: 'col-2',
      }),
    }));
  });

  it('shows loading state while updating', async () => {
    vi.mocked(global.fetch).mockReturnValue(new Promise(() => {})); // Never resolves

    render(
      <ToastProvider>
        <KanbanTransferDropdown />
      </ToastProvider>
    );

    const select = screen.getByLabelText(SELECT_LABEL);
    fireEvent.change(select, { target: { value: 'col-2' } });

    expect(select).toBeDisabled();
  });

  it('shows error state when structure fails to load', () => {
    vi.mocked(useKanbanStructure).mockReturnValue({
      kanbans: [],
      isLoading: false,
      error: new Error('Fetch failed'),
      refetch: vi.fn(),
    } as any);

    render(
      <ToastProvider>
        <KanbanTransferDropdown />
      </ToastProvider>
    );

    expect(screen.getByText('Erro ao carregar')).toBeDefined();
  });
});

