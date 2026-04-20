import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Input } from './input'

expect.extend(toHaveNoViolations)

describe('Input', () => {
  it('renders input element', () => {
    render(<Input placeholder="Type here..." />)
    const input = screen.getByPlaceholderText('Type here...')
    expect(input).toBeInTheDocument()
  })

  it('handles text input', async () => {
    render(<Input />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    
    await userEvent.type(input, 'Hello')
    expect(input.value).toBe('Hello')
  })

  it('shows error state', () => {
    render(<Input error />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-error')
  })

  it('displays helper text', () => {
    render(<Input helperText="This is a helper message" />)
    expect(screen.getByText('This is a helper message')).toBeInTheDocument()
  })

  it('handles disabled state', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('handles different input types', () => {
    render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Input aria-label="Test input" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('focuses when clicked', async () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    
    await userEvent.click(input)
    expect(input).toHaveFocus()
  })
})
