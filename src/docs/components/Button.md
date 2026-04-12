# Button Component

## Overview

A versatile button component built on Radix UI primitives. Supports multiple variants for different use cases: primary actions, secondary actions, destructive operations, ghost buttons, and text links.

## Usage

```tsx
import { Button } from "@/components/ui/button";

export function Demo() {
  return (
    <>
      <Button>Click me</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button disabled>Disabled</Button>
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
    </>
  );
}
```

## Variants

| Variant | Use Case | Example |
|---------|----------|---------|
| **default** | Primary actions | Submit, Create, Save |
| **secondary** | Secondary actions | Cancel, Back, More |
| **destructive** | Dangerous actions | Delete, Remove, Discard |
| **ghost** | Low emphasis | Help, Settings, Expand |
| **link** | Text-like buttons | Links, navigation |

## Sizes

- **sm** — Small buttons for compact layouts
- **default** — Standard button size
- **lg** — Large buttons for touch-friendly interfaces

## Props

```typescript
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'sm' | 'default' | 'lg';
  asChild?: boolean;
}
```

## Examples

### Primary Action

```tsx
<Button onClick={() => saveData()}>
  Save Changes
</Button>
```

### Destructive with Confirmation

```tsx
const [confirmed, setConfirmed] = useState(false);

return confirmed ? (
  <Button 
    variant="destructive" 
    onClick={() => deleteItem()}
  >
    Confirm Delete
  </Button>
) : (
  <Button 
    variant="destructive" 
    onClick={() => setConfirmed(true)}
  >
    Delete Item
  </Button>
);
```

### Link-style Button

```tsx
<Button variant="link" asChild>
  <a href="/help">Need help?</a>
</Button>
```

## Accessibility

✓ **Keyboard Navigation** — Full keyboard support with focus indicators  
✓ **Screen Readers** — Proper button semantics and ARIA labels  
✓ **Focus Management** — Clear focus indicators on keyboard navigation  
✓ **Disabled State** — Properly disabled buttons are not focusable  

## Design Tokens Used

- `--color-primary` — Primary button background
- `--color-primary-hover` — Primary button hover state
- `--spacing-sm`, `--spacing-md` — Button padding
- `--radius-md` — Button border radius

## Related Components

- [Link](./Link.md) — For text navigation
- [Badge](./Badge.md) — For status indicators
- [Card](./Card.md) — Often contains buttons

---

*Component location: `src/components/ui/button.tsx`*
