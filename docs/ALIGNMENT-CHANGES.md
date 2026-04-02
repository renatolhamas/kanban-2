# PRD Alignment Changes — PO Validation Integration

**Document:** ALIGNMENT-CHANGES.md  
**Date:** 2026-04-01  
**Status:** ✅ 8 Divergences Resolved  
**Changes Applied to:** `/docs/prd.md`

---

## Summary

O PRD foi alinhado com as decisões validadas no **CHECKLIST-PO-VALIDATION.md**. Todas as mudanças foram cirúrgicas e preservaram o conteúdo existente.

| #   | Tipo            | Seção PRD               | Mudança                                          | Razão                                |
| --- | --------------- | ----------------------- | ------------------------------------------------ | ------------------------------------ |
| 1   | Arquitetura     | Sprint 0-2 (L615)       | `/SYSTEM` → `/app na raiz`                       | Padrão Next.js + Supabase MCP        |
| 2   | Tech Stack      | Seção 9.1 (L85, 380)    | "Supabase Functions" → "Next.js API Routes"      | Simplifica deploy, melhor controle   |
| 3   | DnD Library     | Sprint 5-6 (L628)       | "React Beautiful DnD" → "dnd-kit v8.0.0"         | Moderno, melhor mantido              |
| 4   | Reordenação     | Feature Set (L181, 184) | Drag-drop no board → Botões ↑↓ em Settings       | Menos complexo, operação intencional |
| 5   | Email Service   | Fase 2 (L348)           | Resend → Mailgun (5k/mês free)                   | Melhor custo-benefício para Fase 2+  |
| 6   | Design System   | Seção 9.1 (L374)        | Genérico → "Architectural Ledger" com cores/typo | Detalhes práticos guiam dev          |
| 7   | Rate Limiting   | Seção 9.1 + 10.1        | "API gateway/Supabase" → "Redis local (VPS)"     | Zero custo, controle total           |
| 8   | Webhook Timeout | Seção 9.4 + 13          | "< 2s latência" → "5s timeout, <500ms UX target" | Clarifica arquitetura async          |

---

## Detailed Changes

### 1️⃣ Arquitetura do Projeto (Sprint 0-2, Linha 615)

**Antes:**

```
- [ ] Setup Next.js project structure em `/SYSTEM`
```

**Depois:**

```
- [ ] Setup Next.js project structure com `/app na raiz (padrão Next.js, não /SYSTEM)
```

**Razão:** Supabase MCP + Vercel deployment assumem estrutura padrão Next.js com `/app` na raiz. Evita fricção com ferramentas.

---

### 2️⃣ API Framework & Webhooks (Seção 9.1, Linhas 373-382)

**Antes:**

```
| **Styling** | Tailwind CSS | Rapid prototyping, design system consistente |
| **Backend & DB** | Supabase Cloud (PostgreSQL) | ... |
...
| **Webhooks** | Supabase Functions (ou externa) | Processamento assíncrono de eventos |
| **Deployment** | Vercel (Frontend) + Supabase Cloud | ... |
| **Monitoring** | Sentry + Supabase Logs | ... |
```

**Depois:**

```
| **Design System** | "Architectural Ledger" (Tailwind + shadcn/ui) | Emerald/Navy/Surface colors, Manrope typography, WCAG AA |
| **Backend & DB** | Supabase Cloud (PostgreSQL) | ... |
...
| **API Framework** | Next.js API Routes (/app/api/) | Auth middleware, CORS, RateLimit, Webhook validation |
| **Rate Limiting** | Redis local (VPS) | 100 req/min per tenant, zero cost |
| **Deployment** | Vercel (Frontend) + Supabase Cloud | ... |
| **Monitoring** | Sentry + Supabase Logs | ... |
```

**Razão:**

- API Routes simplifica deploy (tudo em um lugar)
- Evita múltiplos serviços (Supabase Functions desnecessário)
- Design System detalha cores/typo (prático para dev)
- Redis local aprovado pelo CHECKLIST

---

### 3️⃣ Biblioteca Drag-and-Drop (Sprint 5-6, Linha 628)

**Antes:**

```
- [ ] Drag-and-drop (React Beautiful DnD ou similar)
```

**Depois:**

```
- [ ] Drag-and-drop (dnd-kit v8.0.0 — conversas entre colunas)
```

**Razão:** `dnd-kit` é moderno, melhor mantido, melhor performance/acessibilidade que React Beautiful DnD (em "maintenance mode").

---

### 4️⃣ Reordenação de Colunas (Feature Set, Linhas 181, 184)

**Antes:**

```
| **CRUD de Kanbans** | ... | Interface com drag-drop ou botões Antes/Depois |
| **Ordem Customizável** | Reordenar colunas do Kanban (esquerda → direita) | Números ou drag-drop; persistência no DB |
```

**Depois:**

```
| **CRUD de Kanbans** | ... | Tabela em Settings com botões ↑↓ para reorder |
| **Ordem Customizável** | Reordenar kanbans em Settings | Botões ↑↓ para reorder; persistência no DB |
```

**Razão:**

- Drag-drop de **conversas** permanece no board (essencial)
- Reordenação de **colunas/kanbans** move para Settings (configuração, não operacional)
- Reduz complexidade visual, operação mais intencional

---

### 5️⃣ Email Service — Remover do MVP (Fase 2, Linha 348)

**Antes:**

```
### Fase 2: Multi-User & Collaboration (3-6 meses)
- [ ] Team Management: Owner cria usuários Attendant
- [ ] Granular RLS: Attendants veem apenas conversas atribuídas
- [ ] Atribuição de Conversa: Owner assign conversa para atendente
- [ ] Performance Dashboard: Métricas por atendente (msgs/dia, lead time, etc.)
- [ ] Notificações Sonoras: Alert quando conversa chega em "Novo"
- [ ] Mobile App: iOS + Android nativo (ou React Native)
```

**Depois:**

```
### Fase 2: Multi-User & Collaboration (3-6 meses)
- [ ] Team Management: Owner cria usuários Attendant
- [ ] Granular RLS: Attendants veem apenas conversas atribuídas
- [ ] Atribuição de Conversa: Owner assign conversa para atendente
- [ ] Performance Dashboard: Métricas por atendente (msgs/dia, lead time, etc.)
- [ ] Notificações Sonoras: Alert quando conversa chega em "Novo"
- [ ] Email Service: Mailgun (5k/mês free tier) para notificações e follow-ups
- [ ] Mobile App: iOS + Android nativo (ou React Native)
```

**Razão:**

- MVP não precisa email (Supabase Auth nativa)
- Email é Fase 2+ (notificações, follow-ups)
- Mailgun (5k/mês) é melhor que Resend (100/dia)

---

### 6️⃣ Design System com Cores & Tipografia (Seção 9.1, Linha 374)

**Antes:**

```
| **Styling** | Tailwind CSS | Rapid prototyping, design system consistente |
```

**Depois:**

```
| **Design System** | "Architectural Ledger" (Tailwind + shadcn/ui) | Emerald/Navy/Surface colors, Manrope typography, WCAG AA |
```

**Razão:** Detalhes práticos (cores #006c49, #515f78, tipografia Manrope) guiam o desenvolvimento. Referencia DESIGN.md existente.

---

### 7️⃣ Rate Limiting — Redis Local (Seção 9.1 + 10.1)

**Antes (Seção 9.1):**

```
| **Rate limiting** | API gateway / Supabase | MEDIUM |
```

**Depois (Seção 9.1):**

```
| **Rate Limiting** | Redis local (VPS) | 100 req/min per tenant, zero cost |
```

**Antes (Seção 10.1 Constraints):**

```
| **Desktop-first MVP** | Mobile UI não será polida na Fase 1 |
| **Sem SMS fallback** | Apenas WhatsApp; sem suporte a SMS |
```

**Depois (Seção 10.1 Constraints):**

```
| **Redis local (VPS)** | Taxa de entrega depende de disponibilidade/uptime do Redis do desenvolvedor |
| **Desktop-first MVP** | Mobile UI não será polida na Fase 1 |
| **Sem SMS fallback** | Apenas WhatsApp; sem suporte a SMS |
```

**Razão:** Você já tem VPS com Redis; Upstash é desnecessário. Zero custo adicional.

---

### 8️⃣ Webhook Timeout & Performance (Seção 9.4 + 13)

**Antes (Seção 9.4):**

```
| Webhook signature | Backend HMAC validation | CRITICAL |
| File size (mídia) | Frontend + Backend (max 50MB) | MEDIUM |
| Rate limiting | API gateway / Supabase | MEDIUM |
```

**Depois (Seção 9.4):**

```
| Webhook signature | Backend HMAC validation | CRITICAL |
| Webhook processing | Backend async (return 200 OK <200ms, timeout 5s) | CRITICAL |
| File size (mídia) | Frontend + Backend (max 50MB) | MEDIUM |
| Rate limiting | Redis local (VPS) — 100 req/min per tenant | MEDIUM |
```

**Antes (Seção 13 Success Criteria):**

```
- ✅ Performance < 2s de latência (webhook to UI)
```

**Depois (Seção 13 Success Criteria):**

```
- ✅ Performance < 500ms latência (webhook to UI); webhook timeout 5s
```

**Razão:** Clarifica arquitetura async:

- **Timeout 5s** = Evolution API tem tempo de processar
- **Return 200 OK <200ms** = evita retry storms
- **<500ms UX target** = user feedback é rápido

---

## Checklist de Validação

- [x] Mudança 1: Sprint 0-2 — `/app na raiz`
- [x] Mudança 2: Tech Stack — Next.js API Routes + Design System + Redis
- [x] Mudança 3: Sprint 5-6 — dnd-kit v8.0.0
- [x] Mudança 4: Feature Set — Botões ↑↓ em Settings
- [x] Mudança 5: Fase 2 — Mailgun para notificações
- [x] Mudança 6: Design System — "Architectural Ledger"
- [x] Mudança 7: Constraints — Redis local VPS
- [x] Mudança 8: Success Criteria — Webhook timeout + <500ms UX target

---

## Próximos Passos

1. ✅ **Aplicar mudanças no PRD** — CONCLUÍDO
2. ⏳ **Gerar este documento (ALIGNMENT-CHANGES.md)** — CONCLUÍDO
3. ⏳ **Atualizar CHECKLIST-PO-VALIDATION.md** — `PRD aligned ✅`
4. 📋 **Iniciar Epic Creation (@pm \*create-epic)**

---

**Última atualização:** 2026-04-01 14:45 UTC  
**Assinado por:** Morgan (PM Agent - AIOX)  
**Status:** ✅ READY FOR EPIC BREAKDOWN

---
