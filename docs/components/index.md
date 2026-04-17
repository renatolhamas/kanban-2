# 🎨 The Digital Atelier v2.0

**Design System Pattern Library**

Welcome to The Digital Atelier — a comprehensive design system built with Atomic Design principles, design tokens, and accessibility-first practices.

---

## 📦 Available Components

### Atoms
Fundamental building blocks:

| Component | Variants | Status |
|-----------|----------|--------|
| **[Button](./Button.md)** | primary, secondary, ghost, destructive | ✅ Ready |
| **[Input](./Input.md)** | text, email, password, etc | ✅ Ready |
| Label | (coming) | 🔄 Planned |
| Icon | (coming) | 🔄 Planned |

### Molecules
Combinations of atoms:

| Component | Purpose | Status |
|-----------|---------|--------|
| **[Card](./Card.md)** | Content container | ✅ Ready |
| **[Badge](./Badge.md)** | Status and metadata tag | ✅ Ready |
| **[Modal](./Modal.md)** | Dialog overlay container | ✅ Ready |
| **[Toast](./Toast.md)** | Feedback notification | ✅ Ready |
| FormField | Label + Input | 🔄 Planned |
| ButtonGroup | Multiple buttons | 🔄 Planned |

### Organisms
Complex UI sections:

| Component | Purpose | Status |
|-----------|---------|--------|
| Header | Navigation bar | 🔄 Planned |
| Sidebar | Side navigation | 🔄 Planned |
| KanbanColumn | Kanban board column | 🔄 Planned |

---

## 🎯 Quick Start

### 1. Import Components
```tsx
import { Button, Input, Card, CardHeader, CardTitle } from '@/components/ui'
```

### 2. Use in Your Code
```tsx
<Card>
  <CardHeader>
    <CardTitle>Welcome</CardTitle>
  </CardHeader>
  <Button variant="primary">Get Started</Button>
</Card>
```

### 3. View in Storybook
```bash
npm run storybook
```

---

## 📚 Documentation

- **[Getting Started](../design-system/GETTING-STARTED.md)** — Setup and basics
- **[Tokens Reference](../design-system/TOKENS-REFERENCE.md)** — Colors, spacing, typography
- **[Accessibility Guide](../design-system/ACCESSIBILITY-GUIDE.md)** — WCAG AA compliance
- **[Setup Summary](../design-system/SETUP-SUMMARY.md)** — Project configuration

---

## 🎨 Design Principles

### Atomic Design
Components organized by complexity:
- **Atoms:** Button, Input, Label
- **Molecules:** Card, FormField (combinations)
- **Organisms:** Header, Kanban (complex)

### Tonal Layering
No 1px borders. Depth through background colors.

### Token-Based
All styling from design tokens. Zero hardcoded values.

### Accessible
WCAG 2.2 AA compliant. Keyboard + screen reader ready.

---

## 🚀 Design System Features

✅ **Token-Based Styling** — Centralized colors, spacing, typography  
✅ **CVA Variants** — Flexible component variants via class-variance-authority  
✅ **Radix UI Patterns** — Composability, accessibility patterns  
✅ **TypeScript Types** — Full type safety and IDE support  
✅ **Storybook Stories** — Interactive component showcase  
✅ **Unit Tests** — Jest + React Testing Library  
✅ **Accessibility** — jest-axe + WCAG AA compliance  
✅ **Documentation** — Comprehensive guides and examples  

---

## 🔧 Development

### Run Tests
```bash
npm test
```

### View Components
```bash
npm run storybook
```

### Check Accessibility
```bash
# Automated checks in tests
npm test -- --testNamePattern="a11y"

# Visual audit in Storybook
npm run storybook
# → Open "Accessibility" tab
```

### Type Check
```bash
npm run typecheck
```

---

## 🎭 Component Showcase

### Button Variants
```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
```

### Button Sizes
```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### Button States
```tsx
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>
<Button icon={<Icon />}>With Icon</Button>
```

### Input Types
```tsx
<Input type="text" placeholder="Text" />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
<Input error helperText="Required field" />
```

### Card Composition
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

---

## 📊 Token Categories

### Colors
Primary, secondary, tertiary, surfaces, text, status colors

### Spacing
7-point scale (4px → 64px) for consistent rhythm

### Typography
5 font sizes, 6 weights, 3 line heights

### Border Radius
6 roundness levels (subtle → pill shape)

### Shadows
Elevation shadow for depth

See: [Tokens Reference](../design-system/TOKENS-REFERENCE.md)

---

## ♿ Accessibility

**WCAG 2.2 Level AA** — All components tested and compliant

✅ Keyboard navigation  
✅ Screen reader support  
✅ Color contrast 4.5:1  
✅ Focus indicators  
✅ ARIA attributes  

See: [Accessibility Guide](../design-system/ACCESSIBILITY-GUIDE.md)

---

## 📦 What's Included

- ✅ 3 Core Components (Button, Input, Card)
- ✅ Design Tokens (colors, spacing, typography)
- ✅ Tailwind CSS Configuration
- ✅ TypeScript Types
- ✅ Storybook Stories
- ✅ Unit Tests with jest-axe
- ✅ Component Documentation
- ✅ Accessibility Guide
- 🔄 Additional Components (coming soon)

---

## 🔗 Resources

- [Storybook](http://localhost:6006) — Interactive components
- [GitHub](https://github.com/synkra/aiox) — Source code
- [Design Tokens](../design-system/TOKENS-REFERENCE.md) — Token documentation
- [Accessibility](../design-system/ACCESSIBILITY-GUIDE.md) — A11Y guidelines

---

## 📝 Version

**The Digital Atelier v2.0**  
Last Updated: 2026-04-16  
Status: ✅ Production Ready

---

**Ready to build?** Start with [Getting Started](../design-system/GETTING-STARTED.md) →
