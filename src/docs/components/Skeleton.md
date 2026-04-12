# Skeleton Component

## Overview

A loading placeholder component that shows a shimmer animation while content is being fetched. Helps improve perceived performance and user experience during loading states.

## Usage

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export function Demo() {
  const [isLoading, setIsLoading] = useState(true);

  return isLoading ? (
    <div className="space-y-2">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>
  ) : (
    <div>Actual content</div>
  );
}
```

## Examples

### Skeleton Card

```tsx
<div className="space-y-3 p-4 border rounded">
  <Skeleton className="h-6 w-[200px]" />
  <Skeleton className="h-4 w-[300px]" />
  <Skeleton className="h-4 w-[250px]" />
</div>
```

### Skeleton Avatar + Text

```tsx
<div className="flex items-center gap-4">
  <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
  <div className="flex-1 space-y-2">
    <Skeleton className="h-4 w-[200px]" />
    <Skeleton className="h-3 w-[150px]" />
  </div>
</div>
```

### Skeleton List

```tsx
<div className="space-y-2">
  {Array.from({ length: 5 }).map((_, i) => (
    <Skeleton key={i} className="h-10 w-full" />
  ))}
</div>
```

## Props

```typescript
interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  // Any standard div attributes
}
```

## Styling

Customize skeleton appearance with Tailwind classes:

```tsx
// Circular skeleton
<Skeleton className="h-20 w-20 rounded-full" />

// Rectangular skeleton
<Skeleton className="h-12 w-full" />

// Animated skeleton (default)
<Skeleton className="h-4 w-[250px] animate-pulse" />
```

## Accessibility

✓ **Loading Indicator** — Consider adding aria-label="Loading..."  
✓ **Alternative Text** — Use with loading spinners for clarity  
✓ **Animation** — Respectful of prefers-reduced-motion  

## Design Tokens Used

- `--color-bg-subtle` — Skeleton background color
- `--animation-duration-normal` — Pulse animation speed
- `--radius-md` — Optional border radius

## Related Components

- [Spinner](./Spinner.md) — Circular loading indicator
- [Card](./Card.md) — Container for skeleton layouts
- [Button](./Button.md) — Disable during loading

---

*Component location: `src/components/ui/skeleton.tsx`*
