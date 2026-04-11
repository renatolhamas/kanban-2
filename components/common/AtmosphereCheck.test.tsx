import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AtmosphereCheck } from './AtmosphereCheck';

describe('AtmosphereCheck Component', () => {
  it('renders without errors', () => {
    const { container } = render(<AtmosphereCheck />);
    expect(container).toBeTruthy();
  });

  it('renders main container with correct Tailwind classes', () => {
    const { container } = render(<AtmosphereCheck />);
    const mainDiv = container.querySelector('div');
    expect(mainDiv).toHaveClass('flex', 'flex-col', 'gap-8', 'p-12', 'bg-surface', 'min-h-[300px]');
  });

  it('renders Typography & Color Check section', () => {
    render(<AtmosphereCheck />);
    const heading = screen.getByText('Typography & Color Check');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-secondary', 'font-sans', 'font-semibold');
  });

  it('renders primary color box with correct classes', () => {
    const { container } = render(<AtmosphereCheck />);
    const primaryBox = container.querySelector('.bg-primary');
    expect(primaryBox).toHaveClass('bg-primary', 'text-primary-foreground', 'p-6', 'rounded-md', 'shadow-ambient');
  });

  it('renders Glass & Shadow Check section', () => {
    render(<AtmosphereCheck />);
    const heading = screen.getByText('Glass & Shadow Check');
    expect(heading).toBeInTheDocument();
  });

  it('renders glass surface element with correct classes', () => {
    const { container } = render(<AtmosphereCheck />);
    const glassElement = container.querySelector('.glass-surface');
    expect(glassElement).toHaveClass('glass-surface', 'p-8', 'rounded-md', 'shadow-ambient');
  });

  it('renders Gradient Check section', () => {
    render(<AtmosphereCheck />);
    const heading = screen.getByText('Gradient Check');
    expect(heading).toBeInTheDocument();
  });

  it('renders signature gradient box with correct classes', () => {
    const { container } = render(<AtmosphereCheck />);
    const gradientBox = container.querySelector('.bg-signature-gradient');
    expect(gradientBox).toHaveClass('bg-signature-gradient', 'p-6', 'rounded-md', 'text-white', 'h-24');
  });

  it('verifies all sections are rendered', () => {
    render(<AtmosphereCheck />);
    const sections = screen.getAllByRole('heading', { level: 2 });
    expect(sections).toHaveLength(3);
  });

  it('verifies Design Token CSS variables are applied via classes', () => {
    const { container } = render(<AtmosphereCheck />);

    // Check that primary color is applied (via CSS variables in tailwind.config)
    const primaryElement = container.querySelector('.bg-primary');
    expect(primaryElement).toBeTruthy();

    // Check that surface color is applied
    const surfaceElement = container.querySelector('.bg-surface');
    expect(surfaceElement).toBeTruthy();

    // Check that signature gradient is applied
    const gradientElement = container.querySelector('.bg-signature-gradient');
    expect(gradientElement).toBeTruthy();
  });
});
