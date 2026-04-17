# Button Component

**Category:** Atom | **Status:** ✅ Production Ready

Button is the fundamental interactive element for user actions. Built with CVA (class-variance-authority) for flexible variants and Radix UI patterns for accessibility.

## Usage

```tsx
import { Button } from '@/components/ui'

<Button variant="primary" size="md">Click me</Button>
```

## Variants

### Primary (Default)
Primary action button for main CTAs.

```tsx
<Button variant="primary">Primary Action</Button>
<Button variant="primary" disabled>Disabled</Button>
<Button variant="primary" loading>Loading...</Button>
```

### Secondary
Secondary action button for supporting actions.

```tsx
<Button variant="secondary">Secondary</Button>
```

### Ghost
Minimal button for tertiary actions.

```tsx
<Button variant="ghost">Ghost Action</Button>
```

### Destructive
Red button for delete/dangerous actions.

```tsx
<Button variant="destructive">Delete</Button>
```

## Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>
```

## States

### Loading
Shows spinner and disables interaction.

```tsx
<Button loading>Loading...</Button>
```

### Disabled
Disabled state with reduced opacity.

```tsx
<Button disabled>Disabled</Button>
```

### With Icon
Supports leading icon.

```tsx
<Button icon={<span>🚀</span>}>Launch</Button>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'destructive'` | `'primary'` | Button style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Show loading spinner |
| `disabled` | `boolean` | `false` | Disable interaction |
| `icon` | `ReactNode` | - | Leading icon |
| `asChild` | `boolean` | `false` | Render as child (Radix pattern) |
| `className` | `string` | - | Additional Tailwind classes |

## Design Tokens Used

- **Colors:** `primary`, `primary-hover`, `surface-container-high`, `error`, `text-inverse`
- **Spacing:** `md`, `lg`, `sm`
- **Border Radius:** `full` (pill shape)
- **Shadows:** `ambient`

## Accessibility

✅ **WCAG AA Compliant**

- Keyboard navigation (Tab, Space, Enter)
- ARIA attributes for state (`aria-disabled`, `aria-busy`)
- Focus-visible styles for keyboard users
- Loading state announced via `aria-busy`
- Jest-axe passes all checks

## Examples

### Form Submit
```tsx
<Button type="submit" variant="primary">
  Submit Form
</Button>
```

### Loading State
```tsx
const [loading, setLoading] = useState(false)

<Button 
  loading={loading}
  onClick={async () => {
    setLoading(true)
    await submitForm()
    setLoading(false)
  }}
>
  Save
</Button>
```

### Icon with Text
```tsx
<Button icon={<span>✨</span>} variant="primary">
  Create New
</Button>
```

## Theming

Buttons automatically adapt to design tokens:

```css
/* Light mode (default) */
.bg-primary → #0d631b
.text-text-inverse → #ffffff

/* Dark mode (via data-theme="dark") */
/* Colors adjust via token overrides */
```

## Testing

Run Storybook to see all variants:
```bash
npm run storybook
```

See interactive examples at `src/components/ui/atoms/button.stories.tsx`

---

**View in Storybook:** [Button Stories](http://localhost:6006/?path=/story/atoms-button--primary)
