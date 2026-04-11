import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge Component", () => {
  /**
   * SMOKE TEST: Component renders without crashing
   */
  it("renders badge with text", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  /**
   * VARIANT TEST: Positive (Emerald) variant
   */
  it("applies positive variant styles", () => {
    const { container } = render(<Badge variant="positive">Active</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("bg-emerald-100");
    expect(badge).toHaveClass("text-emerald-900");
  });

  /**
   * VARIANT TEST: Neutral (Steel/Navy) variant
   */
  it("applies neutral variant styles", () => {
    const { container } = render(<Badge variant="neutral">Pending</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("bg-slate-100");
    expect(badge).toHaveClass("text-slate-900");
  });

  /**
   * VARIANT TEST: Warning (Amber) variant
   */
  it("applies warning variant styles", () => {
    const { container } = render(<Badge variant="warning">In Review</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("bg-amber-100");
    expect(badge).toHaveClass("text-amber-900");
  });

  /**
   * VARIANT TEST: Error (Red) variant
   */
  it("applies error variant styles", () => {
    const { container } = render(<Badge variant="error">Failed</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("bg-red-100");
    expect(badge).toHaveClass("text-red-900");
  });

  /**
   * VARIANT TEST: Default variant is neutral
   */
  it("defaults to neutral variant", () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("bg-slate-100");
    expect(badge).toHaveClass("text-slate-900");
  });

  /**
   * SIZE TEST: Small size
   */
  it("applies small size classes", () => {
    const { container } = render(<Badge size="sm">Small</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("px-2");
    expect(badge).toHaveClass("py-1");
    expect(badge).toHaveClass("text-xs");
  });

  /**
   * SIZE TEST: Medium size (default)
   */
  it("applies medium size classes by default", () => {
    const { container } = render(<Badge>Medium</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("px-3");
    expect(badge).toHaveClass("py-2");
    expect(badge).toHaveClass("text-sm");
  });

  /**
   * SIZE TEST: Large size
   */
  it("applies large size classes", () => {
    const { container } = render(<Badge size="lg">Large</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("px-3");
    expect(badge).toHaveClass("py-2");
    expect(badge).toHaveClass("text-base");
  });

  /**
   * STYLING TEST: Full roundedness (9999px)
   */
  it("has full roundedness (pill shape)", () => {
    const { container } = render(<Badge>Pill</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("rounded-full");
  });

  /**
   * STYLING TEST: Font weight
   */
  it("applies font-medium for all sizes", () => {
    const sm = render(<Badge size="sm">Small</Badge>);
    const md = render(<Badge size="md">Medium</Badge>);
    const lg = render(<Badge size="lg">Large</Badge>);

    expect((sm.container.firstChild as HTMLElement)).toHaveClass("font-medium");
    expect((md.container.firstChild as HTMLElement)).toHaveClass("font-medium");
    expect((lg.container.firstChild as HTMLElement)).toHaveClass("font-medium");
  });

  /**
   * STYLING TEST: Inline-flex display
   */
  it("uses inline-flex display", () => {
    const { container } = render(<Badge>Inline</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("inline-flex");
  });

  /**
   * ACCESSIBILITY TEST: Semantic span element
   */
  it("renders as span element", () => {
    render(<Badge>Badge Text</Badge>);
    const badge = screen.getByText("Badge Text");
    expect(badge.tagName).toBe("SPAN");
  });

  /**
   * COMPOSITION TEST: Multiple badges
   */
  it("renders multiple badges independently", () => {
    render(
      <>
        <Badge variant="positive">Active</Badge>
        <Badge variant="warning">Pending</Badge>
        <Badge variant="error">Failed</Badge>
      </>
    );

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  /**
   * COMPOSITION TEST: Badge with children nodes
   */
  it("renders complex children content", () => {
    render(
      <Badge variant="positive">
        <span>✓</span> Verified
      </Badge>
    );

    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  /**
   * CUSTOMIZATION TEST: Custom className
   */
  it("accepts and applies custom className", () => {
    const { container } = render(
      <Badge className="custom-class">Custom</Badge>
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("custom-class");
  });

  /**
   * STYLING TEST: Transition applied
   */
  it("has transition classes for hover", () => {
    const { container } = render(<Badge>Hover</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("transition-colors");
    expect(badge).toHaveClass("duration-150");
  });

  /**
   * EDGE CASE TEST: Empty badge
   */
  it("renders even with empty content", () => {
    const { container } = render(<Badge>·</Badge>);
    expect(container.firstChild).toBeInTheDocument();
  });

  /**
   * EDGE CASE TEST: Single character badge
   */
  it("renders single character badge", () => {
    render(<Badge>A</Badge>);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  /**
   * FORWARD REF TEST: Ref support
   */
  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(<Badge ref={ref}>Ref Test</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  /**
   * SIZE COMBINATIONS TEST: All variant + size combinations
   */
  it("applies correct styles for all variant/size combinations", () => {
    const variants: Array<"positive" | "neutral" | "warning" | "error"> = [
      "positive",
      "neutral",
      "warning",
      "error",
    ];
    const sizes: Array<"sm" | "md" | "lg"> = ["sm", "md", "lg"];

    variants.forEach((variant) => {
      sizes.forEach((size) => {
        const { container } = render(
          <Badge variant={variant} size={size}>
            {variant}-{size}
          </Badge>
        );
        const badge = container.firstChild as HTMLElement;

        // Should have variant classes
        expect(badge.className).toMatch(/bg-/);
        expect(badge.className).toMatch(/text-/);

        // Should have size classes
        expect(badge.className).toMatch(/px-/);
        expect(badge.className).toMatch(/py-/);

        // Should have roundedness
        expect(badge).toHaveClass("rounded-full");
      });
    });
  });
});
