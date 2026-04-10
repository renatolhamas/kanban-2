# 1. Tech Stack — Strategic Decisions

## 1.1 Why These Technologies?

| Layer             | Technology                                   | Why                                                                                                       | Alternatives Rejected                                                                               |
| ----------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Frontend**      | Next.js 14+                                  | SSR for fast initial page loads, Vercel native deployment, built-in API routes, edge middleware           | React + separate backend (overhead), Remix (less mature), Nuxt (harder hiring)                      |
| **Styling**       | Tailwind CSS + shadcn/ui                     | Component library with design tokens, zero-overhead CSS, WCAG AA compliant components                     | Material-UI (heavy), Chakra UI (slower builds), custom CSS (maintenance burden)                     |
| **Backend**       | Supabase Cloud (PostgreSQL)                  | Native RLS for multi-tenancy, Auth built-in, Real-time Subscriptions, SaaS (zero ops), ~$35/month scaling | Firebase (vendor lock-in, expensive at scale), Self-hosted Postgres (ops burden), DynamoDB (no RLS) |
| **Real-time**     | Supabase WebSocket                           | Native integration with database changes, < 100ms latency, scales to 10k+ concurrent                      | Socket.io (extra infra), Pusher (expensive $), custom polling (high load)                           |
| **Webhooks**      | Evo GO (https://docs.evolutionfoundation.com.br/evolution-go) | Go language high-performance WhatsApp gateway, HMAC-SHA256 validation | WhatsApp Cloud API (stricter rate limits, approval process)                                         |
| **File Storage**  | Supabase Storage (S3 compatible)             | Integrated with auth, RLS-like folder policies, ~$5/GB/month, fast uploads                                | Cloudinary (vendor lock, cost), Firebase Storage (cold data expensive)                              |
| **Rate Limiting** | Redis (local VPS)                            | ~$5/month on small VPS, zero additional cost, sub-millisecond latency                                     | Upstash (extra network RTT), Redis Cloud (unnecessary cost)                                         |
| **Monitoring**    | Sentry + Supabase Logs                       | Error tracking + transaction tracing, ~$30/month free tier, native PostgreSQL logging                     | LogRocket (expensive), Datadog (enterprise pricing), CloudWatch (AWS-only)                          |
| **Deployment**    | Vercel (frontend) + Supabase Cloud (backend) | Global CDN, auto-scaling, zero-downtime deploys, 99.99% SLA                                               | Self-hosted (maintenance), Heroku (deprecating), Railway (less mature)                              |

## 1.2 Color Palette & Typography (Architectural Ledger)

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
