# 8. Coding Standards & Conventions

## 8.1 TypeScript Best Practices

- **Strict mode enabled** in `tsconfig.json` (`strict: true`)
- **No `any` types** — use `unknown` with type guards if needed
- **Explicit return types** for all functions
- **Interfaces over types** for object shapes
- **Const assertions** for literal objects

```typescript
// ✅ Good
interface User {
  id: UUID;
  email: string;
  role: "owner" | "attendant";
}

async function getUser(id: UUID): Promise<User> {
  // ...
}

// ❌ Avoid
const getUser = (id) => {
  // Missing type annotation
  // ...
};
```

## 8.2 File Naming Conventions

| Category   | Pattern                        | Example                                |
| ---------- | ------------------------------ | -------------------------------------- |
| Components | PascalCase + `.tsx`            | `KanbanBoard.tsx`                      |
| Hooks      | `use` prefix + camelCase       | `useConversations.ts`                  |
| Utilities  | camelCase + `.ts`              | `formatPhone.ts`                       |
| API routes | kebab-case + `route.ts`        | `/conversations/[id]/route.ts`         |
| Types      | PascalCase (same as interface) | `User.ts` → `export interface User {}` |

## 8.3 Imports Organization

```typescript
// 1. External packages
import React, { useState, useEffect } from "react";
import { supabase } from "@supabase/auth-helpers-nextjs";

// 2. Absolute imports (@/*)
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/lib/types/database";

// 3. Relative imports
import { Header } from "../layout/Header";
```

## 8.4 Error Handling Pattern

```typescript
// API routes: Always return error response
export async function GET(req: Request) {
  try {
    // ...
  } catch (error) {
    console.error('GET /api/something failed:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Frontend: Use Error Boundary
<ErrorBoundary
  fallback={<div>Something went wrong</div>}
  onError={(error) => console.error(error)}
>
  <YourComponent />
</ErrorBoundary>
```

## 8.5 React Component Patterns

```typescript
// Functional component with TypeScript
interface KanbanBoardProps {
  kanbanId: string;
  onCardClick?: (id: string) => void;
}

export function KanbanBoard({ kanbanId, onCardClick }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>([]);

  useEffect(() => {
    // Load data
  }, [kanbanId]);

  return (
    <div className="kanban-board">
      {/* JSX */}
    </div>
  );
}
```

---
