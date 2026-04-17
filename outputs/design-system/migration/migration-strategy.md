# Migration Strategy: Phased Adoption 🚀

Esta estratégia detalha o plano de 4 fases para migrar o projeto Kanban para o Design System v2.0, garantindo estabilidade e ROI imediato.

## 📊 Resumo Executivo
- **Alvo:** Adoção total do sistema com >80% de redução de padrões.
- **Duração:** 4 fases (estimativa de 6-8 sprints).
- **Risco:** Médio (mitigado por abordagem incremental).

## 🏁 Fase 1: Fundação (COMPLETA)
**Objetivo:** Estabelecer a base técnica sem mudanças visuais.
- [x] Implantação de tokens oficiais (`tokens.css`).
- [x] Unificação do `app/globals.css` (aliases criados para manter compatibilidade).
- [x] Alinhamento da paleta: Emerald → Forest Green (Base).

## ⚡ Fase 2: Componentes de Alto Impacto (EM ANDAMENTO)
**Objetivo:** Substituir as implementações manuais mais comuns.
- **Prioridade 1:** Botões (15+ instâncias).
- **Prioridade 2:** Inputs (11+ instâncias).
- **Prioridade 3:** Cards.

## 🧹 Fase 3: Limpeza de Cauda Longa
**Objetivo:** Consolidar padrões complexos e remover CSS legado.
- Limpeza de `app.css`.
- Migração de Modais e Navegação.

## 🛡️ Fase 4: Governança
**Objetivo:** Prevenir regressão através de automação.
- Adição de Lint rules para cores hexadecimais.
- Bloqueio de novos estilos não-sistema via CI/CD.

---
— Brad Frost, Arquiteto de Sistemas
