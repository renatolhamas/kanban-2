# Badge Component

## Overview

A small, inline label component for displaying status, tags, or categories. Lightweight and highly composable.

## Usage

```tsx
import { Badge } from "@/components/ui/badge";

export function Demo() {
  return (
    <>
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </>
  );
}
```

## Variants

| Variant | Use Case |
|---------|----------|
| **default** | Primary status badges |
| **secondary** | Secondary or neutral badges |
| **destructive** | Error, warning, or critical status |
| **outline** | Low emphasis, outline style |

## Examples

### Status Badge

```tsx
const status = "active";

return (
  <div className="flex items-center gap-2">
    <span>User Status:</span>
    <Badge variant={status === "active" ? "default" : "secondary"}>
      {status.toUpperCase()}
    </Badge>
  </div>
);
```

### Tag List

```tsx
const tags = ["React", "TypeScript", "Tailwind"];

return (
  <div className="flex gap-2 flex-wrap">
    {tags.map(tag => (
      <Badge key={tag} variant="outline">
        {tag}
      </Badge>
    ))}
  </div>
);
```

### Category Badge

```tsx
<div className="space-y-2">
  <Badge>Feature</Badge>
  <Badge variant="destructive">Bug</Badge>
  <Badge variant="secondary">Documentation</Badge>
</div>
```

## Props

```typescript
interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}
```

## Accessibility

✓ **Semantic Meaning** — Use variant to convey status  
✓ **Text Labels** — Text content is clear without color alone  
✓ **Color Contrast** — All variants meet WCAG AA  

## Design Tokens Used

- `--color-primary`, `--color-error`, `--color-background` — Variant colors
- `--spacing-xs`, `--spacing-sm` — Badge padding
- `--radius-md` — Badge border radius
- `--font-size-sm` — Badge text size

## Related Components

- [Button](./Button.md) — Action elements
- [Card](./Card.md) — Container elements
- [Input](./Input.md) — Tag inputs

---

*Component location: `src/components/ui/badge.tsx`*
