# 🎨 Pattern Library — Kanban Design System

## Overview

Comprehensive pattern library built on **Atomic Design** methodology with **Radix UI** primitives and **Tailwind CSS** v3 styling.

### Architecture

```
Atoms (Base Components) — button, input, card, badge, etc.
           ↓
Molecules (Simple Combinations) — form-field, card header, etc.
           ↓
Organisms (Complex UI Sections) — panels, dialogs, etc.
           ↓
Templates & Pages (Full interfaces)
```

---

## 🎯 Core Components (8 Atoms)

All components are production-ready, accessible, and fully typed with TypeScript.

| Component | Purpose | Variants |
|-----------|---------|----------|
| **Button** | Primary interactive element | primary, secondary, destructive, ghost, link |
| **Input** | Text input field | default, disabled, error, focus |
| **Card** | Content container | default, elevated, outlined |
| **Textarea** | Multi-line text input | default, disabled, error |
| **Badge** | Status/label indicator | default, secondary, destructive, outline |
| **Skeleton** | Loading placeholder | rectangular, circular, animated |
| **Spinner** | Loading indicator | default, small, large, colored |
| **ThemeToggle** | Light/dark mode switcher | — |

---

## 🎨 Design Tokens

All components use centralized design tokens for consistency:

- **Colors** (18 tokens) — Primitives + semantic aliases
- **Spacing** (8 tokens) — 4px base unit scale
- **Typography** (10 tokens) — Font families, sizes, weights
- **Shadows** (5 tokens) — Elevation levels
- **Radius** (3 tokens) — Corner radius options
- **Animations** (2 tokens) — Duration presets

📖 [View Token Reference](./tokens.md)

---

## ♿ Accessibility (WCAG AA)

All components meet **WCAG 2.1 Level AA** standards:

✓ Keyboard navigation  
✓ Screen reader support (NVDA, JAWS, VoiceOver)  
✓ 4.5:1 color contrast minimum  
✓ Focus indicators  
✓ ARIA attributes  

📖 [View Accessibility Guide](./accessibility.md)

---

## 🚀 Getting Started

### 1. Import a Component

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
```

### 2. Use in Your Code

```tsx
export function LoginForm() {
  const [email, setEmail] = useState("");

  return (
    <div className="space-y-4">
      <Input 
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button onClick={() => console.log(email)}>
        Sign In
      </Button>
    </div>
  );
}
```

### 3. Style with Tokens

```tsx
<div style={{
  color: 'var(--color-text-primary)',
  backgroundColor: 'var(--color-bg-subtle)',
  padding: 'var(--spacing-md)',
  borderRadius: 'var(--radius-md)'
}}>
  Styled with design tokens
</div>
```

### 4. Dark Mode Support

Components automatically adapt to dark mode:

```tsx
<div className="dark">
  {/* Renders in dark theme using CSS variables */}
</div>
```

---

## 📚 Additional Resources

- **[Component Pages](./components/)** — Detailed docs for each component
- **[Token Reference](./tokens.md)** — All design tokens with values
- **[Accessibility Guide](./accessibility.md)** — WCAG compliance details
- **[Getting Started Guide](./getting-started.md)** — Setup and patterns
- **[Storybook](http://localhost:6006/)** — Live component preview

---

## 🏗️ Built With

- **[Shadcn UI](https://ui.shadcn.com/)** — Component library
- **[Radix UI](https://www.radix-ui.com/)** — Accessible primitives
- **[Tailwind CSS](https://tailwindcss.com/)** — Utility CSS
- **[Class Variance Authority](https://cva.style/)** — Component variants
- **[Lucide Icons](https://lucide.dev/)** — Icon library

---

## 📞 Support

For questions or to contribute:

1. Check the [Getting Started](./getting-started.md) guide
2. Review component [accessibility notes](./accessibility.md)
3. Run Storybook for live examples: `npm run storybook`

---

**Kanban Design System v1.0**  
*Built with empathy & data-driven decisions* 🎨
