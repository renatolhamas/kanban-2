import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { UserMenu } from './UserMenu';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('UserMenu Component', () => {
  it('renders trigger button with avatar', () => {
    render(<UserMenu />);
    const button = screen.getByRole('button', { name: /user menu/i });
    expect(button).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    render(<UserMenu />);
    const trigger = screen.getByRole('button', { name: /user menu/i });

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  it('closes dropdown on escape key', async () => {
    render(<UserMenu />);
    const trigger = screen.getByRole('button', { name: /user menu/i });

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('has aria-expanded attribute', () => {
    render(<UserMenu />);
    const trigger = screen.getByRole('button', { name: /user menu/i });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes on outside click', async () => {
    render(<UserMenu />);
    const trigger = screen.getByRole('button', { name: /user menu/i });

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('has profile and logout menu items', async () => {
    render(<UserMenu />);
    const trigger = screen.getByRole('button', { name: /user menu/i });

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  it('applies dark mode styles', () => {
    render(<UserMenu />);
    const trigger = screen.getByRole('button', { name: /user menu/i });

    expect(trigger).toHaveClass('text-text-primary');
    expect(trigger).toHaveClass('hover:bg-surface-container-low');
  });
});
