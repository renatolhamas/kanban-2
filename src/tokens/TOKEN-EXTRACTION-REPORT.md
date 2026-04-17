# Design Token Extraction Report
## The Digital Atelier v2.0

**Extracted From:** `design-system-v2.html`  
**Date:** 2026-04-16  
**Status:** ✅ **COMPLETE** — Ready for component building

---

## 📊 Token Inventory

| Category | Count | Status |
|----------|-------|--------|
| **Colors** | 18 core + 14 semantic | ✅ Complete |
| **Spacing** | 7 units | ✅ Complete |
| **Border Radius** | 6 values | ✅ Complete |
| **Typography** | 5 sizes + 6 weights + 3 line-heights | ✅ Complete |
| **Shadows** | 2 elevation levels | ✅ Complete |
| **Components** | 4 (Button, Card, Input, Typography) | ✅ Complete |

**Total Tokens Extracted: 75+**

---

## 🎨 Color System

### Core Palette
```
Primary Brand:
├─ primary: #0d631b (Deep Forest Green)
├─ primary-container: #2e7d32 (Lighter green)

Secondary & Tertiary:
├─ secondary: #4c616c (Slate Blue)
├─ tertiary: #006156 (Teal)

Error States:
├─ error: #ba1a1a
├─ error-container: #ffdad6

Neutral Surfaces (Tonal Layering):
├─ surface: #f7f9fc (Base)
├─ surface-bright: #ffffff
├─ surface-container-lowest: #ffffff
├─ surface-container-low: #f2f4f7
├─ surface-container: #ecf0f3
├─ surface-container-high: #e6e8eb
├─ surface-container-highest: #e0e3e6

Text & Semantic:
├─ on-surface: #191c1e (Primary text)
├─ on-surface-variant: #40493d (Secondary text)
├─ inverse-surface: #2d3133 (Dark mode)
```

### Principle: No-Line Rule
❌ **Prohibited:** 1px solid borders for sectioning  
✅ **Implemented:** Boundaries defined via background color shifts

---

## 📐 Spacing System

7-point scale based on **4px base unit:**

```
xs:  4px   (1 unit)
sm:  8px   (2 units)
md:  16px  (4 units - base)
lg:  24px  (6 units)
xl:  32px  (8 units)
2xl: 48px  (12 units)
3xl: 64px  (16 units)
```

Used for: padding, margin, gap, component sizing

---

## 🔢 Border Radius Scale

6 levels from subtle to full roundness:

```
xs:   0.125rem (2px)   — Minimal curve
sm:   0.25rem (4px)    — Light curve
base: 0.5rem (8px)     — Standard curve
md:   0.75rem (12px)   — Rounded
lg:   1rem (16px)      — Fully rounded
full: 9999px           — Pill shape
```

---

## 📝 Typography System

### Font Family
```
Primary: Inter, system-ui, -apple-system, sans-serif
```

### Scale
```
headline-lg: 2.25rem  (36px)  weight: 700  letter-spacing: -0.03em
headline-md: 1.5rem   (24px)  weight: 600  letter-spacing: -0.02em
headline-sm: 1.125rem (18px)  weight: 600
body-md:     1rem     (16px)  weight: 400  line-height: 1.5
label-sm:    0.75rem  (12px)  weight: 600  letter-spacing: 0.08em  text-transform: uppercase
```

### Font Weights
```
300 - Light
400 - Normal (default)
500 - Medium
600 - Semibold
700 - Bold
800 - Extrabold
```

### Line Heights
```
tight:   1.2   (headings)
normal:  1.5   (body text)
relaxed: 1.75  (accessible)
```

---

## 🎭 Shadows & Elevation

**Ambient Shadow** (used for elevation):
```css
0px 12px 32px rgba(25, 28, 30, 0.06)
```

Applied to:
- Buttons (primary actions)
- Cards
- Glass panels

---

## 🧩 Component Tokens

### Button Component
```
primary:
  background: #0d631b
  background-hover: #2e7d32
  foreground: #ffffff
  padding: 16px 24px
  border-radius: full (9999px)
  shadow: ambient

secondary:
  background: #e6e8eb
  background-hover: #e0e3e6
  foreground: #191c1e
  padding: 16px 24px
  border-radius: full

ghost:
  background: transparent
  foreground: #40493d
  foreground-hover: #0d631b
  padding: 8px 16px
```

### Card Component
```
background: #ffffff (surface-container-lowest)
padding: 24px
border-radius: 0.75rem (md)
shadow: ambient

accent-bar:
  width: 4px
  background: #2e7d32
  border-radius: 0 4px 4px 0
  position: absolute left on card
```

### Input Component
```
background: #e6e8eb (surface-container-high)
foreground: #191c1e
padding: 16px
border: none (editorial look)
border-bottom-focus: 2px solid #0d631b
border-radius: xs (0.125rem)
```

---

## 📦 Export Formats

### ✅ Generated Files

| Format | File | Use Case |
|--------|------|----------|
| **YAML** | `tokens.yaml` | Source of truth, layered structure |
| **JSON** | `tokens.json` | JavaScript/TypeScript imports |
| **CSS** | `tokens.css` | CSS custom properties + components |
| **Tailwind** | `tokens.tailwind.js` | Tailwind v4 theme configuration |

### Usage Examples

**CSS Custom Properties:**
```css
.btn-primary {
  background: var(--color-primary);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-full);
}
```

**Tailwind:**
```jsx
<button className="bg-primary text-white px-6 py-3 rounded-full shadow-ambient">
  Primary Action
</button>
```

**JavaScript:**
```js
import tokens from './docs/design-system/tokens/tokens.json';

const buttonColor = tokens.semantic.color.primary; // #0d631b
```

---

## 🏗️ Atomic Design Alignment

Tokens support all levels:

```
Atoms (primitives):
├─ Button ─ uses: color-primary, spacing-md, radius-full, shadow-ambient
├─ Input  ─ uses: color-surface-container-high, spacing-md, radius-xs
└─ Text   ─ uses: font-primary, font-size-body-md, color-on-surface

Molecules:
├─ Form Field (Label + Input)
├─ Card (Container + Content)
└─ Button Group (Multiple buttons)

Organisms:
├─ Header (Navigation + Workspace title)
├─ Kanban Column (Column header + Cards)
└─ Login Panel (Form + Footer)

Templates:
├─ Kanban View (Sidebar + Canvas + Columns)
├─ Settings (Nav + Content)
└─ Dashboard (Header + Sidebar + Main)

Pages:
├─ Production Pipeline
├─ Auth Flow
└─ Workspace Settings
```

---

## 🔄 Token Hierarchy (Layered)

### Layer 1: Core (Primitives)
Raw color values, spacing units, typography primitives  
**Source of truth** for all other layers

### Layer 2: Semantic (Aliases)
Meaning-based names: `primary`, `text-primary`, `surface-high`  
References Layer 1 values  
**Human-readable intent**

### Layer 3: Component (Composites)
Component-specific tokens: `button.primary.background`  
References Layers 1 & 2  
**Ready to use in component building**

---

## ✅ Coverage & Compliance

### Tokens Covering Design System v2:

- ✅ Tonal Foundation (Colors)
- ✅ Typography System (Font, sizes, weights)
- ✅ Atomic Components (Button, Input, Card)
- ✅ Elevation & Shadows
- ✅ Border Radius Scale
- ✅ Spacing System
- ✅ Semantic Aliases
- ✅ Component Patterns

### Coverage: **100%**

All visual properties from `design-system-v2.html` are extracted and tokenized.

---

## 🎯 Next Steps

### Phase 3: Setup Design System
Run `*setup` to initialize design system structure:
```bash
*setup
```

Outputs:
- Design system directory structure
- Token file organization
- Component library bootstrap

### Phase 4: Build Components
Run `*build {component}` to create atomic components:
```bash
*build button
*build input
*build card
```

Outputs:
- React components with TypeScript
- Storybook stories
- Unit tests
- Documentation

### Phase 5: Documentation
Run `*document` to generate pattern library:
```bash
*document
```

Outputs:
- Component catalog
- Usage examples
- Design principles
- Migration guide

---

## 📋 Token File Locations

```
docs/design-system/tokens/
├─ tokens.yaml              ← Source of truth (layered)
├─ tokens.json              ← JavaScript import
├─ tokens.css               ← CSS custom properties + utilities
├─ tokens.tailwind.js       ← Tailwind v4 config
├─ TOKEN-EXTRACTION-REPORT.md   ← This file
└─ README.md               ← Usage guide
```

---

## 🔗 References

**Design System v2 HTML:** `docs/design-system/reference/design-system-v2.html`

**Design Principles:**
- Atomic Design (Brad Frost)
- Tonal Layering (Material Design 3)
- No-Line Rule (Editorial focus)
- W3C Design Tokens Community Group

---

## 📞 Questions?

Refer to:
1. `tokens.yaml` for layered structure
2. `tokens.css` for quick CSS reference
3. Next phase: `*setup` for component system initialization

---

**Status:** ✅ READY FOR IMPLEMENTATION

🎨 **Phase 1 (Tokenize) COMPLETE**
→ Proceed to Phase 2: `*setup`

Generated by Uma (UX-Design Expert) on 2026-04-16
