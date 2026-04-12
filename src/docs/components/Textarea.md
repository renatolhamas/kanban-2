# Textarea Component

## Overview

A multi-line text input component for longer text content. Supports resizing, auto-expansion, and all standard textarea features.

## Usage

```tsx
import { Textarea } from "@/components/ui/textarea";

export function Demo() {
  const [value, setValue] = useState("");

  return (
    <Textarea
      placeholder="Type your message..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

## Examples

### Basic Textarea

```tsx
<Textarea placeholder="Write your comment..." />
```

### With Character Counter

```tsx
const [text, setText] = useState("");
const maxLength = 500;

return (
  <div className="space-y-2">
    <Textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      maxLength={maxLength}
      placeholder="Write something..."
    />
    <p className="text-sm text-gray-500">
      {text.length} / {maxLength}
    </p>
  </div>
);
```

### Disabled State

```tsx
<Textarea disabled value="This is read-only" />
```

## Props

```typescript
interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // Inherits all standard HTML textarea attributes
}
```

## Accessibility

✓ **Label Association** — Always pair with a `<label>` element  
✓ **Keyboard Navigation** — Full keyboard support including resize  
✓ **Screen Readers** — Proper semantic structure  
✓ **Character Limits** — Use maxLength with counter feedback  

## Design Tokens Used

- `--color-border` — Textarea border
- `--color-primary` — Focus border
- `--spacing-sm`, `--spacing-md` — Padding
- `--radius-md` — Border radius

## Related Components

- [Input](./Input.md) — Single-line text input
- [Button](./Button.md) — Submit actions
- [Card](./Card.md) — Container for forms

---

*Component location: `src/components/ui/textarea.tsx`*
