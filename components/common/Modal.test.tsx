import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";

describe("Modal Component", () => {
  beforeEach(() => {
    // Reset body overflow style
    document.body.style.overflow = "";
  });

  /**
   * SMOKE TEST: Modal renders when open
   */
  it("renders when open is true", () => {
    render(
      <Modal open={true} title="Test Modal">
        Modal content
      </Modal>
    );
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  /**
   * SMOKE TEST: Modal does not render when open is false
   */
  it("does not render when open is false", () => {
    render(
      <Modal open={false} title="Test Modal">
        Modal content
      </Modal>
    );
    expect(screen.queryByText("Modal content")).not.toBeInTheDocument();
  });

  /**
   * BEHAVIORAL TEST: Title renders when provided
   */
  it("renders title when provided", () => {
    render(
      <Modal open={true} title="Test Title">
        Content
      </Modal>
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  /**
   * BEHAVIORAL TEST: Description renders when provided
   */
  it("renders description when provided", () => {
    render(
      <Modal
        open={true}
        title="Title"
        description="Test Description"
      >
        Content
      </Modal>
    );
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  /**
   * BEHAVIORAL TEST: Footer renders when provided
   */
  it("renders footer when provided", () => {
    render(
      <Modal
        open={true}
        title="Title"
        footer={<button>Action Button</button>}
      >
        Content
      </Modal>
    );
    expect(screen.getByText("Action Button")).toBeInTheDocument();
  });

  /**
   * BEHAVIORAL TEST: Close button functionality
   */
  it("closes modal when close button clicked", async () => {
    const onOpenChange = vi.fn();
    render(
      <Modal
        open={true}
        onOpenChange={onOpenChange}
        title="Test"
      >
        Content
      </Modal>
    );

    const closeButton = screen.getByLabelText("Close modal");
    fireEvent.click(closeButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  /**
   * BEHAVIORAL TEST: Escape key closes modal
   */
  it("closes modal when Escape key is pressed", async () => {
    const onOpenChange = vi.fn();
    render(
      <Modal
        open={true}
        onOpenChange={onOpenChange}
        title="Test"
      >
        Content
      </Modal>
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  /**
   * BEHAVIORAL TEST: Click backdrop closes modal
   */
  it("closes modal when backdrop is clicked", async () => {
    const onOpenChange = vi.fn();
    render(
      <Modal
        open={true}
        onOpenChange={onOpenChange}
        title="Test"
      >
        Content
      </Modal>
    );

    // Find backdrop (first div child of modal container)
    const backdrops = screen.getByRole("dialog").parentElement?.parentElement
      ?.querySelectorAll("div")[0];

    if (backdrops) {
      fireEvent.click(backdrops);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    }
  });

  /**
   * BEHAVIORAL TEST: Click inside modal doesn't close it
   */
  it("does not close when clicking inside modal content", async () => {
    const onOpenChange = vi.fn();
    render(
      <Modal
        open={true}
        onOpenChange={onOpenChange}
        title="Test"
      >
        <button>Inside button</button>
      </Modal>
    );

    const insideButton = screen.getByText("Inside button");
    fireEvent.click(insideButton);

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  /**
   * ACCESSIBILITY TEST: ARIA attributes present
   */
  it("has correct ARIA attributes", () => {
    render(
      <Modal
        open={true}
        title="Modal Title"
        description="Modal Description"
      >
        Content
      </Modal>
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "modal-title");
    expect(dialog).toHaveAttribute("aria-describedby", "modal-description");
  });

  /**
   * ACCESSIBILITY TEST: Focus trap - first element gets focus
   */
  it("sets focus to first focusable element on open", async () => {
    render(
      <Modal
        open={true}
        title="Test"
        footer={<button>Close</button>}
      >
        <button>First button</button>
      </Modal>
    );

    await waitFor(() => {
      expect(screen.getByText("First button")).toHaveFocus();
    });
  });

  /**
   * ACCESSIBILITY TEST: Tab key cycles through focusable elements
   */
  it("cycles focus on Tab key press", async () => {
    const user = userEvent.setup();
    render(
      <Modal
        open={true}
        title="Test"
        footer={<button>Close</button>}
      >
        <button>Button 1</button>
        <button>Button 2</button>
      </Modal>
    );

    const button1 = screen.getByText("Button 1");
    const button2 = screen.getByText("Button 2");

    expect(button1).toHaveFocus();

    await user.tab();
    expect(button2).toHaveFocus();
  });

  /**
   * ANIMATION TEST: Modal has animation classes
   */
  it("applies animation classes", () => {
    render(
      <Modal open={true} title="Test">
        Content
      </Modal>
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("animate-scale-fade-in");
  });

  /**
   * STYLING TEST: Modal has glassmorphism effect
   */
  it("has glassmorphism styling", () => {
    render(
      <Modal open={true} title="Test">
        Content
      </Modal>
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("glass-surface");
    expect(dialog).toHaveClass("backdrop-blur-md");
  });

  /**
   * STYLING TEST: Modal has correct border radius
   */
  it("has rounded corners (8px radius)", () => {
    render(
      <Modal open={true} title="Test">
        Content
      </Modal>
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("rounded-lg");
  });

  /**
   * STYLING TEST: Modal has shadow elevation
   */
  it("has shadow elevation", () => {
    render(
      <Modal open={true} title="Test">
        Content
      </Modal>
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("shadow-ambient");
  });

  /**
   * BEHAVIORAL TEST: Body scroll disabled when modal open
   */
  it("disables body scroll when modal is open", () => {
    render(
      <Modal open={true} title="Test">
        Content
      </Modal>
    );

    expect(document.body.style.overflow).toBe("hidden");
  });

  /**
   * BEHAVIORAL TEST: Body scroll restored when modal closes
   */
  it("restores body scroll when modal closes", async () => {
    const { rerender } = render(
      <Modal open={true} title="Test">
        Content
      </Modal>
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <Modal open={false} title="Test">
        Content
      </Modal>
    );

    expect(document.body.style.overflow).toBe("");
  });

  /**
   * COMPOSITION TEST: All elements render together
   */
  it("renders all sections together", () => {
    render(
      <Modal
        open={true}
        title="Title"
        description="Description"
        footer={<button>Footer Button</button>}
      >
        <p>Main content</p>
      </Modal>
    );

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Main content")).toBeInTheDocument();
    expect(screen.getByText("Footer Button")).toBeInTheDocument();
  });
});
