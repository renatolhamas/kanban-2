import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Modal } from "./Modal";

const meta = {
  title: "Components/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Interactive Modal with state management
 */
function ModalWithState() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
      >
        Open Modal
      </button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Welcome to Modal"
        description="This is a glassmorphism modal with focus trap and keyboard navigation"
      >
        <p className="text-on-surface mb-4">
          This modal demonstrates glassmorphism effects, smooth animations, and accessibility features.
        </p>
        <ul className="text-on-surface text-sm space-y-2 mb-6">
          <li>✓ Fade + Scale entrance animation (200ms)</li>
          <li>✓ Sticky header with glass property</li>
          <li>✓ Focus trap for keyboard navigation</li>
          <li>✓ Press ESC to close</li>
          <li>✓ Click backdrop to close</li>
        </ul>
      </Modal>
    </>
  );
}

export const Default: Story = {
  args: { children: "" },
  render: () => <ModalWithState />,
};

/**
 * Modal with footer actions
 */
function ModalWithFooter() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
      >
        Open Modal with Footer
      </button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Confirm Action"
        description="Are you sure you want to proceed?"
        footer={
          <>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 bg-surface-low text-on-surface rounded-lg hover:bg-surface-high transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Confirm
            </button>
          </>
        }
      >
        <p className="text-on-surface">
          This action cannot be undone. Please confirm your decision before proceeding.
        </p>
      </Modal>
    </>
  );
}

export const WithFooter: Story = {
  args: { children: "" },
  render: () => <ModalWithFooter />,
};

/**
 * Long content modal (scrollable)
 */
function LongContentModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
      >
        Open Long Content Modal
      </button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Terms & Conditions"
        footer={
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Accept
          </button>
        }
      >
        <div className="text-on-surface text-sm space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <p key={i}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          ))}
        </div>
      </Modal>
    </>
  );
}

export const LongContent: Story = {
  args: { children: "" },
  render: () => <LongContentModal />,
};

/**
 * Modal without footer
 */
function MinimalModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
      >
        Open Minimal Modal
      </button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Information"
      >
        <p className="text-on-surface">
          A minimal modal with just title and content. Footer is optional.
        </p>
      </Modal>
    </>
  );
}

export const Minimal: Story = {
  args: { children: "" },
  render: () => <MinimalModal />,
};

/**
 * Modal without title
 */
function NoTitleModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
      >
        Open No-Title Modal
      </button>

      <Modal
        open={open}
        onOpenChange={setOpen}
      >
        <div className="text-on-surface text-center py-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="font-semibold mb-2">Success!</h3>
          <p className="text-sm text-secondary">Your action completed successfully.</p>
        </div>
      </Modal>
    </>
  );
}

export const NoTitle: Story = {
  args: { children: "" },
  render: () => <NoTitleModal />,
};
