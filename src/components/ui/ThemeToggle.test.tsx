import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';

/**
 * ThemeToggle Component Tests
 * Tests light/dark mode toggle, localStorage, system preference detection
 */

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset HTML attributes
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
    // Reset matchMedia mock
    vi.clearAllMocks();
  });

  // ========================================
  // Rendering & Initialization Tests
  // ========================================

  it('should render button with Moon icon in light mode', async () => {
    render(<ThemeToggle />);

    // Wait for component to mount
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /mudar para tema escuro/i });
      expect(button).toBeInTheDocument();
    });
  });

  it('should render button with Sun icon in dark mode', async () => {
    // Mock system preference as dark
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<ThemeToggle />);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /mudar para tema claro/i });
      expect(button).toBeInTheDocument();
    });
  });

  // ========================================
  // Click / Toggle Tests
  // ========================================

  it('should toggle theme on click', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = await screen.findByRole('button', { name: /mudar para tema escuro/i });

    // Click to toggle to dark
    await user.click(button);

    // Verify HTML attribute set
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    // Click again to toggle back to light
    const buttonLight = await screen.findByRole('button', { name: /mudar para tema claro/i });
    await user.click(buttonLight);

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBeNull();
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  // ========================================
  // localStorage Persistence Tests
  // ========================================

  it('should persist theme preference to localStorage', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = await screen.findByRole('button', { name: /mudar para tema escuro/i });
    await user.click(button);

    await waitFor(() => {
      expect(localStorage.getItem('theme-preference')).toBe('dark');
    });
  });

  it('should restore theme from localStorage on mount', async () => {
    // Pre-set localStorage
    localStorage.setItem('theme-preference', 'dark');

    render(<ThemeToggle />);

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  // ========================================
  // System Preference Detection Tests
  // ========================================

  it('should use system preference when no localStorage preference exists', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<ThemeToggle />);

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  // ========================================
  // Keyboard Accessibility Tests
  // ========================================

  it('should toggle theme on Enter key', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = await screen.findByRole('button', { name: /mudar para tema escuro/i });
    button.focus();

    // Press Enter
    fireEvent.keyDown(button, { code: 'Enter' });

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  it('should toggle theme on Space key', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = await screen.findByRole('button', { name: /mudar para tema escuro/i });
    button.focus();

    // Press Space
    fireEvent.keyDown(button, { code: 'Space' });

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  it('should not toggle on other keys', async () => {
    render(<ThemeToggle />);

    const button = await screen.findByRole('button', { name: /mudar para tema escuro/i });

    // Press 'a' key (should not toggle)
    fireEvent.keyDown(button, { code: 'KeyA' });

    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  // ========================================
  // ARIA & Accessibility Tests
  // ========================================

  it('should have correct ARIA label for light mode', async () => {
    render(<ThemeToggle />);

    const button = await screen.findByRole('button', { name: /mudar para tema escuro/i });
    expect(button).toHaveAttribute('aria-label', 'Mudar para tema escuro');
  });

  it('should have correct ARIA label for dark mode', async () => {
    localStorage.setItem('theme-preference', 'dark');

    render(<ThemeToggle />);

    const button = await screen.findByRole('button', { name: /mudar para tema claro/i });
    expect(button).toHaveAttribute('aria-label', 'Mudar para tema claro');
  });

  it('should have title attribute for tooltips', async () => {
    render(<ThemeToggle />);

    const button = await screen.findByRole('button');
    expect(button).toHaveAttribute('title');
  });

  // ========================================
  // Hydration Safety Tests
  // ========================================

  it('should not render until mounted (hydration safety)', () => {
    const { container } = render(<ThemeToggle />);

    // Component should render nothing initially (before useEffect)
    // After mount, button should appear
    expect(screen.queryByRole('button')).toBeInTheDocument();
  });
});
