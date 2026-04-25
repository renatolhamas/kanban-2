import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatModal } from '@/components/ui/organisms/chat/ChatModal';
import { ChatProvider, useChat } from '@/context/ChatContext';
import { ToastProvider } from '@/components/ui/molecules/toast';

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
