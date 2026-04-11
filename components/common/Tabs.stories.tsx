import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tabs } from "./Tabs";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default Tabs with three sections
 */
export const Default: Story = {
  args: {
    items: [
      {
        id: "profile",
        label: "Profile",
        content: (
          <div className="text-on-surface">
            <h3 className="font-semibold mb-2">Profile Information</h3>
            <p className="text-sm">View and edit your profile details here.</p>
          </div>
        ),
      },
      {
        id: "connection",
        label: "Connection",
        content: (
          <div className="text-on-surface">
            <h3 className="font-semibold mb-2">Connection Status</h3>
            <p className="text-sm">Manage your connections and integrations.</p>
          </div>
        ),
      },
      {
        id: "settings",
        label: "Settings",
        content: (
          <div className="text-on-surface">
            <h3 className="font-semibold mb-2">Application Settings</h3>
            <p className="text-sm">Configure your preferences and options.</p>
          </div>
        ),
      },
    ],
    defaultActiveId: "profile",
  },
};

/**
 * Tabs with custom default active
 */
export const CustomDefault: Story = {
  args: {
    items: [
      {
        id: "tab1",
        label: "First Tab",
        content: <p className="text-on-surface">Content for first tab</p>,
      },
      {
        id: "tab2",
        label: "Second Tab",
        content: <p className="text-on-surface">Content for second tab</p>,
      },
      {
        id: "tab3",
        label: "Third Tab",
        content: <p className="text-on-surface">Content for third tab</p>,
      },
    ],
    defaultActiveId: "tab2",
  },
};

/**
 * Tabs with content sections (navigation style)
 */
export const NavigationStyle: Story = {
  args: {
    items: [
      {
        id: "overview",
        label: "Overview",
        content: (
          <div className="space-y-3">
            <h4 className="font-semibold text-on-surface">Overview</h4>
            <p className="text-sm text-secondary">
              Get a quick overview of your dashboard and recent activity.
            </p>
          </div>
        ),
      },
      {
        id: "analytics",
        label: "Analytics",
        content: (
          <div className="space-y-3">
            <h4 className="font-semibold text-on-surface">Analytics</h4>
            <p className="text-sm text-secondary">
              View detailed analytics and performance metrics.
            </p>
          </div>
        ),
      },
      {
        id: "reports",
        label: "Reports",
        content: (
          <div className="space-y-3">
            <h4 className="font-semibold text-on-surface">Reports</h4>
            <p className="text-sm text-secondary">
              Generate and download detailed reports.
            </p>
          </div>
        ),
      },
    ],
    defaultActiveId: "overview",
  },
};

/**
 * Two-tab variant (simple toggle)
 */
export const SimpleTwoTab: Story = {
  args: {
    items: [
      {
        id: "details",
        label: "Details",
        content: <p className="text-on-surface">Detailed information view</p>,
      },
      {
        id: "advanced",
        label: "Advanced",
        content: <p className="text-on-surface">Advanced settings and options</p>,
      },
    ],
    defaultActiveId: "details",
  },
};
