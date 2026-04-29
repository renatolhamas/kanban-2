import {
  KeyboardCoordinateGetter,
  DroppableContainer,
} from '@dnd-kit/core';

export const kanbanCoordinateGetter: KeyboardCoordinateGetter = (
  event,
  { context: { droppableContainers, collisionRect } }
) => {
  if (
    event.code === 'ArrowRight' ||
    event.code === 'ArrowLeft' ||
    event.code === 'ArrowDown' ||
    event.code === 'ArrowUp'
  ) {
    event.preventDefault();

    if (!collisionRect) {
      return undefined;
    }

    const filteredContainers: DroppableContainer[] = [];

    droppableContainers.forEach((entry) => {
      if (!entry || entry.disabled) {
        return;
      }

      const rect = entry.rect.current;

      if (!rect) {
        return;
      }

      const isColumn = entry.id.toString().startsWith('column-') || entry.id.toString().includes('col');
      // For this specific app, column IDs are UUIDs, but they are the only droppable containers.
      if (isColumn) {
        filteredContainers.push(entry);
      }
    });

    const activeRect = collisionRect;
    
    // Find containers in the direction of the arrow
    const containersInDirection = filteredContainers.filter((entry) => {
      const rect = entry.rect.current;
      if (!rect) return false;

      switch (event.code) {
        case 'ArrowRight':
          return rect.left > activeRect.left;
        case 'ArrowLeft':
          return rect.left < activeRect.left;
        case 'ArrowDown':
          return rect.top > activeRect.top;
        case 'ArrowUp':
          return rect.top < activeRect.top;
      }
      return false;
    });

    // Find the closest one
    const closestContainer = containersInDirection.reduce((closest: DroppableContainer | null, current) => {
      if (!closest) return current;
      const closestRect = closest.rect.current!;
      const currentRect = current.rect.current!;

      const distance = (r1: { left: number; top: number }, r2: { left: number; top: number }) => 
        Math.sqrt(Math.pow(r1.left - r2.left, 2) + Math.pow(r1.top - r2.top, 2));

      if (distance(currentRect, activeRect) < distance(closestRect, activeRect)) {
        return current;
      }
      return closest;
    }, null);

    if (closestContainer) {
      const rect = closestContainer.rect.current!;
      return {
        x: rect.left,
        y: rect.top,
      };
    }
  }

  return undefined;
};
