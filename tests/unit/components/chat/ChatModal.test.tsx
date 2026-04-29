import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatModal } from '@/components/ui/organisms/chat/ChatModal';
import { ChatProvider, useChat } from '@/context/ChatContext';
import { ToastProvider } from '@/components/ui/molecules/toast';
import { useAuth } from '@/hooks/useAuth';

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-123', app_metadata: { tenant_id: 'tenant-123' } },
    isAuthenticated: true,
  })),
}));

// Mock useConversations used by KanbanTransferDropdown
vi.mock('@/hooks/useConversations', () => ({
  useConversations: vi.fn(() => ({
    columns: [{ id: 'col-1', name: 'Column 1' }],
    isLoading: false,
    error: null,
    realtimeStatus: 'connected',
  })),
}));

// Mock Supabase client to avoid env var issues in CI
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  })),
}));

// Mock matchMedia for components that might use it (like Radix UI)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo as JSDOM doesn't implement it
window.HTMLElement.prototype.scrollTo = vi.fn();

describe('ChatModal', () => {
  it('renders correctly when open', () => {
    render(
      <ToastProvider>
        <ChatProvider>
           <ChatModal />
           <TestTrigger />
        </ChatProvider>
      </ToastProvider>
    );

    const openButton = screen.getByText('Open Chat');
    fireEvent.click(openButton);

    expect(screen.getByText('Conversa WhatsApp')).toBeDefined();
    expect(screen.getByPlaceholderText('Escreva uma mensagem...')).toBeDefined();
  });
});

function TestTrigger() {
  const { openChat } = useChat();
  return <button onClick={() => openChat('1')}>Open Chat</button>;
}
