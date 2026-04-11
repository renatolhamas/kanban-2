import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tabs } from "./Tabs";

const mockItems = [
  {
    id: "tab1",
    label: "Tab 1",
    content: <div>Content 1</div>,
  },
  {
    id: "tab2",
    label: "Tab 2",
    content: <div>Content 2</div>,
  },
  {
    id: "tab3",
    label: "Tab 3",
    content: <div>Content 3</div>,
  },
];

describe("Tabs Component", () => {
  /**
   * SMOKE TEST: Component renders without crashing
   */
  it("renders tabs with content", () => {
    render(<Tabs items={mockItems} />);
    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
    expect(screen.getByText("Tab 3")).toBeInTheDocument();
  });

  /**
   * SMOKE TEST: Default active tab renders content
   */
  it("renders first tab content by default", () => {
    render(<Tabs items={mockItems} />);
    expect(screen.getByText("Content 1")).toBeInTheDocument();
  });

  /**
   * BEHAVIORAL TEST: Custom default active tab
   */
  it("renders custom default active tab", () => {
    render(<Tabs items={mockItems} defaultActiveId="tab2" />);
    expect(screen.getByText("Content 2")).toBeInTheDocument();
    expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
  });

  /**
   * BEHAVIORAL TEST: Tab selection changes content
   */
  it("changes content when tab is clicked", () => {
    render(<Tabs items={mockItems} defaultActiveId="tab1" />);
    expect(screen.getByText("Content 1")).toBeInTheDocument();

    const tab2Button = screen.getByText("Tab 2");
    fireEvent.click(tab2Button);

    expect(screen.getByText("Content 2")).toBeInTheDocument();
    expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
  });

  /**
   * BEHAVIORAL TEST: Multiple tab selections
   */
  it("handles multiple tab selections", () => {
    render(<Tabs items={mockItems} defaultActiveId="tab1" />);

    fireEvent.click(screen.getByText("Tab 2"));
    expect(screen.getByText("Content 2")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Tab 3"));
    expect(screen.getByText("Content 3")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Tab 1"));
    expect(screen.getByText("Content 1")).toBeInTheDocument();
  });

  /**
   * BEHAVIORAL TEST: onActiveChange callback
   */
  it("calls onActiveChange when tab is selected", () => {
    const onActiveChange = vi.fn();
    render(
      <Tabs items={mockItems} defaultActiveId="tab1" onActiveChange={onActiveChange} />
    );

    fireEvent.click(screen.getByText("Tab 2"));
    expect(onActiveChange).toHaveBeenCalledWith("tab2");

    fireEvent.click(screen.getByText("Tab 3"));
    expect(onActiveChange).toHaveBeenCalledWith("tab3");
  });

  /**
   * ACCESSIBILITY TEST: Semantic HTML structure
   */
  it("has semantic tablist structure", () => {
    const { container: doc } = render(<Tabs items={mockItems} />);
    const tablist = doc.querySelector('[role="tablist"]');
    expect(tablist).toBeInTheDocument();
  });

  /**
   * ACCESSIBILITY TEST: Tab and tabpanel roles
   */
  it("has correct ARIA roles for tabs and panels", () => {
    const { container: doc } = render(<Tabs items={mockItems} />);
    const tabs = doc.querySelectorAll('[role="tab"]');
    const panels = doc.querySelectorAll('[role="tabpanel"]');

    expect(tabs).toHaveLength(3);
    expect(panels).toHaveLength(1); // Only active panel rendered
  });

  /**
   * ACCESSIBILITY TEST: aria-selected attribute
   */
  it("sets aria-selected correctly on tabs", () => {
    render(<Tabs items={mockItems} defaultActiveId="tab2" />);

    const tab1 = screen.getByText("Tab 1");
    const tab2 = screen.getByText("Tab 2");
    const tab3 = screen.getByText("Tab 3");

    expect(tab1).toHaveAttribute("aria-selected", "false");
    expect(tab2).toHaveAttribute("aria-selected", "true");
    expect(tab3).toHaveAttribute("aria-selected", "false");
  });

  /**
   * ACCESSIBILITY TEST: aria-controls links
   */
  it("links tabs to panels with aria-controls", () => {
    render(<Tabs items={mockItems} defaultActiveId="tab1" />);
    const tab1 = screen.getByText("Tab 1") as HTMLButtonElement;

    expect(tab1).toHaveAttribute("aria-controls", "tabpanel-tab1");
  });

  /**
   * STYLING TEST: Active tab styling
   */
  it("applies active tab styling", () => {
    render(<Tabs items={mockItems} defaultActiveId="tab1" />);
    const tab1 = screen.getByText("Tab 1");

    expect(tab1).toHaveClass("font-semibold");
    expect(tab1).toHaveClass("bg-surface-low");
  });

  /**
   * STYLING TEST: Inactive tab styling
   */
  it("applies inactive tab styling", () => {
    render(<Tabs items={mockItems} defaultActiveId="tab1" />);
    const tab2 = screen.getByText("Tab 2");

    expect(tab2).toHaveClass("text-secondary");
    expect(tab2).toHaveClass("bg-transparent");
  });

  /**
   * COMPOSITION TEST: Single tab
   */
  it("renders single tab correctly", () => {
    const singleItem = [
      {
        id: "only",
        label: "Only Tab",
        content: <div>Only Content</div>,
      },
    ];

    render(<Tabs items={singleItem} />);
    expect(screen.getByText("Only Tab")).toBeInTheDocument();
    expect(screen.getByText("Only Content")).toBeInTheDocument();
  });

  /**
   * EDGE CASE TEST: Empty items array
   */
  it("handles empty items array gracefully", () => {
    render(<Tabs items={[]} />);
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });
});
