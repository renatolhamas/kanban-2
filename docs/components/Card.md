# Card Component

**Category:** Molecule | **Status:** ✅ Production Ready

Card is a container molecule for organizing related content. Composed of Card, CardHeader, CardTitle, CardDescription, CardContent, and CardFooter subcomponents.

## Usage

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

## Subcomponents

### Card
Container wrapper with shadow and accent bar.

```tsx
<Card>
  {/* content */}
</Card>
```

### CardHeader
Header section with padding and spacing.

```tsx
<CardHeader>
  {/* header content */}
</CardHeader>
```

### CardTitle
Large title text using design tokens.

```tsx
<CardTitle>My Title</CardTitle>
```

### CardDescription
Smaller description text, secondary color.

```tsx
<CardDescription>This is a description</CardDescription>
```

### CardContent
Main content area.

```tsx
<CardContent>
  Your content here
</CardContent>
```

### CardFooter
Footer section with border divider and gap spacing.

```tsx
<CardFooter>
  <Button>Cancel</Button>
  <Button variant="primary">Save</Button>
</CardFooter>
```

## Examples

### Simple Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Welcome</CardTitle>
  </CardHeader>
  <CardContent>
    <p>This is a simple card with content.</p>
  </CardContent>
</Card>
```

### Card with Actions
```tsx
<Card>
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
    <CardDescription>Manage your account settings</CardDescription>
  </CardHeader>
  <CardContent>
    <p>John Doe • john@example.com</p>
  </CardContent>
  <CardFooter>
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Save Changes</Button>
  </CardFooter>
</Card>
```

### Card Grid
```tsx
<div className="grid grid-cols-3 gap-lg">
  <Card>
    <CardHeader>
      <CardTitle>Card 1</CardTitle>
    </CardHeader>
    <CardContent>Content</CardContent>
  </Card>
  
  <Card>
    <CardHeader>
      <CardTitle>Card 2</CardTitle>
    </CardHeader>
    <CardContent>Content</CardContent>
  </Card>
  
  <Card>
    <CardHeader>
      <CardTitle>Card 3</CardTitle>
    </CardHeader>
    <CardContent>Content</CardContent>
  </Card>
</div>
```

## Design Tokens Used

- **Colors:** `surface-container-lowest` (background), `primary-container` (accent bar), `text-primary` (title)
- **Spacing:** `lg` (padding), `md` (internal gaps)
- **Border Radius:** `md` (rounded corners)
- **Shadows:** `ambient` (elevation)
- **Borders:** `4px left border` using `primary-container`

## Props

| Component | Props | Description |
|-----------|-------|-------------|
| `Card` | `className` | Additional Tailwind classes |
| `CardHeader` | `className` | Additional Tailwind classes |
| `CardTitle` | `className` | Additional Tailwind classes |
| `CardDescription` | `className` | Additional Tailwind classes |
| `CardContent` | `className` | Additional Tailwind classes |
| `CardFooter` | `className` | Additional Tailwind classes |

All components accept standard React HTML attributes via spread.

## Styling

### Accent Bar
Left border (4px) using primary-container color for visual emphasis:

```css
border-l-4 border-primary-container
```

### Shadow
Uses ambient elevation shadow for depth:

```css
box-shadow: 0px 12px 32px rgba(25, 28, 30, 0.06)
```

## Accessibility

✅ **WCAG AA Compliant**

- Semantic HTML structure
- Proper heading hierarchy (CardTitle uses `<h2>`)
- Content well-organized within sections
- Focus management via composable subcomponents
- Jest-axe passes all checks

## Composition Pattern

Cards are composed using subcomponents for maximum flexibility:

```tsx
// Simple (header only)
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
</Card>

// Full (header, content, footer)
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
  <CardFooter>
    Footer
  </CardFooter>
</Card>

// Custom (only content)
<Card>
  <CardContent>
    Just content
  </CardContent>
</Card>
```

## Testing

Run Storybook to see all variants:
```bash
npm run storybook
```

See interactive examples at `src/components/ui/molecules/card.stories.tsx`

---

**View in Storybook:** [Card Stories](http://localhost:6006/?path=/story/molecules-card--default)
