# Task: Optimize Squad/Task Execution

**Task ID:** optimize
**Version:** 2.1.0
**Purpose:** Otimizar squads/tasks convertendo Agent → Worker onde possível + análise de economia
**Orchestrator:** @squad-chief
**Mode:** Analysis + Implementation
**Pattern:** EXEC-DT-002
**Execution Type:** `Agent` (requires semantic analysis of task content)

---

## Task Anatomy

| Field                    | Value                                        |
| ------------------------ | -------------------------------------------- |
| **task_name**            | Optimize Squad/Task Execution                |
| **status**               | `active`                                     |
| **responsible_executor** | @squad-chief                                 |
| **execution_type**       | Agent                                        |
| **input**                | `target` (task, squad, ou "all")             |
| **output**               | Relatório de otimização + economia de tokens |
| **action_items**         | Analisar, converter, medir economia          |
| **acceptance_criteria**  | Tasks otimizadas + relatório de ROI          |

---

## Overview

Comando único para otimizar execução de tasks:

1. **Identifica** tasks que deveriam ser Worker (código) ao invés de Agent (LLM)
2. **Converte** tasks para o executor correto
3. **Mede economia** de tokens após refatoração
4. **Gera relatório** de ROI

```
*optimize {target}

Onde {target} pode ser:
- task: "squads/{squad-name}/tasks/{task-name}.md"
- squad: "{squad-name}"
- "all" (todos os squads)

Flags:
--scan        Só analisa, não implementa (default)
--implement   Implementa as conversões
--post        Análise de economia pós-refatoração
--exec N      Projeção com N execuções/mês (default: 20)
```

---

## PHASE 0: TARGET IDENTIFICATION

**Duration:** 1-2 minutes

### Step 0.0: MANDATORY - Load Decision Tree Framework

```yaml
mandatory_first_step:
  action: READ_COMPLETE
  file: "squads/squad-creator-pro/data/executor-decision-tree.md"

  why: |
    The decision tree contains the EXACT 6 questions (Q1-Q6) and criteria
    that MUST be applied to each action. Without loading this framework,
    the analysis WILL BE WRONG.

  validation:
    - "File was read completely? If NO → Read it now"
    - "6 questions understood? Q1, Q2, Q2a, Q2b, Q3, Q4, Q5, Q6"
    - "Output format understood? Table with columns per question"

  if_not_loaded:
    STOP_EXECUTION: true
    message: "Cannot proceed without loading the decision tree framework"
```

---

### Step 0.1: Parse Target

```yaml
parse_target:
  if_file:
    action: "Analisar única task"
    path: "{target}"

  if_squad:
    action: "Listar todas tasks do squad"
    glob: "squads/{target}/tasks/*.md"

  if_all:
    action: "Listar todas tasks de todos squads"
    glob: "squads/*/tasks/*.md"
    exclude:
      - "squads/squad-creator-pro/*" # Meta-squad, não analisar
```

### Step 0.2: Load Tasks

```yaml
load_tasks:
  for_each_file:
    - read: "{file_path}"
    - extract:
        - task_name
        - execution_type (se existir)
        - purpose/description
        - inputs
        - outputs
        - action_items/steps
```

---

## PHASE 1: DETERMINISM ANALYSIS

**Duration:** 2-5 minutes per task

### ⚠️ MANDATORY: Load Decision Tree Framework

**BEFORE ANALYZING ANY TASK, YOU MUST:**

```yaml
mandatory_dependency:
  file: "squads/squad-creator-pro/data/executor-decision-tree.md"
  action: READ COMPLETELY
  reason: "Framework contains the 6 questions and exact criteria for classification"

  validation:
    - "Framework loaded? If NO → STOP and load it"
    - "6 questions understood? If NO → Re-read framework"
    - "Output format clear? If NO → Check Step 1.3"
```

**NEVER "interpret" or "summarize" the framework. FOLLOW IT LITERALLY.**

---

### Step 1.1: Decompose Task into Individual Actions

**CRITICAL:** Don't analyze the task as a whole. Break it into ATOMIC ACTIONS.

```yaml
decompose_task:
  for_each_task: 1. Read the task file COMPLETELY
    2. Identify EVERY action/step in the task
    3. List each action as a separate row for analysis

  example:
    task: "db-health-check.md"
    actions_found:
      - "1.1: Connect to database"
      - "1.2: Check connection pool status"
      - "1.3: Run EXPLAIN on slow queries"
      - "1.4: Check table sizes"
      - "1.5: Generate health report"
```

---

### Step 1.2: Apply Decision Tree Per Action (STRICT)

**FOR EACH ACTION, answer the 6 questions LITERALLY:**

```yaml
analyze_action:
  # DO NOT SKIP ANY QUESTION
  # DO NOT ASSUME ANSWERS
  # FOLLOW THE EXACT FLOW FROM executor-decision-tree.md

  questions_flow:
    Q1: "Output é 100% previsível dado o input?"
      - ✅ SIM → Go to Q2
      - ❌ NÃO → Go to Q3
      - ⚠️ PARCIAL → Explain why, then choose path

    Q2: "Pode ser escrito como função pura f(x) → y?"
      - ✅ SIM → Go to Q2a
      - ❌ NÃO → Go to Q3

    Q2a: "Existe biblioteca/API que faz isso?"
      - ✅ SIM → WORKER
      - ❌ NÃO → Go to Q2b

    Q2b: "Vale a pena codificar? (usado 3+ vezes?)"
      - ✅ SIM → WORKER
      - ❌ NÃO → AGENT

    Q3: "Requer interpretação de linguagem natural?"
      - ✅ SIM → Go to Q4
      - ❌ NÃO → Go to Q5

    Q4: "Impacto de erro é significativo?"
      - Alto/Médio → HYBRID
      - Baixo → AGENT

    Q5: "Requer julgamento estratégico/relacionamento?"
      - ✅ SIM → Go to Q6
      - ❌ NÃO → Go to Q4

    Q6: "AI pode assistir/preparar?"
      - ✅ SIM → HYBRID
      - ❌ NÃO → HUMAN
```

---

### Step 1.3: MANDATORY Output Format

**EVERY analysis MUST produce this exact table format:**

```markdown
## Task: {task_name}

| Step | Ação     | Q1 Det?  | Q2 Pura? | Q2a Lib? | Q3 NL? | Q4 Impacto?      | Executor                  | Justificativa |
| ---- | -------- | -------- | -------- | -------- | ------ | ---------------- | ------------------------- | ------------- |
| 1.1  | {action} | ✅/❌/⚠️ | ✅/❌/⚠️ | ✅/❌/⚠️ | ✅/❌  | Alto/Médio/Baixo | Worker/Agent/Hybrid/Human | {why}         |
| 1.2  | {action} | ✅/❌/⚠️ | ✅/❌/⚠️ | ✅/❌/⚠️ | ✅/❌  | Alto/Médio/Baixo | Worker/Agent/Hybrid/Human | {why}         |

...
```

**Example of CORRECT analysis:**

```markdown
## Task: db-health-check.md

| Step | Ação              | Q1 Det?    | Q2 Pura? | Q2a Lib?    | Q3 NL? | Q4 Impacto? | Executor | Justificativa                            |
| ---- | ----------------- | ---------- | -------- | ----------- | ------ | ----------- | -------- | ---------------------------------------- |
| 1.1  | Conectar ao banco | ✅ SIM     | ✅ SIM   | ✅ SIM (pg) | -      | -           | Worker   | Connection string + lib = determinístico |
| 1.2  | Verificar pool    | ✅ SIM     | ✅ SIM   | ✅ SIM (pg) | -      | -           | Worker   | Query fixa retorna métricas fixas        |
| 1.3  | EXPLAIN queries   | ✅ SIM     | ✅ SIM   | ✅ SIM (pg) | -      | -           | Worker   | EXPLAIN é comando SQL determinístico     |
| 1.4  | Checar tamanhos   | ✅ SIM     | ✅ SIM   | ✅ SIM      | -      | -           | Worker   | pg_relation_size() é determinístico      |
| 1.5  | Gerar relatório   | ⚠️ PARCIAL | ❌ NÃO   | -           | ✅ SIM | Baixo       | Agent    | Interpretar dados e sugerir melhorias    |

**Conclusão:** 4/5 ações são Worker, 1/5 é Agent → Task é HYBRID ou pode ter script + agent no final
```

**Example of WRONG analysis (DO NOT DO THIS):**

```markdown
❌ ERRADO: "db-health-check parece ser Agent porque faz análise de banco"
❌ ERRADO: Analisar pelo nome do arquivo sem ler o conteúdo
❌ ERRADO: Não mostrar a tabela com cada ação
❌ ERRADO: Pular perguntas Q1-Q6
```

---

### Step 1.4: Quality Gate Before Proceeding

```yaml
quality_gate_phase_1:
  checklist:
    - [ ] Decision tree framework was READ completely (not summarized)
    - [ ] Each task was READ completely (not assumed from name)
    - [ ] Each task was DECOMPOSED into individual actions
    - [ ] Each action went through Q1-Q6 questions
    - [ ] Table format was used for every task
    - [ ] Justification column explains the reasoning

  if_any_unchecked:
    action: STOP
    message: "Analysis incomplete. Return to Step 1.1"
```

### Step 1.5: Aggregate Task Classification

After analyzing all actions, classify the TASK OVERALL:

```yaml
classify_task:
  logic: |
    Count executor types across all actions:
    - If 100% Worker → Task is WORKER
    - If 100% Agent → Task is AGENT
    - If mixed Worker + Agent → Task is HYBRID (Worker script + Agent interpretation)
    - If any Human → Task requires HUMAN involvement

  categories:
    SHOULD_BE_WORKER:
      criteria:
        - "ALL actions are deterministic (Q1=SIM)"
        - "ALL can be pure functions (Q2=SIM)"
        - "Libraries exist OR worth coding (Q2a/Q2b=SIM)"
      recommendation: "Create Worker script"
      priority: "HIGH"

    COULD_BE_WORKER:
      criteria:
        - "MAJORITY of actions are deterministic"
        - "1-2 actions need interpretation"
        - "Can split: Worker for deterministic + Agent fallback"
      recommendation: "Create Worker with Agent fallback"
      priority: "MEDIUM"

    CORRECTLY_AGENT:
      criteria:
        - "MAJORITY of actions require NL interpretation (Q3=SIM)"
        - "Impact is LOW (Q4=Baixo)"
        - "Current execution_type = Agent matches analysis"
      recommendation: "Keep as Agent"
      priority: "NONE"

    SHOULD_BE_HYBRID:
      criteria:
        - "Contains Agent actions with MEDIUM/HIGH impact"
        - "Output affects external users/clients"
        - "Would benefit from human review"
      recommendation: "Add human validation step"
      priority: "MEDIUM"

    MISCLASSIFIED:
      criteria:
        - "Current execution_type doesn't match analysis"
        - "Example: execution_type=Agent but all actions are deterministic"
      recommendation: "Reclassify executor"
      priority: "HIGH"
```

---

## PHASE 2: ROI CALCULATION

**Duration:** 1-2 minutes

### Step 2.1: Estimate Costs

```yaml
calculate_roi:
  per_task:
    current_cost:
      if_agent:
        tokens_per_execution: "{estimate based on task complexity}"
        cost_per_1000_tokens: "$0.003 (input) + $0.015 (output)"
        executions_per_month: "{estimate}"
        monthly_cost: "{calculation}"

    potential_cost:
      if_worker:
        compute_per_execution: "$0.0001"
        monthly_cost: "{calculation}"

    savings:
      monthly: "{current - potential}"
      annual: "{monthly × 12}"

    conversion_effort:
      simple: "2-4 hours (lib exists)"
      medium: "1-2 days (need to implement)"
      complex: "3-5 days (edge cases)"

    payback_period:
      formula: "conversion_effort_cost / monthly_savings"
      threshold: "< 3 months = worth it"
```

---

## PHASE 3: REPORT GENERATION

**Duration:** 2-3 minutes

### Step 3.1: Generate Report

````yaml
report_template: |
  # Determinism Analysis Report

  **Target:** {target}
  **Date:** {date}
  **Tasks Analyzed:** {count}

  ---

  ## Executive Summary

  | Category | Count | Potential Monthly Savings |
  |----------|-------|---------------------------|
  | Should be Worker | {n} | ${savings} |
  | Could be Worker | {n} | ${savings} |
  | Correctly Agent | {n} | - |
  | Should be Hybrid | {n} | - |
  | Misclassified | {n} | - |

  **Total Potential Savings:** ${total}/month (${annual}/year)

  ---

  ## 🔴 HIGH PRIORITY: Should Be Worker

  Tasks que estão usando LLM mas poderiam ser código determinístico:

  ### {task_name}

  **Current:** Agent
  **Recommended:** Worker
  **Reason:** {analysis}

  **Evidence:**
  - Input: {input_type} → Estruturado ✅
  - Output: {output_type} → Previsível ✅
  - Lib exists: {lib_name} ✅

  **Implementation:**
  ```python
  # Sugestão de implementação
  {code_suggestion}
````

**ROI:**

- Current cost: ${current}/month
- After conversion: ${after}/month
- Savings: ${savings}/month
- Conversion effort: {hours}h
- Payback: {days} days

---

## 🟡 MEDIUM PRIORITY: Could Be Worker

Tasks que poderiam ser Worker com algumas modificações:

### {task_name}

**Current:** Agent
**Recommended:** Worker with fallback to Agent
**Reason:** {analysis}

**Blockers:**

- {blocker_1}
- {blocker_2}

**Path to Worker:**

1. {step_1}
2. {step_2}
3. {step_3}

---

## ✅ CORRECTLY CLASSIFIED: Agent

Tasks que corretamente usam LLM:

| Task        | Reason   |
| ----------- | -------- |
| {task_name} | {reason} |

---

## ⚠️ SHOULD ADD VALIDATION: Hybrid

Tasks Agent que deveriam ter validação humana:

| Task        | Impact Level | Recommendation   |
| ----------- | ------------ | ---------------- |
| {task_name} | {level}      | Add human review |

---

## Action Items

### Immediate (this week)

- [ ] Convert {task_1} to Worker
- [ ] Convert {task_2} to Worker

### Short-term (this month)

- [ ] Evaluate {task_3} for conversion
- [ ] Add Hybrid validation to {task_4}

### Backlog

- [ ] Monitor {task_5} for patterns

````

---

## PHASE 4: IMPLEMENTATION SUGGESTIONS

### Step 4.1: Generate Code Stubs

Para tasks classificadas como SHOULD_BE_WORKER, gerar sugestão de implementação:

```yaml
code_generation:
  for_each_should_be_worker:
    analyze:
      - "Qual é a transformação core?"
      - "Quais libs usar?"
      - "Quais edge cases?"

    generate:
      script_template: |
        #!/usr/bin/env python3
        """
        Worker: {task_name}

        Converted from Agent to deterministic code.
        Original task: {task_file}
        """

        import {libs}

        def {function_name}(input_data: dict) -> dict:
            """
            {description}

            Args:
                input_data: {input_schema}

            Returns:
                {output_schema}
            """
            # Validation
            {validation_code}

            # Core transformation
            {transformation_code}

            # Output
            return {output}


        if __name__ == "__main__":
            # Example usage
            result = {function_name}({example_input})
            print(result)
````

---

## Examples

### Example 1: Analyzing Single Task (CORRECT FORMAT)

<!-- Example - replace with your squad and task -->

```
User: *optimize squads/{squad-name}/tasks/{task-name}.md

Agent:

## Step 0.0: Loading Decision Tree Framework ✅
Read: squads/squad-creator-pro/data/executor-decision-tree.md (775 lines)

## Step 0.1: Loading Task
Read: squads/{squad-name}/tasks/{task-name}.md

## Step 1.1: Decomposing into Actions
Actions found in {task-name}.md:
- 1.1: Receive testimonial data object
- 1.2: Extract quote, name, title fields
- 1.3: Format into string pattern
- 1.4: Return formatted string

## Step 1.2-1.3: Decision Tree Analysis (Per Action)

| Step | Ação | Q1 Det? | Q2 Pura? | Q2a Lib? | Q3 NL? | Q4 Impacto? | Executor | Justificativa |
|------|------|---------|----------|----------|--------|-------------|----------|---------------|
| 1.1 | Receive data object | ✅ SIM | ✅ SIM | ✅ SIM | - | - | Worker | JSON parsing é determinístico |
| 1.2 | Extract fields | ✅ SIM | ✅ SIM | ✅ SIM | - | - | Worker | Object property access é determinístico |
| 1.3 | Format string | ✅ SIM | ✅ SIM | ✅ SIM | - | - | Worker | Template string é determinístico |
| 1.4 | Return result | ✅ SIM | ✅ SIM | ✅ SIM | - | - | Worker | Return value é determinístico |

## Step 1.5: Task Classification

**Result:** 4/4 ações são Worker → Task é **SHOULD_BE_WORKER** ✅

**Current:** Agent ❌
**Recommended:** Worker ✅
**Priority:** HIGH

## ROI Calculation

| Métrica | Antes (Agent) | Depois (Worker) |
|---------|---------------|-----------------|
| Tokens/exec | ~500 | ~0 |
| Custo/exec | $0.015 | $0.0001 |
| Mensal (200 exec) | $3.00 | $0.02 |
| Anual | $36.00 | $0.24 |
| **Economia** | | **$35.76/ano (99%)** |
```

### Example 2: Analyzing Mixed Task (Worker + Agent)

<!-- Example - replace with your squad and task -->

```
User: *optimize squads/{squad-name}/tasks/{task-name}.md

Agent:

## Step 0.0: Loading Decision Tree Framework ✅
Read: squads/squad-creator-pro/data/executor-decision-tree.md (775 lines)

## Step 0.1: Loading Task
Read: squads/{squad-name}/tasks/{task-name}.md

## Step 1.1: Decomposing into Actions
Actions found:
- 1.1: Connect to database
- 1.2: Query pg_stat_activity
- 1.3: Check connection pool metrics
- 1.4: Run EXPLAIN on slow queries
- 1.5: Check table/index sizes
- 1.6: Analyze findings and generate recommendations

## Step 1.2-1.3: Decision Tree Analysis (Per Action)

| Step | Ação | Q1 Det? | Q2 Pura? | Q2a Lib? | Q3 NL? | Q4 Impacto? | Executor | Justificativa |
|------|------|---------|----------|----------|--------|-------------|----------|---------------|
| 1.1 | Connect to DB | ✅ SIM | ✅ SIM | ✅ SIM (pg) | - | - | Worker | pg lib + connection string = determinístico |
| 1.2 | Query pg_stat | ✅ SIM | ✅ SIM | ✅ SIM | - | - | Worker | SQL query retorna dados estruturados |
| 1.3 | Check pool | ✅ SIM | ✅ SIM | ✅ SIM | - | - | Worker | Métricas são valores numéricos |
| 1.4 | Run EXPLAIN | ✅ SIM | ✅ SIM | ✅ SIM | - | - | Worker | EXPLAIN é comando SQL determinístico |
| 1.5 | Check sizes | ✅ SIM | ✅ SIM | ✅ SIM | - | - | Worker | pg_relation_size() retorna bytes |
| 1.6 | Analyze + recommend | ❌ NÃO | - | - | ✅ SIM | Baixo | Agent | Interpretar padrões e sugerir melhorias |

## Step 1.5: Task Classification

**Result:** 5/6 Worker + 1/6 Agent → Task é **COULD_BE_WORKER** (with Agent fallback)

**Recommendation:** Create bash script for steps 1.1-1.5, Agent only for 1.6

**Implementation Strategy:**
```

scripts/db-health-checker.sh → Executa queries, coleta dados
Agent → Recebe dados, interpreta, gera recomendações

```

## ROI Calculation

| Métrica | Antes (100% Agent) | Depois (Hybrid) |
|---------|-------------------|-----------------|
| Tokens input/exec | ~2000 | ~500 |
| Tokens output/exec | ~1000 | ~800 |
| Custo/exec | $0.10 | $0.05 |
| Economia | | **50%** |
```

### Example 3: Squad Summary Report

```
User: *optimize db-sage

Agent:

## 📊 Determinism Analysis: Squad db-sage

**Date:** 2026-02-03
**Tasks Analyzed:** 28

---

## Summary Table

| Category | Count | % | Monthly Savings |
|----------|-------|---|-----------------|
| 🔴 SHOULD_BE_WORKER | 8 | 29% | $40 |
| 🟡 COULD_BE_WORKER | 5 | 18% | $25 |
| ✅ CORRECTLY_AGENT | 12 | 43% | - |
| ⚠️ SHOULD_BE_HYBRID | 3 | 10% | - |

**Total Potential Savings:** $65/month ($780/year)

---

## 🔴 HIGH PRIORITY: Should Be Worker

[For each task, show the analysis table as in Example 1]

---

## 🟡 MEDIUM PRIORITY: Could Be Worker

[For each task, show the analysis table as in Example 2]

---

## ✅ Correctly Agent

| Task | Reason (from Q1-Q6 analysis) |
|------|------------------------------|
| query-optimization.md | Q3=SIM: requires analyzing query patterns |
| domain-modeling.md | Q3=SIM: requires understanding business context |
...
```

---

## Command Variants

```bash
# Análise (default) - só mostra oportunidades
*optimize db-sage
*optimize copy
*optimize all

# Implementação - converte tasks + cria scripts
*optimize db-sage --implement

# Pós-refatoração - análise de economia
*optimize db-sage --post
*optimize db-sage --post --exec 50   # projeção com 50 exec/mês

# Combinados
*optimize db-sage --implement --post  # implementa e mostra economia
```

---

## Quality Gate

```yaml
quality_gate:
  id: "DET_ANALYSIS_001"
  name: "Determinism Analysis Quality"

  blocking:
    - "Cada task tem classificação"
    - "Classificação tem justificativa"
    - "ROI calculado para conversões"

  warning:
    - "Sugestão de código para Workers"
    - "Action items priorizados"
```

---

## Integration Points

### Post-Analysis Actions

```yaml
post_analysis:
  if_should_be_worker:
    suggest:
      - "Quer que eu crie o script Worker para {task}?"
      - "Quer que eu atualize a task para execution_type: Worker?"

  if_should_be_hybrid:
    suggest:
      - "Quer que eu adicione human_review ao {task}?"

  if_misclassified:
    suggest:
      - "Quer que eu corrija o execution_type de {task}?"
```

---

## PHASE 5: POST-REFACTORING ECONOMY ANALYSIS

**Trigger:** Após implementar conversões Worker/Hybrid
**Command:** `*optimize {target} --post`

### Step 5.1: Inventory Changes

```yaml
inventory_changes:
  scan:
    - "Encontrar tasks com execution_type: Worker"
    - "Encontrar scripts criados em scripts/"
    - "Mapear task → script correspondente"

  collect:
    for_each_task:
      - task_name
      - execution_type
      - script_path (se Worker)
      - task_lines (wc -l)
      - script_lines (wc -l)
```

### Step 5.2: Calculate Token Economics

```yaml
token_economics:
  model: "claude-opus"
  pricing:
    input_per_1m: 15.00 # $15/1M tokens
    output_per_1m: 75.00 # $75/1M tokens
    avg_ratio: "80% input / 20% output"
    blended_per_1m: 27.00 # ~$0.027/1K tokens

  estimate_tokens:
    # 1 linha markdown ≈ 15 tokens
    # 1 linha código ≈ 10 tokens
    # Raciocínio do Agent ≈ 500-1500 tokens output

    before_agent:
      input: "task_lines × 15 + context_overhead(500)"
      output: "reasoning(800) + commands(300)"
      total_per_exec: "(input × 0.015) + (output × 0.075)"

    after_worker:
      input: "invocation_tokens(100) + result_parse(200)"
      output: "summary(150)"
      total_per_exec: "(300 × 0.015) + (150 × 0.075)"

    after_hybrid:
      # Worker executa + Agent valida resultado
      input: "invocation(100) + result(500) + validation_context(300)"
      output: "validation_reasoning(400)"
      total_per_exec: "(900 × 0.015) + (400 × 0.075)"
```

### Step 5.3: Generate Economy Report

```yaml
report_template: |
  ╔══════════════════════════════════════════════════════════════════════════════╗
  ║                    ANÁLISE DE ECONOMIA DE TOKENS                              ║
  ║                    Squad: {squad_name}                                        ║
  ║                    Data: {date}                                               ║
  ╚══════════════════════════════════════════════════════════════════════════════╝

  ═══ INVENTÁRIO DE MUDANÇAS ═══

  | Tipo     | Qty | Scripts Criados |
  |----------|-----|-----------------|
  | Worker   | {n} | {script_list}   |
  | Hybrid   | {n} | {script_list}   |
  | Agent    | {n} | (não alterados) |

  ═══ ECONOMIA POR EXECUÇÃO ═══

  | Task | Tipo | ANTES (tokens) | DEPOIS (tokens) | Economia |
  |------|------|----------------|-----------------|----------|
  {for_each_task}
  | {task_name} | {type} | {before} | {after} | {savings} ({pct}%) |
  {end_for}

  ═══ PROJEÇÃO MENSAL ═══

  Cenário: {executions_per_month} execuções/mês

  | Tipo    | Tasks | Exec/mês | Tokens ANTES | Tokens DEPOIS | Economia    |
  |---------|-------|----------|--------------|---------------|-------------|
  | Worker  | {n}   | {exec}   | {before}     | {after}       | {savings}   |
  | Hybrid  | {n}   | {exec}   | {before}     | {after}       | {savings}   |
  | Agent   | {n}   | {exec}   | {before}     | {before}      | 0           |
  |---------|-------|----------|--------------|---------------|-------------|
  | TOTAL   | {n}   | {exec}   | {total_before}| {total_after}| {total_sav} |

  ═══ ECONOMIA FINANCEIRA ═══

  Modelo: Claude Opus ($15/1M input + $75/1M output)

  | Período  | ANTES      | DEPOIS     | Economia   | % Redução |
  |----------|------------|------------|------------|-----------|
  | Por exec | ${before}  | ${after}   | ${savings} | {pct}%    |
  | Mensal   | ${monthly} | ${monthly} | ${savings} | {pct}%    |
  | Anual    | ${annual}  | ${annual}  | ${savings} | {pct}%    |

  ═══ ROI DA REFATORAÇÃO ═══

  | Métrica              | Valor            |
  |----------------------|------------------|
  | Tempo investido      | ~{hours}h        |
  | Custo do tempo       | ~${time_cost}    |
  | Economia mensal      | ${monthly_save}  |
  | Payback              | {payback_days} dias |
  | ROI 12 meses         | {roi_pct}%       |

  ═══ RESUMO EXECUTIVO ═══

  ┌─────────────────────────────────────────┐
  │  ECONOMIA TOTAL: {total_pct}%           │
  │  TOKENS/MÊS: -{tokens_saved}            │
  │  $/MÊS: -${monthly_savings}             │
  │  $/ANO: -${annual_savings}              │
  │  PAYBACK: {payback} dias                │
  └─────────────────────────────────────────┘
```

### Step 5.4: Per-Script Breakdown

```yaml
script_breakdown:
  for_each_script:
    script_name: "{name}"
    tasks_covered:
      - "{task_1}"
      - "{task_2}"

    metrics:
      script_lines: "{wc -l}"
      tasks_lines_total: "{sum of task lines}"
      tokens_saved_per_exec: "{calculation}"

    output: |
      ### {script_name}

      | Métrica | Valor |
      |---------|-------|
      | Tasks cobertas | {count} |
      | Linhas do script | {lines} |
      | Economia/execução | ~{tokens} tokens |
      | Economia/mês | ~${monthly} |

      **Tasks:**
      {for task in tasks}
      - `{task}` ({lines} linhas → {tokens} tokens economizados)
      {end}
```

### Step 5.5: Comparison Table

```yaml
comparison_table:
  generate: |
    ## Comparativo ANTES vs DEPOIS

    | Aspecto | ANTES (Agent) | DEPOIS (Worker) | Diferença |
    |---------|---------------|-----------------|-----------|
    | Tokens input/exec | ~{before_in} | ~{after_in} | -{diff} ({pct}%) |
    | Tokens output/exec | ~{before_out} | ~{after_out} | -{diff} ({pct}%) |
    | Custo/execução | ${before_cost} | ${after_cost} | -${diff} |
    | Tempo de resposta | ~{before_sec}s | ~{after_sec}s | -{diff}s |
    | Determinismo | Variável | 100% | +Confiabilidade |
    | Auditabilidade | Baixa | Alta | +Rastreabilidade |
```

---

## Quick Reference

```bash
# SCAN - Identifica oportunidades
*optimize {squad}

# IMPLEMENT - Converte + cria scripts
*optimize {squad} --implement

# POST - Economia após refatoração
*optimize {squad} --post

# FULL - Implementa e mostra economia
*optimize {squad} --implement --post
```

---

## Auto-Trigger Rules

```yaml
auto_trigger:
  after_script_creation:
    message: "Script criado. Executando *optimize --post..."
    auto_run: true

  after_batch_refactor:
    condition: "3+ tasks modificadas"
    message: "Refatoração detectada. Gerando análise de economia..."
    auto_run: true
```

---

## ⛔ ANTI-PATTERNS (What NOT to do)

These mistakes WILL result in wrong analysis:

### ❌ Anti-Pattern 1: Analyzing by filename only

```yaml
WRONG:
  input: "*optimize design"
  output: "thumbnail-design.md → Agent because 'design' suggests creativity"
  why_wrong: "Didn't read the task file, assumed from name"

CORRECT:
  input: "*optimize design"
  action: 1. Read squads/design/tasks/thumbnail-design.md completely
    2. Decompose into individual actions
    3. Apply Q1-Q6 to EACH action
    4. Show table with all columns
```

### ❌ Anti-Pattern 2: Skipping the framework load

```yaml
WRONG:
  process: "I'll analyze the tasks based on my understanding..."
  why_wrong: "Framework not loaded, criteria not standardized"

CORRECT:
  process: 1. READ squads/squad-creator-pro/data/executor-decision-tree.md
    2. THEN analyze tasks using the exact Q1-Q6 flow
```

### ❌ Anti-Pattern 3: Summarizing instead of tabular output

```yaml
WRONG:
  output: |
    - Task A: Probably Worker
    - Task B: Seems like Agent
    - Task C: Could be Hybrid

CORRECT:
  output: |
    | Step | Ação | Q1 Det? | Q2 Pura? | Q2a Lib? | Q3 NL? | Q4 Impacto? | Executor | Justificativa |
    |------|------|---------|----------|----------|--------|-------------|----------|---------------|
    | ... detailed analysis per action ... |
```

### ❌ Anti-Pattern 4: Analyzing whole task instead of actions

```yaml
WRONG:
  analysis: "db-health-check is a complex task that involves database analysis → Agent"
  why_wrong: "Treated task as monolithic instead of decomposing"

CORRECT:
  analysis:
    1. Decompose: "Connect, Query, Check, Analyze"
    2. Analyze each: "Connect=Worker, Query=Worker, Check=Worker, Analyze=Agent"
    3. Conclude: "3/4 Worker + 1/4 Agent = Hybrid approach"
```

### ❌ Anti-Pattern 5: Using intuition instead of Q1-Q6 flow

```yaml
WRONG:
  reasoning: "This feels like it needs AI judgment"

CORRECT:
  reasoning: |
    Q1: Output previsível? ❌ NÃO - interpretar padrões varia
    Q3: Requer NL? ✅ SIM - gerar recomendações textuais
    Q4: Impacto de erro? Baixo - relatório interno
    → Agent (followed Q1→Q3→Q4 path)
```

---

## ✅ VALIDATION CHECKLIST (Before Delivering Report)

Run this checklist BEFORE presenting results to user:

```yaml
pre_delivery_validation:
  framework_compliance:
    - [ ] executor-decision-tree.md was READ completely (not summarized)
    - [ ] All 6 questions (Q1, Q2, Q2a, Q2b, Q3, Q4, Q5, Q6) are understood

  analysis_quality:
    - [ ] Each task file was READ completely (not assumed from name)
    - [ ] Each task was DECOMPOSED into individual actions
    - [ ] EVERY action has a row in the analysis table
    - [ ] Table has ALL columns: Step | Ação | Q1 | Q2 | Q2a | Q3 | Q4 | Executor | Justificativa
    - [ ] Executor column matches the Q1-Q6 flow result
    - [ ] Justificativa column explains WHY (not just "seems like")

  output_format:
    - [ ] Used markdown table format (not bullet lists)
    - [ ] Showed framework load step explicitly
    - [ ] Showed task decomposition step explicitly
    - [ ] Summary counts match individual analyses

  if_any_unchecked:
    action: GO_BACK_AND_FIX
    message: "Analysis incomplete. Redo from the unchecked step."
```

---

## Related Documents

- `executor-decision-tree.md` - Decision tree usado na análise (MUST READ)
- `executor-matrix-framework.md` - Perfis de executores
- `create-task.md` - Workflow de criação (usa mesma lógica)

---

**END OF TASK**
