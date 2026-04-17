# Getting Started with The Digital Atelier

Welcome to **The Digital Atelier v2.0** — Design System for Synkra AIOX

## Quick Start (2 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Import Components
```tsx
import { Button, Input, Card, CardHeader, CardTitle } from '@/components/ui'

export default function App() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
      <Button variant="primary">Get Started</Button>
    </Card>
  )
}
```

### 3. View in Storybook
```bash
npm run storybook
```

Visit **http://localhost:6006** to see all components and variations.

---

## Design Philosophy

### 🎨 Atomic Design
Components organized by complexity:
- **Atoms:** Button, Input, Label (standalone)
- **Molecules:** Card, FormField (combinations)
- **Organisms:** Header, Navigation, Kanban (complex sections)

### 🎭 Tonal Layering
No 1px borders. Depth created through background color shifts.

```
Lightest  → #f7f9fc  (surface)
Light     → #f2f4f7  (container-low)
Medium    → #ecf0f3  (container)
Dark      → #e6e8eb  (container-high)
Darkest   → #e0e3e6  (container-highest)
```

### 🎯 Token-Based Styling
Everything from design tokens. Zero hardcoded values.

```tsx
// ✅ Good: uses design tokens
<button className="bg-primary px-lg py-md rounded-full">

// ❌ Bad: hardcoded values
<button style={{ background: '#0d631b', padding: '24px' }}>
```

---

## Core Concepts

### 1. Design Tokens
Colors, spacing, typography defined centrally.

```tsx
import tokens from '@/tokens'

tokens.colors.primary        // #0d631b
tokens.spacing.lg            // 24px
tokens.borderRadius.full     // 9999px
```

See: [Tokens Reference](./TOKENS-REFERENCE.md)

### 2. Variants (CVA)
Components support multiple variants via `class-variance-authority`.

```tsx
<Button variant="primary" size="lg" loading>
  Loading...
</Button>

// Variants: primary | secondary | ghost | destructive
// Sizes: sm | md | lg
// States: loading, disabled
```

### 3. Composition
Build complex UIs from simple components.

```tsx
<Card>
  <CardHeader>
    <CardTitle>My Form</CardTitle>
  </CardHeader>
  <CardContent>
    <Input type="email" placeholder="Email" />
  </CardContent>
  <CardFooter>
    <Button>Submit</Button>
  </CardFooter>
</Card>
```

---

## Component Library

### Atoms (Ready)
- **Button** — Interactive actions (4 variants, 3 sizes)
- **Input** — Text field with error support
- Coming: Label, Icon, Badge, Skeleton

### Molecules (Ready)
- **Card** — Container with header/footer
- Coming: FormField, ButtonGroup, Navigation

### Organisms (Planned)
- Header, Sidebar, Kanban Column

### Page Layouts (Planned)

---

## Using Components

### Import
```tsx
import { Button, Input, Card } from '@/components/ui'
```

### Props
All components accept standard HTML attributes:

```tsx
<Button 
  variant="primary"           // Custom prop
  size="lg"                   // Custom prop
  className="mt-4"            // HTML attribute
  onClick={() => alert('✨')} // Event handler
  disabled                    // HTML attribute
>
  Click me
</Button>
```

### Type Safety
All components are fully typed in TypeScript:

```tsx
import type { ButtonProps } from '@/components/ui'

const MyButton: React.FC<ButtonProps> = (props) => (
  <Button {...props} />
)
```

---

## Tailwind CSS Integration

### Color Classes
```tsx
// Primary brand
<div className="bg-primary text-text-inverse">Primary</div>

// Surfaces
<div className="bg-surface-container-high">Elevated</div>

// Status
<div className="text-error">Error</div>
```

### Spacing Classes
```tsx
// Padding
<div className="px-lg py-md">Padded</div>

// Margin
<div className="mx-sm my-lg">Margin</div>

// Gap (flex/grid)
<div className="flex gap-md">Spaced items</div>
```

### Border Radius
```tsx
<div className="rounded-md">Rounded</div>
<div className="rounded-full">Pill</div>
```

### Shadows
```tsx
<div className="shadow-ambient">Elevated</div>
```

---

## Dark Mode

All design tokens support dark mode:

```css
/* Light mode (default) */
--color-primary: #0d631b

/* Dark mode (via data-theme="dark") */
/* Tokens automatically adjust */
```

Enable dark mode:
```tsx
<html data-theme="dark">
  {/* content */}
</html>
```

---

## Accessibility

All components meet **WCAG 2.2 Level AA**.

✅ Keyboard navigation  
✅ Screen reader support  
✅ Color contrast (4.5:1)  
✅ Focus indicators  

See: [Accessibility Guide](./ACCESSIBILITY-GUIDE.md)

---

## Testing

### Unit Tests
```bash
npm test
```

Components include:
- Render tests
- Interaction tests
- Accessibility tests (jest-axe)
- Snapshot tests

### Visual Testing
```bash
npm run storybook
```

All variants visible and interactive.

### E2E Testing
```bash
npm run playwright
```

---

## File Structure

```
src/
├── components/ui/
│   ├── atoms/
│   │   ├── button.tsx
│   │   ├── button.test.tsx
│   │   ├── button.stories.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── molecules/
│   │   ├── card.tsx
│   │   └── ...
│   ├── organisms/
│   │   └── (coming soon)
│   └── index.ts (exports)
├── tokens/
│   ├── index.ts
│   ├── tokens.yaml
│   └── tokens.json
├── lib/
│   └── utils.ts (cn helper, etc)
└── __tests__/
    └── setup.ts
```

---

## Next Steps

1. **Explore Components** → View in Storybook
2. **Read Component Docs** → See examples and props
3. **Build a Page** → Compose components together
4. **Test** → Run tests, Storybook, E2E

---

## Resources

- [Component Library](./components/)
- [Tokens Reference](./TOKENS-REFERENCE.md)
- [Accessibility Guide](./ACCESSIBILITY-GUIDE.md)
- [Storybook](http://localhost:6006)

---

**Version:** 2.0.0  
**Last Updated:** 2026-04-16
