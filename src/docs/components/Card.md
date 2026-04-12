# Card Component

## Overview

A flexible card container for grouping related content. Provides a clean, bordered container with optional shadows and rounded corners.

## Usage

```tsx
import { Card } from "@/components/ui/card";

export function Demo() {
  return (
    <Card>
      <div className="p-4">
        <h3>Card Title</h3>
        <p>Card content goes here.</p>
      </div>
    </Card>
  );
}
```

## Examples

### Basic Card

```tsx
<Card>
  <div className="p-6">
    <h2 className="font-bold">Title</h2>
    <p className="text-gray-600">Content</p>
  </div>
</Card>
```

### Card with Header and Footer

```tsx
<Card>
  <div className="bg-gray-50 p-4 border-b">
    <h3>Header</h3>
  </div>
  <div className="p-4">
    Body content
  </div>
  <div className="bg-gray-50 p-4 border-t">
    Footer
  </div>
</Card>
```

### Card Grid

```tsx
<div className="grid grid-cols-3 gap-4">
  <Card>
    <div className="p-4">Card 1</div>
  </Card>
  <Card>
    <div className="p-4">Card 2</div>
  </Card>
  <Card>
    <div className="p-4">Card 3</div>
  </Card>
</div>
```

## Props

```typescript
interface CardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  // Any standard div attributes
}
```

## Styling

Cards use design tokens for consistent appearance:

```tsx
<Card className="shadow-lg hover:shadow-xl transition-shadow">
  <div className="p-6">
    Content with enhanced shadow
  </div>
</Card>
```

## Accessibility

✓ **Semantic Structure** — Use proper heading hierarchy inside cards  
✓ **Focus Management** — Ensure interactive elements inside are accessible  
✓ **Color Contrast** — Maintain proper contrast in card text  

## Design Tokens Used

- `--color-border` — Card border color
- `--shadow-base`, `--shadow-md` — Card elevation
- `--radius-md` — Card border radius
- `--spacing-md` — Internal padding

## Related Components

- [Button](./Button.md) — Call-to-action in cards
- [Badge](./Badge.md) — Status badges on cards
- [Input](./Input.md) — Forms inside cards

---

*Component location: `src/components/ui/card.tsx`*
