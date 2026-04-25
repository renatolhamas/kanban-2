import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessageInput } from '@/components/ui/molecules/chat/MessageInput';
import { useChat } from '@/context/ChatContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock useChat hook
vi.mock('@/context/ChatContext', () => ({
  useChat: vi.fn(),
}));

describe('MessageInput', () => {
  const mockSendMessage = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useChat as any).mockReturnValue({
      sendMessage: mockSendMessage,
      isSending: false,
    });
  });

  it('renders input and send button', () => {
    render(<MessageInput />);
    expect(screen.getByPlaceholderText(/escreva uma mensagem/i)).toBeInTheDocument();
    expect(screen.getByTitle(/enviar mensagem/i)).toBeInTheDocument();
  });

  it('updates text on change', () => {
    render(<MessageInput />);
    const input = screen.getByPlaceholderText(/escreva uma mensagem/i) as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'Hello world' } });
    expect(input.value).toBe('Hello world');
  });

  it('calls sendMessage and clears input on success', async () => {
    mockSendMessage.mockResolvedValueOnce(undefined);
    render(<MessageInput />);
    
    const input = screen.getByPlaceholderText(/escreva uma mensagem/i);
    const button = screen.getByTitle(/enviar mensagem/i);

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(button);

    expect(mockSendMessage).toHaveBeenCalledWith('Hello');
    await waitFor(() => {
      expect((input as HTMLTextAreaElement).value).toBe('');
    });
  });

  it('keeps text on error', async () => {
    mockSendMessage.mockRejectedValueOnce(new Error('Failed'));
    render(<MessageInput />);
    
    const input = screen.getByPlaceholderText(/escreva uma mensagem/i);
    const button = screen.getByTitle(/enviar mensagem/i);

    fireEvent.change(input, { target: { value: 'Retry me' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect((input as HTMLTextAreaElement).value).toBe('Retry me');
    });
  });

  it('disables button when input is empty', () => {
    render(<MessageInput />);
    const button = screen.getByTitle(/enviar mensagem/i);
    expect(button).toBeDisabled();
  });

  it('sends message on Enter key', () => {
    render(<MessageInput />);
    const input = screen.getByPlaceholderText(/escreva uma mensagem/i);
    
    fireEvent.change(input, { target: { value: 'Enter test' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: false });

    expect(mockSendMessage).toHaveBeenCalledWith('Enter test');
  });

  it('does not send on Shift+Enter', () => {
    render(<MessageInput />);
    const input = screen.getByPlaceholderText(/escreva uma mensagem/i);
    
    fireEvent.change(input, { target: { value: 'Newline test' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true });

    expect(mockSendMessage).not.toHaveBeenCalled();
  });
});
