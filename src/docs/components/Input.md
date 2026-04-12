# Input Component

## Overview

A text input component built on native HTML `<input>` with Shadcn/Radix enhancements. Supports multiple input types, validation states, and full accessibility.

## Usage

```tsx
import { Input } from "@/components/ui/input";

export function Demo() {
  const [value, setValue] = useState("");

  return (
    <Input 
      type="email"
      placeholder="your@email.com"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

## Input Types

Supports all standard HTML input types:

```tsx
<Input type="text" placeholder="Text" />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
<Input type="number" placeholder="Number" />
<Input type="tel" placeholder="Phone" />
<Input type="date" />
<Input type="search" placeholder="Search..." />
```

## States

```tsx
<Input placeholder="Default" />
<Input disabled placeholder="Disabled" />
<Input value="Readonly" readOnly />
<Input className="border-red-500" placeholder="Error" />
```

## Props

```typescript
interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // Inherits all standard HTML input attributes
}
```

## Examples

### Email Input with Validation

```tsx
const [email, setEmail] = useState("");
const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

return (
  <div className="space-y-2">
    <Input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Enter your email"
    />
    {email && !isValid && (
      <p className="text-red-500 text-sm">Invalid email</p>
    )}
  </div>
);
```

### Search Input

```tsx
<Input
  type="search"
  placeholder="Search..."
  onChange={(e) => handleSearch(e.target.value)}
/>
```

## Accessibility

✓ **Label Association** — Always use with `<label>` for screen readers  
✓ **Focus Visible** — Clear focus outline on keyboard navigation  
✓ **Error Messages** — Use aria-describedby for error states  
✓ **Placeholder Text** — Not a substitute for labels  

## Design Tokens Used

- `--color-border` — Input border color
- `--color-primary` — Focus border color
- `--spacing-sm`, `--spacing-md` — Input padding
- `--radius-md` — Input border radius

## Related Components

- [Textarea](./Textarea.md) — Multi-line input
- [Button](./Button.md) — Often paired with form submissions
- [Badge](./Badge.md) — For input tags/pills

---

*Component location: `src/components/ui/input.tsx`*
