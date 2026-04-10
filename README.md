# WhatsApp Kanban System

> Status: Greenfield Setup
> Created: 2026-04-01

## Project Overview

WhatsApp Kanban System — Uma plataforma SaaS multi-tenant para gestão colaborativa de conversas no WhatsApp com interface Kanban.

**Stack:**

- Frontend: Next.js + Tailwind CSS
- Backend: Supabase Cloud (PostgreSQL + Auth + RLS)
- Integration: Evo GO
- Infrastructure: Docker + GitHub Actions

## Getting Started

See [docs/](./docs) for detailed documentation.

### Autenticação

O sistema utiliza Supabase Auth com email e senha. Fluxos implementados:
- Registro (com confirmação por email obrigatória)
- Login (com verificação de restrições via RLS)
- Reenvio de Configuração de Email (`/resend-confirmation`)
- Reset de Senha (`/forgot-password` e `/change-password`)

## Setup

```bash
npm install
npm run dev
```

Environment configured via AIOX bootstrap.

---

## Architecture & Development Patterns

### Application-Layer Orchestration

This project uses **application-layer orchestration** (Node.js/TypeScript) for all multi-step operations, database mutations, and automation flows — never PostgreSQL Triggers or Edge Functions.

**Why?** Simplicity, testability, debuggability, and consistency.

**For Developers:**
- **Quick Start:** [PATTERNS.md](./PATTERNS.md) — 3-step onboarding (10 min read)
- **Deep Dive:** [Application-Layer Orchestration Pattern](./docs/architecture/application-layer-orchestration-pattern.md) — Complete guide with examples, testing, pitfalls, FAQ

**Key Reference:** `app/api/auth/register/route.ts` — Canonical implementation showing multi-step user registration with tenant auto-creation and error rollback.

---

_Project initialized with Synkra AIOX Framework_
