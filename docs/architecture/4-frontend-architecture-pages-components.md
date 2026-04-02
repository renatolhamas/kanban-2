# 4. Frontend Architecture — Pages & Components

## 4.1 Page Structure & User Flows

### Authentication Pages (No Sidebar Layout)
- **`/register`**: Email, password (8+ chars, mixed case + number), name. POST to `/api/auth/register`. On success → redirect to `/settings/connection`.
- **`/login`**: Email, password. POST to `/api/auth/login`. On success → redirect to `/` (home). Store JWT in `httpOnly` cookie.

### Protected Pages (With Sidebar Layout)
- **`/` (Home/Kanban Board)**: Main canvas. Displays selected kanban's columns and conversations. Drag-and-drop reorder. Click card → open `<ChatModal>`.
- **`/contacts`**: Contacts directory with CRUD. Search, pagination, inline error validation.
- **`/settings`**: Tabbed interface with Profile, Connection, Automatic Messages, Kanbans subsections.

## 4.2 Component Hierarchy

```
<RootLayout>
  ├─ <Header>
  │  ├─ Logo
  │  ├─ Page Title
  │  └─ <UserMenu>
  │     ├─ Profile
  │     └─ Logout
  ├─ <Sidebar>
  │  ├─ Home (kanban icon)
  │  ├─ Contacts (people icon)
  │  └─ Settings (gear icon)
  └─ <main> (page content)

// Home page
<KanbanBoard>
  ├─ <KanbanSelector /> (dropdown to switch boards)
  ├─ <FilterToggle /> (Active | Archived)
  └─ <DragDropContainer>
     └─ <KanbanColumn> (for each column in kanban)
        └─ <ConversationCard> (for each conversation)
           └─ onClick → <ChatModal/>

// Chat Modal
<ChatModal>
  ├─ <MessageList />
  ├─ <KanbanTransferDropdown /> (Kanban - Column)
  ├─ <MessageInput />
  │  ├─ Text input
  │  └─ Media upload button
  ├─ <AutoMessageButton />
  └─ <ArchiveButton />

// Contacts page
<ContactsTable>
  ├─ Search bar
  ├─ <CreateContactModal />
  ├─ Table rows
  │  ├─ Name
  │  ├─ Phone
  │  ├─ Edit button → <EditContactModal />
  │  └─ Delete button (with confirmation)
  └─ Pagination

// Settings page
<SettingsPage>
  ├─ Tabs: Profile | Connection | Messages | Kanbans
  ├─ <ProfileSection />
  │  ├─ Name input
  │  ├─ Password input (strength validator)
  │  └─ Save button
  ├─ <ConnectionSection />
  │  ├─ Connection status badge
  │  └─ "Connect WhatsApp" button → <QRCodeModal />
  ├─ <AutoMessageSection />
  │  ├─ Table of templates
  │  ├─ Create button → <CreateMessageModal />
  │  └─ Edit buttons → <EditMessageModal />
  └─ <KanbansSection />
     ├─ Table of kanbans
     ├─ Create button
     ├─ Edit buttons
     └─ Reorder buttons (↑ ↓)
```

## 4.3 State Management Strategy

**For MVP (minimal):**
- Auth state: Context API (`AuthContext`) — user, tenant_id, JWT
- Form state: React hooks (`useState`, custom `useForm` hook)
- Real-time subscriptions: Custom hooks (`useConversations`, `useMessages`) with Supabase listeners
- No Zustand/Redux needed for MVP

**Real-time subscription example:**
```typescript
// Hook: useConversations
export function useConversations(kanbanId: string) {
  const [conversations, setConversations] = useState([]);
  
  useEffect(() => {
    const subscription = supabase
      .from('conversations')
      .on('*', (payload) => {
        // Refresh conversations on any change
        loadConversations();
      })
      .subscribe();
    
    return () => supabase.removeSubscription(subscription);
  }, [kanbanId]);
  
  return conversations;
}
```

---
