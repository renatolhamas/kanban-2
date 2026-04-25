import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { KanbanBoard } from './KanbanBoard'

describe('KanbanBoard', () => {
  describe('rendering', () => {
    it('should render children', () => {
      render(
        <KanbanBoard>
          <div data-testid="child">Column</div>
        </KanbanBoard>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<KanbanBoard className="custom-class" />)
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should render as a div', () => {
      const { container } = render(<KanbanBoard />)
      expect(container.firstChild?.nodeName).toBe('DIV')
    })
  })

  describe('accessibility', () => {
    it('should have no a11y violations', async () => {
      const { container } = render(
        <KanbanBoard>
          <div>Column content</div>
        </KanbanBoard>
      )
      // @ts-expect-error jest-axe matcher not recognized by Vitest types
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
