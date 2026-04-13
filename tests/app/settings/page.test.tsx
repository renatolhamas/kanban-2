/**
 * Settings Page Component Tests
 *
 * Run: npm test -- page.test.tsx
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from '@/app/settings/page';

// Mock fetch
global.fetch = vi.fn() as unknown as typeof fetch;

// Mock next components (Toast, Modal already exist)
vi.mock('@/components/common/Card', () => ({
  Card: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="card" data-title={title}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/common/Button', () => ({
  Button: ({ children, onClick, disabled, ...props }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; [key: string]: unknown }) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/common/Badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <div data-testid="badge" data-variant={variant}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/common/Modal', () => ({
  Modal: ({ children, isOpen, title }: { children: React.ReactNode; isOpen: boolean; title: string; onClose?: () => void }) => (
    isOpen ? (
      <div data-testid="modal" data-title={title}>
        {children}
      </div>
    ) : null
  ),
}));

vi.mock('@/components/common/Toast', () => ({
  Toast: ({ message, type, onClose: _onClose }: { message: string; type: string; onClose?: () => void }) => (
    <div data-testid="toast" data-type={type}>
      {message}
    </div>
  ),
}));

describe('Settings Page - WhatsApp Connection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial Rendering', () => {
    it('should render WhatsApp Connection card section', async () => {
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ connection_status: 'disconnected' }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('card')).toBeInTheDocument();
      });
    });

    it('should show disconnected status badge initially', async () => {
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ connection_status: 'disconnected' }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('badge')).toBeInTheDocument();
      });
    });

    it('should show "Conectar WhatsApp" button when disconnected', async () => {
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ connection_status: 'disconnected' }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Conectar WhatsApp/i })).toBeInTheDocument();
      });
    });

    it('should load initial connection status from API', async () => {
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ connection_status: 'connected' }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/settings/evo-go/status');
      });
    });
  });

  describe('Button Click - Gerar QR Code', () => {
    it('should call POST /api/settings/evo-go/qr on button click', async () => {
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ connection_status: 'disconnected' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ qr_code: 'data:image/png;base64,test' }),
        });

      const user = userEvent.setup({ delay: null });
      render(<SettingsPage />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Conectar WhatsApp/i });
        expect(button).toBeInTheDocument();
      });

      const connectButton = screen.getByRole('button', { name: /Conectar WhatsApp/i });
      await user.click(connectButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/settings/evo-go/qr', { method: 'POST' });
      });
    });

    it('should show loading state while fetching QR code', async () => {
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ connection_status: 'disconnected' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ qr_code: 'data:image/png;base64,test' }),
        });

      const user = userEvent.setup({ delay: null });
      render(<SettingsPage />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Conectar WhatsApp/i });
        expect(button).toBeInTheDocument();
      });

      const connectButton = screen.getByRole('button', { name: /Conectar WhatsApp/i });
      await user.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText(/Gerando código QR/i)).toBeInTheDocument();
      });
    });

    it('should disable button during loading', async () => {
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ connection_status: 'disconnected' }),
        })
        .mockImplementation(
          () =>
            new Promise((resolve) => {
              setTimeout(
                () => resolve({
                  ok: true,
                  json: async () => ({ qr_code: 'data:image/png;base64,test' }),
                }),
                100,
              );
            }),
        );

      const user = userEvent.setup({ delay: null });
      render(<SettingsPage />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Conectar WhatsApp/i });
        expect(button).toBeInTheDocument();
      });

      const connectButton = screen.getByRole('button', { name: /Conectar WhatsApp/i });
      await user.click(connectButton);

      // After click, button should be disabled
      expect(connectButton).toBeDisabled();
    });
  });

  describe('QR Code Display and Timer', () => {
    it('should display QR code from API response', async () => {
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ connection_status: 'disconnected' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ qr_code: 'data:image/png;base64,iVBORw0KG' }),
        });

      const user = userEvent.setup({ delay: null });
      render(<SettingsPage />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Conectar WhatsApp/i });
        expect(button).toBeInTheDocument();
      });

      const connectButton = screen.getByRole('button', { name: /Conectar WhatsApp/i });
      await user.click(connectButton);

      await waitFor(() => {
        const qrImage = screen.getByAltText(/QR Code/i) as HTMLImageElement;
        expect(qrImage).toBeInTheDocument();
        expect(qrImage.src).toContain('data:image/png;base64');
      });
    });

    it('should display 5-minute countdown timer', async () => {
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ connection_status: 'disconnected' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ qr_code: 'data:image/png;base64,test' }),
        });

      const user = userEvent.setup({ delay: null });
      render(<SettingsPage />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Conectar WhatsApp/i });
        expect(button).toBeInTheDocument();
      });

      const connectButton = screen.getByRole('button', { name: /Conectar WhatsApp/i });
      await user.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText(/5:00/)).toBeInTheDocument();
      });
    });

    it('should countdown timer every second', async () => {
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ connection_status: 'disconnected' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ qr_code: 'data:image/png;base64,test' }),
        });

      const user = userEvent.setup({ delay: null });
      render(<SettingsPage />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Conectar WhatsApp/i });
        expect(button).toBeInTheDocument();
      });

      const connectButton = screen.getByRole('button', { name: /Conectar WhatsApp/i });
      await user.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText(/5:00/)).toBeInTheDocument();
      });

      // Advance timer by 60 seconds
      vi.advanceTimersByTime(60000);

      await waitFor(() => {
        expect(screen.getByText(/4:00/)).toBeInTheDocument();
      });
    });

    it('should expire QR code when timer reaches 0', async () => {
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ connection_status: 'disconnected' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ qr_code: 'data:image/png;base64,test' }),
        });

      const user = userEvent.setup({ delay: null });
      render(<SettingsPage />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Conectar WhatsApp/i });
        expect(button).toBeInTheDocument();
      });

      const connectButton = screen.getByRole('button', { name: /Conectar WhatsApp/i });
      await user.click(connectButton);

      // Advance timer to end (300 seconds = 5 minutes)
      vi.advanceTimersByTime(300000);

      await waitFor(() => {
        expect(screen.getByText(/expirado/i)).toBeInTheDocument();
      });
    });
  });

  describe('Status Polling', () => {
    it('should poll GET /api/settings/evo-go/status every 3 seconds', async () => {
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ connection_status: 'disconnected' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ qr_code: 'data:image/png;base64,test' }),
        })
        .mockResolvedValue({
          ok: true,
          json: async () => ({ connection_status: 'disconnected' }),
        });

      const user = userEvent.setup({ delay: null });
      render(<SettingsPage />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Conectar WhatsApp/i });
        expect(button).toBeInTheDocument();
      });

      const connectButton = screen.getByRole('button', { name: /Conectar WhatsApp/i });
      await user.click(connectButton);

      await waitFor(() => {
        expect(screen.getByAltText(/QR Code/i)).toBeInTheDocument();
      });

      // Clear previous calls
      (mockFetch as ReturnType<typeof vi.fn>).mockClear();

      // Advance timer by 3 seconds
      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/settings/evo-go/status');
      });
    });

    it('should transition to connected state when status updates', async () => {
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ connection_status: 'disconnected' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ qr_code: 'data:image/png;base64,test' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ connection_status: 'connected' }),
        });

      const user = userEvent.setup({ delay: null });
      render(<SettingsPage />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Conectar WhatsApp/i });
        expect(button).toBeInTheDocument();
      });

      const connectButton = screen.getByRole('button', { name: /Conectar WhatsApp/i });
      await user.click(connectButton);

      await waitFor(() => {
        expect(screen.getByAltText(/QR Code/i)).toBeInTheDocument();
      });

      // Advance timer to trigger polling
      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.getByText(/Conectado ✅/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message on API failure', async () => {
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ connection_status: 'disconnected' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Failed to generate QR' }),
        });

      const user = userEvent.setup({ delay: null });
      render(<SettingsPage />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Conectar WhatsApp/i });
        expect(button).toBeInTheDocument();
      });

      const connectButton = screen.getByRole('button', { name: /Conectar WhatsApp/i });
      await user.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText(/Falha ao gerar QR/i)).toBeInTheDocument();
      });
    });

    it('should show toast error notification on failure', async () => {
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ connection_status: 'disconnected' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      const user = userEvent.setup({ delay: null });
      render(<SettingsPage />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Conectar WhatsApp/i });
        expect(button).toBeInTheDocument();
      });

      const connectButton = screen.getByRole('button', { name: /Conectar WhatsApp/i });
      await user.click(connectButton);

      await waitFor(() => {
        expect(screen.getByTestId('toast')).toBeInTheDocument();
      });
    });
  });

  describe('Disconnect Functionality', () => {
    it('should show Desconectar button when connected', async () => {
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ connection_status: 'connected' }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Desconectar/i })).toBeInTheDocument();
      });
    });

    it('should open confirmation modal on disconnect click', async () => {
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ connection_status: 'connected' }),
      });

      const user = userEvent.setup({ delay: null });
      render(<SettingsPage />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Desconectar/i });
        expect(button).toBeInTheDocument();
      });

      const disconnectButton = screen.getByRole('button', { name: /Desconectar/i });
      await user.click(disconnectButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });
    });

    it('should call disconnect API and update status', async () => {
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ connection_status: 'connected' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      const user = userEvent.setup({ delay: null });
      render(<SettingsPage />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Desconectar/i });
        expect(button).toBeInTheDocument();
      });

      const disconnectButton = screen.getByRole('button', { name: /Desconectar/i });
      await user.click(disconnectButton);

      // Find confirm button in modal
      const confirmButton = screen.getAllByRole('button', { name: /Confirmar desconexão|Desconectar/i })[1];
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/settings/evo-go/disconnect', { method: 'POST' });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ connection_status: 'disconnected' }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        const button = screen.getByLabelText(/Conectar WhatsApp/i);
        expect(button).toBeInTheDocument();
      });
    });

    it('should have proper role attributes', async () => {
      const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ connection_status: 'disconnected' }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        const badge = screen.getByTestId('badge');
        expect(badge).toHaveAttribute('role', 'status');
      });
    });
  });
});
