# Input Component

**Category:** Atom | **Status:** ✅ Production Ready

Text input field with editorial styling (no border, bottom border on focus). Supports error states, helper text, and multiple input types.

## Usage

```tsx
import { Input } from '@/components/ui'

<Input type="text" placeholder="Enter text..." />
```

## Basic Examples

### Text Input
```tsx
<Input type="text" placeholder="Username" />
```

### Email Input
```tsx
<Input type="email" placeholder="user@example.com" />
```

### Password Input
```tsx
<Input type="password" placeholder="Enter password" />
```

### With Helper Text
```tsx
<Input 
  placeholder="Username" 
  helperText="Choose a unique username"
/>
```

### Error State
```tsx
<Input 
  error 
  placeholder="Email" 
  helperText="Email is required"
/>
```

### Disabled
```tsx
<Input disabled placeholder="Disabled input" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | HTML input type | `'text'` | Input type (text, email, password, etc) |
| `placeholder` | `string` | - | Placeholder text |
| `error` | `boolean` | `false` | Show error styling |
| `helperText` | `string` | - | Helper text below input |
| `disabled` | `boolean` | `false` | Disable input |
| `className` | `string` | - | Additional Tailwind classes |

## Design Tokens Used

- **Colors:** `surface-container-high` (background), `primary` (focus border), `error` (error state)
- **Spacing:** `md` (padding)
- **Border Radius:** `xs` (subtle curve)
- **Text:** `text-primary`, `text-secondary`, `on-surface-variant` (placeholder)

## Styling

### Editorial Look
No visible border by default. Border appears on focus:

```css
border-b-2 border-transparent
focus:border-primary
```

This creates a clean, editorial appearance inspired by content platforms.

## Accessibility

✅ **WCAG AA Compliant**

- Keyboard navigation (Tab, Shift+Tab)
- Label support (use with `<label>` tag)
- Error states announced via helper text
- Focus-visible styles
- Jest-axe passes all checks

## Examples

### Form Field Pattern
```tsx
<div className="space-y-2">
  <label htmlFor="email" className="text-label-sm">
    Email Address
  </label>
  <Input 
    id="email"
    type="email" 
    placeholder="user@example.com"
    helperText="We'll never share your email"
  />
</div>
```

### With Validation
```tsx
const [email, setEmail] = useState('')
const [error, setError] = useState(false)

const validateEmail = (value: string) => {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  setError(!isValid && value.length > 0)
}

<Input 
  type="email"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value)
    validateEmail(e.target.value)
  }}
  error={error}
  helperText={error ? "Invalid email address" : "Enter your email"}
/>
```

## Input Types Supported

| Type | Example | Use Case |
|------|---------|----------|
| `text` | `<Input type="text" />` | General text input |
| `email` | `<Input type="email" />` | Email validation |
| `password` | `<Input type="password" />` | Passwords |
| `number` | `<Input type="number" />` | Numbers |
| `tel` | `<Input type="tel" />` | Phone numbers |
| `url` | `<Input type="url" />` | URLs |
| `search` | `<Input type="search" />` | Search fields |

## Testing

Run Storybook to see all variants:
```bash
npm run storybook
```

See interactive examples at `src/components/ui/atoms/input.stories.tsx`

---

**View in Storybook:** [Input Stories](http://localhost:6006/?path=/story/atoms-input--default)
