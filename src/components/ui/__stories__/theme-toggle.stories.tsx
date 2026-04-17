import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ThemeToggle } from '../theme-toggle';

/**
 * ThemeToggle — Atom
 *
 * Icon-only button to toggle between light and dark theme modes.
 * Persists user preference and updates HTML data-theme attribute.
 *
 * Story 2.10: Dark Mode Support
 */

const meta = {
  title: 'Atoms/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Toggles between light and dark mode. Persists preference to localStorage and updates the document theme attribute. Fully accessible with WCAG AA compliance.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state: Light mode active
 */
export const LightMode: Story = {
  decorators: [
    (Story) => (
      <div className="bg-surface-bright dark:bg-surface-container-highest p-8">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: {
      default: 'light',
    },
  },
};

/**
 * Dark mode preview
 */
export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <div className="dark bg-surface-container-highest p-8">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};

/**
 * In Header context (next to UserMenu)
 */
export const InHeader: Story = {
  decorators: [
    (Story) => (
      <div className="flex items-center justify-between bg-surface-bright dark:bg-surface-container-highest p-4 rounded-lg border border-surface-container-low">
        <span className="text-sm text-text-secondary">Header Navigation Area</span>
        <div className="flex items-center gap-3">
          <Story />
          <div className="h-10 w-10 rounded-full bg-primary text-text-inverse flex items-center justify-center">
            U
          </div>
        </div>
      </div>
    ),
  ],
};

/**
 * With focus state visible (keyboard navigation)
 */
export const FocusState: Story = {
  decorators: [
    (Story) => (
      <div className="bg-surface-bright dark:bg-surface-container-highest p-8">
        <div className="text-sm text-text-secondary mb-4">Press Tab to see focus ring</div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Shows proper focus ring for keyboard navigation (WCAG AAA)',
      },
    },
  },
};

/**
 * Accessibility testing
 */
export const A11y: Story = {
  decorators: [
    (Story) => (
      <div className="bg-surface-bright dark:bg-surface-container-highest p-8 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-2">Light Mode</h3>
          <Story />
        </div>
        <div className="dark">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Dark Mode</h3>
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Theme toggle maintains proper contrast and accessibility in both light and dark modes. Uses proper ARIA attributes and semantic HTML.',
      },
    },
  },
};
