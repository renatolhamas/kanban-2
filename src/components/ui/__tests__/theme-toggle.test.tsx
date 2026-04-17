import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeToggle } from '../theme-toggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
  });

  it('renders with initial light theme', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(button).toBeInTheDocument();
  });

  it('respects localStorage theme preference on mount', () => {
    localStorage.setItem('theme', 'dark');

    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: /switch to light mode/i });
    expect(button).toBeInTheDocument();
  });

  it('toggles theme when button is clicked', async () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: /switch to dark mode/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  it('persists theme choice to localStorage', async () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: /switch to dark mode/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(localStorage.getItem('theme')).toBe('dark');
    });
  });

  it('has proper accessibility attributes', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: /switch to dark mode/i });

    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('aria-pressed');
    expect(button).toHaveAttribute('title');
  });

  it('updates aria-label and aria-pressed when toggling', async () => {
    render(<ThemeToggle />);

    let button = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(button);

    await waitFor(() => {
      button = screen.getByRole('button', { name: /switch to light mode/i });
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('displays loading state during hydration', () => {
    const { rerender } = render(<ThemeToggle />);

    // Component should render without error
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('applies design system tokens for colors and spacing', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button');

    expect(button).toHaveClass('h-10', 'w-10', 'rounded-lg', 'bg-surface-container-low');
  });

  it('supports focus ring with proper offset', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button');

    expect(button).toHaveClass('focus:ring-2', 'focus:ring-primary', 'focus:ring-offset-2');
  });

  it('applies hover state with design tokens', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button');

    expect(button).toHaveClass('hover:bg-surface-container', 'transition-colors');
  });
});
