import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { vi } from 'vitest'
import { KanbanSelector } from './KanbanSelector'

const options = [
  { id: 'kb-1', name: 'Vendas' },
  { id: 'kb-2', name: 'Suporte' },
  { id: 'kb-3', name: 'Marketing' },
]

describe('KanbanSelector', () => {
  describe('rendering', () => {
    it('should render all options', () => {
      render(<KanbanSelector options={options} value="kb-1" />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText('Vendas')).toBeInTheDocument()
      expect(screen.getByText('Suporte')).toBeInTheDocument()
      expect(screen.getByText('Marketing')).toBeInTheDocument()
    })

    it('should reflect the selected value', () => {
      render(<KanbanSelector options={options} value="kb-2" />)
      expect(screen.getByRole('combobox')).toHaveValue('kb-2')
    })

    it('should render empty when no options', () => {
      render(<KanbanSelector options={[]} value="" />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  describe('interaction', () => {
    it('should call onValueChange when selection changes', async () => {
      const handler = vi.fn()
      render(<KanbanSelector options={options} value="kb-1" onValueChange={handler} />)
      await userEvent.selectOptions(screen.getByRole('combobox'), 'kb-3')
      expect(handler).toHaveBeenCalledWith('kb-3')
    })
  })

  describe('accessibility attributes', () => {
    it('should accept and pass id prop to select', () => {
      render(<KanbanSelector options={options} value="kb-1" id="kanban-selector" />)
      expect(screen.getByRole('combobox')).toHaveAttribute('id', 'kanban-selector')
    })

    it('should have aria-hidden on the chevron icon', () => {
      const { container } = render(<KanbanSelector options={options} value="kb-1" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('accessibility', () => {
    it('should have no a11y violations', async () => {
      const { container } = render(
        <div>
          <label htmlFor="ks">Selecione o Quadro</label>
          <KanbanSelector options={options} value="kb-1" id="ks" />
        </div>
      )
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
