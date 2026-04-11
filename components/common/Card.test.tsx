import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card Component", () => {
  /**
   * SMOKE TEST: Component renders without crashing
   */
  it("renders basic card with children", () => {
    render(<Card>Test content</Card>);
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  /**
   * STRUCTURAL TEST: Header section renders when provided
   */
  it("renders header when provided", () => {
    render(
      <Card header={<div>Card Header</div>}>
        Card content
      </Card>
    );
    expect(screen.getByText("Card Header")).toBeInTheDocument();
  });

  /**
   * STRUCTURAL TEST: Footer section renders when provided
   */
  it("renders footer when provided", () => {
    render(
      <Card footer={<div>Card Footer</div>}>
        Card content
      </Card>
    );
    expect(screen.getByText("Card Footer")).toBeInTheDocument();
  });

  /**
   * BEHAVIORAL TEST: Header and footer optional
   */
  it("renders without header and footer", () => {
    const { container } = render(<Card>Only content</Card>);
    expect(screen.getByText("Only content")).toBeInTheDocument();
    // Verify no extra sections rendered
    expect(container.querySelectorAll("div").length).toBeGreaterThan(0);
  });

  /**
   * VARIANT TEST: Executive Insight variant applies correctly
   */
  it("applies executive-insight variant class", () => {
    const { container } = render(
      <Card variant="executive-insight">Content</Card>
    );
    const cardElement = container.firstChild as HTMLElement;
    // Should have the variant class applied
    expect(cardElement).toHaveClass("relative");
  });

  /**
   * STYLING TEST: Default variant uses surface-lowest background
   */
  it("has surface-lowest background color in default variant", () => {
    const { container } = render(<Card>Content</Card>);
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass("bg-surface-lowest");
  });

  /**
   * STYLING TEST: No borders applied (No-Line Rule)
   */
  it("has no borders (No-Line Rule)", () => {
    const { container } = render(<Card>Content</Card>);
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass("border-0");
  });

  /**
   * STYLING TEST: Rounded corners (8px radius)
   */
  it("has rounded corners (8px radius)", () => {
    const { container } = render(<Card>Content</Card>);
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass("rounded-lg");
  });

  /**
   * STYLING TEST: Shadow elevation
   */
  it("has shadow elevation", () => {
    const { container } = render(<Card>Content</Card>);
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass("shadow-ambient");
  });

  /**
   * COMPOSITION TEST: All sections render together
   */
  it("renders header, content, and footer together", () => {
    render(
      <Card
        header={<div>Header</div>}
        footer={<div>Footer</div>}
      >
        Main Content
      </Card>
    );
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Main Content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  /**
   * ACCESSIBILITY TEST: Semantic HTML structure
   */
  it("maintains semantic structure with divs", () => {
    const { container } = render(
      <Card header={<h3>Title</h3>}>
        <p>Paragraph content</p>
      </Card>
    );
    expect(container.querySelector("h3")).toBeInTheDocument();
    expect(container.querySelector("p")).toBeInTheDocument();
  });

  /**
   * BEHAVIORAL TEST: Forward ref works
   */
  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(
      <Card ref={ref}>
        Content
      </Card>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  /**
   * CUSTOMIZATION TEST: Custom className is applied
   */
  it("accepts and applies custom className", () => {
    const { container } = render(
      <Card className="custom-class">
        Content
      </Card>
    );
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass("custom-class");
  });
});
