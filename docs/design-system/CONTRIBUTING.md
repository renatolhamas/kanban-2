# Contributing to Synkra Design System 🎨

**Version:** 1.0.0  
**Last Updated:** 2026-04-12  
**Status:** Active

Welcome! This guide explains how to add tokens, create components, and maintain the design system.

---

## Table of Contents

1. [Adding Tokens](#adding-tokens)
2. [Creating Components](#creating-components)
3. [Testing Components](#testing-components)
4. [Dark Mode Support](#dark-mode-support)
5. [Quality Checklist](#quality-checklist)
6. [Common Tasks](#common-tasks)

---

## Adding Tokens

### Step 1: Edit tokens.yaml

**File:** `design-system/tokens/tokens.yaml`

This is the ONLY place to add or modify tokens. Tokens are organized in 3 layers:

```yaml
# Core tokens (primitives)
colors:
  primary: "#007acc"
  secondary: "#10b981"
  danger: "#ef4444"

spacing:
  "0": "0"
  "1": "0.25rem"
  "2": "0.5rem"
  "4": "1rem"

# Semantic tokens (aliases for intent)
colorIntent:
  primary: "{colors.primary}"
  success: "{colors.secondary}"

# Component tokens (specific to UI elements)
button:
  primary:
    background: "{colorIntent.primary}"
    color: "white"
  danger:
    background: "{colors.danger}"
    color: "white"
```

### Step 2: Export Tokens

After editing `tokens.yaml`, generate all formats:

```bash
npm run tokens:export
```

**This generates:**
- `tokens.css` — CSS custom properties (for globals.css)
- `tokens.json` — JSON format (for component usage)
- `tokens.tailwind.js` — Tailwind config (auto-included)
- `tokens.scss` — SCSS variables
- `tokens.dtcg.json` — W3C Design Tokens standard

### Step 3: Verify Generation

```bash
# Check generated files exist
ls -la design-system/tokens/build/

# Validate token syntax
npm run tokens:validate

# Check if TypeScript types updated (auto-generated)
grep "color-primary" design-system/tokens/build/tokens.json
```

### Step 4: Update app/globals.css (if new tokens)

If you added new **color** tokens, merge them into `app/globals.css`:

```css
:root {
  /* Existing tokens */
  --primary: 161 100% 21%;
  
  /* Your new tokens */
  --color-success: #10b981;
}
```

### Step 5: Commit

```bash
git add design-system/tokens/
git commit -m "feat: add new token [token-name] [Token Update]"
```

**Example:**
```bash
git commit -m "feat: add color-warning and spacing-12 tokens [Token Update]"
```

---

## Creating Components

### Before You Start

✅ **Read:** [Button.tsx](../src/components/ui/Button.tsx) — POC component  
✅ **Read:** [Button.stories.tsx](../src/components/ui/Button.stories.tsx) — Story template  
✅ **Tool:** Storybook running: `npm run storybook`

### Step 1: Create Component File

**Location:** `src/components/ui/{ComponentName}.tsx`

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles
  "font-medium rounded transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",
        secondary: "bg-[var(--color-secondary)] text-white",
        danger: "bg-[var(--color-danger)] text-white",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);

Button.displayName = "Button";
```

### Step 2: Create Storybook Story

**Location:** `src/components/ui/{ComponentName}.stories.tsx`

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Primary: Story = {
  args: {
    children: "Click me",
    variant: "primary",
    size: "md",
  },
};

// Variants
export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Danger: Story = {
  args: {
    children: "Delete",
    variant: "danger",
  },
};

// Sizes
export const Small: Story = {
  args: {
    children: "Small",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    children: "Large",
    size: "lg",
  },
};

// Dark mode (test both)
export const DarkMode: Story = {
  args: {
    children: "In dark mode",
    variant: "primary",
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div data-theme="dark" style={{ padding: "2rem", background: "#1a1a1a" }}>
        <Story />
      </div>
    ),
  ],
};
```

### Step 3: Create Unit Tests

**Location:** `src/components/ui/{ComponentName}.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";
import { describe, it, expect } from "vitest";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  it("applies variant class", () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("color-danger");
  });

  it("applies size class", () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("lg");
  });

  it("is clickable", async () => {
    const { user } = render(<Button>Click</Button>);
    const button = screen.getByRole("button");
    await user.click(button);
    expect(button).toHaveBeenClicked();
  });

  it("forwards ref", () => {
    const ref = { current: null };
    render(<Button ref={ref}>Click</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
```

---

## Testing Components

### 1. Unit Tests (Vitest)

```bash
# Run all tests
npm test

# Run tests for one component
npm test Button.test.tsx

# Watch mode
npm test -- --watch
```

**What to test:**
- ✅ Component renders
- ✅ Props apply correctly
- ✅ Variants render expected classes
- ✅ User interactions work
- ✅ Dark mode colors apply

### 2. Visual Tests (Storybook)

```bash
# Start Storybook
npm run storybook

# Storybook opens at http://localhost:6006
# Click on component to see all stories
# Use Addons → Accessibility to check contrast (WCAG AA)
```

**What to verify in Storybook:**
- ✅ All variants visible
- ✅ All sizes visible
- ✅ Dark mode story renders correctly
- ✅ Text is readable (sufficient contrast)
- ✅ Responsive on mobile (use Viewport addon)

### 3. Dark Mode Testing

Test BOTH dark mode methods:

#### Method 1: System Dark Mode (@media)
```bash
# In DevTools:
1. Ctrl+Shift+I (open DevTools)
2. Ctrl+Shift+P (command palette)
3. Search: "Emulate CSS media feature prefers-color-scheme"
4. Select: dark
5. Check component colors changed
```

#### Method 2: Manual Toggle (data-theme)
```bash
# In app/browser:
1. Click ThemeToggle component
2. Verify [data-theme="dark"] applied to <html>
3. Check component colors match dark palette
4. Refresh page → verify localStorage persisted
```

### 4. Accessibility Testing

In Storybook:
1. Open Addons panel (right side)
2. Click "Accessibility" tab
3. Check for violations:
   - ✅ Contrast ratio >= 4.5:1 (WCAG AA)
   - ✅ All interactive elements keyboard accessible
   - ✅ Focus indicators visible

---

## Dark Mode Support

### Two Methods (Both Required)

#### 1. System Dark Mode (@media)
Automatically applied when user's OS is in dark mode.

```css
/* In tokens.yaml, define dark mode values */
colors:
  primary:
    light: "#007acc"
    dark: "#0098ff"
```

This generates:
```css
/* app/globals.css */
:root {
  --color-primary: #007acc;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #0098ff;
  }
}
```

#### 2. Manual Toggle ([data-theme])
User can manually override using ThemeToggle component.

```tsx
// In component, test both modes:
<button
  className={cn(
    "bg-[var(--color-primary)]", // Works with both @media and [data-theme]
    "text-white"
  )}
>
  Click me
</button>
```

### Testing Checklist

- [ ] System dark mode works (@media prefers-color-scheme: dark)
- [ ] Manual toggle works ([data-theme="dark"])
- [ ] Manual override beats system preference
- [ ] Colors are readable in both modes (contrast >= 4.5:1)
- [ ] Storybook "DarkMode" story shows component correctly
- [ ] localStorage persists theme choice across refreshes
- [ ] No hardcoded colors (all from CSS variables)

---

## Quality Checklist

Before committing ANY component:

### Code Quality
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] No console errors or warnings
- [ ] Uses CSS variables (no hardcoded colors)

### Testing
- [ ] `npm test` passes all component tests
- [ ] Component has unit tests
- [ ] Component has Storybook stories (5+ variants)
- [ ] Storybook auto-discovers component

### Dark Mode
- [ ] Tested with @media (prefers-color-scheme: dark)
- [ ] Tested with [data-theme="dark"] manual toggle
- [ ] Colors readable in both modes
- [ ] DarkMode story in Storybook

### Accessibility (WCAG AA minimum)
- [ ] Text contrast >= 4.5:1
- [ ] Interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] No color-only information conveying meaning
- [ ] Form labels associated with inputs

### Documentation
- [ ] Storybook stories have clear names
- [ ] Component props documented (JSDoc)
- [ ] Usage examples in Storybook

---

## Common Tasks

### Add New Variant to Existing Component

```tsx
// src/components/ui/Button.tsx

const buttonVariants = cva(..., {
  variants: {
    variant: {
      primary: "...",
      secondary: "...",
      outline: "border-2 border-[var(--color-primary)] text-[var(--color-primary)]", // NEW
    },
  },
});
```

Then add story:
```tsx
// src/components/ui/Button.stories.tsx
export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};
```

### Add Dark Mode to Component

```tsx
// Ensure you use CSS variables (not hardcoded colors)
const buttonVariants = cva(
  "bg-[var(--color-primary)] text-[var(--color-text)]",
  // ...
);

// tokens.yaml handles the rest
// Colors auto-change with @media and [data-theme]
```

### Use Token in Component

```tsx
// ✅ Correct: CSS variables
className="bg-[var(--color-primary)] p-[var(--spacing-4)]"

// ✅ Correct: Tailwind with variables
className={cn(
  "bg-[var(--color-primary)]",
  "p-4" // Tailwind maps to CSS vars
)}

// ❌ Wrong: Hardcoded values
className="bg-blue-600 p-4"

// ❌ Wrong: No token exists
className="bg-[var(--color-magic)]"
```

### Run Full Quality Check

```bash
# 1. Lint
npm run lint

# 2. Type check
npm run typecheck

# 3. Tests
npm test

# 4. Build
npm run build

# 5. Storybook
npm run storybook
# → Manually verify components render correctly
```

If all pass, you're ready to commit!

```bash
git add src/components/ui/
git commit -m "feat: create Button component with 3 variants [Component]"
```

---

## File Structure

```
src/
└── components/
    ├── ui/                          ← New components here
    │   ├── Button.tsx               ← Component
    │   ├── Button.stories.tsx       ← Storybook (5+ stories)
    │   ├── Button.test.tsx          ← Unit tests
    │   ├── Input.tsx
    │   ├── Input.stories.tsx
    │   └── Input.test.tsx
    └── layout/                      ← Existing layout components
        └── Header.tsx

design-system/
└── tokens/
    ├── tokens.yaml                  ← EDIT HERE for tokens
    └── build/                       ← Generated (auto)
        ├── tokens.css
        ├── tokens.json
        ├── tokens.tailwind.js
        └── tokens.scss
```

---

## Quick Reference

### Add Token
```bash
nano design-system/tokens/tokens.yaml  # Edit
npm run tokens:export                  # Generate
npm run tokens:validate                # Check
git add design-system/tokens/ && git commit -m "feat: add token X [Token Update]"
```

### Create Component
```bash
# 1. Component + Story + Tests
touch src/components/ui/Button.tsx src/components/ui/Button.stories.tsx src/components/ui/Button.test.tsx

# 2. Quality check
npm run lint && npm run typecheck && npm test

# 3. Verify in Storybook
npm run storybook

# 4. Commit
git add src/components/ui/ && git commit -m "feat: create Button component [Component]"
```

### Test Dark Mode
```bash
npm run storybook
# → Find component → DarkMode story
# → DevTools → Emulate dark mode
# → Verify colors change
```

---

## Getting Help

- **Token questions:** See [GOVERNANCE.md](./GOVERNANCE.md) → Section 4 (Dark Mode) and Section 2 (Token Source)
- **Component patterns:** See Button.tsx (POC component in `src/components/ui/`)
- **Testing examples:** See Button.test.tsx
- **Storybook help:** `npm run storybook` then click ? icon

---

**Last Updated:** 2026-04-12  
**Owner:** Solo Fullstack Developer  
**Status:** ✅ Active

— Aria 🎨
