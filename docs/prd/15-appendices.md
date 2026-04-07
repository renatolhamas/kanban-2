# 15. Appendices

## 15.1 References

### WhatsApp Integration — Evo GO ONLY

⚠️ **CRITICAL:** This project uses **EVO GO EXCLUSIVELY**. Do NOT use Evolution API v2.

- **Evo GO Documentation:** https://docs.evolutionfoundation.com.br/evolution-go
- **Evo GO Installation:** https://docs.evolutionfoundation.com.br/evolution-go/installation
- **Evo GO GitHub (Open Source):** https://github.com/EvolutionAPI/evolution-go

### DO NOT USE (Deprecated for this project)

- ❌ Evolution API v2: https://doc.evolution-api.com/v2/api-reference
- ❌ Evolution API Foundation: https://docs.evolutionfoundation.com.br/evolution-api
- ❌ Evolution API GitHub: https://github.com/EvolutionAPI/evolution-api

### Infrastructure & Framework

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

## 15.2 Glossary

| Term                  | Definição                                                                 |
| --------------------- | ------------------------------------------------------------------------- |
| **Tenant**            | Instância isolada de cliente/empresa; separação lógica via `tenant_id`    |
| **Kanban**            | Pipeline/funil de vendas com colunas customizáveis                        |
| **Conversation**      | Thread de chat entre Owner/Attendant e um contato via WhatsApp            |
| **Automatic Message** | Template de mensagem pré-cadastrada para envio manual ou automático       |
| **RLS**               | Row Level Security — política de segurança que filtra dados por tenant_id |
| **Evo GO**            | Gateway WhatsApp third-party; pairing + webhooks                          |
| **E2E**               | End-to-End (fluxo completo Register → Chat)                               |

## 15.3 Related Documents

### Core Documentation
- `docs/brief.md` — Project brief (estratégia de negócio)
- `docs/architecture/` — Technical diagrams (ERD, API flows)
- `docs/stories/` — User stories (criadas por @sm após approval do PRD)
- `docs/prd.md` — Este documento (master PRD)

### Evo GO Integration Documentation
- **`docs/db/EVO-GO-TECHNICAL-SPECS.md`** — ⭐ **MUST READ** — Evo GO technical specifications, webhook events, database architecture, message flows
- **`docs/db/pesquisa.schema.evogo.md`** — Deep research on schema compatibility with Evo GO
- **`docs/CRITICAL-EVO-GO-NOT-EVOLUTION-API.md`** — ⚠️ Critical distinction: Evo GO vs Evolution API v2

### Evo GO Official Resources
- Documentation: https://docs.evolutionfoundation.com.br/evolution-go
- Installation: https://docs.evolutionfoundation.com.br/evolution-go/installation
- GitHub: https://github.com/EvolutionAPI/evolution-go

---
