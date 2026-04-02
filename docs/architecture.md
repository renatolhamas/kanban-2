---
> 🏛️ **DOCUMENTO SHARDADO**
>
> Este documento de arquitetura foi shardado em **2026-04-01** por **Aria (@architect)** para facilitar navegação modular.
>
> **Versão shardada disponível em:** [`docs/architecture/`](./architecture/) (13 seções em arquivos separados)
>
> **Consulte os shards para leitura — este arquivo é mantido como referência histórica e fonte de verdade.**

---

# WhatsApp Kanban System — Technical Architecture

**Document Version:** 1.0  
**Status:** APPROVED FOR DEVELOPMENT  
**Created:** 2026-04-01  
**Architect:** Aria (AIOX @architect agent)  
**Target Audience:** Development team (@dev, @qa, @data-engineer)

---

## 1. Tech Stack — Strategic Decisions

### 1.1 Why These Technologies?

| Layer | Technology | Why | Alternatives Rejected |
|-------|-----------|-----|----------------------|
| **Frontend** | Next.js 14+ | SSR for fast initial page loads, Vercel native deployment, built-in API routes, edge middleware | React + separate backend (overhead), Remix (less mature), Nuxt (harder hiring) |
| **Styling** | Tailwind CSS + shadcn/ui | Component library with design tokens, zero-overhead CSS, WCAG AA compliant components | Material-UI (heavy), Chakra UI (slower builds), custom CSS (maintenance burden) |
| **Backend** | Supabase Cloud (PostgreSQL) | Native RLS for multi-tenancy, Auth built-in, Real-time Subscriptions, SaaS (zero ops), ~$35/month scaling | Firebase (vendor lock-in, expensive at scale), Self-hosted Postgres (ops burden), DynamoDB (no RLS) |
| **Real-time** | Supabase WebSocket | Native integration with database changes, < 100ms latency, scales to 10k+ concurrent | Socket.io (extra infra), Pusher (expensive $), custom polling (high load) |
| **Webhooks** | Evolution API v2 | Stable, mature, pinned version prevents breaking changes, HMAC-SHA256 validation | WhatsApp Cloud API (stricter rate limits, approval process) |
| **File Storage** | Supabase Storage (S3 compatible) | Integrated with auth, RLS-like folder policies, ~$5/GB/month, fast uploads | Cloudinary (vendor lock, cost), Firebase Storage (cold data expensive) |
| **Rate Limiting** | Redis (local VPS) | ~$5/month on small VPS, zero additional cost, sub-millisecond latency | Upstash (extra network RTT), Redis Cloud (unnecessary cost) |
| **Monitoring** | Sentry + Supabase Logs | Error tracking + transaction tracing, ~$30/month free tier, native PostgreSQL logging | LogRocket (expensive), Datadog (enterprise pricing), CloudWatch (AWS-only) |
| **Deployment** | Vercel (frontend) + Supabase Cloud (backend) | Global CDN, auto-scaling, zero-downtime deploys, 99.99% SLA | Self-hosted (maintenance), Heroku (deprecating), Railway (less mature) |

### 1.2 Color Palette & Typography (Architectural Ledger)

Design tokens for UI consistency across all components:

```
Primary:      #10B981 (Emerald 500)     — CTAs, highlights
Secondary:    #1E40AF (Blue 800)        — Secondary actions, links
Surface:      #F9FAFB (Gray 50)         — Backgrounds, cards
Danger:       #EF4444 (Red 500)         — Delete, error states
Success:      #22C55E (Green 500)       — Confirmation, valid states

Typography:   Manrope (font-family)
             Font sizes: 12px (small) → 32px (h1)
             Line height: 1.5 (body), 1.2 (headings)
             Weights: 400 (normal), 600 (semibold), 700 (bold)
```

---

## 2. Project Structure — Source Tree

### 2.1 Folder Layout (Next.js 14 App Router)

```
kanban.2/
├── .aiox-core/                    # AIOX Framework (READ-ONLY)
├── .claude/                        # Claude Code configuration
│   ├── CLAUDE.md                   # Development rules
│   ├── rules/                      # Agent rules
│   └── settings.local.json
├── .next/                          # Next.js build output (gitignored)
├── public/                         # Static assets
│   ├── logo.svg
│   ├── favicon.ico
│   └── icons/                      # UI icons (shadcn exports)
├── src/
│   ├── app/                        # Next.js 14 App Router
│   │   ├── layout.tsx              # Root layout (header, nav, theme)
│   │   ├── page.tsx                # Home page (kanban board)
│   │   ├── (auth)/                 # Auth group layout (no sidebar)
│   │   │   ├── layout.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── login/page.tsx
│   │   ├── (app)/                  # Protected app routes (with sidebar)
│   │   │   ├── layout.tsx
│   │   │   ├── contacts/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── settings/profile.tsx (subsection component)
│   │   ├── api/                    # Backend API routes
│   │   │   ├── auth/               # Auth endpoints
│   │   │   │   ├── register/route.ts
│   │   │   │   ├── login/route.ts
│   │   │   │   └── refresh/route.ts
│   │   │   ├── conversations/      # Conversation management
│   │   │   │   ├── [id]/route.ts
│   │   │   │   └── update-column/route.ts
│   │   │   ├── messages/           # Message endpoints
│   │   │   │   ├── send/route.ts
│   │   │   │   └── history/route.ts
│   │   │   ├── contacts/           # Contact management
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── kanbans/            # Kanban CRUD
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── automatic-messages/ # Message templates
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── webhooks/           # External integrations
│   │   │   │   ├── messages/route.ts  # Evolution API webhook
│   │   │   │   └── connection/route.ts # Evolution connection status
│   │   │   ├── settings/           # Settings endpoints
│   │   │   │   ├── profile/route.ts
│   │   │   │   ├── connection/route.ts (QR generation)
│   │   │   │   └── connection-status/route.ts
│   │   │   └── health/route.ts     # Health check
│   │   └── error.tsx, not-found.tsx # Error pages
│   ├── components/                 # Reusable React components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── UserMenu.tsx
│   │   ├── kanban/
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── ConversationCard.tsx
│   │   │   ├── KanbanSelector.tsx
│   │   │   └── FilterToggle.tsx
│   │   ├── chat/
│   │   │   ├── ChatModal.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── KanbanTransferDropdown.tsx
│   │   │   ├── AutoMessageButton.tsx
│   │   │   └── ArchiveButton.tsx
│   │   ├── contacts/
│   │   │   ├── ContactsTable.tsx
│   │   │   ├── CreateContactModal.tsx
│   │   │   ├── EditContactModal.tsx
│   │   │   └── PhoneValidator.tsx
│   │   ├── settings/
│   │   │   ├── ProfileSection.tsx
│   │   │   ├── ConnectionSection.tsx
│   │   │   ├── QRCodeModal.tsx
│   │   │   ├── KanbansTable.tsx
│   │   │   ├── AutoMessageSection.tsx
│   │   │   └── CreateMessageModal.tsx
│   │   ├── common/
│   │   │   ├── Button.tsx (shadcn wrapper)
│   │   │   ├── Modal.tsx (shadcn Dialog)
│   │   │   ├── Input.tsx (shadcn Input)
│   │   │   ├── Loading.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   └── icons/ (shadcn exports)
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts              # Auth context hook
│   │   ├── useSupabase.ts          # Supabase client hook
│   │   ├── useConversations.ts     # Conversations real-time subscription
│   │   ├── useMessages.ts          # Messages real-time subscription
│   │   ├── useForm.ts              # Form state management
│   │   └── useDragDrop.ts          # dnd-kit integration
│   ├── lib/                        # Utility functions
│   │   ├── supabase/
│   │   │   ├── client.ts           # Supabase client initialization
│   │   │   ├── server.ts           # Server-side Supabase client
│   │   │   ├── auth.ts             # Auth utilities
│   │   │   ├── queries.ts          # Common database queries
│   │   │   └── rls.ts              # RLS helper functions
│   │   ├── api/
│   │   │   ├── evolution.ts        # Evolution API client
│   │   │   ├── webhook-validator.ts # HMAC-SHA256 validation
│   │   │   └── rate-limiter.ts     # Redis rate limiter
│   │   ├── validators/
│   │   │   ├── phone.ts            # E.164 phone validation
│   │   │   ├── email.ts            # Email validation
│   │   │   └── auth.ts             # Password strength validation
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT auth middleware
│   │   │   ├── tenant-isolation.ts # Tenant ID extraction
│   │   │   └── error-handler.ts    # API error handler
│   │   ├── types/
│   │   │   ├── database.ts         # TypeScript types from Supabase
│   │   │   ├── api.ts              # API request/response types
│   │   │   └── evolution.ts        # Evolution API types
│   │   └── utils/
│   │       ├── datetime.ts         # Date formatting
│   │       ├── formatting.ts       # UI formatting (phone, etc)
│   │       └── errors.ts           # Error mapping
│   ├── styles/
│   │   ├── globals.css             # Global Tailwind imports
│   │   └── variables.css           # CSS variables for design tokens
│   ├── context/
│   │   ├── AuthContext.tsx         # Auth state (JWT, tenant_id, user)
│   │   └── ThemeContext.tsx        # Light/dark mode (future Phase 2+)
│   └── store/                      # State management (if needed)
│       └── index.ts                # Placeholder for Zustand/Redux (MVP minimal)
├── migrations/                     # Supabase migrations
│   ├── 20260401000000_init.sql     # Initial schema + RLS
│   ├── 20260401000100_auth-functions.sql
│   └── ...
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/ (Playwright)
│   └── fixtures/
├── docs/
│   ├── prd/                        # PRD sharded (auto-generated)
│   ├── architecture/               # This file, sharded (auto-generated)
│   ├── stories/                    # Development stories
│   └── guides/
├── .env.local                      # Local dev secrets (git-ignored)
├── .env.example                    # Example env template
├── tailwind.config.ts              # Tailwind CSS config
├── tsconfig.json
├── package.json
├── next.config.js
├── Makefile                        # Common dev commands
└── README.md
```

### 2.2 TypeScript Path Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/app/*": ["src/app/*"],
      "@/components/*": ["src/components/*"],
      "@/lib/*": ["src/lib/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/types/*": ["src/lib/types/*"],
      "@/utils/*": ["src/lib/utils/*"]
    }
  }
}
```

---

## 3. Database Schema — Complete Reference

### 3.1 Core Tables

#### `tenants` — Multi-tenancy root
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subscription_status TEXT CHECK (subscription_status IN ('active', 'paused', 'cancelled')) DEFAULT 'active',
  evolution_instance_id TEXT,  -- Evolution API instance for this tenant
  connection_status TEXT CHECK (connection_status IN ('disconnected', 'connecting', 'active', 'error')) DEFAULT 'disconnected',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_tenants_subscription ON tenants(subscription_status);
```

#### `users` — Owners and attendants
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('owner', 'attendant')) DEFAULT 'owner',
  name TEXT NOT NULL,
  password_hash TEXT,  -- NULL if using OAuth
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_users_email_tenant ON users(email, tenant_id);
CREATE INDEX idx_users_tenant ON users(tenant_id);
```

#### `kanbans` — Pipelines/funnels
```sql
CREATE TABLE kanbans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,  -- Only one per tenant
  order_position INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_kanbans_main_tenant ON kanbans(tenant_id, is_main) WHERE is_main = TRUE;
CREATE INDEX idx_kanbans_tenant_order ON kanbans(tenant_id, order_position);
```

#### `columns` — Kanban stages
```sql
CREATE TABLE columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kanban_id UUID NOT NULL REFERENCES kanbans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_position INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_columns_kanban_order ON columns(kanban_id, order_position);
```

#### `contacts` — Contact directory
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,  -- E.164 format: +5511987654321
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_contacts_phone_tenant ON contacts(phone, tenant_id);
CREATE INDEX idx_contacts_tenant ON contacts(tenant_id);
```

#### `conversations` — Contact-to-kanban links
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  kanban_id UUID NOT NULL REFERENCES kanbans(id) ON DELETE SET NULL,
  column_id UUID NOT NULL REFERENCES columns(id) ON DELETE SET NULL,
  wa_phone TEXT NOT NULL,  -- WhatsApp phone (may differ from contact.phone)
  status TEXT CHECK (status IN ('active', 'archived')) DEFAULT 'active',
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_conversations_tenant_status ON conversations(tenant_id, status);
CREATE INDEX idx_conversations_kanban_column ON conversations(kanban_id, column_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
```

#### `messages` — Message history
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT CHECK (sender_type IN ('user', 'contact')) NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,  -- S3 URL if file attached
  media_type TEXT CHECK (media_type IN ('image', 'video', 'audio')),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
```

#### `automatic_messages` — Message templates
```sql
CREATE TABLE automatic_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_interval_minutes INT,  -- NULL = manual only; >0 = auto-send interval
  scheduled_kanban_id UUID REFERENCES kanbans(id) ON DELETE SET NULL,  -- Optional: only for this kanban
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_automatic_messages_tenant ON automatic_messages(tenant_id);
```

### 3.2 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanbans ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE automatic_messages ENABLE ROW LEVEL SECURITY;

-- Extract tenant_id from JWT
CREATE OR REPLACE FUNCTION auth.get_tenant_id() RETURNS UUID AS $$
  SELECT (auth.jwt()->>'tenant_id')::UUID;
$$ LANGUAGE SQL;

-- Policy: Users see only their tenant's data
CREATE POLICY "users_see_own_tenant"
  ON tenants FOR SELECT USING (
    id = auth.get_tenant_id()
  );

CREATE POLICY "conversations_isolation"
  ON conversations FOR SELECT USING (
    tenant_id = auth.get_tenant_id()
  );

CREATE POLICY "conversations_update"
  ON conversations FOR UPDATE USING (
    tenant_id = auth.get_tenant_id()
  );

-- Similar policies for other tables...
```

### 3.3 Indexes & Query Optimization

| Index | Purpose | Query Pattern |
|-------|---------|---------------|
| `idx_conversations_tenant_status` | Filter active conversations per tenant | `SELECT * FROM conversations WHERE tenant_id = ? AND status = 'active'` |
| `idx_messages_conversation_created` | Load message history, newest first | `SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC` |
| `idx_contacts_phone_tenant` | Prevent duplicate phone per tenant | `SELECT * FROM contacts WHERE phone = ? AND tenant_id = ?` |
| `idx_kanbans_main_tenant` | Find "Main" kanban for auto-routing | `SELECT * FROM kanbans WHERE tenant_id = ? AND is_main = TRUE` |
| `idx_conversations_kanban_column` | Load conversations for board render | `SELECT * FROM conversations WHERE kanban_id = ? AND column_id = ?` |

---

## 4. Frontend Architecture — Pages & Components

### 4.1 Page Structure & User Flows

#### Authentication Pages (No Sidebar Layout)
- **`/register`**: Email, password (8+ chars, mixed case + number), name. POST to `/api/auth/register`. On success → redirect to `/settings/connection`.
- **`/login`**: Email, password. POST to `/api/auth/login`. On success → redirect to `/` (home). Store JWT in `httpOnly` cookie.

#### Protected Pages (With Sidebar Layout)
- **`/` (Home/Kanban Board)**: Main canvas. Displays selected kanban's columns and conversations. Drag-and-drop reorder. Click card → open `<ChatModal>`.
- **`/contacts`**: Contacts directory with CRUD. Search, pagination, inline error validation.
- **`/settings`**: Tabbed interface with Profile, Connection, Automatic Messages, Kanbans subsections.

### 4.2 Component Hierarchy

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

### 4.3 State Management Strategy

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

## 5. Backend Architecture — API Routes & Middleware

### 5.1 Middleware Stack

All `/api/*` routes are protected by:

1. **`auth.ts`** — Verify JWT in cookie; extract `sub` (user ID) and `tenant_id` claims
2. **`tenant-isolation.ts`** — Ensure `req.tenant_id` is set from JWT; block if missing
3. **`error-handler.ts`** — Catch all errors; return `{ error: string, statusCode: number }`

```typescript
// /api/conversations/route.ts (example)
import { auth } from '@/lib/middleware/auth';
import { tenantIsolation } from '@/lib/middleware/tenant-isolation';

export async function GET(req: Request) {
  // Run middleware
  const user = await auth(req);
  const { tenantId } = await tenantIsolation(req, user);
  
  // Query database with tenant isolation
  const conversations = await supabase
    .from('conversations')
    .select('*')
    .eq('tenant_id', tenantId);
  
  return Response.json(conversations);
}
```

### 5.2 API Route Groups

#### **Auth Routes** (`/api/auth/*`)
- `POST /api/auth/register` — Create tenant + user + "Main" kanban + columns
- `POST /api/auth/login` — Validate email/password; return JWT (httpOnly cookie)
- `POST /api/auth/logout` — Destroy session
- `POST /api/auth/refresh` — Refresh expired JWT
- `GET /api/auth/me` — Return current user & tenant info

#### **Conversations** (`/api/conversations/*`)
- `GET /api/conversations` — List conversations for tenant (paginated)
- `GET /api/conversations/[id]` — Get single conversation
- `PATCH /api/conversations/[id]/column` — Move conversation to column (drag-drop)
- `PATCH /api/conversations/[id]/archive` — Archive conversation
- `DELETE /api/conversations/[id]` — Hard delete

#### **Messages** (`/api/messages/*`)
- `POST /api/messages/send` — Send message via Evolution API + save to DB
- `GET /api/messages?conversation_id=...` — Get message history (paginated, newest first)
- `POST /api/messages/send-automatic` — Send automatic message template

#### **Contacts** (`/api/contacts/*`)
- `GET /api/contacts` — List contacts (paginated)
- `POST /api/contacts` — Create contact
- `PATCH /api/contacts/[id]` — Update contact
- `DELETE /api/contacts/[id]` — Delete contact

#### **Kanbans** (`/api/kanbans/*`)
- `GET /api/kanbans` — List all kanbans for tenant
- `POST /api/kanbans` — Create kanban (auto-create columns)
- `PATCH /api/kanbans/[id]` — Update kanban name/order
- `PATCH /api/kanbans/[id]/main` — Set as "Main" kanban
- `DELETE /api/kanbans/[id]` — Delete kanban (if not in use)

#### **Automatic Messages** (`/api/automatic-messages/*`)
- `GET /api/automatic-messages` — List templates
- `POST /api/automatic-messages` — Create template
- `PATCH /api/automatic-messages/[id]` — Update template
- `DELETE /api/automatic-messages/[id]` — Delete template
- `POST /api/automatic-messages/[id]/test` — Send test message

#### **Settings** (`/api/settings/*`)
- `PATCH /api/settings/profile` — Update user name/password
- `GET /api/settings/connection-status` — Evolution API connection status
- `POST /api/settings/qr-code` — Generate new QR code from Evolution API
- `POST /api/settings/reconnect` — Force reconnect to WhatsApp

#### **Webhooks** (`/api/webhooks/*`)
- `POST /api/webhooks/messages` — Evolution API webhook for new messages
- `POST /api/webhooks/connection` — Evolution API webhook for connection status changes

---

## 6. Integration Patterns — Evolution API + Supabase

### 6.1 WhatsApp Message Receive Flow (Webhook → DB → Real-time)

```
┌─────────────────────────┐
│   Evolution API         │
│   (WhatsApp gateway)    │
└──────────┬──────────────┘
           │ POST webhook
           ▼
┌─────────────────────────────────────┐
│   /api/webhooks/messages            │
│   ├─ Validate HMAC-SHA256 signature │
│   ├─ Extract: phone, message, media │
│   └─ Parse to EvolutionMessage type │
└──────────┬────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│   Database Transaction               │
│   ├─ Lookup contact by wa_phone      │
│   ├─ IF NOT EXISTS → CREATE          │
│   ├─ Lookup conversation             │
│   ├─ IF NOT EXISTS → CREATE in Main  │
│   │   (kanban auto-routed)           │
│   ├─ INSERT message                  │
│   └─ UPDATE conversation.updated_at  │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│   Supabase Real-time Broadcast       │
│   (WebSocket to all active clients)  │
│   ├─ Event: "INSERT" on messages     │
│   ├─ Event: "UPDATE" on conversations│
│   └─ Frontend re-renders             │
└──────────────────────────────────────┘
```

**Code example:**
```typescript
// /api/webhooks/messages
import { validateWebhookSignature } from '@/lib/api/webhook-validator';

export async function POST(req: Request) {
  const signature = req.headers.get('X-Signature');
  const body = await req.text();
  
  // Validate
  if (!validateWebhookSignature(body, signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const event = JSON.parse(body);
  const { phone, message, media_url } = event.data;
  
  // 1. Find or create contact
  let contact = await supabase
    .from('contacts')
    .select('*')
    .eq('phone', phone)
    .single();
  
  if (!contact) {
    contact = await supabase
      .from('contacts')
      .insert({ phone, tenant_id })
      .single();
  }
  
  // 2. Find or create conversation
  let conversation = await supabase
    .from('conversations')
    .select('*')
    .eq('contact_id', contact.id)
    .single();
  
  if (!conversation) {
    // Auto-route to "Main" kanban
    const mainKanban = await supabase
      .from('kanbans')
      .select('*')
      .eq('is_main', true)
      .single();
    
    conversation = await supabase
      .from('conversations')
      .insert({
        contact_id: contact.id,
        kanban_id: mainKanban.id,
        column_id: mainKanban.columns[0].id, // First column
        wa_phone: phone
      })
      .single();
  }
  
  // 3. Save message
  await supabase
    .from('messages')
    .insert({
      conversation_id: conversation.id,
      sender_type: 'contact',
      content: message,
      media_url,
      media_type: event.data.media_type
    });
  
  // 4. Supabase Real-time broadcasts automatically
  return Response.json({ ok: true });
}
```

### 6.2 Send Message Flow (Frontend → Evolution API → DB)

```
┌──────────────────┐
│   Chat Modal     │
│   Message Input  │
└────────┬─────────┘
         │ onChange + POST
         ▼
┌────────────────────────────────┐
│   /api/messages/send           │
│   ├─ Validate JWT              │
│   ├─ Call Evolution API         │
│   │   POST /message             │
│   │   { phone, message, media } │
│   └─ Await 200 OK               │
└────────┬────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│   Database INSERT              │
│   ├─ INSERT message            │
│   │   (sender_type: 'user')     │
│   └─ UPDATE last_message_at     │
└────────┬────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│   Supabase Real-time           │
│   ├─ Broadcast to subscribers  │
│   └─ Frontend updates UI        │
└────────────────────────────────┘
```

---

## 7. Security Architecture

### 7.1 Authentication Flow (JWT + httpOnly Cookies)

```
Registration:
  Email, Name, Password (8+ chars, mixed case + number)
    ↓ POST /api/auth/register
  Supabase Auth creates user record
    ↓
  Backend creates tenant + owner user
    ↓
  Generate JWT (includes sub + tenant_id claims)
    ↓
  Set httpOnly cookie (secure flag in prod)
    ↓
  Redirect to /settings/connection

Login:
  Email, Password
    ↓ POST /api/auth/login
  Supabase Auth validates
    ↓
  Generate JWT
    ↓
  httpOnly cookie
    ↓
  Redirect to / (home)

JWT Payload:
{
  "sub": "user-uuid",
  "tenant_id": "tenant-uuid",
  "email": "owner@example.com",
  "role": "owner",
  "iat": 1234567890,
  "exp": 1234567890 + 3600  // 1 hour
}
```

### 7.2 Webhook Security (HMAC-SHA256)

Evolution API signs all webhooks with `X-Signature` header using HMAC-SHA256:

```typescript
import crypto from 'crypto';

export function validateWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.EVOLUTION_WEBHOOK_SECRET;
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}
```

### 7.3 RLS Enforcement

Every row in a tenant-scoped table has `tenant_id`. Supabase RLS policies extract the authenticated user's `tenant_id` from the JWT and enforce at the database layer — **no cross-tenant data leakage possible**.

### 7.4 Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit

---

## 8. Coding Standards & Conventions

### 8.1 TypeScript Best Practices

- **Strict mode enabled** in `tsconfig.json` (`strict: true`)
- **No `any` types** — use `unknown` with type guards if needed
- **Explicit return types** for all functions
- **Interfaces over types** for object shapes
- **Const assertions** for literal objects

```typescript
// ✅ Good
interface User {
  id: UUID;
  email: string;
  role: 'owner' | 'attendant';
}

async function getUser(id: UUID): Promise<User> {
  // ...
}

// ❌ Avoid
const getUser = (id) => { // Missing type annotation
  // ...
};
```

### 8.2 File Naming Conventions

| Category | Pattern | Example |
|----------|---------|---------|
| Components | PascalCase + `.tsx` | `KanbanBoard.tsx` |
| Hooks | `use` prefix + camelCase | `useConversations.ts` |
| Utilities | camelCase + `.ts` | `formatPhone.ts` |
| API routes | kebab-case + `route.ts` | `/conversations/[id]/route.ts` |
| Types | PascalCase (same as interface) | `User.ts` → `export interface User {}` |

### 8.3 Imports Organization

```typescript
// 1. External packages
import React, { useState, useEffect } from 'react';
import { supabase } from '@supabase/auth-helpers-nextjs';

// 2. Absolute imports (@/*)
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/lib/types/database';

// 3. Relative imports
import { Header } from '../layout/Header';
```

### 8.4 Error Handling Pattern

```typescript
// API routes: Always return error response
export async function GET(req: Request) {
  try {
    // ...
  } catch (error) {
    console.error('GET /api/something failed:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Frontend: Use Error Boundary
<ErrorBoundary
  fallback={<div>Something went wrong</div>}
  onError={(error) => console.error(error)}
>
  <YourComponent />
</ErrorBoundary>
```

### 8.5 React Component Patterns

```typescript
// Functional component with TypeScript
interface KanbanBoardProps {
  kanbanId: string;
  onCardClick?: (id: string) => void;
}

export function KanbanBoard({ kanbanId, onCardClick }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>([]);
  
  useEffect(() => {
    // Load data
  }, [kanbanId]);
  
  return (
    <div className="kanban-board">
      {/* JSX */}
    </div>
  );
}
```

---

## 9. Performance Strategy

### 9.1 Frontend Optimization

| Strategy | Implementation | Target |
|----------|----------------|--------|
| **Code splitting** | Next.js dynamic imports for modals | Reduce initial bundle by 20% |
| **Lazy loading** | `IntersectionObserver` for message history | < 3s page load |
| **Image optimization** | Next.js `<Image>` component | Auto-resize, WebP format |
| **Caching** | React Query / SWR for API responses | Stale-while-revalidate |
| **CSS minification** | Tailwind CSS purge unused styles | < 50KB gzipped CSS |

### 9.2 Database Optimization

| Strategy | Implementation | Metric |
|----------|----------------|--------|
| **Connection pooling** | Supabase built-in | < 100ms query latency |
| **Indexes on hot tables** | Foreign keys + common filters | Conversations by tenant+status |
| **Pagination** | `LIMIT 50 OFFSET` for tables | Load 50 records at a time |
| **Real-time filtering** | Client-side WHERE clauses | Reduce bandwidth |
| **N+1 prevention** | Always `SELECT *` with JOINs | Fetch related data in one query |

### 9.3 API Optimization

| Strategy | Implementation |
|----------|----------------|
| **Response compression** | Gzip (Next.js built-in) |
| **Rate limiting** | Redis 100 req/min per tenant |
| **Webhook timeout** | 5s (return 200 OK immediately, process async) |
| **Connection pooling** | Supabase + Evolution API token caching |

---

## 10. Deployment Architecture

### 10.1 Deployment Topology

```
┌─────────────────────────────────────────┐
│         Vercel (Frontend)               │
│  ├─ Next.js app (SSR + API Routes)      │
│  ├─ GitHub webhooks for auto-deploy     │
│  ├─ Environment variables via .env.prod │
│  └─ 99.99% SLA, auto-scaling            │
└──────────┬────────────────────────────────┘
           │ HTTPS
           │ API calls + WebSocket
           ▼
┌─────────────────────────────────────────┐
│    Supabase Cloud (Backend)             │
│  ├─ PostgreSQL database                 │
│  ├─ Auth service                        │
│  ├─ Real-time WebSocket server          │
│  ├─ Row Level Security (RLS) policies   │
│  ├─ Storage (S3 compatible)             │
│  └─ Managed backups (daily)             │
└──────────┬────────────────────────────────┘
           │ HTTPS
           │ REST API + WebSocket
           ▼
┌─────────────────────────────────────────┐
│   Evolution API v2 (WhatsApp Gateway)   │
│  ├─ QR code generation                  │
│  ├─ Message send/receive webhooks       │
│  └─ Connection management               │
└─────────────────────────────────────────┘

External Services:
  ├─ Sentry (Error tracking) — $30/month
  ├─ Vercel Analytics (Performance APM)
  └─ Supabase Logs (PostgreSQL audit log)
```

### 10.2 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Evolution API
EVOLUTION_API_URL=https://api.evolution.example.com
EVOLUTION_API_KEY=xxx
EVOLUTION_WEBHOOK_SECRET=xxx

# Redis (local VPS rate limiter)
REDIS_URL=redis://localhost:6379

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx

# General
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://kanban.example.com
```

### 10.3 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm install
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test
      
      - uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

### 10.4 Database Migrations (Supabase)

Migrations live in `/migrations/` folder:

```bash
# Create migration
supabase migration new create_initial_schema

# Apply migration locally
supabase db push

# Apply to production
supabase db push --db-url $SUPABASE_PROD_URL
```

---

## 11. Development Workflow

### 11.1 Local Setup

```bash
# Clone & install
git clone <repo>
npm install

# Environment
cp .env.example .env.local
# Fill in SUPABASE_URL, SUPABASE_KEY, etc.

# Start dev server
npm run dev  # http://localhost:3000

# Supabase local (optional)
supabase start
supabase db push

# Run tests
npm test

# Lint & typecheck
npm run lint
npm run typecheck
```

### 11.2 Code Review Checklist

Before marking complete, verify:
- ✅ TypeScript compiles without errors (`npm run typecheck`)
- ✅ Linting passes (`npm run lint`)
- ✅ Tests pass (`npm test`)
- ✅ No hardcoded secrets or credentials
- ✅ RLS policies applied (if DB changes)
- ✅ Error handling implemented
- ✅ Loading/error states added to UI

---

## 12. Appendix: Technology Justification Summary

| Technology | Why Not Alternatives |
|-----------|----------------------|
| **Next.js 14** | Not Remix (less hiring pool), not SvelteKit (smaller ecosystem), not Astro (poor state management) |
| **Supabase** | Not Firebase (lock-in + cost), not self-hosted (ops burden), not DynamoDB (no RLS) |
| **Tailwind + shadcn** | Not Material-UI (heavy), not Chakra (slower builds), not custom CSS (maintenance) |
| **Evolution API v2** | Not WhatsApp Cloud API (stricter approvals), not Twilio (expensive ~$1/msg) |
| **Vercel** | Not Heroku (deprecating), not Railway (immature), not self-hosted (ops burden) |
| **Redis local** | Not Upstash (network latency), not Redis Cloud (cost) |

---

**Last Updated:** 2026-04-01  
**Status:** READY FOR DEVELOPMENT  
**Next Step:** @sm creates stories from Epic structure; @dev begins implementation (Epic 1)

---
