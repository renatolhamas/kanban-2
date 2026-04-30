import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ContactModal } from '../ContactModals';
import React from 'react';

// Mock components that might cause issues in unit tests
vi.mock('@/components/ui/molecules/modal', () => ({
  Modal: ({ children, title, isOpen }: any) => isOpen ? (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ) : null,
}));

describe('ContactModal', () => {
  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    title: 'Test Modal',
  };

  it('renders with PT-BR labels', () => {
    render(<ContactModal {...defaultProps} />);
    expect(screen.getByLabelText(/Nome */)).toBeDefined();
    expect(screen.getByLabelText(/Telefone */)).toBeDefined();
    expect(screen.getByText(/Cancelar/)).toBeDefined();
    expect(screen.getByText(/Salvar Contato/)).toBeDefined();
  });

  it('validates E.164 format on blur', async () => {
    render(<ContactModal {...defaultProps} />);
    const phoneInput = screen.getByLabelText(/Telefone */);

    fireEvent.change(phoneInput, { target: { value: '11987654321' } });
    fireEvent.blur(phoneInput);

    await waitFor(() => {
      expect(screen.getByText(/Número deve começar com o código do país/)).toBeDefined();
    });
  });

  it('suggests format when DDI is missing', async () => {
    render(<ContactModal {...defaultProps} />);
    const phoneInput = screen.getByLabelText(/Telefone */);

    fireEvent.change(phoneInput, { target: { value: '11987654321' } });
    fireEvent.blur(phoneInput);

    await waitFor(() => {
      expect(screen.getByText(/Sugestão: \+55 11987654321/)).toBeDefined();
    });
  });

  it('calls onSave with normalized data', async () => {
    render(<ContactModal {...defaultProps} />);
    const nameInput = screen.getByLabelText(/Nome */);
    const phoneInput = screen.getByLabelText(/Telefone */);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(phoneInput, { target: { value: '+55 (11) 98765-4321' } });
    
    fireEvent.submit(screen.getByRole('button', { name: /Salvar Contato/ }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('John Doe', '+5511987654321');
    });
  });

  it('handles legacy data gracefully (no immediate error)', async () => {
    // Legacy data without +
    const legacyContact = { id: '1', name: 'Legacy', phone: '11987654321', tenant_id: 't1', created_at: '', updated_at: '' };
    
    render(<ContactModal {...defaultProps} initialData={legacyContact} />);
    
    // Should NOT show error immediately
    expect(screen.queryByText(/Número deve começar com o código do país/)).toBeNull();
    
    // But should block submit
    fireEvent.submit(screen.getByRole('button', { name: /Salvar Contato/ }));
    
    await waitFor(() => {
      expect(screen.getByText(/Número deve começar com o código do país/)).toBeDefined();
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });
});
