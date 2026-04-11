import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar } from "./Avatar";
import { DarkModeDecorator } from "@/.storybook/decorators/DarkModeDecorator";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  decorators: [DarkModeDecorator],
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Avatar with initials (default fallback)
 */
export const Initials: Story = {
  args: {
    name: "John Doe",
    size: "md",
    variant: "primary",
  },
};

/**
 * Avatar with image (success case)
 */
export const WithImage: Story = {
  args: {
    src: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    name: "John Doe",
    size: "md",
    variant: "primary",
  },
};

/**
 * Primary variant: rounded square (8px radius)
 */
export const PrimaryVariant: Story = {
  args: {
    name: "Sarah Smith",
    size: "md",
    variant: "primary",
  },
};

/**
 * Circle variant
 */
export const CircleVariant: Story = {
  args: {
    name: "Michael Johnson",
    size: "md",
    variant: "circle",
  },
};

/**
 * Small size
 */
export const Small: Story = {
  args: {
    name: "Alice Brown",
    size: "sm",
    variant: "primary",
  },
};

/**
 * Large size
 */
export const Large: Story = {
  args: {
    name: "Robert Wilson",
    size: "lg",
    variant: "primary",
  },
};

/**
 * All sizes together
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-end">
      <Avatar name="Small" size="sm" variant="primary" />
      <Avatar name="Medium" size="md" variant="primary" />
      <Avatar name="Large" size="lg" variant="primary" />
    </div>
  ),
};

/**
 * Different names (color cycling)
 */
export const ColorVariety: Story = {
  render: () => (
    <div className="flex gap-4">
      <Avatar name="Alice Anderson" size="md" variant="primary" />
      <Avatar name="Bob Brown" size="md" variant="primary" />
      <Avatar name="Charlie Chen" size="md" variant="primary" />
      <Avatar name="Diana Davis" size="md" variant="primary" />
    </div>
  ),
};

/**
 * Variant comparison: primary vs circle
 */
export const VariantComparison: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-on-surface">Primary (Rounded)</p>
        <Avatar name="John Doe" size="lg" variant="primary" />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-on-surface">Circle</p>
        <Avatar name="John Doe" size="lg" variant="circle" />
      </div>
    </div>
  ),
};

/**
 * Single letter name
 */
export const SingleLetter: Story = {
  args: {
    name: "X",
    size: "md",
    variant: "primary",
  },
};

/**
 * Image with fallback (invalid src)
 */
export const InvalidImageFallback: Story = {
  args: {
    src: "https://invalid-url-that-will-fail.com/image.png",
    name: "Fallback Name",
    size: "md",
    variant: "primary",
  },
};
