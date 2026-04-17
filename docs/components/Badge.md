# Badge Component

**Category:** Molecule | **Status:** ✅ Production Ready

Badge is a small status indicator used to highlight metadata, status, or categories.

## Usage

```tsx
import { Badge } from '@/components/ui'

<Badge variant="success">Completed</Badge>
```

## Variants

### Default
Standard neutral tag.

```tsx
<Badge variant="default">Tag</Badge>
```

### Success / Positive
Indicates completion or success.

```tsx
<Badge variant="success">Success</Badge>
<Badge variant="positive">Active</Badge>
```

### Warning
Indicates caution or pending status.

```tsx
<Badge variant="warning">Pending</Badge>
```

### Error
Indicates failure or destructive state.

```tsx
<Badge variant="error">Critical</Badge>
```

### Info
Indicates general information or updates.

```tsx
<Badge variant="info">New</Badge>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'success' \| 'error' \| 'warning' \| 'info' \| 'positive' \| 'neutral'` | `'default'` | Badge style |
| `children` | `ReactNode` | - | Badge content |
| `className` | `string` | - | Additional Tailwind classes |

## Design Tokens Used

- **Colors:** `surface-container-low`, `text-primary`, status-specific colors from tailwind (green, red, yellow, blue)
- **Border Radius:** `full` (pill shape)
- **Typography:** `xs` (extra small font), `medium` (font weight)

## Accessibility

✅ **WCAG AA Compliant**

- High contrast text for all variants
- Semantic structure as a simple inline element
- Screen readers read badge content naturally as part of the context

## Examples

### Task Status
```tsx
<div className="flex gap-2">
  <span>Task #123</span>
  <Badge variant="warning">In Progress</Badge>
</div>
```

### User Roles
```tsx
<Badge variant="info">Admin</Badge>
<Badge variant="default">User</Badge>
```

## Theming

Badges use semantic surface tokens where possible, with hardcoded status colors for better cross-theme visibility.

---

**Last Updated:** 2026-04-17  
**Version:** 1.0.0
