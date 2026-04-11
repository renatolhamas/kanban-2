import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./Badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Positive variant (Emerald)
 */
export const Positive: Story = {
  args: {
    variant: "positive",
    children: "Active",
  },
};

/**
 * Neutral variant (Steel/Navy)
 */
export const Neutral: Story = {
  args: {
    variant: "neutral",
    children: "Pending",
  },
};

/**
 * Warning variant (Amber)
 */
export const Warning: Story = {
  args: {
    variant: "warning",
    children: "In Review",
  },
};

/**
 * Error variant (Red)
 */
export const Error: Story = {
  args: {
    variant: "error",
    children: "Failed",
  },
};

/**
 * Small size
 */
export const Small: Story = {
  args: {
    variant: "positive",
    size: "sm",
    children: "New",
  },
};

/**
 * Medium size (default)
 */
export const Medium: Story = {
  args: {
    variant: "positive",
    size: "md",
    children: "Active",
  },
};

/**
 * Large size
 */
export const Large: Story = {
  args: {
    variant: "positive",
    size: "lg",
    children: "Approved",
  },
};

/**
 * All variants together
 */
export const AllVariants: Story = {
  args: { children: "" },
  render: () => (
    <div className="flex gap-3 flex-wrap">
      <Badge variant="positive">Active</Badge>
      <Badge variant="neutral">Pending</Badge>
      <Badge variant="warning">In Review</Badge>
      <Badge variant="error">Failed</Badge>
    </div>
  ),
};

/**
 * All sizes together
 */
export const AllSizes: Story = {
  args: { children: "" },
  render: () => (
    <div className="flex gap-3 items-center flex-wrap">
      <Badge size="sm" variant="positive">
        Small
      </Badge>
      <Badge size="md" variant="positive">
        Medium
      </Badge>
      <Badge size="lg" variant="positive">
        Large
      </Badge>
    </div>
  ),
};

/**
 * In context: Status indicators
 */
export const StatusIndicators: Story = {
  args: { children: "" },
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-on-surface text-sm">User Status:</span>
        <Badge variant="positive">Online</Badge>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-on-surface text-sm">Task Status:</span>
        <Badge variant="warning">In Progress</Badge>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-on-surface text-sm">Connection:</span>
        <Badge variant="neutral">Connected</Badge>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-on-surface text-sm">Error:</span>
        <Badge variant="error">Failed</Badge>
      </div>
    </div>
  ),
};

/**
 * In context: Tag list
 */
export const TagList: Story = {
  args: { children: "" },
  render: () => (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-on-surface">Component Tags:</p>
      <div className="flex gap-2 flex-wrap">
        <Badge variant="positive">Accessible</Badge>
        <Badge variant="positive">Tested</Badge>
        <Badge variant="neutral">Documented</Badge>
        <Badge variant="warning">In Review</Badge>
      </div>
    </div>
  ),
};
