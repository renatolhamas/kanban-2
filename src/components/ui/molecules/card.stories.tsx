import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'
import { Button } from '../atoms/button'

const meta: Meta<typeof Card> = {
  component: Card,
  title: 'Molecules/Card',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card subtitle or description</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-body-md">This is the card content.</p>
      </CardContent>
    </Card>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>View and edit profile information</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-body-md">John Doe • john@example.com</p>
      </CardContent>
      <CardFooter>
        <Button variant="secondary" size="sm">Cancel</Button>
        <Button variant="primary" size="sm">Save</Button>
      </CardFooter>
    </Card>
  ),
}

export const MultipleCards: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-lg p-lg bg-surface">
      <Card>
        <CardHeader>
          <CardTitle className="text-headline-sm">Card 1</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body-md">First card content</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-headline-sm">Card 2</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body-md">Second card content</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-headline-sm">Card 3</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body-md">Third card content</p>
        </CardContent>
      </Card>
    </div>
  ),
}
