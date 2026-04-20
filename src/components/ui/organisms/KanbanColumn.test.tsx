import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { KanbanColumn } from './KanbanColumn'

describe('KanbanColumn', () => {
  describe('rendering', () => {
    it('should render the column title', () => {
      render(<KanbanColumn title="Em Andamento" />)
      expect(screen.getByText('Em Andamento')).toBeInTheDocument()
    })

    it('should render count when provided', () => {
      render(<KanbanColumn title="Novo" count={5} />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should not render count when undefined', () => {
      const { container } = render(<KanbanColumn title="Novo" />)
      expect(container.querySelector('span.rounded-full')).not.toBeInTheDocument()
    })

    it('should render children', () => {
      render(
        <KanbanColumn title="Novo">
          <div data-testid="card">Card</div>
        </KanbanColumn>
      )
      expect(screen.getByTestId('card')).toBeInTheDocument()
    })
  })

  describe('semantics', () => {
    it('should render as a section element', () => {
      const { container } = render(<KanbanColumn title="Novo" />)
      expect(container.firstChild?.nodeName).toBe('SECTION')
    })

    it('should have aria-label with column title', () => {
      render(<KanbanColumn title="Resolvido" />)
      expect(screen.getByRole('region', { name: 'Coluna: Resolvido' })).toBeInTheDocument()
    })

    it('should have aria-live on cards container', () => {
      const { container } = render(<KanbanColumn title="Novo" />)
      const liveRegion = container.querySelector('[aria-live="polite"]')
      expect(liveRegion).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have no a11y violations', async () => {
      const { container } = render(
        <KanbanColumn title="Em Andamento" count={3}>
          <div>Card content</div>
        </KanbanColumn>
      )
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
