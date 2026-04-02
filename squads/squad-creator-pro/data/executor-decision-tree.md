# Executor Type Decision Tree

**Date:** 2026-02-03
**Version:** 1.0.0
**Status:** Standard
**Author:** Squad Architect
**Domain:** Technical / Process Automation
**Pattern:** EXEC-DT-001

---

## Purpose

Esta decision tree determina **QUEM ou O QUE executa uma task**: código determinístico (Worker), LLM probabilístico (Agent), combinação AI+Human (Hybrid), ou decisão humana pura (Human).

A escolha correta de executor impacta diretamente:

- **Custo**: Worker ($) vs Agent ($$$$)
- **Velocidade**: Worker (ms) vs Human (horas)
- **Consistência**: Worker (100%) vs Human (variável)
- **Qualidade**: Depende do tipo de task

**Princípio fundamental:** Maximizar determinismo. Usar LLM apenas quando necessário.

---

## Os 4 Tipos de Executor

### 1. Worker (Código Determinístico)

**Definition:** Execução por script, função, API call, ou automação sem julgamento.

**When to use:**

- Input e output são 100% previsíveis
- Regras podem ser codificadas completamente
- Não há ambiguidade na interpretação
- Task pode ser escrita como função pura
- Mesma entrada SEMPRE produz mesma saída

**Examples:**

- Formatar JSON para YAML
- Validar schema de arquivo
- Fazer API call e transformar response
- Mover arquivos entre diretórios
- Calcular métricas a partir de dados estruturados
- Gerar relatório a partir de template + dados

**Characteristics:**

| Attribute          | Value                    |
| ------------------ | ------------------------ |
| Custo              | $ (mais barato)          |
| Velocidade         | Milissegundos a segundos |
| Consistência       | 100% (determinístico)    |
| Escalabilidade     | Infinita                 |
| Julgamento         | Zero                     |
| Fallback requerido | Sim (para erros)         |

**Implementation:**

```yaml
executor:
  type: Worker
  pattern: EXEC-W-001
  implementation:
    language: "python | node | bash"
    location: "scripts/{task_id}.py"
    idempotent: true
    retry_policy: "3 attempts, exponential backoff"
```

---

### 2. Agent (LLM Probabilístico)

**Definition:** Execução por modelo de linguagem que interpreta, analisa, ou gera conteúdo.

**When to use:**

- Task requer interpretação de linguagem natural
- Output varia baseado em contexto/nuance
- Análise de padrões em texto não-estruturado
- Geração de conteúdo criativo ou analítico
- Síntese de múltiplas fontes de informação

**Examples:**

- Analisar sentimento de feedback de clientes
- Gerar primeiro rascunho de copy
- Extrair entidades de texto livre
- Resumir documento longo
- Classificar tickets de suporte por categoria
- Responder perguntas sobre codebase

**Characteristics:**

| Attribute          | Value                       |
| ------------------ | --------------------------- |
| Custo              | $$$$ (tokens)               |
| Velocidade         | Segundos a minutos          |
| Consistência       | ~85-95% (probabilístico)    |
| Escalabilidade     | Alta (paralelo)             |
| Julgamento         | Médio (baseado em training) |
| Fallback requerido | Sim (para Hybrid)           |

**Implementation:**

```yaml
executor:
  type: Agent
  pattern: EXEC-A-001
  implementation:
    model: "claude-sonnet | gpt-4 | gemini-pro"
    temperature: 0.3 # Lower = more deterministic
    max_tokens: 4096
    validation: "automated"
    confidence_threshold: 0.7
    fallback_to: Hybrid
```

---

### 3. Hybrid (AI + Human Validation)

**Definition:** LLM executa, humano valida/aprova antes de prosseguir.

**When to use:**

- Output do LLM precisa de revisão antes de uso
- Task tem impacto médio-alto se errada
- Humano pode melhorar/corrigir output do AI
- Processo de aprendizado (AI melhora com feedback)
- Decisões que afetam clientes/usuários externos

**Examples:**

- Gerar email de resposta → humano revisa antes de enviar
- Criar PR description → humano aprova antes de merge
- Sugerir classificação de lead → humano confirma
- Rascunhar proposta comercial → humano ajusta valores
- Analisar contrato → humano valida pontos críticos

**Characteristics:**

| Attribute          | Value                          |
| ------------------ | ------------------------------ |
| Custo              | $$ (AI + tempo humano parcial) |
| Velocidade         | Minutos a horas                |
| Consistência       | 95%+ (AI + human check)        |
| Escalabilidade     | Limitada pelo humano           |
| Julgamento         | Alto (combinado)               |
| Fallback requerido | Opcional (para Human)          |

**Implementation:**

```yaml
executor:
  type: Hybrid
  pattern: EXEC-HY-001
  implementation:
    ai_phase:
      model: "claude-sonnet"
      output: "draft"
    human_phase:
      action: "review | approve | edit"
      timeout: "4h"
      escalation: "manager"
    feedback_loop: true # AI learns from corrections
```

---

### 4. Human (Decisão Humana Pura)

**Definition:** Humano executa a task do início ao fim, sem assistência de AI.

**When to use:**

- Decisão estratégica de alto impacto
- Requer contexto que AI não tem acesso
- Envolve relacionamentos interpessoais
- Negociação ou persuasão necessária
- Responsabilidade legal ou ética
- Criatividade genuína (não derivativa)

**Examples:**

- Aprovar orçamento acima de $10k
- Demitir ou promover funcionário
- Negociar contrato com cliente enterprise
- Definir estratégia de produto
- Resolver conflito entre stakeholders
- Decidir pivô de negócio

**Characteristics:**

| Attribute          | Value                        |
| ------------------ | ---------------------------- |
| Custo              | $$$ (tempo humano integral)  |
| Velocidade         | Horas a dias                 |
| Consistência       | Variável (depende da pessoa) |
| Escalabilidade     | Muito limitada               |
| Julgamento         | Máximo                       |
| Fallback requerido | Não                          |

**Implementation:**

```yaml
executor:
  type: Human
  pattern: EXEC-H-001
  implementation:
    responsible: "@role or @person"
    decision_criteria: "documented"
    time_limit: "48h"
    escalation: "skip-level manager"
    documentation: "required"
```

---

## Decision Tree

```mermaid
graph TD
    Start([🎯 Nova Task]) --> Q1{1. Output é 100%<br/>previsível dado<br/>o input?}

    Q1 -->|✅ SIM| Q2{2. Pode ser escrito<br/>como função pura?<br/>f(x) → y sempre igual}
    Q1 -->|❌ NÃO| Q3{3. Requer interpretação<br/>de linguagem natural<br/>ou contexto?}

    Q2 -->|✅ SIM| Q2a{2a. Existe biblioteca/<br/>API que faz isso?}
    Q2 -->|❌ NÃO| Q3

    Q2a -->|✅ SIM| Worker[🔧 WORKER<br/>Código Determinístico]
    Q2a -->|❌ NÃO| Q2b{2b. Vale a pena<br/>codificar?<br/>Será usado 3+ vezes?}

    Q2b -->|✅ SIM| Worker
    Q2b -->|❌ NÃO| Agent[🤖 AGENT<br/>LLM Probabilístico]

    Q3 -->|✅ SIM| Q4{4. Erro no output<br/>causa impacto<br/>significativo?}
    Q3 -->|❌ NÃO| Q5{5. Requer julgamento<br/>estratégico ou<br/>relacionamento?}

    Q4 -->|✅ SIM Alto| Hybrid[🔄 HYBRID<br/>AI + Human Review]
    Q4 -->|❌ NÃO Baixo| Agent

    Q5 -->|✅ SIM| Q6{6. AI pode<br/>assistir/preparar?}
    Q5 -->|❌ NÃO| Q4

    Q6 -->|✅ SIM| Hybrid
    Q6 -->|❌ NÃO| Human[👤 HUMAN<br/>Decisão Humana]

    Worker --> End([✅ Executor Definido])
    Agent --> End
    Hybrid --> End
    Human --> End

    style Worker fill:#2ecc71,color:#000
    style Agent fill:#3498db,color:#fff
    style Hybrid fill:#f39c12,color:#000
    style Human fill:#e74c3c,color:#fff
    style Start fill:#9b59b6,color:#fff
    style End fill:#1abc9c,color:#fff
```

---

## Detailed Decision Criteria

### Criterion 1: Output é 100% previsível?

**Question:** Dado o mesmo input, o output será SEMPRE idêntico?

**Examples:**

| Scenario                                 | Answer | Why?                           | Path         |
| ---------------------------------------- | ------ | ------------------------------ | ------------ |
| Converter JSON para YAML                 | ✅ SIM | Transformação determinística   | → Worker     |
| Extrair campos de formulário estruturado | ✅ SIM | Parsing com regras fixas       | → Worker     |
| Resumir artigo de blog                   | ❌ NÃO | Resumo varia por interpretação | → Pergunta 3 |
| Classificar email como spam/não-spam     | ❌ NÃO | Depende de contexto e nuance   | → Pergunta 3 |
| Calcular total de fatura                 | ✅ SIM | Matemática pura                | → Worker     |
| Sugerir próxima ação para lead           | ❌ NÃO | Depende de análise contextual  | → Pergunta 3 |

**If SIM → Pergunta 2**
**If NÃO → Pergunta 3**

---

### Criterion 2: Pode ser função pura?

**Question:** A task pode ser implementada como `function(input) → output` sem side effects e sem ambiguidade?

**Examples:**

| Scenario                              | Answer | Why?                               | Path         |
| ------------------------------------- | ------ | ---------------------------------- | ------------ |
| Validar CPF                           | ✅ SIM | Algoritmo fixo de validação        | → 2a         |
| Gerar slug a partir de título         | ✅ SIM | Regras de transformação claras     | → 2a         |
| Decidir melhor horário para reunião   | ❌ NÃO | Depende de preferências implícitas | → Pergunta 3 |
| Formatar data para padrão ISO         | ✅ SIM | Transformação determinística       | → 2a         |
| Escolher melhor imagem para thumbnail | ❌ NÃO | Julgamento estético                | → Pergunta 3 |

**If SIM → Pergunta 2a (existe lib/API?)**
**If NÃO → Pergunta 3**

---

### Criterion 2a: Existe biblioteca/API?

**Question:** Existe código pronto (biblioteca, SDK, API) que faz essa operação?

**Examples:**

| Scenario          | Answer     | Implementation                       | Path     |
| ----------------- | ---------- | ------------------------------------ | -------- |
| Validar email     | ✅ SIM     | `email-validator` lib                | → Worker |
| Parse de PDF      | ✅ SIM     | `pdf-parse`, `PyPDF2`                | → Worker |
| OCR de imagem     | ✅ SIM     | Tesseract, Google Vision API         | → Worker |
| Traduzir texto    | ⚠️ PARCIAL | APIs existem mas são probabilísticas | → Agent  |
| Formatar markdown | ✅ SIM     | `remark`, `markdown-it`              | → Worker |

**If SIM → Worker**
**If NÃO → Pergunta 2b**

---

### Criterion 2b: Vale codificar?

**Question:** A task será executada 3+ vezes? O esforço de codificar compensa?

**Rule of thumb:**

- < 3 execuções → Agent (mais rápido implementar)
- 3-10 execuções → Avaliar complexidade
- > 10 execuções → Worker (investimento se paga)

**If SIM → Worker (codificar)**
**If NÃO → Agent (LLM é mais rápido para one-off)**

---

### Criterion 3: Requer interpretação de linguagem natural?

**Question:** A task envolve entender, analisar, ou gerar texto que não segue estrutura fixa?

**Examples:**

| Scenario                         | Answer | Why?                       | Path         |
| -------------------------------- | ------ | -------------------------- | ------------ |
| Analisar sentimento de review    | ✅ SIM | Linguagem natural, nuances | → Pergunta 4 |
| Extrair nome de campo JSON       | ❌ NÃO | Estrutura fixa, parsing    | → Worker     |
| Gerar descrição de produto       | ✅ SIM | Criação de texto           | → Pergunta 4 |
| Classificar intenção de mensagem | ✅ SIM | Interpretação semântica    | → Pergunta 4 |
| Somar valores de array           | ❌ NÃO | Operação matemática        | → Worker     |

**If SIM → Pergunta 4**
**If NÃO → Pergunta 5**

---

### Criterion 4: Impacto de erro é significativo?

**Question:** Se o output estiver errado, qual é o impacto?

**Impact Levels:**

| Level       | Description                              | Examples                                                                | Path              |
| ----------- | ---------------------------------------- | ----------------------------------------------------------------------- | ----------------- |
| **Baixo**   | Facilmente corrigível, sem consequências | Typo em draft interno, classificação errada que será revisada           | → Agent           |
| **Médio**   | Retrabalho necessário, mas reversível    | Email enviado com erro, relatório impreciso                             | → Hybrid          |
| **Alto**    | Dano financeiro, reputacional, ou legal  | Proposta com valor errado, comunicação a cliente, decisão de compliance | → Hybrid ou Human |
| **Crítico** | Irreversível ou catastrófico             | Dados deletados, violação legal, demissão injusta                       | → Human           |

**If Baixo → Agent**
**If Médio/Alto → Hybrid**
**If Crítico → Human**

---

### Criterion 5: Requer julgamento estratégico ou relacionamento?

**Question:** A task envolve decisões que dependem de contexto político, estratégico, ou interpessoal?

**Examples:**

| Scenario                         | Answer     | Why?                                    | Path         |
| -------------------------------- | ---------- | --------------------------------------- | ------------ |
| Decidir prioridade de roadmap    | ✅ SIM     | Estratégia de produto                   | → Pergunta 6 |
| Negociar desconto com fornecedor | ✅ SIM     | Relacionamento comercial                | → Pergunta 6 |
| Escolher stack tecnológico       | ✅ SIM     | Decisão arquitetural de longo prazo     | → Pergunta 6 |
| Gerar relatório de vendas        | ❌ NÃO     | Dados objetivos                         | → Pergunta 4 |
| Aprovar férias de funcionário    | ⚠️ DEPENDE | Se rotina → Worker; se conflito → Human | → Avaliar    |

**If SIM → Pergunta 6**
**If NÃO → Pergunta 4**

---

### Criterion 6: AI pode assistir/preparar?

**Question:** Um AI pode fazer trabalho preparatório que acelera a decisão humana?

**Examples:**

| Scenario                    | AI Assist                       | Human Decision            | Path     |
| --------------------------- | ------------------------------- | ------------------------- | -------- |
| Contratar candidato         | AI faz triagem inicial          | Human entrevista e decide | → Hybrid |
| Aprovar grande investimento | AI prepara análise de ROI       | Human aprova              | → Hybrid |
| Resolver conflito de equipe | ❌ Não aplicável                | Human media               | → Human  |
| Definir preço de produto    | AI analisa mercado/concorrência | Human define estratégia   | → Hybrid |
| Demitir funcionário         | ❌ Não aplicável                | Human executa             | → Human  |

**If SIM → Hybrid**
**If NÃO → Human**

---

## Comparison Matrix

| Attribute              | Worker                                  | Agent                           | Hybrid                            | Human                                |
| ---------------------- | --------------------------------------- | ------------------------------- | --------------------------------- | ------------------------------------ |
| **Custo por execução** | $                                       | $$$$                            | $$                                | $$$                                  |
| **Velocidade**         | ms-s                                    | s-min                           | min-h                             | h-dias                               |
| **Consistência**       | 100%                                    | 85-95%                          | 95%+                              | Variável                             |
| **Escalabilidade**     | ∞                                       | Alta                            | Média                             | Baixa                                |
| **Julgamento**         | Zero                                    | Médio                           | Alto                              | Máximo                               |
| **Setup inicial**      | Alto                                    | Baixo                           | Médio                             | Zero                                 |
| **Manutenção**         | Média                                   | Baixa                           | Média                             | Zero                                 |
| **Fallback**           | Hybrid                                  | Hybrid                          | Human                             | N/A                                  |
| **Auditabilidade**     | Total                                   | Alta                            | Alta                              | Média                                |
| **Adaptabilidade**     | Nenhuma                                 | Alta                            | Alta                              | Máxima                               |
| **Best For**           | Transformações, validações, integrações | Análise, geração, classificação | Conteúdo crítico, decisões médias | Estratégia, relacionamentos, crítico |

---

## Cost-Benefit Analysis

### Custo por 1000 Execuções

| Type   | Custo Direto                                         | Custo Indireto   | Total Estimado |
| ------ | ---------------------------------------------------- | ---------------- | -------------- |
| Worker | ~$0.10 (compute)                                     | $0               | **$0.10**      |
| Agent  | ~$5-50 (tokens)                                      | $0               | **$5-50**      |
| Hybrid | ~$5-50 (tokens) + ~$100 (15min human × $40/h × 0.25) | $0               | **$15-60**     |
| Human  | ~$500 (30min × $40/h × 25 tasks)                     | Opportunity cost | **$500+**      |

### ROI Decision Framework

```
Se task será executada N vezes:

N < 3:        → Agent (menor setup)
3 ≤ N < 50:   → Avaliar: Worker se simples, Agent se complexo
N ≥ 50:       → Worker (ROI positivo mesmo com setup alto)
N ≥ 1000:     → Worker OBRIGATÓRIO (Agent seria $5k-50k)
```

---

## Migration Paths

### Agent → Worker (Determinização)

**Trigger:** Task executada 50+ vezes com output consistente

**Process:**

1. Analisar outputs do Agent dos últimos 30 dias
2. Identificar padrões/regras que emergem
3. Codificar regras como função
4. Testar Worker contra histórico do Agent
5. Se accuracy > 98% → Migrar para Worker

**Example:**

```yaml
migration:
  from: Agent
  to: Worker
  task: "Classificar tipo de documento"
  trigger: "500 execuções, 97% consistência"

  before:
    executor: Agent
    prompt: "Classifique este documento como: invoice, receipt, contract, other"
    cost_per_1000: $25

  after:
    executor: Worker
    implementation: "scripts/classify_document.py"
    rules:
      - "if 'INVOICE' in header → invoice"
      - "if 'RECEIPT' in header → receipt"
      - "if 'AGREEMENT' in text → contract"
      - "else → other"
    cost_per_1000: $0.05

  savings: "99.8% redução de custo"
```

### Hybrid → Agent (Confiança Aumentada)

**Trigger:** Human approval rate > 95% por 30 dias

**Process:**

1. Analisar taxa de aprovação humana
2. Identificar padrões de rejeição
3. Adicionar guardrails para casos de rejeição
4. Implementar validação automatizada
5. Se validação captura 99% dos erros → Migrar para Agent

### Human → Hybrid (Assistência AI)

**Trigger:** Task repetitiva onde AI pode preparar contexto

**Process:**

1. Mapear informações que humano precisa para decidir
2. Criar prompt que coleta/analisa essas informações
3. AI prepara "briefing" para humano
4. Humano decide em fração do tempo

---

## Implementation Examples

### Example 1: Processar Upload de Arquivo

**Context:** Usuário faz upload de arquivo, sistema precisa processar.

**Decision Process:**

1. Output previsível? → Depende do tipo de arquivo
2. Função pura? → SIM para parsing básico
3. Existe lib? → SIM (mime-type, file-parser)

**Result:** Worker

```yaml
task:
  id: process-file-upload
  executor:
    type: Worker
    pattern: EXEC-W-001
    rationale: "Parsing de arquivo é determinístico"
    implementation:
      script: "scripts/process_upload.py"
      libs: ["python-magic", "PyPDF2", "openpyxl"]
    fallback:
      type: Hybrid
      trigger: "Arquivo corrompido ou formato não suportado"
```

---

### Example 2: Gerar Resposta a Ticket de Suporte

**Context:** Cliente abre ticket, sistema sugere resposta.

**Decision Process:**

1. Output previsível? → NÃO (cada ticket é único)
2. Linguagem natural? → SIM
3. Impacto de erro? → MÉDIO (cliente pode ficar insatisfeito)

**Result:** Hybrid

```yaml
task:
  id: generate-support-response
  executor:
    type: Hybrid
    pattern: EXEC-HY-001
    rationale: "LLM gera draft, humano revisa antes de enviar"
    implementation:
      ai_phase:
        model: "claude-sonnet"
        prompt: "Gere resposta empática e útil para: {ticket}"
        output: "draft_response"
      human_phase:
        action: "review_and_send"
        ui: "support-dashboard"
        timeout: "2h"
    fallback:
      type: Human
      trigger: "Ticket marcado como 'escalado' ou 'VIP'"
```

---

### Example 3: Aprovar Despesa > $5000

**Context:** Funcionário solicita reembolso de despesa alta.

**Decision Process:**

1. Output previsível? → NÃO (depende de contexto)
2. Julgamento estratégico? → SIM (política e budget)
3. AI pode assistir? → SIM (verificar política, histórico)

**Result:** Hybrid

```yaml
task:
  id: approve-high-expense
  executor:
    type: Hybrid
    pattern: EXEC-HY-001
    rationale: "AI verifica compliance, human aprova"
    implementation:
      ai_phase:
        checks:
          - "Despesa está dentro da política?"
          - "Funcionário tem histórico de fraude?"
          - "Budget do departamento permite?"
        output: "compliance_report"
      human_phase:
        action: "approve | reject | request_info"
        required_role: "finance_manager"
        documentation: "required"
```

---

### Example 4: Definir OKRs do Trimestre

**Context:** Liderança define objetivos estratégicos.

**Decision Process:**

1. Output previsível? → NÃO
2. Julgamento estratégico? → SIM (direção da empresa)
3. AI pode assistir? → NÃO efetivamente (contexto político interno)

**Result:** Human

```yaml
task:
  id: define-quarterly-okrs
  executor:
    type: Human
    pattern: EXEC-H-001
    rationale: "Decisão estratégica requer contexto que AI não tem"
    implementation:
      responsible: "@leadership_team"
      process: "quarterly_planning_meeting"
      inputs:
        - "performance_metrics"
        - "market_analysis"
        - "team_capacity"
      documentation: "okr_document"
```

---

## Quick Reference Checklist

Use esta checklist para decisão rápida:

### Step 1: Teste de Determinismo

- [ ] Mesmo input SEMPRE gera mesmo output?
  - ✅ SIM → Provavelmente **Worker**
  - ❌ NÃO → Continue

### Step 2: Teste de Linguagem Natural

- [ ] Task envolve entender/gerar texto livre?
  - ✅ SIM → Provavelmente **Agent** ou **Hybrid**
  - ❌ NÃO → Provavelmente **Worker**

### Step 3: Teste de Impacto

- [ ] Erro causa dano significativo?
  - ✅ SIM → **Hybrid** ou **Human**
  - ❌ NÃO → **Agent** ou **Worker**

### Step 4: Teste de Julgamento

- [ ] Requer decisão estratégica/política/interpessoal?
  - ✅ SIM → **Human** (possivelmente **Hybrid**)
  - ❌ NÃO → **Agent** ou **Worker**

### Step 5: Validação Final

- [ ] Escolha final:
  - **Worker** → Existe código que faz? Se não, vale codificar?
  - **Agent** → Prompt está claro? Fallback definido?
  - **Hybrid** → Fluxo de review definido? Timeout?
  - **Human** → Responsável definido? Critérios documentados?

---

## Common Mistakes to Avoid

### 1. Usar Agent para task determinística

**Mistake:** Usar LLM para formatar data, validar CPF, converter unidades.

**Why it happens:** "LLM pode fazer tudo" → esquece que código é mais barato e consistente.

**Correct approach:** Sempre perguntar "Isso pode ser uma função pura?" primeiro.

---

### 2. Usar Worker para task que requer interpretação

**Mistake:** Tentar codificar regras para classificar sentimento ou intenção.

**Why it happens:** Excesso de confiança em regex e if/else.

**Correct approach:** Se a task tem "interpretação", "análise", ou "julgamento", é Agent ou Hybrid.

---

### 3. Pular Hybrid e ir direto para Human

**Mistake:** Humano faz tudo sozinho quando AI poderia preparar 80%.

**Why it happens:** "Não confio no AI" ou "É mais fácil eu fazer".

**Correct approach:** Sempre perguntar "O que o AI pode preparar para acelerar a decisão humana?"

---

### 4. Não definir fallback para Agent

**Mistake:** Agent executa sem plano B quando falha ou output é ruim.

**Why it happens:** Assumir que LLM sempre funciona.

**Correct approach:** Todo Agent deve ter `fallback_to: Hybrid` com trigger claro.

---

### 5. Usar Human para task repetitiva

**Mistake:** Humano processa 100 itens por dia que poderiam ser automatizados.

**Why it happens:** "Sempre fizemos assim" ou "É rápido".

**Correct approach:** Se task é repetida 50+ vezes, DEVE ser Worker ou Agent.

---

## Version History

| Version | Date       | Author          | Changes                               |
| ------- | ---------- | --------------- | ------------------------------------- |
| 1.0.0   | 2026-02-03 | Squad Architect | Initial decision tree with 6 criteria |

---

## Related Documents

- `executor-matrix-framework.md` - Framework original de executores
- `executor-matrix-checklist.md` - Checklist de validação
- `task-tmpl.md` - Template de task (inclui campo execution_type)
- `create-task.md` - Workflow de criação de task

---

## Integration with Task Creation

Este decision tree deve ser aplicado no **Step 0.3** do `create-task.md`:

```yaml
# Integração proposta
step_0_3:
  name: "Assign Executor Type"

  elicitation:
    - question: "Dado o mesmo input, output será SEMPRE idêntico?"
      type: boolean
      if_yes: "criterion_2"
      if_no: "criterion_3"

    - id: criterion_2
      question: "Pode ser implementado como função pura sem ambiguidade?"
      if_yes: "criterion_2a"
      if_no: "criterion_3"

    - id: criterion_2a
      question: "Existe biblioteca/API pronta para isso?"
      if_yes: "result_worker"
      if_no: "criterion_2b"

    # ... continua seguindo a árvore

  output:
    executor_type: "{resultado}"
    executor_rationale: "{explicação baseada no caminho}"
    executor_pattern: "EXEC-{tipo}-001"
```

---

**END OF DECISION TREE**
