# 2. Project Structure — Source Tree

## 2.1 Folder Layout (Next.js 14 App Router)

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

## 2.2 TypeScript Path Aliases (tsconfig.json)

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
