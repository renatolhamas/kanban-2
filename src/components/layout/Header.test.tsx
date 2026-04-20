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

  it('applies dark mode classes', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('dark:bg-gray-900');
    expect(header).toHaveClass('dark:border-gray-800');
  });
});
