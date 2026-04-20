import * as React from "react"
import { cn } from "@/lib/utils"

export interface KanbanColumnProps extends React.HTMLAttributes<HTMLElement> {
  title: string
  count?: number
  children?: React.ReactNode
}

export const KanbanColumn = React.forwardRef<HTMLElement, KanbanColumnProps>(
  ({ title, count, children, className, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          "flex flex-col flex-1 min-w-[320px] max-w-[400px] h-full bg-surface-container-lowest/50 rounded-lg border border-outline-variant",
          className
        )}
        aria-label={`Coluna: ${title}`}
        {...props}
      >
        <header className="flex items-center justify-between p-md bg-surface-container-low border-b border-outline-variant rounded-t-lg sticky top-0 z-10">
          <h3 className="text-title-md font-bold text-text-primary">
            {title}
          </h3>
          {count !== undefined && (
            <span className="flex items-center justify-center min-w-[24px] h-6 px-1.5 text-label-md font-bold bg-neutral-100 dark:bg-neutral-800 text-text-secondary rounded-full border border-outline-variant">
              {count}
            </span>
          )}
        </header>

        <div
          aria-live="polite"
          aria-atomic="false"
          className="flex flex-col p-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-container scrollbar-track-transparent"
        >
          {children}
        </div>
      </section>
    )
  }
)

KanbanColumn.displayName = "KanbanColumn"
