import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Header } from './Header';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock ThemeToggle
vi.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

// Mock UserMenu
vi.mock('@/components/layout/UserMenu', () => ({
  UserMenu: () => <div data-testid="user-menu">User Menu</div>,
}));

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: '1', email: 'test@example.com' },
    signOut: vi.fn(),
  }),
}));

describe('Header Component', () => {
  it('renders header with logo', () => {
    render(<Header />);
    expect(screen.getByText('Kanban')).toBeInTheDocument();
  });

  it('renders dynamic page title', () => {
    render(<Header />);
    expect(screen.getByText('Kanban Board')).toBeInTheDocument();
  });

  it('renders theme toggle', () => {
    render(<Header />);
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('renders user menu', () => {
    render(<Header />);
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });

  it('has correct ARIA labels', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveAttribute('aria-label', 'Application header');
  });

  it('applies dark mode and design token classes', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');
    
    // Check for tokens applied in Story 2.11 / Design Compliance
    expect(header).toHaveClass('dark:bg-surface-container-highest');
    expect(header).toHaveClass('border-surface-container-low');
  });
});

