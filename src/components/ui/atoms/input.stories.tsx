import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './input'

const meta: Meta<typeof Input> = {
  component: Input,
  title: 'Atoms/Input',
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'user@example.com',
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
}

export const WithHelper: Story = {
  args: {
    placeholder: 'Username',
    helperText: 'Choose a unique username',
  },
}

export const Error: Story = {
  args: {
    error: true,
    helperText: 'Email is required',
    placeholder: 'Enter email',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 p-8 bg-surface max-w-md">
      <div className="space-y-2">
        <label className="text-label-sm text-text-primary">Default</label>
        <Input placeholder="Enter text..." />
      </div>

      <div className="space-y-2">
        <label className="text-label-sm text-text-primary">Email</label>
        <Input type="email" placeholder="user@example.com" />
      </div>

      <div className="space-y-2">
        <label className="text-label-sm text-text-primary">Password</label>
        <Input type="password" placeholder="Enter password" />
      </div>

      <div className="space-y-2">
        <label className="text-label-sm text-text-primary">With Helper</label>
        <Input placeholder="Username" helperText="Choose a unique username" />
      </div>

      <div className="space-y-2">
        <label className="text-label-sm text-text-primary">Error State</label>
        <Input error placeholder="Enter email" helperText="Email is required" />
      </div>

      <div className="space-y-2">
        <label className="text-label-sm text-text-primary">Disabled</label>
        <Input disabled placeholder="Disabled input" />
      </div>
    </div>
  ),
}
