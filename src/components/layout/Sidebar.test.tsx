import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Sidebar } from './Sidebar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock Sheet component
interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

vi.mock('@/components/layout/Sheet', () => ({
  Sheet: ({ isOpen, onClose, children, title }: SheetProps) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        <button onClick={onClose} aria-label="Close navigation menu">Close</button>
        {children}
      </div>
    ) : null,
}));

describe('Sidebar Component', () => {
  it('renders navigation on desktop', () => {
    render(<Sidebar />);
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<Sidebar />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Contacts')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders mobile hamburger button', () => {
    render(<Sidebar />);
    expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();
  });

  it('opens drawer on hamburger click', async () => {
    render(<Sidebar />);
    const hamburger = screen.getByRole('button', { name: /open navigation menu/i });

    fireEvent.click(hamburger);

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Navigation' })).toBeInTheDocument();
    });
  });

  it('marks active link with aria-current', () => {
    render(<Sidebar />);
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  it('applies active styles to current route', () => {
    render(<Sidebar />);
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveClass('bg-emerald-50');
    expect(homeLink).toHaveClass('text-emerald-700');
  });

  it('applies dark mode classes', () => {
    const { container } = render(<Sidebar />);
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('dark:bg-gray-900');
    expect(nav).toHaveClass('dark:border-gray-800');
  });

  it('renders nav links as internal links', () => {
    render(<Sidebar />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(3); // Home, Contacts, Settings
  });
});
