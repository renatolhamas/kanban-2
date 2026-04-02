# 10. Deployment Architecture

## 10.1 Deployment Topology

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

## 10.2 Environment Variables

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

## 10.3 CI/CD Pipeline (GitHub Actions)

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

## 10.4 Database Migrations (Supabase)

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
