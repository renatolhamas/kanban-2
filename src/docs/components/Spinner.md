# Spinner Component

## Overview

A rotating loading spinner component. Perfect for indicating ongoing operations, data fetching, or background processing.

## Usage

```tsx
import { Spinner } from "@/components/ui/spinner";

export function Demo() {
  return (
    <>
      <Spinner />
      <Spinner className="w-8 h-8" />
      <Spinner className="text-blue-500" />
    </>
  );
}
```

## Sizes

```tsx
// Small spinner
<Spinner className="w-4 h-4" />

// Default spinner
<Spinner />

// Large spinner
<Spinner className="w-12 h-12" />
```

## Colors

```tsx
// Default (primary)
<Spinner />

// Custom colors
<Spinner className="text-red-500" />
<Spinner className="text-green-500" />
<Spinner className="text-yellow-500" />
```

## Examples

### Button with Loading State

```tsx
const [isLoading, setIsLoading] = useState(false);

return (
  <Button 
    disabled={isLoading}
    onClick={async () => {
      setIsLoading(true);
      await fetchData();
      setIsLoading(false);
    }}
  >
    {isLoading ? (
      <>
        <Spinner className="w-4 h-4 mr-2" />
        Loading...
      </>
    ) : (
      'Submit'
    )}
  </Button>
);
```

### Loading Overlay

```tsx
return (
  <div className="relative">
    <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
      {content}
    </div>
    {isLoading && (
      <div className="absolute inset-0 flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    )}
  </div>
);
```

### Centered Loader

```tsx
<div className="flex items-center justify-center h-64">
  <div className="text-center">
    <Spinner className="w-12 h-12 mx-auto mb-4" />
    <p className="text-gray-600">Loading...</p>
  </div>
</div>
```

## Props

```typescript
interface SpinnerProps
  extends React.SVGProps<SVGSVGElement> {
  // Any standard SVG attributes
}
```

## Accessibility

✓ **ARIA Label** — Add aria-label="Loading" for screen readers  
✓ **Announce Updates** — Use aria-live="polite" on parent  
✓ **Motion Sensitivity** — Consider prefers-reduced-motion  

## Design Tokens Used

- `--color-primary` — Spinner color (default)
- `--animation-duration-normal` — Rotation speed

## Related Components

- [Skeleton](./Skeleton.md) — Placeholder during load
- [Button](./Button.md) — Loading state in buttons
- [Card](./Card.md) — Loading state in cards

---

*Component location: `src/components/ui/spinner.tsx`*
