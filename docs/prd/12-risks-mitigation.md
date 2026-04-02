# 12. Risks & Mitigation

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|--------|-----------|
| Evolution API v2 breaking changes | Média | Alto | Monitorar changelog, versionar API, contract tests |
| Custo Supabase cresce exponencial | Média | Médio | Rate limiting, otimizar queries, cache layer |
| Compliance WhatsApp (ToS) | Baixa | Crítico | Legal review, terms of service, documentação clara |
| Latência webhook > 2s (UX ruins) | Baixa | Médio | Async queues, database indexing, CDN strategy |
| RLS misconfiguration (data leak) | Muito Baixa | Crítico | Security audit pré-produção, testes automatizados, Code Review rigorosa |

---
