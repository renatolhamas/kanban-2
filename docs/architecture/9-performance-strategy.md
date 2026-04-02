# 9. Performance Strategy

## 9.1 Frontend Optimization

| Strategy | Implementation | Target |
|----------|----------------|--------|
| **Code splitting** | Next.js dynamic imports for modals | Reduce initial bundle by 20% |
| **Lazy loading** | `IntersectionObserver` for message history | < 3s page load |
| **Image optimization** | Next.js `<Image>` component | Auto-resize, WebP format |
| **Caching** | React Query / SWR for API responses | Stale-while-revalidate |
| **CSS minification** | Tailwind CSS purge unused styles | < 50KB gzipped CSS |

## 9.2 Database Optimization

| Strategy | Implementation | Metric |
|----------|----------------|--------|
| **Connection pooling** | Supabase built-in | < 100ms query latency |
| **Indexes on hot tables** | Foreign keys + common filters | Conversations by tenant+status |
| **Pagination** | `LIMIT 50 OFFSET` for tables | Load 50 records at a time |
| **Real-time filtering** | Client-side WHERE clauses | Reduce bandwidth |
| **N+1 prevention** | Always `SELECT *` with JOINs | Fetch related data in one query |

## 9.3 API Optimization

| Strategy | Implementation |
|----------|----------------|
| **Response compression** | Gzip (Next.js built-in) |
| **Rate limiting** | Redis 100 req/min per tenant |
| **Webhook timeout** | 5s (return 200 OK immediately, process async) |
| **Connection pooling** | Supabase + Evolution API token caching |

---
