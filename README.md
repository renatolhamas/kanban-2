# WhatsApp Kanban System

> Status: Greenfield Setup
> Created: 2026-04-01

## Project Overview

WhatsApp Kanban System — Uma plataforma SaaS multi-tenant para gestão colaborativa de conversas no WhatsApp com interface Kanban.

**Stack:**

- Frontend: Next.js + Tailwind CSS
- Backend: Supabase Cloud (PostgreSQL + Auth + RLS)
- Integration: Evolution API v2
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

_Project initialized with Synkra AIOX Framework_
