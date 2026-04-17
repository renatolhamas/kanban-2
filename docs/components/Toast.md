# Toast Component System

**Category:** Molecule | **Status:** ✅ Production Ready

Toast is a feedback notification system for providing non-blocking updates to users.

## Usage

The system requires the `ToastProvider` at the root of your application.

```tsx
// 1. Wrap your app
import { ToastProvider } from '@/components/ui/molecules/toast'

function App() {
  return (
    <ToastProvider>
      <YourContent />
    </ToastProvider>
  )
}

// 2. Use in components
import { useToast } from '@/components/ui/molecules/toast'

function MyComponent() {
  const { success, error } = useToast()
  
  return (
    <Button onClick={() => success('Saved successfully!')}>
      Save
    </Button>
  )
}
```

## API

### useToast() Hook
Returns helper functions to trigger notifications:

- `success(message)`: Green notification for positive outcomes.
- `error(message)`: Red notification for errors.
- `warning(message)`: Yellow/orange notification for alerts.
- `info(message)`: Blue notification for information.
- `addToast(message, type)`: Base function for triggering toasts.

## Current Implementation Status

> [!NOTE]
> The current version of Toast is in **MVP phase**. It implements the React Context and hook architecture, providing console-logged feedback in place of visual UI elements until more complex animation patterns are established.

## Planned Improvements

- Visual overlay container for toast stacking.
- Slide-in / Slide-out animations using CSS or Framer Motion.
- Automatic dismissal after timeout.
- Action buttons within toasts.

---

**Last Updated:** 2026-04-17  
**Version:** 1.0.0
