import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MessageStatus } from '@/src/components/ui/molecules/chat/MessageStatus';
import React from 'react';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Check: () => <div data-testid="icon-check" />,
  CheckCheck: () => <div data-testid="icon-checkcheck" />,
  AlertCircle: () => <div data-testid="icon-error" />,
  Clock: () => <div data-testid="icon-clock" />,
}));

describe('MessageStatus Component', () => {
  it('renders clock icon for sending status', () => {
    render(<MessageStatus status="sending" />);
    expect(screen.getByTestId('icon-clock')).toBeDefined();
  });

  it('renders single check for sent status', () => {
    render(<MessageStatus status="sent" />);
    expect(screen.getByTestId('icon-check')).toBeDefined();
  });

  it('renders double check for delivered status', () => {
    render(<MessageStatus status="delivered" />);
    expect(screen.getByTestId('icon-checkcheck')).toBeDefined();
  });

  it('renders double check with emerald color for read status', () => {
    const { container } = render(<MessageStatus status="read" />);
    expect(screen.getByTestId('icon-checkcheck')).toBeDefined();
    expect(container.firstChild).toHaveClass('text-token-success');
  });

  it('renders alert icon for error status', () => {
    render(<MessageStatus status="error" />);
    expect(screen.getByTestId('icon-error')).toBeDefined();
  });
});
