# Design Tokens Reference

**The Digital Atelier v2.0** — Complete token documentation

## Color Tokens

### Primary Brand
```
--color-primary: #0d631b          (Deep Forest Green - main actions)
--color-primary-hover: #2e7d32    (Lighter green - hover state)
--color-primary-container: #2e7d32 (Container background)
```

### Surfaces (Tonal Layering)
```
--color-surface: #f7f9fc                  (Base background)
--color-surface-container-low: #f2f4f7    (Subtle layer)
--color-surface-container: #ecf0f3        (Standard layer)
--color-surface-container-high: #e6e8eb   (Strong layer)
--color-surface-container-highest: #e0e3e6 (Darkest layer)
```

### Text Colors
```
--color-text-primary: #191c1e    (Body text)
--color-text-secondary: #40493d  (Secondary text, captions)
--color-text-inverse: #ffffff    (Text on dark backgrounds)
```

### Status Colors
```
--color-error: #ba1a1a              (Errors, destructive)
--color-error-container: #ffdad6    (Error background)
--color-success: #0d631b            (Success feedback)
--color-warning: #2e7d32            (Warning state)
```

## Spacing Scale

**Base Unit: 4px**

```
--space-xs:  4px    (1 unit)
--space-sm:  8px    (2 units)
--space-md:  16px   (4 units) ← default padding
--space-lg:  24px   (6 units) ← card padding
--space-xl:  32px   (8 units) ← section spacing
--space-2xl: 48px   (12 units)
--space-3xl: 64px   (16 units)
```

### Usage
```tsx
// Button padding
padding: var(--space-md) var(--space-lg)  // 16px 24px

// Card padding
padding: var(--space-lg)  // 24px

// Gap between elements
gap: var(--space-sm)  // 8px
```

## Border Radius Scale

```
--radius-xs:   0.125rem (2px)   (Minimal curve)
--radius-base: 0.5rem   (8px)   (Standard)
--radius-md:   0.75rem  (12px)  (Rounded)
--radius-lg:   1rem     (16px)  (Fully rounded)
--radius-full: 9999px           (Pill shape)
```

### Usage
```tsx
border-radius: var(--radius-md)    // 12px
border-radius: var(--radius-full)  // Pill button
```

## Typography

### Font Family
```
--font-primary: Inter, system-ui, -apple-system, sans-serif
```

### Font Sizes
```
--font-size-headline-lg: 2.25rem  (36px) — Large headings
--font-size-headline-md: 1.5rem   (24px) — Section titles
--font-size-headline-sm: 1.125rem (18px) — Subsection titles
--font-size-body-md: 1rem         (16px) — Body text
--font-size-label-sm: 0.75rem     (12px) — Labels, captions
```

### Font Weights
```
--font-weight-light: 300
--font-weight-normal: 400         (default)
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
--font-weight-extrabold: 800
```

### Line Heights
```
--line-height-tight: 1.2    (headings)
--line-height-normal: 1.5   (body text)
--line-height-relaxed: 1.75 (accessible)
```

## Shadows

```
--shadow-ambient: 0px 12px 32px rgba(25, 28, 30, 0.06)
```

Applied to: buttons, cards, elevated surfaces

## Token Hierarchy

### Layer 1: Core (Primitives)
Raw color values, spacing units, typography.
**Source of truth** for all other layers.

### Layer 2: Semantic (Aliases)
Meaning-based names: `primary`, `text-primary`, `surface-high`.
References Layer 1.

### Layer 3: Component (Composites)
Component-specific tokens: `button.primary.background`.
Ready to use in component building.

## How to Use

### CSS Custom Properties
```css
button {
  background: var(--color-primary);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-ambient);
}
```

### Tailwind Classes
```jsx
<button className="bg-primary px-lg py-md rounded-full shadow-ambient">
  Click me
</button>
```

### JavaScript
```ts
import tokens from '@/tokens'

const primaryColor = tokens.colors.primary
const spacing = tokens.spacing.md
```

## Motion & Animation Tokens (Story 5.2)

### Duration Tokens
```
--motion-duration-fast: 100ms      (entrance animations)
--motion-duration-standard: 200ms  (UI state transitions)
--motion-duration-slow: 2000ms     (subtle background pulses)
```

### Easing Functions
```
--motion-easing-ease-out: ease-out       (for entrance effects)
--motion-easing-ease-in-out: ease-in-out (for symmetric animations)
--motion-easing-linear: linear           (for consistent pacing)
```

### ConversationCard Reopen Animation
```
--animation-reopen-entrance-duration: 100ms
--animation-reopen-entrance-easing: ease-out
--animation-reopen-entrance-distance: 20px
--animation-reopen-pulse-duration: 2000ms
--animation-reopen-pulse-easing: ease-in-out
--animation-reopen-pulse-delay: 100ms
--animation-reopen-color-from: surface-container-low
--animation-reopen-color-to: primary-container
```

### ConversationCard Badge Tokens

**Group Indicator:**
```
--badge-group-background: surface-container
--badge-group-foreground: text-primary
--badge-group-border: outline-variant
```

**Status Badges:**
```
Active (no badge):
  --badge-status-active-background: surface-container-low
  --badge-status-active-foreground: text-primary

Archived:
  --badge-status-archived-background: surface-container-high
  --badge-status-archived-foreground: text-secondary

Closed:
  --badge-status-closed-background: error-container
  --badge-status-closed-foreground: text-primary
```

### Usage Example
```css
/* Import animation tokens */
@import 'tokens-animations-export.css';

/* Apply to component */
.conversation-card.--reopen {
  animation:
    animation-reopen-entrance var(--animation-reopen-entrance-duration) var(--animation-reopen-entrance-easing),
    animation-reopen-pulse var(--animation-reopen-pulse-duration) var(--animation-reopen-pulse-easing) var(--animation-reopen-pulse-delay);
}
```

---

## Best Practices

✅ **DO:**
- Always use tokens for colors, spacing, sizing, and animations
- Reference tokens by semantic name (`primary` not `blue-500`)
- Compose tokens for complex patterns
- Use motion tokens for consistent animation timing

❌ **DON'T:**
- Hardcode color values (`#0d631b` → use `primary` instead)
- Use arbitrary Tailwind values (`px-20` → use `px-lg` instead)
- Mix styling approaches (Tailwind + inline CSS)
- Hardcode animation durations (use `--motion-duration-*` instead)

## Token Files

| File | Purpose |
|------|---------|
| `src/tokens/index.ts` | TypeScript exports |
| `src/tokens/tokens.yaml` | YAML source (3-layer structure) |
| `src/tokens/tokens.json` | JSON for consumption |
| `src/tokens/tokens.css` | CSS custom properties |
| `tailwind.config.js` | Tailwind theme configuration |

---

**Last Updated:** 2026-04-16  
**Version:** 2.0.0
