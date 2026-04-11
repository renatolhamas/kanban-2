import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card } from "./Card";
import { DarkModeDecorator } from "@/.storybook/decorators/DarkModeDecorator";

const meta = {
  title: "Components/Card",
  component: Card,
  decorators: [DarkModeDecorator],
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "surface",
      values: [
        {
          name: "surface",
          value: "hsl(210 20% 98%)", // --surface
        },
        {
          name: "white",
          value: "#ffffff",
        },
      ],
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default Card with content sections
 */
export const Default: Story = {
  args: {
    header: <h3 className="text-on-surface font-semibold">Card Header</h3>,
    children: (
      <p className="text-on-surface text-sm">
        This is the main content area of the card. It supports any React content.
      </p>
    ),
    footer: <button className="text-primary text-sm font-medium">Action</button>,
  },
};

/**
 * Executive Insight variant with Emerald left accent bar
 */
export const ExecutiveInsight: Story = {
  args: {
    variant: "executive-insight",
    header: (
      <div>
        <h3 className="text-on-surface font-semibold">Executive Insight</h3>
        <p className="text-secondary text-xs mt-1">High-priority information</p>
      </div>
    ),
    children: (
      <div className="space-y-2">
        <p className="text-on-surface font-medium">Key Metrics:</p>
        <ul className="text-on-surface text-sm space-y-1">
          <li>• 47% improvement in performance</li>
          <li>• 12 new features shipped</li>
        </ul>
      </div>
    ),
  },
};

/**
 * Card without header or footer
 */
export const Minimal: Story = {
  args: {
    children: (
      <p className="text-on-surface">
        A minimal card with just content, no header or footer.
      </p>
    ),
  },
};

/**
 * Card with multiple content sections
 */
export const MultiSection: Story = {
  args: {
    header: <h3 className="text-on-surface font-semibold">Multi-section Card</h3>,
    children: (
      <div className="space-y-4">
        <div>
          <h4 className="text-on-surface font-medium text-sm mb-2">Section 1</h4>
          <p className="text-on-surface text-sm">Content for section one.</p>
        </div>
        <div>
          <h4 className="text-on-surface font-medium text-sm mb-2">Section 2</h4>
          <p className="text-on-surface text-sm">Content for section two.</p>
        </div>
      </div>
    ),
    footer: (
      <div className="flex gap-2">
        <button className="text-primary text-sm font-medium">Primary</button>
        <button className="text-secondary text-sm font-medium">Secondary</button>
      </div>
    ),
  },
};

/**
 * Dark background context (Card sits on darker surface)
 */
export const OnDarkSurface: Story = {
  args: {
    header: <h3 className="text-on-surface font-semibold">On Dark Background</h3>,
    children: (
      <p className="text-on-surface text-sm">
        Card with surface-lowest background shows clear contrast on darker surfaces.
      </p>
    ),
  },
  parameters: {
    backgrounds: {
      default: "dark-surface",
      values: [
        {
          name: "dark-surface",
          value: "hsl(210 16% 96%)", // --surface-low
        },
      ],
    },
  },
};
