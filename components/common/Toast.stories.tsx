import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ToastProvider, useToast } from "./Toast";
import { Button } from "./Button";

const meta: Meta = {
  title: "Components/Toast",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};

export default meta;

/**
 * Success toast - Green variant
 */
export const Success: StoryObj = {
  render: function SuccessStory() {
    const { addToast } = useToast();

    return (
      <Button
        onClick={() => addToast("Operation completed successfully!", "success")}
        variant="primary"
      >
        Show Success Toast
      </Button>
    );
  },
};

/**
 * Error toast - Red variant
 */
export const Error: StoryObj = {
  render: function ErrorStory() {
    const { addToast } = useToast();

    return (
      <Button
        onClick={() => addToast("An error occurred. Please try again.", "error")}
        variant="primary"
      >
        Show Error Toast
      </Button>
    );
  },
};

/**
 * Warning toast - Yellow variant
 */
export const Warning: StoryObj = {
  render: function WarningStory() {
    const { addToast } = useToast();

    return (
      <Button
        onClick={() => addToast("This action cannot be undone.", "warning")}
        variant="primary"
      >
        Show Warning Toast
      </Button>
    );
  },
};

/**
 * Info toast - Blue variant
 */
export const Info: StoryObj = {
  render: function InfoStory() {
    const { addToast } = useToast();

    return (
      <Button
        onClick={() => addToast("Here is some useful information.", "info")}
        variant="primary"
      >
        Show Info Toast
      </Button>
    );
  },
};

/**
 * Multiple toasts stacking
 * Note: Maximum 3 visible at a time
 */
export const MultipleToasts: StoryObj = {
  render: function MultipleStory() {
    const { addToast } = useToast();

    const showMultiple = () => {
      addToast("First notification", "success");
      setTimeout(() => addToast("Second notification", "info"), 200);
      setTimeout(() => addToast("Third notification", "warning"), 400);
      setTimeout(() => addToast("Fourth notification (replaces first)", "error"), 600);
    };

    return (
      <Button onClick={showMultiple} variant="primary">
        Show Multiple Toasts
      </Button>
    );
  },
};

/**
 * Toast with custom duration (auto-dismiss after 10 seconds)
 */
export const CustomDuration: StoryObj = {
  render: function CustomDurationStory() {
    const { addToast } = useToast();

    return (
      <Button
        onClick={() => addToast("This will stay for 10 seconds", "info", 10000)}
        variant="primary"
      >
        Show Toast (10s duration)
      </Button>
    );
  },
};

/**
 * Persistent toast (no auto-dismiss)
 */
export const Persistent: StoryObj = {
  render: function PersistentStory() {
    const { addToast } = useToast();

    return (
      <Button
        onClick={() => addToast("This will stay until you close it", "info", 0)}
        variant="primary"
      >
        Show Persistent Toast
      </Button>
    );
  },
};

/**
 * All variants showcase
 */
export const AllVariants: StoryObj = {
  render: function AllVariantsStory() {
    const { addToast } = useToast();

    return (
      <div className="flex flex-col gap-3">
        <Button
          onClick={() => addToast("Success message", "success")}
          variant="primary"
          size="sm"
        >
          Success
        </Button>
        <Button
          onClick={() => addToast("Error message", "error")}
          variant="primary"
          size="sm"
        >
          Error
        </Button>
        <Button
          onClick={() => addToast("Warning message", "warning")}
          variant="primary"
          size="sm"
        >
          Warning
        </Button>
        <Button
          onClick={() => addToast("Info message", "info")}
          variant="primary"
          size="sm"
        >
          Info
        </Button>
      </div>
    );
  },
};

/**
 * Interactive demo showing multiple operations
 */
export const InteractiveDemo: StoryObj = {
  render: function InteractiveDemoStory() {
    const { addToast, clearAll } = useToast();

    return (
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Button
            onClick={() => addToast("Form saved successfully", "success")}
            variant="primary"
            size="sm"
          >
            Save
          </Button>
          <Button
            onClick={() => addToast("Form submission failed", "error")}
            variant="primary"
            size="sm"
          >
            Error
          </Button>
        </div>
        <Button
          onClick={clearAll}
          variant="secondary"
          size="sm"
        >
          Clear All
        </Button>
      </div>
    );
  },
};
