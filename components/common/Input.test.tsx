import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./Input";

describe("Input Component", () => {
  describe("rendering", () => {
    it("should render input element", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("should render with label", () => {
      render(<Input label="Email" />);
      const label = screen.getByText("Email");
      expect(label).toBeInTheDocument();
    });

    it("should render with placeholder", () => {
      render(<Input placeholder="Enter email" />);
      const input = screen.getByPlaceholderText("Enter email");
      expect(input).toBeInTheDocument();
    });

    it("should render with helper text", () => {
      render(<Input helperText="This is a helper text" />);
      const helper = screen.getByText("This is a helper text");
      expect(helper).toBeInTheDocument();
    });

    it("should render with error message", () => {
      render(<Input error="This field is required" />);
      const error = screen.getByText("This field is required");
      expect(error).toBeInTheDocument();
    });
  });

  describe("value changes", () => {
    it("should handle value changes", async () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      await userEvent.type(input, "test");

      expect(handleChange).toHaveBeenCalled();
      expect(input.value).toBe("test");
    });

    it("should update value when prop changes", () => {
      const { rerender } = render(<Input value="initial" readOnly />);
      let input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("initial");

      rerender(<Input value="updated" readOnly />);
      input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("updated");
    });
  });

  describe("states", () => {
    it("should render disabled state", () => {
      render(<Input disabled />);
      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("should apply error styling", () => {
      render(<Input error="Error message" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-describedby");
    });
  });

  describe("accessibility", () => {
    it("should associate label with input", () => {
      render(<Input label="Email" />);
      const label = screen.getByText("Email") as HTMLLabelElement;
      const input = screen.getByRole("textbox");

      expect(label.htmlFor).toBe(input.id);
    });

    it("should have aria-label when provided", () => {
      render(<Input aria-label="Custom label" />);
      const input = screen.getByLabelText("Custom label");
      expect(input).toBeInTheDocument();
    });

    it("should have aria-describedby when error or helper text present", () => {
      const { rerender } = render(<Input error="Error text" />);
      let input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-describedby");

      rerender(<Input helperText="Helper text" />);
      input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-describedby");
    });

    it("should be keyboard accessible", async () => {
      render(<Input />);
      const input = screen.getByRole("textbox");

      await userEvent.tab();
      expect(input).toHaveFocus();
    });
  });

  describe("input types", () => {
    it("should render email type", () => {
      render(<Input type="email" />);
      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.type).toBe("email");
    });

    it("should render password type", () => {
      const { container } = render(<Input type="password" />);
      const input = container.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it("should render number type", () => {
      const { container } = render(<Input type="number" />);
      const input = container.querySelector('input[type="number"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe("focus state", () => {
    it("should apply focus styling on focus", async () => {
      render(<Input />);
      const input = screen.getByRole("textbox");

      await userEvent.click(input);
      expect(input).toHaveFocus();
    });
  });

  describe("className merging", () => {
    it("should accept additional className prop", () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("custom-class");
    });
  });
});
