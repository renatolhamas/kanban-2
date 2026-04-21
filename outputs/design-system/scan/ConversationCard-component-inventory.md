# Component Inventory: ConversationCard Scan

**Artifact:** ConversationCard.tsx (Molecule)  
**Scan Date:** 2026-04-21  
**Analyzer:** Uma (UX-Design-Expert)

---

## 📦 Atomic Design Breakdown

### ATOMS (Fundamental Building Blocks)

| Atom | Count | Type | Usage |
|------|-------|------|-------|
| Text (name) | 1 | Typography | Contact name display |
| Text (phone) | 1 | Typography | Phone number display |
| Text (timestamp) | 1 | Typography | Message timestamp |
| Text (lastMessage) | 1 | Typography | Message preview |
| Badge | 1 | Component | Unread count indicator |
| Border | 1 | Visual | Left accent border (4px) |
| Focus Ring | 1 | Visual | Keyboard focus indication |

**Total Atoms:** 7

---

### MOLECULES (Simple Combinations)

| Molecule | Composition | Count | Usage |
|----------|-------------|-------|-------|
| **ConversationCard** | Card + flex layout + text stack | 1 | Card display in kanban |
| **Text Header** | 2 texts (name + timestamp) in flex | 1 | Top section of card |
| **Message Section** | Text + Badge in flex | 1 | Bottom section of card |

**Total Molecules:** 1 standalone molecule (ConversationCard itself)

---

### ORGANISMS

**None** — ConversationCard is consumed by organisms (KanbanColumn), not composed of them.

---

## 🎨 Design Token Usage

### Color Tokens (7 total)

```yaml
semantic_colors:
  text_colors:
    - text-primary: 2 instances (name, lastMessage)
    - text-secondary: 2 instances (phone, timestamp)
  
  surface_colors:
    - surface-container-low: 1 instance (selected state)
    - surface-container-lowest: 1 instance (hover state)
  
  accent_colors:
    - primary-container: 1 instance (selected border)
    - outline-variant: 1 instance (hover border)
    - primary: 1 instance (focus ring)

total_unique_tokens: 7
hardcoded_values: 0 ✅
```

### Typography Tokens (4 distinct levels)

```yaml
typography_hierarchy:
  body-lg:
    font_size: 18px
    font_weight: bold
    usage: Contact name
    instances: 1
  
  body-md:
    font_size: 16px
    usage: Last message text
    instances: 1
  
  body-sm:
    font_size: 16px
    usage: Phone number
    instances: 1
  
  label-sm:
    font_size: 12px
    usage: Timestamp
    instances: 1

token_compliance: ✅ 100%
```

### Spacing Tokens (4 values)

```yaml
spacing_usage:
  4px (space-y-1): vertical gap between sections
  4px (pt-1): padding-top before message section
  16px (pr-4): message text right padding
  auto (ml-auto): badge right alignment

scale_base: 4px ✅
compliance: ✅ 100%
```

### Transition Tokens (1)

```yaml
transitions:
  duration: 200ms
  easing: all properties
  use_case: Smooth state transitions (selected, hover)
```

---

## 🔄 Current Variants

### State-Based Variants

| State | Trigger | Styling Changes | CSS Properties |
|-------|---------|-----------------|-----------------|
| **Default** | None | Neutral background | `bg-transparent` |
| **Hover** | Mouse over | Light background + border | `hover:bg-surface-container-lowest` + `hover:border-outline-variant` |
| **Selected** | `isSelected={true}` | Blue background + border + scale | `bg-surface-container-low` + `border-primary-container` + `scale-[1.02]` |
| **Focus** | Keyboard tab | Focus ring | `focus:ring-primary` |
| **With Badge** | `unreadCount > 0` | Unread indicator | Conditional `<Badge>` |

**Total Variants:** 5 (1 default + 4 states)

---

## 🆕 Proposed Variants (Stories 5.1 & 5.2)

### Variant 1: Group Indicator

```typescript
// Props addition
isGroup?: boolean;

// Render
{isGroup && (
  <Badge variant="group" className="ml-2">
    👥 Grupo
  </Badge>
)}
```

**Tokens Used:**
- `bg-surface-container`
- `text-text-primary`
- `border-outline-variant`

---

### Variant 2: Status Indicator

```typescript
// Props addition
status?: 'active' | 'archived' | 'closed';

// Render (only if status !== 'active')
{status !== 'active' && (
  <Badge variant={`status-${status}`} className="ml-2">
    {status === 'archived' ? '📦 Arquivada' : '🔒 Fechada'}
  </Badge>
)}
```

**Variants:**
- `status-active`: Default (no badge shown)
- `status-archived`: `bg-surface-container-high` + `text-text-secondary`
- `status-closed`: `bg-warning-container` + `text-text-primary`

---

### Variant 3: Reopen Animation

```typescript
// Props addition
justReopened?: boolean;

// Render
<Card
  className={cn(
    "...",
    justReopened && "conversation-card--reopen"
  )}
>
  {/* content */}
</Card>
```

**Animation:**
- Duration: 2.1s (100ms entrance + 2s pulse)
- Entrance: Fade in + slide from right
- Pulse: Background color transition
- Tokens: `--color-surface-container-low` → `--color-primary-container`

---

## 📊 Props Impact Matrix

| Prop | Current | New | Type | Optional | Default |
|------|---------|-----|------|----------|---------|
| `name` | ✅ | — | string | NO | — |
| `phone` | ✅ | — | string | NO | — |
| `lastMessage` | ✅ | — | string | NO | — |
| `timestamp` | ✅ | — | string | NO | — |
| `unreadCount` | ✅ | — | number | YES | undefined |
| `isSelected` | ✅ | — | boolean | YES | undefined |
| `isGroup` | — | ✅ NEW | boolean | YES | undefined |
| `status` | — | ✅ NEW | 'active' \| 'archived' \| 'closed' | YES | 'active' |
| `justReopened` | — | ✅ NEW | boolean | YES | undefined |

**Impact:** +3 new optional props (backward compatible ✅)

---

## 🧪 Test Coverage

### Current Tests (ConversationCard.test.tsx)

- ✅ Renders with required props
- ✅ Displays name, phone, lastMessage, timestamp
- ✅ Shows unread badge when count > 0
- ✅ Highlights when selected
- ✅ Handles click events
- ✅ Keyboard navigation (Enter, Space)
- ✅ Accessibility attributes

### New Tests Needed (for Story 5.1 & 5.2)

- [ ] Shows group badge when `isGroup === true`
- [ ] Hides group badge when `isGroup === false`
- [ ] Shows status badge for `status === 'archived'`
- [ ] Shows status badge for `status === 'closed'`
- [ ] Hides status badge for `status === 'active'`
- [ ] Applies reopen animation class when `justReopened === true`
- [ ] Multiple badges display side-by-side without layout shift

---

## 📈 Complexity Assessment

| Aspect | Score | Notes |
|--------|-------|-------|
| **Structural Complexity** | LOW (3 sections) | Simple flex layout |
| **Logic Complexity** | LOW (conditional rendering) | Basic if/else for badges |
| **Styling Complexity** | LOW (token-based) | No custom CSS |
| **Accessibility Complexity** | MEDIUM (ARIA + keyboard) | Good a11y patterns |
| **Testing Complexity** | LOW (6 test cases) | Straightforward coverage |
| **Extension Complexity** | LOW (additive props) | New props don't break existing |

**Overall Complexity:** **LOW** ✅ — Well-designed, easy to extend

---

## 🎯 Build Priority

| Task | Priority | Effort | Story | Status |
|------|----------|--------|-------|--------|
| Add `isGroup` prop + badge | HIGH | 30 min | 5.1 | Ready |
| Add `status` prop + 3 badges | HIGH | 45 min | 5.2 | Ready |
| Add `justReopened` prop + animation | HIGH | 20 min | 5.2 | Ready |
| Update tests (new variants) | HIGH | 45 min | 5.1/5.2 | Ready |
| Add Storybook stories | MEDIUM | 30 min | 5.1/5.2 | Ready |

**Total Effort:** ~3 hours  
**Blocker:** None ✅

---

Generated by: Uma (UX-Design-Expert)  
Scan Date: 2026-04-21
