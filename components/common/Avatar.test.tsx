import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Avatar } from "./Avatar";

describe("Avatar Component", () => {
  /**
   * SMOKE TEST: Component renders without crashing
   */
  it("renders without crashing", () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  /**
   * BEHAVIORAL TEST: Image renders when src provided
   */
  it("renders image when src is provided", () => {
    render(
      <Avatar
        src="https://api.dicebear.com/7.x/avataaars/svg?seed=test"
        name="Test User"
      />
    );
    const img = screen.getByAltText("Test User") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("dicebear");
  });

  /**
   * BEHAVIORAL TEST: Initials fallback when image fails
   */
  it("shows initials when image fails to load", () => {
    const { rerender } = render(
      <Avatar
        src="https://invalid-url-that-will-fail.com/image.png"
        name="Jane Smith"
      />
    );

    // Simulate image load error
    const img = screen.getByAltText("Jane Smith") as HTMLImageElement;
    fireEvent.error(img);

    rerender(
      <Avatar
        src="https://invalid-url-that-will-fail.com/image.png"
        name="Jane Smith"
      />
    );

    // After error, initials should show
    expect(screen.getByText("JS")).toBeInTheDocument();
  });

  /**
   * BEHAVIORAL TEST: Two-letter initials from full name
   */
  it("generates correct initials from full name", () => {
    render(<Avatar name="Alice Johnson" />);
    expect(screen.getByText("AJ")).toBeInTheDocument();
  });

  /**
   * BEHAVIORAL TEST: Single letter initial
   */
  it("handles single-letter names", () => {
    render(<Avatar name="X" />);
    expect(screen.getByText("X")).toBeInTheDocument();
  });

  /**
   * BEHAVIORAL TEST: Multi-word name initials
   */
  it("handles multi-word names correctly", () => {
    render(<Avatar name="John Michael Smith" />);
    expect(screen.getByText("JM")).toBeInTheDocument(); // First letters only
  });

  /**
   * VARIANT TEST: Primary variant (rounded square)
   */
  it("applies primary variant (rounded-lg)", () => {
    const { container } = render(
      <Avatar name="Test" variant="primary" />
    );
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveClass("rounded-lg");
  });

  /**
   * VARIANT TEST: Circle variant
   */
  it("applies circle variant (rounded-full)", () => {
    const { container } = render(
      <Avatar name="Test" variant="circle" />
    );
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveClass("rounded-full");
  });

  /**
   * SIZE TEST: Small size
   */
  it("applies small size classes", () => {
    const { container } = render(
      <Avatar name="Test" size="sm" />
    );
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveClass("w-8", "h-8");
  });

  /**
   * SIZE TEST: Medium size (default)
   */
  it("applies medium size classes by default", () => {
    const { container } = render(
      <Avatar name="Test" />
    );
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveClass("w-10", "h-10");
  });

  /**
   * SIZE TEST: Large size
   */
  it("applies large size classes", () => {
    const { container } = render(
      <Avatar name="Test" size="lg" />
    );
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveClass("w-12", "h-12");
  });

  /**
   * STYLING TEST: Background colors assigned
   */
  it("has background color applied", () => {
    const { container } = render(
      <Avatar name="John Doe" />
    );
    const avatar = container.firstChild as HTMLElement;
    // Should have one of the bg color classes
    const hasColor = avatar.className.includes("bg-");
    expect(hasColor).toBe(true);
  });

  /**
   * STYLING TEST: Text color for initials
   */
  it("has white text for contrast", () => {
    const { container } = render(
      <Avatar name="Test" />
    );
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveClass("text-white");
  });

  /**
   * ACCESSIBILITY TEST: Alt text on image
   */
  it("has alt text for accessibility", () => {
    render(
      <Avatar
        src="https://api.dicebear.com/7.x/avataaars/svg?seed=test"
        name="Alice Brown"
      />
    );
    const img = screen.getByAltText("Alice Brown");
    expect(img).toBeInTheDocument();
  });

  /**
   * FALLBACK CHAIN TEST: Image -> Initials -> Icon
   */
  it("shows default background when image fails", () => {
    const { container } = render(
      <Avatar
        src="https://invalid.com/image.png"
        name="Test User"
      />
    );
    // When image fails, Avatar falls back to initials
    // Component should still render without errors
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toBeInTheDocument();
    // Should have a background color applied
    const hasColor = avatar.className.includes("bg-");
    expect(hasColor).toBe(true);
  });

  /**
   * EDGE CASE TEST: Name with special characters
   */
  it("handles names with special characters", () => {
    render(<Avatar name="José García" />);
    expect(screen.getByText("JG")).toBeInTheDocument();
  });

  /**
   * COMPOSITION TEST: Responsive size changes
   */
  it("applies size class correctly for each size", () => {
    const { container: sm } = render(
      <Avatar name="Test" size="sm" />
    );
    const { container: md } = render(
      <Avatar name="Test" size="md" />
    );
    const { container: lg } = render(
      <Avatar name="Test" size="lg" />
    );

    expect(sm.firstChild).toHaveClass("w-8");
    expect(md.firstChild).toHaveClass("w-10");
    expect(lg.firstChild).toHaveClass("w-12");
  });

  /**
   * STYLING TEST: Forward ref works
   */
  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(<Avatar ref={ref} name="Test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
