# 16. Appendices

## 16.1 References

### WhatsApp Integration — Evo GO ONLY

⚠️ **CRITICAL:** This project uses **EVO GO EXCLUSIVELY**. Do NOT use Evo GO.

#### 🔧 Technical Reference (for implementation)
- **Swagger Interactive (Renatop Instance):** https://evogo.renatop.com.br/swagger/index.html
  - Source of truth for API endpoints, payloads, and schemas
  - Use this when implementing Send Message, QR Code, webhooks

#### 📚 Official Documentation (for context & standards)
- **Evo GO Documentation:** https://evogo.renatop.com.br/swagger/index.html (Ref: docs/evogo/docs.evogo.doc.json)
- **Evo GO Installation Guide:** https://evogo.renatop.com.br/swagger/index.html (Ref: docs/evogo/docs.evogo.doc.json)/installation
- **Evo GO GitHub (Open Source):** https://github.com/EvolutionAPI/evolution-go

### DO NOT USE (Deprecated for this project)

- ❌ Evo GO: https://doc.evolution-api.com/v2/api-reference
- ❌ Evo GO Foundation: https://evogo.renatop.com.br/swagger/index.html (Ref: docs/evogo/docs.evogo.doc.json)
- ❌ Evo GO GitHub: https://github.com/EvolutionAPI/evolution-api

### Infrastructure & Framework

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

## 16.2 Glossary

| Term                  | Definição                                                                 |
| --------------------- | ------------------------------------------------------------------------- |
| **Tenant**            | Instância isolada de cliente/empresa; separação lógica via `tenant_id`    |
| **Kanban**            | Pipeline/funil de vendas com colunas customizáveis                        |
| **Conversation**      | Thread de chat entre Owner/Attendant e um contato via WhatsApp            |
| **Automatic Message** | Template de mensagem pré-cadastrada para envio manual ou automático       |
| **RLS**               | Row Level Security — política de segurança que filtra dados por tenant_id |
| **Evo GO**            | Gateway WhatsApp third-party; pairing + webhooks                          |
| **E2E**               | End-to-End (fluxo completo Register → Chat)                               |

## 16.3 Related Documents

### Core Documentation
- `docs/brief.md` — Project brief (estratégia de negócio)
- `docs/architecture/` — Technical diagrams (ERD, API flows)
- `docs/stories/` — User stories (criadas por @sm após approval do PRD)
- `docs/prd.md` — Este documento (master PRD)

### Evo GO Integration Documentation
- **`docs/db/EVO-GO-TECHNICAL-SPECS.md`** — ⭐ **MUST READ** — Evo GO technical specifications, webhook events, database architecture, message flows
- **`docs/db/pesquisa.schema.evogo.md`** — Deep research on schema compatibility with Evo GO
- **`docs/CRITICAL-EVO-GO-NOT-EVOLUTION-API.md`** — ⚠️ Critical distinction: Evo GO vs Evo GO

### Evo GO Instance & Official Resources

#### Instance-Specific (Use for implementation)
- **Swagger Interactive:** https://evogo.renatop.com.br/swagger/index.html
  - Live API reference for our Evo GO instance
  - Real endpoint signatures, payload schemas, rate limits

#### Official Evo GO Resources (Use for context & standards)
- **Documentation:** https://evogo.renatop.com.br/swagger/index.html (Ref: docs/evogo/docs.evogo.doc.json)
- **Installation Guide:** https://evogo.renatop.com.br/swagger/index.html (Ref: docs/evogo/docs.evogo.doc.json)/installation
- **GitHub Repository:** https://github.com/EvolutionAPI/evolution-go

---


