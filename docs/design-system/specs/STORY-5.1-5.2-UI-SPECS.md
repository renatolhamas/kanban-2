# UI Specifications: Stories 5.1 & 5.2 (Enhanced Webhooks)

**Created:** 2026-04-21  
**For:** @dev (Implementation) | @qa (Verification)  
**Stories:** 5.1 (Contact Auto-Registration) + 5.2 (Conversation Auto-Creation)

---

## Overview

Stories 5.1 and 5.2 add webhook-driven contact and conversation management. This document defines **THREE new UI elements** to be integrated into the existing `ConversationCard` component.

---

## Element 1: Group Indicator Badge

### Location
**Component:** `ConversationCard` (line 42-49, after contact name)  
**Position:** Inline with contact name, right-aligned

### Specification

```jsx
// When contact.is_group === true, render:
{contact.is_group && (
  <Badge variant="group" className="ml-2">
    👥 Grupo
  </Badge>
)}
```

### Design Tokens Used
- **Background:** `--color-surface-container` (token: `bg-surface-container`)
- **Text:** `--color-text-primary` (token: `text-text-primary`)
- **Border:** `--color-outline-variant` (token: `border-outline-variant`)
- **Spacing:** `--space-sm` gap (existing Tailwind: `ml-2`)

### Visual Reference
```
[Contact Name]            👥 Grupo
[Phone Number]
```

### Implementation Notes
- Add `contact.is_group` to `ConversationCardProps`
- Use existing Badge component (updated with `variant="group"`)
- Show ONLY when `isGroup === true`
- No unread count displayed for groups (groups show `unreadCount` only)

---

## Element 2: Status Indicator Badge (NEW)

### Location
**Component:** `ConversationCard` (line 56-65, with unread badge)  
**Position:** Right side, next to unread count badge

### Specification

```jsx
// Render status badge based on conversation.status
const getStatusVariant = (status: 'active' | 'archived' | 'closed') => ({
  active: 'status-active',
  archived: 'status-archived',
  closed: 'status-closed',
}[status]);

// Only show if status !== 'active' (omit for default active state)
{conversation.status !== 'active' && (
  <Badge variant={getStatusVariant(conversation.status)} className="ml-2">
    {status === 'archived' ? '📦 Arquivada' : '🔒 Fechada'}
  </Badge>
)}
```

### Badge Variants

| Status | Variant | Colors | Icon | Text |
|--------|---------|--------|------|------|
| `active` | `status-active` | Surface low (green implicit) | — | (omitted) |
| `archived` | `status-archived` | Surface high + secondary text | 📦 | Arquivada |
| `closed` | `status-closed` | Warning container | 🔒 | Fechada |

### Design Tokens Used
- **Active:** Background `surface-container-low`, text `text-primary`
- **Archived:** Background `surface-container-high`, text `text-secondary` (subtle)
- **Closed:** Background `warning-container`, text `text-primary` (warning emphasis)

### Implementation Notes
- Add `conversation.status: 'active' | 'archived' | 'closed'` to props
- Status badges use updated Badge variants (already added)
- Render to the RIGHT of unread badge if both present
- On Story 5.2 logic: When conversation auto-reopens, status → `active` and badge disappears

---

## Element 3: Reopen Animation (CSS Keyframes)

### Location
**Component:** `KanbanColumn` (when new card inserted at position 0)  
**Trigger:** Conversation status changes from `archived`/`closed` → `active` + moves to first column

### Specification

```tsx
// src/styles/animations.css (create file)

@keyframes reopen-entrance {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes reopen-pulse {
  0%, 100% {
    background-color: var(--color-surface-container-low);
  }
  50% {
    background-color: var(--color-primary-container);
  }
}

.conversation-card--reopen {
  animation: reopen-entrance 100ms ease-out,
             reopen-pulse 2s ease-in-out 100ms;
}
```

### When Applied
- When `conversations` table: `archived/closed → active` AND `column_id` changes to "first column"
- Apply class `conversation-card--reopen` to Card element
- Remove class after animation completes (2.1s total)

### Integration Point
```tsx
// In KanbanColumn or ConversationCard wrapper
const isReopened = conversation.justReopened; // Set by webhook handler

return (
  <Card
    className={cn(
      isReopened && 'conversation-card--reopen'
    )}
  >
    {/* existing content */}
  </Card>
);
```

### Visual Effect
1. **0-100ms:** Fade in + slide from right (entrance animation)
2. **100-2100ms:** Subtle pulse between `surface-container-low` (default) and `primary-container` (highlight)
3. **2100ms+:** Return to normal styling

### Design Tokens Used
- **Entrance:** `transform: translateX(20px)`
- **Highlight color:** `--color-primary-container`
- **Normal color:** `--color-surface-container-low`

---

## ConversationCard Props Update

### Current Props (UNCHANGED)
```tsx
interface ConversationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  phone: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isSelected?: boolean;
}
```

### NEW Props (ADD)
```tsx
interface ConversationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  // ... existing props ...
  isGroup?: boolean;                          // From Story 5.1
  status?: 'active' | 'archived' | 'closed'; // From Story 5.2 (default: 'active')
  // Flag to trigger reopen animation (optional)
  justReopened?: boolean;                     // From Story 5.2 routing logic
}
```

---

## Layout Diagram

```
┌──────────────────────────────────────────────────┐
│ [Name] 👥 Grupo                    [Timestamp]   │  ← Group badge inline
│ Phone Number                                     │
│ Last message text here...    [unread: 3] 📦 Arch │  ← Status + unread badges
└──────────────────────────────────────────────────┘
```

---

## Stories & Acceptance Criteria Alignment

### Story 5.1: Contact Auto-Registration
- **AC 8:** Groups (`@g.us`) are identified and registered with `is_group = true`
- **UI Implementation:** Group indicator badge ✓

### Story 5.2: Conversation Auto-Creation
- **AC 4:** If archived/closed → move to first column, set status → `active`
- **AC 5:** If already active → remain where it is but update
- **AC 6:** `unread_count` incremented (already in ConversationCard)
- **UI Implementation:** Status badge + reopen animation ✓

---

## Testing Checklist (for @qa)

- [ ] Group badge renders when `isGroup === true`
- [ ] Group badge hidden when `isGroup === false` or undefined
- [ ] Status badge shows "Arquivada" when status === 'archived'
- [ ] Status badge shows "Fechada" when status === 'closed'
- [ ] Status badge HIDDEN when status === 'active'
- [ ] Reopen animation plays when `justReopened === true`
- [ ] Animation duration: 2.1s total (100ms entrance + 2s pulse)
- [ ] Unread count still displays alongside status badge
- [ ] No layout shift when badges appear/disappear
- [ ] Tokens used match design system (no hardcoded colors)

---

## Files to Create/Modify

| File | Action | Priority |
|------|--------|----------|
| `src/components/ui/molecules/badge.tsx` | Add `group`, `status-*` variants | ✅ DONE |
| `src/components/ui/molecules/ConversationCard.tsx` | Add props + render logic | HIGH |
| `src/styles/animations.css` | Create keyframe animations | HIGH |
| `docs/design-system/tokens/tokens.yaml` | Already complete (no changes) | — |

---

**Design System Phase:** Phase 4 (Component Building - Atomic)  
**Review:** @architect (for token compliance) + @qa (for visual correctness)

