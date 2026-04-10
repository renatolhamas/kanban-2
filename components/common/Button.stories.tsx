import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "radio",
      options: ["primary", "secondary", "ghost", "disabled"],
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/**
 * Primary variant - Emerald color, used for main actions
 * Hover state shifts to Deep Emerald (#006c49)
 */
export const Primary: Story = {
  args: {
    children: "Primary Button",
    variant: "primary",
    size: "md",
  },
};

/**
 * Secondary variant - Navy color, for secondary actions
 * Hover state shifts to Deep Navy (#434f63)
 */
export const Secondary: Story = {
  args: {
    children: "Secondary Button",
    variant: "secondary",
    size: "md",
  },
};

/**
 * Ghost variant - Transparent background with underline
 * Hover state shifts to light surface (bg-surface-high)
 */
export const Ghost: Story = {
  args: {
    children: "Ghost Button",
    variant: "ghost",
    size: "md",
  },
};

/**
 * Disabled variant - Greyed out, no interactions
 */
export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    variant: "disabled",
    size: "md",
    disabled: true,
  },
};

/**
 * Small size variant
 */
export const Small: Story = {
  args: {
    children: "Small Button",
    variant: "primary",
    size: "sm",
  },
};

/**
 * Medium size variant (default)
 */
export const Medium: Story = {
  args: {
    children: "Medium Button",
    variant: "primary",
    size: "md",
  },
};

/**
 * Large size variant
 */
export const Large: Story = {
  args: {
    children: "Large Button",
    variant: "primary",
    size: "lg",
  },
};

/**
 * All variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="disabled">Disabled</Button>
      </div>
      <div className="flex gap-3">
        <Button variant="primary" size="sm">
          Small
        </Button>
        <Button variant="primary" size="md">
          Medium
        </Button>
        <Button variant="primary" size="lg">
          Large
        </Button>
      </div>
    </div>
  ),
};

/**
 * Interactive button with click handler
 */
export const Interactive: Story = {
  args: {
    children: "Click Me",
    variant: "primary",
    onClick: () => alert("Button clicked!"),
  },
};
