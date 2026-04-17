import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './button'

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Atoms/Button',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
}

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 p-8 bg-surface">
      <div className="space-y-2">
        <h3 className="text-headline-sm font-bold text-text-primary">Primary</h3>
        <div className="flex gap-2 flex-wrap">
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="primary" loading>Loading</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-headline-sm font-bold text-text-primary">Secondary</h3>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm">Small</Button>
          <Button variant="secondary" size="md">Medium</Button>
          <Button variant="secondary" size="lg">Large</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-headline-sm font-bold text-text-primary">Ghost</h3>
        <div className="flex gap-2 flex-wrap">
          <Button variant="ghost" size="sm">Small</Button>
          <Button variant="ghost" size="md">Medium</Button>
          <Button variant="ghost" size="lg">Large</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-headline-sm font-bold text-text-primary">Destructive</h3>
        <div className="flex gap-2 flex-wrap">
          <Button variant="destructive" size="sm">Delete</Button>
          <Button variant="destructive" size="md">Remove</Button>
          <Button variant="destructive" size="lg">Destroy</Button>
        </div>
      </div>
    </div>
  ),
}
