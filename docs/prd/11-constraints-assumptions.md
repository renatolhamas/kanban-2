# 11. Constraints & Assumptions

## 11.1 Restrições (Hard Constraints)

| Restrição                     | Impacto                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------- |
| **Evo GO depency**  | Qualquer breaking change na API quebra o sistema; versão fixa obrigatória         |
| **Supabase Cloud (SaaS)**     | Sem self-hosted gratuito; cliente precisa pagar Supabase (dependência de crédito) |
| **WhatsApp Business Account** | Cliente precisa ser aprovado pelo WhatsApp (não controlado por nós)               |
| **Redis local (VPS)**         | Taxa de entrega depende de disponibilidade/uptime do Redis do desenvolvedor       |
| **Desktop-first MVP**         | Mobile UI não será polida na Fase 1                                               |
| **Sem SMS fallback**          | Apenas WhatsApp; sem suporte a SMS                                                |

## 11.2 Premissas (Assumptions)

| Premissa                                          | Validação                      |
| ------------------------------------------------- | ------------------------------ |
| Cliente possui instância Evo GO ativa   | Onboarding checklist           |
| Cliente tem acesso a projeto Supabase Cloud       | Documentação de setup          |
| Banda larga estável (para webhooks)               | N/A para MVP                   |
| Mínimo 2 atendentes por tenant (valor de produto) | Pesquisa de mercado pré-launch |
| Contatos usam WhatsApp (obviamente)               | Educação no GTM                |

---
