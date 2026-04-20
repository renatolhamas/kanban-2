import * as React from "react"
import { cn } from "@/lib/utils"

export interface KanbanBoardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const KanbanBoard = React.forwardRef<HTMLDivElement, KanbanBoardProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full gap-6 p-4 overflow-x-auto scrollbar-thin scrollbar-thumb-surface-container scrollbar-track-transparent bg-surface-container-lowest",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

KanbanBoard.displayName = "KanbanBoard"
