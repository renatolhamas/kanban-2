# Design Tokens Reference

## Overview

Comprehensive reference of all design tokens used in the Kanban Design System. Tokens are defined as CSS custom properties in `src/app.css` and exported from `src/tokens/tokens.yaml`.

All components use these tokens to ensure consistency across the system.

---

## 🎨 Colors

### Primitives (Base Colors)

```css
/* Neutrals */
--color-neutral-0: #ffffff     /* White */
--color-neutral-50: #f3f3f3    /* Very light gray */
--color-neutral-100: #cccccc   /* Light gray */
--color-neutral-200: #c1c1c1   /* Lighter gray */
--color-neutral-300: #999999   /* Gray */
--color-neutral-500: #616161   /* Dark gray */
--color-neutral-600: #444444   /* Darker gray */
--color-neutral-700: #333333   /* Very dark gray */
--color-neutral-900: #000000   /* Black */

/* Blues (Primary) */
--color-blue-primary: #007acc  /* Branded blue */
--color-blue-light: #3794ff    /* Lighter blue */

/* Status Colors */
--color-red-error: #f14c4c     /* Error red */
--color-red-dark: #e51400      /* Dark red */
--color-green-success: #5f8787 /* Success green */
--color-brown-primary: #d5c4a1 /* Warning brown */
--color-brown-dark: #504945    /* Dark brown */
```

### Semantic Aliases (Meaningful Names)

```css
/* Brand Colors */
--color-primary: var(--color-blue-primary);
--color-primary-hover: var(--color-blue-light);

/* Status Colors */
--color-success: var(--color-green-success);
--color-error: var(--color-red-error);
--color-warning: var(--color-brown-primary);

/* Background & Foreground */
--color-background: var(--color-neutral-0);      /* Page background */
--color-foreground: var(--color-neutral-900);    /* Text on background */
--color-border: var(--color-neutral-200);        /* Borders */

/* Text Hierarchy */
--color-text-primary: var(--color-neutral-900);   /* Main text */
--color-text-secondary: var(--color-neutral-600); /* Secondary text */
--color-text-tertiary: var(--color-neutral-500);  /* Tertiary text */

/* Background Variants */
--color-bg-subtle: var(--color-neutral-50);   /* Subtle background */
--color-bg-elevated: var(--color-neutral-0);  /* Elevated background */
```

### Dark Mode

Automatically inverted in dark mode using `@media (prefers-color-scheme: dark)`:

```css
--color-background: var(--color-neutral-900);
--color-foreground: var(--color-neutral-0);
--color-text-primary: var(--color-neutral-0);
--color-text-secondary: var(--color-neutral-500);
```

---

## 📏 Spacing

Based on 4px base unit scale:

```css
--spacing-xs: 4px       /* Micro spacing */
--spacing-sm: 8px       /* Small spacing */
--spacing-md: 16px      /* Default spacing */
--spacing-lg: 24px      /* Large spacing */
--spacing-xl: 32px      /* Extra large */
--spacing-2xl: 48px     /* 2x large */
--spacing-3xl: 64px     /* 3x large */
--spacing-4xl: 80px     /* 4x large */
```

**Usage Examples:**
```tsx
<div style={{ padding: 'var(--spacing-md)' }}>
  Padding: 16px
</div>

<div style={{ marginBottom: 'var(--spacing-lg)' }}>
  Margin bottom: 24px
</div>
```

---

## 🔤 Typography

### Font Families

```css
--font-family-base: system-ui, -apple-system, sans-serif;
--font-family-mono: Menlo, Monaco, monospace;
```

### Font Sizes

```css
--font-size-xs: 12px    /* Extra small text */
--font-size-sm: 14px    /* Small text */
--font-size-base: 16px  /* Body text (default) */
--font-size-md: 18px    /* Medium text */
--font-size-lg: 20px    /* Large text */
--font-size-xl: 24px    /* Extra large */
--font-size-2xl: 28px   /* 2x large */
--font-size-3xl: 32px   /* 3x large */
--font-size-4xl: 40px   /* 4x large */
--font-size-5xl: 48px   /* 5x large */
```

### Font Weights

```css
--font-weight-normal: 400;     /* Regular text */
--font-weight-medium: 500;     /* Medium weight */
--font-weight-semibold: 600;   /* Semi-bold */
--font-weight-bold: 700;       /* Bold text */
```

---

## 🎁 Shadows

Elevation levels for depth:

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-base: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
```

**Usage:**
```tsx
<div style={{ boxShadow: 'var(--shadow-md)' }}>
  Elevated element
</div>
```

---

## 🔘 Border Radius

Corner rounding levels:

```css
--radius: 4px        /* Small corners */
--radius-md: 8px     /* Medium corners */
--radius-lg: 12px    /* Large corners */
```

---

## ⏱️ Animations

```css
--animation-duration-fast: 150ms      /* Quick transitions */
--animation-duration-normal: 300ms    /* Default speed */
--animation-duration-slow: 500ms      /* Slow transitions */

--animation-easing-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--animation-easing-ease-out: cubic-bezier(0, 0, 0.2, 1);
```

---

## 💡 Best Practices

### ✓ DO Use Tokens

```tsx
// ✓ Good: Using design tokens
<div style={{
  color: 'var(--color-text-primary)',
  padding: 'var(--spacing-md)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-sm)'
}}>
  Content
</div>
```

### ✗ DON'T Hardcode Values

```tsx
// ✗ Bad: Hardcoded values
<div style={{
  color: '#000000',
  padding: '16px',
  borderRadius: '4px',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
}}>
  Content
</div>
```

### Using with Tailwind

```tsx
// Tokens work with Tailwind CSS classes
<div className="bg-primary text-white p-4 rounded-lg shadow-md">
  Styled with Tailwind + tokens
</div>
```

---

## 📖 Complete Token List

All tokens defined in: `src/tokens/tokens.yaml`

Exported formats:
- `src/app.css` — CSS variables
- `src/tokens/tokens.json` — W3C Design Tokens JSON
- `src/tokens/index.ts` — TypeScript exports

---

*Design tokens are the single source of truth for consistent styling across Kanban.* 🎨
