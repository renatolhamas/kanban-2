import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button Component", () => {
  describe("rendering", () => {
    it("should render button with text", () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole("button", { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it("should render all variants", () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();

      rerender(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();

      rerender(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();

      rerender(<Button variant="disabled">Disabled</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should render all sizes", () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      expect(screen.getByRole("button")).toHaveClass("px-3");

      rerender(<Button size="md">Medium</Button>);
      expect(screen.getByRole("button")).toHaveClass("px-4");

      rerender(<Button size="lg">Large</Button>);
      expect(screen.getByRole("button")).toHaveClass("px-6");
    });
  });

  describe("interactions", () => {
    it("should handle click events", async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      expect(handleClick).toHaveBeenCalledOnce();
    });

    it("should not fire click event when disabled", async () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );

      const button = screen.getByRole("button");
      await userEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should not fire click event when variant is disabled", async () => {
      const handleClick = vi.fn();
      render(
        <Button variant="disabled" onClick={handleClick}>
          Disabled
        </Button>
      );

      const button = screen.getByRole("button");
      await userEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("disabled state", () => {
    it("should apply disabled styling when disabled prop is true", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should apply disabled styling when variant is disabled", () => {
      render(<Button variant="disabled">Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("accessibility", () => {
    it("should have focus ring visible on focus", async () => {
      render(<Button>Focus me</Button>);
      const button = screen.getByRole("button");

      await userEvent.tab();
      expect(button).toHaveFocus();
    });

    it("should be keyboard accessible", async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Press Enter</Button>);

      const button = screen.getByRole("button");
      button.focus();
      await userEvent.keyboard("{Enter}");

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe("className merging", () => {
    it("should accept additional className prop", () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });
  });
});
