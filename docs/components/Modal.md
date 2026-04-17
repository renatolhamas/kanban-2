# Modal Component

**Category:** Molecule | **Status:** ✅ Production Ready

Modal is a dialog overlay used for focused interactions, forms, or confirmations. It manages its own state and uses native `<dialog>` elements for accessibility.

## Usage

```tsx
import { Modal } from '@/components/ui'
import { useState } from 'react'

const [isOpen, setIsOpen] = useState(false)

<Modal 
  open={isOpen} 
  onOpenChange={setIsOpen} 
  title="Edit Profile"
>
  <p>Form content here...</p>
</Modal>
```

## Features

- **Native Dialog:** Uses the HTML5 `<dialog>` element.
- **Backdrop:** Automatic semi-transparent backdrop.
- **Focus Trap:** Native focus management.
- **Responsive Sizes:** sm, md, lg options.
- **Close Button:** Integrated "X" button and backdrop click-to-close.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Controls visibility |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when visibility changes |
| `title` | `string` | - | Header title |
| `children` | `ReactNode` | - | Main content area |
| `footer` | `ReactNode` | - | Optional footer actions |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Width of the modal |

## Design Tokens Used

- **Colors:** `surface-bright` / `surface-container-highest` (background), `surface-container-low` (borders), `text-primary`
- **Shadows:** `ambient`
- **Border Radius:** `lg` (8px rounded corners)

## Accessibility

✅ **WCAG AA Compliant**

- Native `<dialog>` behavior handles focus trapping and aria roles.
- Keyboard support: `Esc` to close, `Tab` for focus trap.
- Screen reader friendly: Uses semantic headings and buttons.
- ARIA: `aria-label` on close button, `role="dialog"` inferred.

## Examples

### Confirmation Dialog
```tsx
<Modal 
  title="Delete Project?" 
  size="sm"
  footer={
    <div className="flex justify-end gap-2">
      <Button variant="ghost">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  }
>
  <p>This action cannot be undone. Are you sure?</p>
</Modal>
```

### Form in Modal
```tsx
<Modal title="Add New Task">
  <div className="space-y-4">
    <Input placeholder="Task Title" />
    <Button variant="primary" className="w-full">Create Task</Button>
  </div>
</Modal>
```

---

**Last Updated:** 2026-04-17  
**Version:** 1.0.0
