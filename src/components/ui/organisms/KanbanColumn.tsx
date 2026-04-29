import * as React from "react"
import { cn } from "@/lib/utils"
import { useDroppable } from "@dnd-kit/core"

export interface KanbanColumnProps extends React.HTMLAttributes<HTMLElement> {
  id: string
  title: string
  count?: number
  children?: React.ReactNode
}

export const KanbanColumn = React.forwardRef<HTMLElement, KanbanColumnProps>(
  ({ id, title, count, children, className, ...props }, ref) => {
    const { isOver, setNodeRef } = useDroppable({
      id: id,
    })

    return (
      <section
        ref={(node) => {
          setNodeRef(node)
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        className={cn(
          "flex flex-col w-[350px] flex-shrink-0 h-full bg-surface-container-lowest/50 rounded-lg border border-outline-variant transition-colors duration-200",
          isOver && "border-primary border-2 bg-primary/10",
          className
        )}
        aria-label={`Coluna: ${title}`}
        {...props}
      >
        <header className={cn(
          "flex items-center justify-between p-md bg-surface-container-low border-b border-outline-variant rounded-t-lg sticky top-0 z-10",
          isOver && "bg-primary/20 border-primary/30"
        )}>
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
          className="flex-1 flex flex-col p-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-container scrollbar-track-transparent"
        >
          {children}
        </div>
      </section>
    )
  }
)

KanbanColumn.displayName = "KanbanColumn"
