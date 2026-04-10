import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast } from "@/components/common/Toast";

// Test component that uses useToast (ToastProvider renders ToastContainer)
function ToastButton() {
  const { addToast } = useToast();

  return (
    <div>
      <button onClick={() => addToast("Success message", "success")}>
        Add Success
      </button>
      <button onClick={() => addToast("Error message", "error")}>
        Add Error
      </button>
      <button onClick={() => addToast("Warning message", "warning")}>
        Add Warning
      </button>
      <button onClick={() => addToast("Info message", "info")}>
        Add Info
      </button>
    </div>
  );
}

describe("useToast Hook", () => {
  it("should add a toast to the list", async () => {
    render(
      <ToastProvider>
        <ToastButton />
      </ToastProvider>
    );

    const addButton = screen.getByRole("button", { name: /Add Success/i });
    await userEvent.click(addButton);

    // Toast should be rendered in the alert container
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
  });

  it("should render toast message", async () => {
    render(
      <ToastProvider>
        <ToastButton />
      </ToastProvider>
    );

    const addButton = screen.getByRole("button", { name: /Add Success/i });
    await userEvent.click(addButton);

    // Message should appear
    const message = screen.getByText("Success message");
    expect(message).toBeInTheDocument();
  });

  it("should support different toast types", async () => {
    render(
      <ToastProvider>
        <ToastButton />
      </ToastProvider>
    );

    // Add different types
    await userEvent.click(screen.getByRole("button", { name: /Add Success/i }));
    await userEvent.click(screen.getByRole("button", { name: /Add Error/i }));

    // Both should be rendered
    expect(screen.getByText("Success message")).toBeInTheDocument();
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  it("should render close button on toast", async () => {
    render(
      <ToastProvider>
        <ToastButton />
      </ToastProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: /Add Success/i }));

    // Close button should exist
    const closeButton = screen.getByLabelText("Close notification");
    expect(closeButton).toBeInTheDocument();
  });

  it("should handle close button click", async () => {
    render(
      <ToastProvider>
        <ToastButton />
      </ToastProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: /Add Success/i }));

    const closeButton = screen.getByLabelText("Close notification");
    await userEvent.click(closeButton);

    // Toast should be removed (message should not be in document)
    expect(screen.queryByText("Success message")).not.toBeInTheDocument();
  });

  it("should throw error if hook used outside provider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(<ToastButton />);
    }).toThrow("useToast must be used within ToastProvider");

    consoleError.mockRestore();
  });

  it("should render ToastProvider without errors", () => {
    const { container } = render(
      <ToastProvider>
        <div>Content</div>
      </ToastProvider>
    );

    expect(container).toBeInTheDocument();
  });

  it("should have alert region in DOM", () => {
    render(
      <ToastProvider>
        <div>Test</div>
      </ToastProvider>
    );

    const region = screen.getByRole("region", { name: /Notifications/i });
    expect(region).toBeInTheDocument();
  });

  it("should render toast with alert role", async () => {
    render(
      <ToastProvider>
        <ToastButton />
      </ToastProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: /Add Success/i }));

    // Alert should exist
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "polite");
  });

  it("should render toast container on the right side", () => {
    const { container } = render(
      <ToastProvider>
        <div>Content</div>
      </ToastProvider>
    );

    // Find the toast container div
    const toastContainer = container.querySelector(
      "div.fixed.top-4.right-4.z-50"
    );
    expect(toastContainer).toBeInTheDocument();
  });

  describe("Toast accessibility", () => {
    it("should have aria-live on alert container", async () => {
      render(
        <ToastProvider>
          <ToastButton />
        </ToastProvider>
      );

      await userEvent.click(
        screen.getByRole("button", { name: /Add Success/i })
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveAttribute("aria-live");
    });

    it("should have aria-atomic on alert", async () => {
      render(
        <ToastProvider>
          <ToastButton />
        </ToastProvider>
      );

      await userEvent.click(
        screen.getByRole("button", { name: /Add Success/i })
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveAttribute("aria-atomic", "true");
    });
  });
});
