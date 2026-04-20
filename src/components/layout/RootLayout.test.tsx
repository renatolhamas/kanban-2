import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { RootLayout } from './RootLayout';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock components
vi.mock('@/components/layout/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

vi.mock('@/components/layout/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

describe('RootLayout Component', () => {
  it('renders header', () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders sidebar on protected pages', () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('has main role on content area', () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('applies correct layout classes', () => {
    const { container } = render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).toHaveClass('flex-col');
    expect(wrapper).toHaveClass('h-screen');
  });

  it('applies dark mode classes', () => {
    const { container } = render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('dark:bg-gray-900');
  });
});
