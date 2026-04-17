import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'

expect.extend(toHaveNoViolations)

describe('Card', () => {
  it('renders card container', () => {
    render(<Card data-testid="card">Content</Card>)
    expect(screen.getByTestId('card')).toBeInTheDocument()
  })

  it('renders with header and title', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
      </Card>
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders with description', () => {
    render(
      <Card>
        <CardDescription>Test Description</CardDescription>
      </Card>
    )
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
        <CardContent>Content here</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>
    )
    
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card description')).toBeInTheDocument()
    expect(screen.getByText('Content here')).toBeInTheDocument()
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
      </Card>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
