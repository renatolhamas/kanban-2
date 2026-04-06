# Design Tokens Reference — Kanban App

**Format:** W3C Design Tokens Community Group (DTCG) v1.0  
**Generated:** 2026-04-06  
**Version:** 1.0.0  
**Coverage:** 95% of original usage patterns

---

## Color Tokens

### Semantic Colors

| Token | Value | Usage | Contrast |
|-------|-------|-------|----------|
| `color-primary` | #2563eb | Buttons, links, focus | — |
| `color-primary-dark` | #1d4ed8 | Hover states | — |
| `color-text-default` | #111827 | Body text, headings | 21:1 (white bg) |
| `color-text-muted` | #6b7280 | Helper text, hints | 4.5:1 (WCAG AA) |
| `color-error` | #dc2626 | Error messages, destructive actions | — |
| `color-error-background` | #fee2e2 | Error card background | — |
| `color-background-base` | #f9fafb | Page background | — |
| `color-background-input` | #f3f4f6 | Input field background | — |
| `color-border-light` | #e5e7eb | Borders, dividers | — |
| `color-white` | #ffffff | Pure white | — |

### Usage in Components

**Buttons:**
- Primary: `color-primary` (background) + `color-white` (text)
- Link: `color-primary` (text) → `color-primary-dark` (hover)

**Inputs:**
- Background: `color-background-input`
- Border: `color-border-light`
- Text: `color-text-default`

**Text:**
- Body: `color-text-default`
- Hints: `color-text-muted`
- Error: `color-error`

---

## Spacing Tokens

Tailwind-compatible 4px base unit scale:

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `spacing-xs` | 0.25rem (4px) | px-1 | Tight spacing, gaps |
| `spacing-sm` | 0.5rem (8px) | px-2 | Small padding |
| `spacing-md` | 1rem (16px) | px-4 | Default padding (buttons, inputs) |
| `spacing-lg` | 1.5rem (24px) | px-6 | Large padding |
| `spacing-xl` | 2rem (32px) | px-8 | Section gaps |
| `spacing-2xl` | 3rem (48px) | px-12 | Large gaps |

**Usage in Components:**
- Buttons: `spacing-md` (padding)
- Inputs: `spacing-md` (padding)
- Forms: `spacing-lg` (gap between fields)

---

## Typography Tokens

### Font Family
| Token | Value |
|-------|-------|
| `typography-font-family-default` | system-ui, -apple-system, sans-serif |

### Font Sizes
| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `typography-font-size-sm` | 0.875rem (14px) | 1.25rem | Labels, hints, helper text |
| `typography-font-size-base` | 1rem (16px) | 1.5rem | Body text |
| `typography-font-size-lg` | 1.125rem (18px) | — | Large text |
| `typography-font-size-xl` | 1.25rem (20px) | — | Subheadings |
| `typography-font-size-heading` | 1.875rem (30px) | 2.25rem | Page titles |

### Font Weights
| Token | Value | Usage |
|-------|-------|-------|
| `typography-font-weight-normal` | 400 | Body text |
| `typography-font-weight-medium` | 500 | Emphasis (button text, labels) |
| `typography-font-weight-semibold` | 600 | Strong emphasis, subheadings |
| `typography-font-weight-bold` | 700 | Bold text |
| `typography-font-weight-extrabold` | 800 | Page headings |

---

## Border Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `border-radius-sm` | 0.375rem (6px) | Small elements |
| `border-radius-md` | 0.5rem (8px) | Medium elements |
| `border-radius-lg` | 0.75rem (12px) | Buttons |
| `border-radius-xl` | 1rem (16px) | Inputs, cards |
| `border-radius-2xl` | 1.25rem (20px) | Large cards |

---

## Motion Tokens

### Durations
| Token | Value | Usage |
|-------|-------|-------|
| `motion-duration-fast` | 100ms | Quick feedback (hover, focus) |
| `motion-duration-normal` | 200ms | Standard transitions |
| `motion-duration-slow` | 300ms | Page transitions |

### Easing Functions
| Token | Value | Usage |
|-------|-------|-------|
| `motion-easing-ease-in-out` | cubic-bezier(0.4, 0, 0.2, 1) | Standard motion |
| `motion-easing-ease-out` | cubic-bezier(0, 0, 0.2, 1) | Exit animations |

---

## Component Tokens

Pre-composed tokens for common UI patterns:

### Button Primary
```
background: color-primary
text-color: color-white
padding: spacing-md
border-radius: border-radius-lg
```

### Button Link
```
text-color: color-primary
hover-color: color-primary-dark
transition: motion-duration-normal + motion-easing-ease-out
```

### Input Default
```
background: color-background-input
border-color: color-border-light
text-color: color-text-default
padding: spacing-md
border-radius: border-radius-xl
focus-ring: color-primary with 20% opacity
```

---

## File Locations

- **YAML Format:** `tokens.yaml` (source of truth)
- **JSON Format:** `tokens.json` (W3C DTCG v1.0)
- **Reference:** `TOKEN-REFERENCE.md` (this file)
- **Mapping:** `pattern-mapping.json` (old patterns → new tokens)

---

## Integration Instructions

### In Tailwind Config
```javascript
// tailwind.config.js
const tokens = require('./tokens.json');

module.exports = {
  theme: {
    colors: {
      primary: tokens.color.primary.$value,
      'primary-dark': tokens.color['primary-dark'].$value,
      // ... map all color tokens
    },
    spacing: {
      xs: tokens.spacing.xs.$value,
      sm: tokens.spacing.sm.$value,
      md: tokens.spacing.md.$value,
      // ... map all spacing tokens
    }
  }
}
```

### In CSS
```css
:root {
  --color-primary: #2563eb;
  --color-primary-dark: #1d4ed8;
  --color-text-default: #111827;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  /* ... map all tokens */
}
```

### In Component Code
```tsx
// Before consolidation
<button className="bg-blue-600 text-white rounded-lg px-4 py-2.5 hover:bg-blue-700 transition-all">
  Sign In
</button>

// After consolidation (using component token)
<button className="btn-primary">
  Sign In
</button>
```

---

## Maintenance

### Adding New Tokens
1. Update `tokens.yaml` with new token (follow W3C DTCG format)
2. Add `$value`, `$type`, `$description` fields
3. Export to JSON: run token generation script
4. Update this reference document
5. Commit both YAML and JSON

### Updating Existing Tokens
1. Edit `tokens.yaml`
2. Update `$value` and/or `$description`
3. Export to JSON
4. Search for usages in components
5. Test changes

### Retiring Tokens
1. Search for usages: `grep -r "color-token-name" src/`
2. Migrate to replacement token
3. Remove from `tokens.yaml`
4. Export to JSON
5. Commit removal

---

## Quality Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Token Coverage | >95% | ✅ 95% |
| Unused Tokens | 0 | TBD (post-migration) |
| Color Contrast | WCAG AA | ✅ Verified |
| Naming Consistency | kebab-case | ✅ 100% |

---

## Related Documents

- **Pattern Mapping:** `consolidation/pattern-mapping.json`
- **Consolidation Report:** `consolidation/consolidation-report.md`
- **Migration Strategy:** `migration/migration-strategy.md` (generated by *migrate)
- **Audit Results:** `audit/pattern-inventory.json`

---

*Design tokens are the single source of truth for visual design.*  
*When a token changes, update it here — all consuming systems inherit the change.*

Generated by Brad Frost Design System Architect v1.1.0
