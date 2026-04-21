# Scan Summary: ConversationCard Molecule

**Artifact:** `src/components/ui/molecules/ConversationCard.tsx`  
**Scanned:** 2026-04-21 by Uma (UX-Design-Expert)  
**Component Type:** Molecule (Label + Card + Badge combination)  
**Complexity:** MEDIUM (accessibility-focused, 4 text levels, conditional rendering)  
**Status:** PRODUCTION-READY (well-structured, token-compliant)

---

## 🎯 Component Overview

**Purpose:** Display conversation preview in Kanban board with contact info, last message, and unread indicator.

**Current Props:**
```typescript
interface ConversationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;              // Contact name
  phone: string;             // Contact phone
  lastMessage: string;       // Last message preview
  timestamp: string;         // Message timestamp
  unreadCount?: number;      // Unread message count (optional)
  isSelected?: boolean;      // Selection state (optional)
}
```

**Dependencies:**
- `Card` (molecule) — Container styling
- `Badge` (atom) — Unread count indicator
- `cn` utility — Classname merging

---

## 🎨 Design Tokens Extracted

### Colors (Semantic Tokens Used)

| Token | Value | Usage | Frequency |
|-------|-------|-------|-----------|
| `--color-text-primary` | `#191c1e` | Contact name, last message | 2 instances |
| `--color-text-secondary` | `#40493d` | Phone, timestamp | 2 instances |
| `--color-surface-container-low` | `#f2f4f7` | Selected state background | 1 instance |
| `--color-surface-container-lowest` | `#ffffff` | Hover state background | 1 instance |
| `--color-primary-container` | `#2e7d32` | Selected border color | 1 instance |
| `--color-outline-variant` | `rgba(112, 122, 108, 0.15)` | Hover border | 1 instance |
| `--color-primary` | `#0d631b` | Focus ring color | 1 instance |

### Typography Tokens

| Token | Value | Usage | Frequency |
|-------|-------|-------|-----------|
| `text-body-lg` | 18px, font-bold | Contact name | 1 instance |
| `text-label-sm` | 12px | Timestamp | 1 instance |
| `text-body-sm` | 16px | Phone number | 1 instance |
| `text-body-md` | 16px | Last message preview | 1 instance |

### Spacing Tokens

| Token | Value | Usage | Frequency |
|-------|-------|-------|-----------|
| `space-y-1` | 4px (Tailwind gap) | Vertical stack gap | 1 instance |
| `pt-1` | 4px padding-top | Section spacing | 1 instance |
| `pr-4` | 16px padding-right | Message text padding | 1 instance |
| `ml-auto` | auto margin | Badge right-align | 1 instance |

### Transitions & Effects

| Property | Value | Usage |
|----------|-------|-------|
| `transition-all` | 200ms | Smooth state changes |
| `cursor-pointer` | pointer | Interactive affordance |
| `truncate` | text-overflow | Long text handling |
| `border-l-4` | 4px left border | Visual accent |
| `scale-[1.02]` | 2% scale on select | Subtle affordance |
| `shadow-active` | Ambient shadow | Selected state depth |

---

## 📐 Component Structure (Atomic Design)

**Classification:** MOLECULE (multi-atom combination)

**Composition:**
```
ConversationCard (Molecule)
├── Card (Molecule container)
├── Flex Container (4px vertical gap)
│   ├── Header Section (justify-between)
│   │   ├── Name (text-body-lg, bold)
│   │   └── Timestamp (text-label-sm)
│   ├── Phone Section (text-body-sm)
│   └── Message Section (flex justify-between)
│       ├── LastMessage (text-body-md, truncate)
│       └── Badge (atom - unread count)
```

**Reusable Patterns Identified:**
1. **Text Stack Pattern:** Name + timestamp header (used 1×, reusable)
2. **Two-Column Layout:** Message + badge (used 1×, reusable)
3. **Truncation Pattern:** Long text handling (used 3×)
4. **Accessibility Pattern:** aria-label + keyboard nav (used 1×, good practice)
5. **Selection State:** Border + background + scale (used 1×, reusable)

---

## 🔄 Variant Analysis

**Current Variants:** 1 base component
- ✅ Selected state (via `isSelected` prop)
- ✅ Hover state (via CSS)
- ✅ Focus state (keyboard navigation)
- ✅ With unread badge (conditional)

**Missing Variants (for Stories 5.1 & 5.2):**
1. **Group Indicator** — Show `👥 Grupo` badge when `isGroup === true`
2. **Status Indicator** — Show status badge (`📦 Arquivada` / `🔒 Fechada`) when `status !== 'active'`
3. **Reopen Animation** — Animate entrance when `justReopened === true`

**Recommendation:** Add 3 new props (see STORY-5.1-5.2-UI-SPECS.md for details)

---

## ✅ Token Compliance Assessment

| Category | Status | Notes |
|----------|--------|-------|
| Colors | ✅ FULL | All semantic tokens used (zero hardcoded hex) |
| Typography | ✅ FULL | All typography tokens via Tailwind classes |
| Spacing | ✅ FULL | All spacing via Tailwind (4px-based scale) |
| Shadows | ✅ FULL | Uses `shadow-active` token on selection |
| Borders | ✅ FULL | Border colors use semantic tokens |
| Accessibility | ✅ FULL | ARIA labels, keyboard navigation, focus states |

**Verdict:** 🟢 **DESIGN SYSTEM COMPLIANT** — Zero technical debt, ready for extension.

---

## 🎯 Build Recommendations

### High Priority (Stories 5.1 & 5.2)

**1. Add Group Indicator Badge**
- **Effort:** 30 min
- **Implementation:** Conditional Badge render when `isGroup === true`
- **Tokens:** Uses existing `bg-surface-container`, `text-text-primary`, `border-outline-variant`
- **File:** `src/components/ui/molecules/ConversationCard.tsx` (line 42-49)

**2. Add Status Badge (3 variants)**
- **Effort:** 45 min
- **Implementation:** Conditional Badge with status-specific variants
- **Tokens:** Uses `status-active`, `status-archived`, `status-closed` variants (already created in Badge.tsx)
- **File:** `src/components/ui/molecules/ConversationCard.tsx` (line 56-65)

**3. Integrate Reopen Animation**
- **Effort:** 20 min
- **Implementation:** Apply CSS class when `justReopened === true`
- **Tokens:** Uses `--color-surface-container-low`, `--color-primary-container`
- **File:** `src/styles/animations-story-5.css` (already created)

### Medium Priority (Future)

**4. Create Conversation List Organism**
- Combine multiple ConversationCards into scrollable list
- Add filtering/search
- Add virtual scrolling for large lists (1000+)

**5. Add Conversation Detail Template**
- Full message thread view
- Message input
- File attachments
- Typing indicator

---

## 📊 Redundancy Analysis

**Pattern Usage in Codebase:**

| Pattern | Instances | Consolidation |
|---------|-----------|---|
| Text truncation | 3 | ✅ Standardized (Tailwind `truncate`) |
| Color tokens | 7 | ✅ 100% semantic (zero hardcoded) |
| Border styling | 1 | ✅ Minimal (no redundancy) |
| Typography hierarchy | 4 levels | ✅ Well-structured (no variants) |
| Flex layouts | 2 | ✅ Simple, no alternative patterns |
| State styling | 3 (selected, hover, focus) | ✅ Consistent (CSS-based) |

**Verdict:** 🟢 **NO REDUNDANCY** — Component is lean and well-structured.

---

## 🔗 Related Components

**Uses:**
- `Card` (molecule) — Container/styling foundation
- `Badge` (atom) — Unread count display

**Used By:**
- `KanbanColumn` (organism) — Displays cards in kanban columns
- `ConversationList` (future organism) — Multiple cards in list view

**Potential Consumers:**
- Chat history list
- Message inbox
- Notification center

---

## 📋 Quality Checklist

- ✅ TypeScript types: Complete, strongly typed
- ✅ Accessibility: ARIA labels, keyboard nav, focus states
- ✅ Design tokens: 100% token-compliant (zero hardcoded values)
- ✅ Responsive: Flexbox layout adapts to screen size
- ✅ Performance: Uses React.forwardRef, minimal re-renders
- ✅ Testing: Has test file (ConversationCard.test.tsx)
- ✅ Naming: Clear, semantic naming (`isSelected`, `unreadCount`)
- ✅ Documentation: Good JSDoc potential

---

## 🚀 Next Steps

1. **Implement Story 5.1 UI:** Add `isGroup` prop + group indicator badge
2. **Implement Story 5.2 UI:** Add `status` prop + status badges
3. **Implement Animation:** Apply `conversation-card--reopen` class in webhook handler
4. **Run tests:** Update ConversationCard.test.tsx with new variants
5. **Update Storybook:** Add stories for new props (group, status, reopen)

---

**Scan Date:** 2026-04-21  
**Component Status:** PRODUCTION-READY for extension  
**Design System Alignment:** ✅ 100% COMPLIANT  
**Ready for Implementation:** ✅ YES

Generated by: Uma (UX-Design-Expert)  
Reference: `docs/design-system/specs/STORY-5.1-5.2-UI-SPECS.md`
