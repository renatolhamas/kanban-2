# EPIC-6: Chat & Real-Time

**Status:** 📋 Planning  
**Epic ID:** 6  
**Owner:** Morgan (@pm)  
**Executor Model:** Wave-based parallel execution (6 stories, 3-4 development streams)  
**Created:** 2026-04-23  
**Updated:** 2026-04-23

---

## Epic Goal

Implement a complete real-time messaging interface with WebSocket subscriptions, paginated message history, and conversation management in a dedicated Chat Modal—enabling attendants to communicate seamlessly with instant message delivery and conversation organization.

---

## Business Value

**For Attendants:**
- Instant message delivery via WebSocket (no refresh needed)
- Searchable chat history with backward pagination
- Quick conversation management (archive, reassign to kanban column)
- Professional chat experience matching modern apps (Slack, WhatsApp Web)

**For Product:**
- Completes end-to-end messaging flow (Epic 5 persistence → Epic 6 UI → interaction)
- Enables real-time collaboration features in future epics
- MVP feature: required for beta release

---

## Existing System Context

**Current State (Post-Epic 5):**
- ✅ Messages persisted to `messages` table (Story 5.3)
- ✅ Conversations auto-created and routed (Story 5.2)  
- ✅ Contacts auto-registered (Story 5.1)
- ✅ Kanban board displays conversations (Story 4.2)
- ⚠️ **Gap:** No chat modal UI for viewing/sending messages
- ⚠️ **Gap:** No real-time updates (messages only visible on page refresh)
- ⚠️ **Gap:** No conversation management (archive, column reassignment)

**Technology Stack:**
- **Frontend:** React 18, TypeScript, Tailwind CSS, Shadcn/ui components (Epic 2)
- **Realtime:** Supabase Realtime (WebSocket subscriptions)
- **State Management:** React hooks + React Query/SWR for caching
- **Database:** Supabase PostgreSQL (messages, conversations tables)
- **Testing:** Vitest, React Testing Library

**Integration Points:**
- Kanban board (click conversation → opens chat modal)
- Message send API (Story 5.5)
- Supabase Realtime subscriptions (new)
- Conversation soft-delete (archive logic)

---

## Scope

### In Scope ✅
- Chat Modal UI with conversation header, message thread, input field
- Message history pagination (50-message batches, backward scroll)
- Real-time Supabase Realtime subscriptions (filtered by conversation_id)
- Kanban integration: column selector within modal for conversation reassignment
- Archive conversation (soft delete: archived=true, hide from kanban)
- Loading spinners, error states, connection loss recovery
- Message input + send integration with existing flow
- Subscription cleanup on modal close

### Out of Scope ❌
- Automatic message templates (Epic 8)
- Multi-user attendant features (Phase 2 - Epic 9)
- Message search/filtering, full-text search (post-MVP)
- Message reactions, threads, mentions (post-MVP)
- Voice/video messaging, media gallery (post-MVP)
- Message editing/deletion (post-MVP)
- Read receipts (post-MVP)

---

## Stories with Executor Assignments

### Story 6.1: Chat Modal UI (8 points)

**Description:** Create Chat Modal component with conversation header, message thread display, and input field. Implement local message state management and basic send integration.

**Executor Assignment (via assignExecutorFromContent):**
- **Executor:** @dev (frontend/component implementation)
- **Quality Gate:** @architect (component patterns, state management, design system consistency)
- **Quality Gate Tools:** component_review, pattern_validation, accessibility_check

**Quality Gates:**
- Pre-Commit: Component accessibility (WCAG AA), design system compliance
- Pre-PR: Modal integration test, keyboard navigation verification

**Focus Areas:**
- Reuse Shadcn/ui components (Modal, Card, Input)
- TypeScript strict mode
- Keyboard accessibility (Escape to close, Tab navigation)
- Design system token consistency (Tailwind config from Epic 2)

---

### Story 6.2: Message History Pagination (5 points)

**Description:** Implement backward pagination for message history. Load 50 older messages when scrolling to top. Prevent duplicate rendering and show loading states.

**Executor Assignment:**
- **Executor:** @dev (frontend logic, pagination state)
- **Quality Gate:** @architect (query optimization, state management patterns)
- **Quality Gate Tools:** performance_profiling, query_optimization, state_review

**Quality Gates:**
- Pre-Commit: Query performance check (index verification on messages table)
- Pre-PR: Pagination logic test, duplicate prevention test

**Focus Areas:**
- Cursor-based pagination using (conversation_id, created_at)
- Prevent duplicate messages in UI
- Virtual scrolling optimization for large message lists (windowing)
- Loading indicator during pagination

---

### Story 6.3: Real-Time Subscriptions (WebSocket) (8 points)

**Description:** Implement Supabase Realtime subscriptions to messages table. New messages arrive instantly. Handle connection loss and reconnection gracefully.

**Executor Assignment:**
- **Executor:** @dev (real-time integration, subscription management)
- **Quality Gate:** @architect (reliability patterns, error handling, subscription lifecycle)
- **Quality Gate Tools:** reliability_test, error_handling_check, integration_test

**Quality Gates:**
- Pre-Commit: Connection resilience test, reconnection logic verification
- Pre-PR: Subscription cleanup test, memory leak check

**Focus Areas:**
- Subscribe to `messages` table filtered by conversation_id
- Automatic reconnection on connection loss
- Cleanup subscriptions on component unmount
- Debounce updates to prevent re-render storms
- Test with simulated network failures

---

### Story 6.4: Kanban/Column Selector in Chat (5 points)

**Description:** Add dropdown selector in chat modal header to reassign conversation to different kanban columns. Update conversation's column_id in real-time.

**Executor Assignment:**
- **Executor:** @dev (UI integration, state update)
- **Quality Gate:** @architect (integration patterns, state consistency)
- **Quality Gate Tools:** integration_test, state_consistency_check

**Quality Gates:**
- Pre-Commit: Kanban state synchronization test
- Pre-PR: Column update persistence test

**Focus Areas:**
- Fetch available kanban columns (user's kanbans)
- Update conversation.column_id on selection
- Reflect change in kanban board in real-time (subscribe to conversations table)
- Handle stale state if conversation archived while reassigning

---

### Story 6.5: Archive Conversation (3 points)

**Description:** Add "Archive" button in chat modal header. Soft-delete conversation (set archived=true). Hide from kanban board immediately. Allow unarchive from Settings (future).

**Executor Assignment:**
- **Executor:** @dev (UI + API call)
- **Quality Gate:** @architect (data consistency, soft-delete pattern)
- **Quality Gate Tools:** data_consistency_test, soft_delete_validation

**Quality Gates:**
- Pre-Commit: Data consistency check, soft-delete verification
- Pre-PR: Archive/unarchive flow test

**Focus Areas:**
- Soft delete pattern: archived=true, not DELETE
- Close modal after archive
- Show success toast notification
- Verify conversation disappears from kanban board

---

### Story 6.6: Loading + Error States (5 points)

**Description:** Implement loading spinners while fetching message history. Show error banners when WebSocket connection fails. Provide retry button for failed message sends.

**Executor Assignment:**
- **Executor:** @dev (UI state management, error handling)
- **Quality Gate:** @architect (error handling patterns, UX consistency)
- **Quality Gate Tools:** ux_review, error_scenario_test, accessibility_check

**Quality Gates:**
- Pre-Commit: Error scenario test coverage
- Pre-PR: UX consistency review, accessibility of error messages

**Focus Areas:**
- Loading spinner during initial message fetch
- "Connection lost" banner with auto-reconnect countdown
- Retry button for failed message sends
- Error messages accessible to screen readers
- Graceful fallback if WebSocket unavailable

---

## Risk Analysis & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| WebSocket connection unstable | Medium | Message delivery delays | Automatic reconnection logic, fallback to polling if needed |
| Memory leak from subscription cleanup | Low | Browser memory growth | Explicit cleanup in useEffect return, test with React DevTools |
| Concurrent message updates cause duplicates | Low | Confusing duplicate messages | Cursor-based deduplication, idempotency on server |
| Pagination breaks with new incoming messages | Medium | History gaps or duplicates | Sort by created_at consistently, use cursor-based pagination |
| Column reassignment fails silently | Low | UI out of sync with DB | Error toast + retry button, subscribe to conversations updates |

**Rollback Plan:**
- Feature flag `CHAT_REALTIME_ENABLED` gates WebSocket subscriptions
- Fallback to manual refresh button if WebSocket unavailable
- Archive functionality is soft-delete only (fully reversible in DB)

---

## Quality Assurance Strategy

**CodeRabbit Integration:**

All stories include pre-commit and pre-PR quality gates:

| Story | Pre-Commit | Pre-PR | Severity Focus |
|-------|-----------|--------|-----------------|
| 6.1 (Modal UI) | component accessibility, design consistency | modal integration, keyboard nav | CRITICAL: accessibility |
| 6.2 (Pagination) | query performance, dedup logic | pagination bounds, memory | CRITICAL: performance |
| 6.3 (WebSocket) | connection resilience, reconnection | subscription cleanup, error handling | CRITICAL: reliability |
| 6.4 (Column Selector) | state sync, kanban integration | persistence, real-time update | MEDIUM: integration |
| 6.5 (Archive) | soft-delete validation, data consistency | archive/unarchive flow | MEDIUM: data integrity |
| 6.6 (Loading/Errors) | error scenario coverage, UX | accessibility, error messages | MEDIUM: UX quality |

---

## Success Criteria

- [ ] Chat modal opens when clicking conversation on kanban board
- [ ] User can scroll up to load earlier messages (pagination working)
- [ ] New incoming messages appear instantly without page refresh
- [ ] User can reassign conversation to different kanban column from modal
- [ ] User can archive conversation (archived=true, hidden from kanban)
- [ ] Loading spinners display while fetching history
- [ ] Error banners display gracefully on WebSocket failure
- [ ] Chat modal closes when clicking outside or pressing Escape
- [ ] All accessibility requirements met (WCAG AA)
- [ ] No memory leaks detected (subscription cleanup validated)
- [ ] All stories pass CodeRabbit quality gates

---

## Dependencies

**Prerequisite Stories/Epics:**
- ✅ Epic 1-5 completed (Auth, UI System, Evo Integration, DB, Message Persistence)
- ✅ Story 5.3 completed (Messages persisted to DB)
- ✅ Story 5.5 completed (Send message via Evo GO)
- ✅ Epic 2 completed (Design System with Shadcn/ui, Tailwind, Storybook)

**External Dependencies:**
- Supabase Realtime (WebSocket) - available in current plan
- React 18 hooks API (already used)
- Tailwind CSS, Shadcn/ui (already integrated)

---

## Timeline & Capacity

**Duration:** 2 weeks  
**Period:** Weeks 14-15 (post-Epic 5)  
**Team Capacity:** 3-4 developers (wave-based parallel execution)

**Wave Breakdown:**
- **Wave 1 (Days 1-2):** Stories 6.1, 6.2 (Modal + Pagination)
- **Wave 2 (Days 3-4):** Stories 6.3, 6.4 (WebSocket + Column Selector)
- **Wave 3 (Days 5-6):** Stories 6.5, 6.6 (Archive + Loading/Errors)
- **QA & Integration (Days 7-10):** Cross-story testing, real-time sync validation

---

## Design System Integration

Stories 6.1-6.6 use design system established in Epic 2:

- **Modal:** Modal + Card + Button from Shadcn/ui
- **Messages:** New Message component (text bubble, avatar, timestamp)
- **Input:** Input + Button from Shadcn/ui
- **Loading:** Spinner component (already in design system)
- **Errors:** Toast + Alert from Shadcn/ui

**Token Usage:**
- Color: Primary (send button), Neutral (message bg), Success/Error (status)
- Typography: Body-sm (message text), Label-sm (timestamp)
- Spacing: md (message padding), lg (modal padding)
- Shadows: sm (message bubble), md (modal)

---

## Handoff to Story Manager (@sm)

Once this epic is approved:

1. **@sm creates individual story files** (6.1-6.6) using `*draft {n}` command
2. **@po validates each story** using `*validate-story-draft {story-id}`
3. **@dev implements** following quality gates defined above
4. **@qa reviews** with CodeRabbit pre-commit/pre-PR gates
5. **@devops pushes** to production after all stories complete

**Next Command:** `@sm *draft 6.1`

---
