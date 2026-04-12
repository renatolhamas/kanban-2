# Accessibility Guidelines (WCAG AA)

## Overview

All Kanban Design System components meet **WCAG 2.1 Level AA** standards. This guide covers accessibility best practices when using these components.

## Standards & Testing

| Standard | Level | Coverage |
|----------|-------|----------|
| WCAG | 2.1 AA | All components |
| Testing Tools | axe-core | Automated |
| Screen Readers | NVDA, JAWS, VoiceOver | Manual |
| Keyboard Navigation | Full | 100% |

---

## ♿ Core Principles

### 1. Perceivable
Information must be presentable to users in ways they can perceive.

✓ **Color Contrast** — 4.5:1 ratio minimum for text  
✓ **Text Alternatives** — Alt text for images  
✓ **Adaptability** — Content works at any zoom level  

### 2. Operable
Components must be usable with keyboard, mouse, or assistive devices.

✓ **Keyboard Navigation** — All interactive elements keyboard accessible  
✓ **Focus Indicators** — Clear focus outlines  
✓ **No Keyboard Trap** — Users can navigate away from any element  

### 3. Understandable
Content and interactions must be clear and predictable.

✓ **Clear Language** — Simple, direct communication  
✓ **Consistent Navigation** — Predictable interaction patterns  
✓ **Error Prevention** — Clear error messages  

### 4. Robust
Content must be compatible with current and future technologies.

✓ **Semantic HTML** — Proper element structure  
✓ **ARIA Attributes** — When necessary, not overused  
✓ **Web Standards** — Valid HTML, CSS, JavaScript  

---

## 🔑 Keyboard Navigation

All components support full keyboard navigation:

| Key | Action |
|-----|--------|
| **Tab** | Move focus forward |
| **Shift+Tab** | Move focus backward |
| **Enter** | Activate button/link |
| **Space** | Toggle checkbox/radio |
| **Arrow Keys** | Navigate lists/menus |
| **Escape** | Close modal/menu |

### Button Example

```tsx
// ✓ Good: Button supports keyboard interaction
<Button onClick={handleClick}>
  Delete Item
</Button>

// ✓ Keyboard users can:
// 1. Tab to the button
// 2. Press Enter to activate
// 3. See focus indicator
```

### Link Example

```tsx
// ✓ Good: Semantic link with visible focus
<a href="/page" className="focus:outline-2 focus:outline-primary">
  Navigate to Page
</a>
```

---

## 👁️ Screen Reader Support

Use semantic HTML and ARIA when needed:

### Form Example

```tsx
// ✓ Good: Associated label
<label htmlFor="email">Email Address</label>
<Input id="email" type="email" />

// Screen reader announces: "Email Address, edit text, required"
```

### Button with Icon

```tsx
// ✓ Good: Descriptive aria-label
<Button aria-label="Delete this item" variant="destructive">
  <TrashIcon />
</Button>

// Screen reader announces: "Delete this item, button"
```

### Error Message

```tsx
// ✓ Good: Associated error message
<div>
  <Input
    id="email"
    aria-describedby="email-error"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  {!isValidEmail && (
    <span id="email-error" className="text-error text-sm">
      Please enter a valid email address
    </span>
  )}
</div>

// Screen reader announces error when field is focused
```

---

## 🎨 Color & Contrast

### Contrast Ratios

All colors meet minimum contrast requirements:

| Text Type | Ratio | Level |
|-----------|-------|-------|
| Normal text | 4.5:1 | AA |
| Large text | 3:1 | AA |
| Graphics/UI | 3:1 | AA |

### DON'T Rely on Color Alone

```tsx
// ✗ Bad: Using only color to indicate status
<span className="text-red-500">Error</span>

// ✓ Good: Combine color with text and icon
<span className="text-red-500 flex items-center gap-2">
  <AlertIcon /> Error
</span>
```

### Dark Mode

Components automatically support high contrast with dark mode:

```tsx
// Automatically adapts to user preference
<div className="text-primary">
  Text is readable in both light and dark modes
</div>
```

---

## 🔍 Focus Management

### Focus Indicators

All interactive elements have clear, visible focus indicators:

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Tab Order

```tsx
// ✓ Natural tab order follows visual flow
<div>
  <Input placeholder="First" />
  <Input placeholder="Second" />
  <Button>Submit</Button>
</div>

// Tab order: First Input → Second Input → Button
```

---

## 🎯 Common Patterns

### Form Fields

```tsx
function ContactForm() {
  return (
    <div className="space-y-4">
      {/* Each field has label + input + error message */}
      <div>
        <label htmlFor="name">Name *</label>
        <Input
          id="name"
          aria-describedby="name-error"
          required
        />
        <span id="name-error" role="alert" aria-live="polite">
          {/* Error messages announced immediately */}
        </span>
      </div>

      <Button type="submit">Send Message</Button>
    </div>
  );
}
```

### Modal Dialog

```tsx
function Modal() {
  return (
    <div
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      <h2 id="modal-title">Confirm Action</h2>
      <p>Are you sure?</p>
      <Button>Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  );
}
```

---

## 🧪 Testing Accessibility

### Automated Testing

```bash
# Check for accessibility issues
npm run lint

# Run accessibility tests
npm run test
```

### Manual Testing

1. **Keyboard Navigation**
   - Tab through entire page
   - Verify focus is visible
   - Check for keyboard traps

2. **Screen Reader Testing**
   - Use NVDA (Windows) or VoiceOver (Mac)
   - Navigate with arrow keys
   - Verify announcements make sense

3. **Color Contrast**
   - Use axe DevTools browser extension
   - Check high contrast mode
   - Test with colorblindness simulator

---

## 📚 Resources

- **[WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)** — Official standards
- **[Radix UI Accessibility](https://www.radix-ui.com/docs/primitives/overview/accessibility)** — Component accessibility
- **[WebAIM Resources](https://webaim.org/)** — Accessibility education
- **[MDN ARIA Docs](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)** — ARIA reference

---

## ✅ Checklist

Before shipping a feature, verify:

- [ ] Keyboard navigation works fully
- [ ] Focus indicators are visible
- [ ] Color contrast meets 4.5:1 ratio
- [ ] Forms have associated labels
- [ ] Error messages are announced
- [ ] Screen reader testing passed
- [ ] Mobile touch targets are 44x44px+
- [ ] No keyboard traps exist

---

*Accessibility is not an afterthought—it's built in from day one.* ♿
