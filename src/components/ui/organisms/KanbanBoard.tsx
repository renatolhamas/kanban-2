import * as React from "react"
import { cn } from "@/lib/utils"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DropAnimation,
  defaultDropAnimationSideEffects,
  closestCorners,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { kanbanCoordinateGetter } from "@/lib/dnd-coordinates"

export interface KanbanBoardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDragStart' | 'onDragEnd'> {
  children?: React.ReactNode
  onDragStart?: (event: DragStartEvent) => void
  onDragEnd?: (event: DragEndEvent) => void
  activeOverlay?: React.ReactNode
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
}

export const KanbanBoard = React.forwardRef<HTMLDivElement, KanbanBoardProps>(
  ({ children, className, onDragStart, onDragEnd, activeOverlay, ...props }, ref) => {
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 5, // [Dex] Prevents accidental drag during horizontal scroll
        },
      }),
      useSensor(TouchSensor, {
        activationConstraint: {
          delay: 250,
          tolerance: 5,
        },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: kanbanCoordinateGetter, // [Dex] Custom jumping between columns
      })
    )

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
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
        
        <DragOverlay dropAnimation={dropAnimation}>
          {activeOverlay ? activeOverlay : null}
        </DragOverlay>
      </DndContext>
    )
  }
)

KanbanBoard.displayName = "KanbanBoard"
