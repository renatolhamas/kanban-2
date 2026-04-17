# Design Tokens — The Digital Atelier v2.0

Quick reference for using design tokens in The Digital Atelier design system.

## 📂 Files in This Directory

| File | Purpose | Use When |
|------|---------|----------|
| **tokens.yaml** | Layered source of truth | Defining tokens, documentation |
| **tokens.json** | JavaScript/TypeScript imports | Frontend code |
| **tokens.css** | CSS custom properties | CSS files, vanilla HTML |
| **tokens.tailwind.js** | Tailwind config | Tailwind v4 projects |
| **TOKEN-EXTRACTION-REPORT.md** | Full token inventory | Reference, coverage report |
| **README.md** | This file | Quick start guide |

---

## 🎨 Using Tokens in Code

### Option 1: CSS Custom Properties (Recommended for CSS/Tailwind)

```css
/* In your CSS file */
@import url('./tokens.css');

.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-ambient);
}
```

### Option 2: JavaScript/TypeScript Imports

```js
import tokens from './tokens.json';

const primaryColor = tokens.semantic.color.primary;
// → #0d631b

const spacing = tokens.spacing.md;
// → 16px

const buttonStyles = tokens.component.button.primary;
// → { background: '#0d631b', foreground: '#ffffff', ... }
```

### Option 3: Tailwind CSS Classes

Update `tailwind.config.js`:
```js
const tokens = require('./docs/design-system/tokens/tokens.tailwind.js');

module.exports = {
  theme: { extend: tokens }
};
```

Then use in HTML/JSX:
```jsx
<button className="bg-primary text-white px-6 py-3 rounded-full shadow-ambient">
  Click me
</button>
```

---

## 🎨 Color Tokens

### Primary Brand
```
--color-primary:           #0d631b  ← Main brand color
--color-primary-hover:     #2e7d32  ← Hover state
--color-primary-container: #2e7d32  ← Container background
```

### Surfaces (Tonal Layering)
```
--color-surface:               #f7f9fc  ← Base background
--color-surface-container-low: #f2f4f7  ← Subtle layer
--color-surface-container-high: #e6e8eb ← Strong layer
```

### Text
```
--color-text-primary:   #191c1e  ← Body text
--color-text-secondary: #40493d  ← Captions
--color-text-inverse:   #ffffff  ← Text on dark
```

### Status
```
--color-error:    #ba1a1a  ← Errors/destructive
--color-success:  #0d631b  ← Success (uses primary)
--color-warning:  #2e7d32  ← Warning (uses primary-container)
```

---

## 📏 Spacing System

7-point scale (4px base):

```
--space-xs:  4px   ← Micro spacing
--space-sm:  8px   ← Small gaps
--space-md:  16px  ← Default/padding
--space-lg:  24px  ← Large padding
--space-xl:  32px  ← Section spacing
--space-2xl: 48px  ← Large spacing
--space-3xl: 64px  ← XL spacing
```

### Use Cases
- **xs/sm:** Gaps between inline elements
- **md:** Default padding, small components
- **lg:** Card padding, button padding
- **xl+:** Section margins, large components

---

## 🔢 Border Radius Scale

```
--radius-xs:   0.125rem (2px)    ← Subtle curve
--radius-base: 0.5rem (8px)      ← Standard
--radius-md:   0.75rem (12px)    ← Rounded
--radius-lg:   1rem (16px)       ← Fully rounded
--radius-full: 9999px            ← Pill shape
```

---

## 📝 Typography

### Available Styles
```
Headline LG:  2.25rem, bold
Headline MD:  1.5rem, semibold
Headline SM:  1.125rem, semibold
Body MD:      1rem, normal (default)
Label SM:     0.75rem, semibold, uppercase
```

### Using Typography Classes

CSS:
```css
h1 { @apply headline-lg; }
h2 { @apply headline-md; }
p { @apply body-md; }
.label { @apply label-sm; }
```

Tailwind:
```jsx
<h1 className="text-headline-lg font-bold">Title</h1>
<p className="text-body-md font-normal">Body</p>
<span className="text-label-sm font-semibold">Label</span>
```

---

## 🧩 Component Tokens

### Button
```
Primary:
  background: #0d631b
  foreground: #ffffff
  padding: 16px 24px
  radius: full (pill)
  shadow: ambient

Secondary:
  background: #e6e8eb
  foreground: #191c1e
  padding: 16px 24px
  radius: full

Ghost:
  background: transparent
  foreground: #40493d
  padding: 8px 16px
```

**Usage:**
```jsx
<button className="bg-primary text-white px-6 py-3 rounded-full shadow-ambient">
  Primary
</button>

<button className="bg-surface-container-high text-on-surface px-6 py-3 rounded-full">
  Secondary
</button>
```

### Card
```
background: #ffffff
padding: 24px
radius: md (12px)
shadow: ambient
accent-bar: 4px solid #2e7d32 (left side)
```

### Input
```
background: #e6e8eb
foreground: #191c1e
padding: 16px
border: none (editorial)
border-bottom-focus: 2px solid #0d631b
radius: xs (2px)
```

---

## 🎭 Shadow (Elevation)

```
--shadow-ambient: 0px 12px 32px rgba(25, 28, 30, 0.06)
```

Used on:
- Buttons (primary actions)
- Cards
- Glass panels
- Elevated surfaces

---

## 🌈 Design Principles Implemented

### ✅ Tonal Layering
No 1px borders. Depth through **background color shifts**.

```
Lightest: #f7f9fc (surface)
  ↓
Light:    #f2f4f7 (container-low)
  ↓
Medium:   #ecf0f3 (container)
  ↓
Dark:     #e6e8eb (container-high)
  ↓
Darkest:  #e0e3e6 (container-highest)
```

### ✅ Atomic Design
Tokens compose from atoms → molecules → organisms:

- **Atoms:** Button, Input, Text
- **Molecules:** Form Field, Card
- **Organisms:** Column, Header, Panel
- **Templates:** Kanban, Settings, Login
- **Pages:** Production Pipeline, Workspace

### ✅ Semantic Naming
Intent-based names, not color-based:

```
✅ Better:  --color-primary, --color-text-primary
❌ Avoid:   --color-blue-500, --color-text-blue
```

---

## 🔄 Token Layers

### Layer 1: Core (Primitives)
Raw values — source of truth.
```yaml
core:
  color:
    primary: "#0d631b"
  spacing:
    md: "16px"
```

### Layer 2: Semantic (Aliases)
Meaning-based names. Reference Layer 1.
```yaml
semantic:
  color:
    primary: "{layers.core.color.primary}"
    text-primary: "{layers.core.color.on-surface}"
```

### Layer 3: Component (Composites)
Component-specific. Reference Layers 1 & 2.
```yaml
component:
  button:
    primary:
      background: "{layers.semantic.color.primary}"
      foreground: "{layers.semantic.color.text-inverse}"
```

---

## 📊 Token Statistics

| Category | Count |
|----------|-------|
| Colors | 32 (18 core + 14 semantic) |
| Spacing | 7 |
| Border Radius | 6 |
| Font Sizes | 5 |
| Font Weights | 6 |
| Line Heights | 3 |
| Shadows | 2 |
| **Total** | **75+** |

**Coverage:** 100% of design-system-v2.html

---

## 🔗 Token References in Design System v2

| Component | Tokens Used |
|-----------|-------------|
| **Button (Primary)** | color-primary, space-lg, radius-full, shadow-ambient |
| **Button (Secondary)** | color-surface-container-high, space-lg, radius-full |
| **Card** | color-surface-bright, space-lg, radius-md, shadow-ambient |
| **Input** | color-surface-container-high, space-md, radius-xs |
| **Header** | typography-headline-md, space-lg |
| **Navigation** | color-inverse-surface, color-text-inverse |
| **Sidebar** | color-inverse-surface, space-md |

---

## 🚀 Quick Start

### 1. CSS Only
```css
@import url('./tokens.css');

button {
  background: var(--color-primary);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-full);
}
```

### 2. Tailwind
```js
// tailwind.config.js
const tokens = require('./docs/design-system/tokens/tokens.tailwind.js');
module.exports = { theme: { extend: tokens } };
```

### 3. JavaScript
```js
import tokens from './tokens.json';
const primaryColor = tokens.semantic.color.primary;
```

---

## 📚 Further Reading

- **Full Inventory:** See `TOKEN-EXTRACTION-REPORT.md`
- **Layered Structure:** See `tokens.yaml`
- **Design Principles:** See `design-system-v2.html`

---

## 🎨 Next Phase

Ready to build components?

```bash
*build button
*build input
*build card
```

Components will:
- Use these tokens
- Support responsive variants
- Include TypeScript types
- Have Storybook stories
- Include unit tests

---

Generated by Uma (UX-Design Expert)  
Last Updated: 2026-04-16  
Version: 2.0.0
