# Getting Started with Kanban Design System

## Welcome! 👋

This guide will help you get up and running with the Kanban Design System in minutes.

---

## ⚡ Quick Start

### 1. Import a Component

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
```

### 2. Use in Your Code

```tsx
export function LoginForm() {
  const [email, setEmail] = useState("");

  return (
    <form className="space-y-4 p-6">
      <Input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit">
        Sign In
      </Button>
    </form>
  );
}
```

### 3. Done! 🎉

That's it! Start building.

---

## 📦 Available Components

### Atoms (Base Components)

- **Button** — Interactive actions
- **Input** — Text input fields
- **Card** — Content containers
- **Textarea** — Multi-line text
- **Badge** — Status indicators
- **Skeleton** — Loading placeholders
- **Spinner** — Loading indicator
- **ThemeToggle** — Dark/light mode

[View Full Component Library →](./index.md)

---

## 🎨 Styling Your Components

### Option 1: Design Tokens (Recommended)

```tsx
<div style={{
  color: 'var(--color-text-primary)',
  backgroundColor: 'var(--color-bg-subtle)',
  padding: 'var(--spacing-md)',
  borderRadius: 'var(--radius-md)'
}}>
  Styled with design tokens
</div>
```

### Option 2: Tailwind CSS

```tsx
<div className="text-primary bg-gray-50 p-4 rounded-lg shadow-md">
  Styled with Tailwind
</div>
```

### Option 3: Combine Both

```tsx
<div
  style={{ color: 'var(--color-text-primary)' }}
  className="bg-gray-50 p-4 rounded-lg"
>
  Hybrid styling
</div>
```

---

## 🌙 Dark Mode

Components automatically adapt to dark mode using CSS variables:

```tsx
// Light mode (default)
<Button>Click me</Button>

// Dark mode (automatically applied when prefers-color-scheme: dark)
// or when [data-theme="dark"] is set on root
<html data-theme="dark">
  <Button>Click me</Button>
</html>
```

---

## 🏗️ Atomic Design Pattern

This design system follows **Atomic Design** methodology:

```
Atoms (smallest)
  ↓ Input, Button, Badge
  
Molecules (combinations)
  ↓ Form-field (Label + Input), Card Header
  
Organisms (complex sections)
  ↓ Form, Dialog, Navigation
  
Templates & Pages (full layouts)
  ↓ Login page, Dashboard page
```

---

## 📝 Common Patterns

### Form with Validation

```tsx
function ContactForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const isValid = name.length > 0 && message.length > 0;

  return (
    <form
      className="space-y-4 p-6 max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        console.log({ name, message });
      }}
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          Message
        </label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your message"
          rows={4}
        />
      </div>

      <Button type="submit" disabled={!isValid}>
        Send Message
      </Button>
    </form>
  );
}
```

### Loading States

```tsx
function DataTable() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData().then(setData).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((item) => (
        <Card key={item.id}>
          <div className="p-4">{item.name}</div>
        </Card>
      ))}
    </div>
  );
}
```

### Status Badges

```tsx
function UserStatus({ user }) {
  const statusColor = {
    active: "default",
    inactive: "secondary",
    suspended: "destructive"
  }[user.status];

  return (
    <div className="flex items-center gap-2">
      <span>{user.name}</span>
      <Badge variant={statusColor}>
        {user.status}
      </Badge>
    </div>
  );
}
```

---

## 🔧 Configuration

### Color Scheme

Set preferred color scheme in your root HTML:

```tsx
// Light mode (default)
<html>
  <body>{/* content */}</body>
</html>

// Dark mode
<html data-theme="dark">
  <body>{/* content */}</body>
</html>
```

### Custom Tokens

Modify design tokens in `src/app.css`:

```css
:root {
  --color-primary: #your-color;
  --spacing-md: 16px;
  /* ... */
}
```

---

## 🧪 Testing

### Unit Tests

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

test('button renders with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

### Accessibility Tests

All components include accessibility built-in:

```bash
# Run tests
npm run test

# Check accessibility
npm run lint
```

---

## 📚 Next Steps

1. **Explore Components** — Browse [Component Library](./index.md)
2. **Understand Tokens** — Review [Design Tokens](./tokens.md)
3. **Learn Accessibility** — Read [Accessibility Guide](./accessibility.md)
4. **Try Storybook** — Run `npm run storybook` for live preview
5. **Build Molecules** — Combine atoms into custom components

---

## 🎯 Best Practices

### ✓ DO

```tsx
// ✓ Use semantic HTML
<label htmlFor="email">Email</label>
<Input id="email" type="email" />

// ✓ Use design tokens
style={{ color: 'var(--color-primary)' }}

// ✓ Combine components
<Card>
  <Input placeholder="Search..." />
  <Button>Search</Button>
</Card>

// ✓ Support dark mode
className="text-foreground bg-background"
```

### ✗ DON'T

```tsx
// ✗ Hardcode colors
style={{ color: '#007acc' }}

// ✗ Hardcode sizing
style={{ padding: '16px' }}

// ✗ Skip accessibility
<button>Click</button>  // Missing aria-label

// ✗ Create custom buttons
<div onClick={handler}>Click</div>  // Use Button component
```

---

## 💡 Tips & Tricks

### Responsive Design

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id}>
      <div className="p-4">{item.name}</div>
    </Card>
  ))}
</div>
```

### Conditional Styling

```tsx
<Button
  variant={isLoading ? "ghost" : "default"}
  disabled={isLoading}
>
  {isLoading ? (
    <>
      <Spinner className="w-4 h-4 mr-2" />
      Loading...
    </>
  ) : (
    "Submit"
  )}
</Button>
```

### Component Composition

```tsx
// Create custom component from primitives
function FormField({ label, ...inputProps }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Input {...inputProps} />
    </div>
  );
}

// Use it
<FormField label="Email" type="email" />
```

---

## 🆘 Need Help?

- **Component Documentation** — [View Individual Components](./components/)
- **Accessibility Issues** — [Accessibility Guide](./accessibility.md)
- **Token Values** — [Token Reference](./tokens.md)
- **Live Examples** — `npm run storybook`

---

## 🚀 You're Ready!

Start building beautiful, accessible interfaces with Kanban Design System! 🎉

*Happy coding!* ✨
