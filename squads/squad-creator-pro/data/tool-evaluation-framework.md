# Tool Evaluation Framework

**Version:** 2.0
**Purpose:** Framework de avaliação de ferramentas baseado em **análise comparativa** e **tiers relativos**, não em valores absolutos arbitrários.

## Filosofia Central

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRINCÍPIO FUNDAMENTAL                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  NÃO EXISTEM VALORES ABSOLUTOS UNIVERSAIS.                      │
│                                                                 │
│  Um projeto com 30 stars pode ser EXCELENTE se for o melhor     │
│  do nicho. Um projeto com 10,000 stars pode ser MEDIANO se      │
│  todos os concorrentes tiverem 50,000.                          │
│                                                                 │
│  SEMPRE comparar ferramentas ENTRE SI, dentro do contexto       │
│  da pesquisa realizada.                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Princípios Operacionais

1. **Comparação Relativa** - Tiers baseados nos projetos encontrados, não em números mágicos
2. **Contexto de Domínio** - Ferramentas de nicho competem com ferramentas de nicho
3. **Segurança é Factual** - CVE crítica é CVE crítica (único absoluto aceitável)
4. **Nenhum VETO Prematuro** - Projetos pequenos podem ser a melhor opção
5. **Dados > Heurísticas** - Normalizar dentro do dataset encontrado

---

## 1. METODOLOGIA DE TIERS RELATIVOS

### 1.1 Como Funciona

```
PASSO 1: Pesquisa encontra N ferramentas para o domínio
         Exemplo: 25 MCPs para "copywriting"

PASSO 2: Para CADA dimensão, coletar valores brutos
         stars: [12, 45, 89, 150, 500, 2000, ...]
         downloads: [100, 500, 2000, 10000, ...]

PASSO 3: Calcular percentis DENTRO do conjunto
         P20 = valor no percentil 20
         P50 = mediana
         P80 = valor no percentil 80

PASSO 4: Classificar cada ferramenta por tier RELATIVO
         Tier 1: Top 20% (acima de P80)
         Tier 2: 21-50% (entre P50 e P80)
         Tier 3: 51-80% (entre P20 e P50)
         Tier 4: Bottom 20% (abaixo de P20)

PASSO 5: Combinar tiers de múltiplas dimensões
         Tool X: Stars=Tier1, Downloads=Tier2, Activity=Tier1
         → Composite Tier = weighted average
```

### 1.2 Cálculo de Percentis

```python
def calculate_tier(value, all_values):
    """
    Retorna tier 1-4 baseado na posição relativa do valor
    dentro do conjunto de todos os valores encontrados.
    """
    sorted_values = sorted(all_values)
    n = len(sorted_values)

    p20 = sorted_values[int(n * 0.20)]
    p50 = sorted_values[int(n * 0.50)]
    p80 = sorted_values[int(n * 0.80)]

    if value >= p80:
        return 1  # Top 20%
    elif value >= p50:
        return 2  # 21-50%
    elif value >= p20:
        return 3  # 51-80%
    else:
        return 4  # Bottom 20%
```

### 1.3 Normalização de Score (0-10)

```python
def normalize_score(value, all_values):
    """
    Normaliza valor para escala 0-10 baseado no range encontrado.
    Usa log scale para métricas com distribuição exponencial (stars, downloads).
    """
    import math

    # Log scale para métricas exponenciais
    log_value = math.log10(value + 1)
    log_min = math.log10(min(all_values) + 1)
    log_max = math.log10(max(all_values) + 1)

    # Normalizar para 0-10
    if log_max == log_min:
        return 5.0  # Todos iguais

    normalized = ((log_value - log_min) / (log_max - log_min)) * 10
    return round(normalized, 2)
```

---

## 2. DIMENSÕES DE AVALIAÇÃO

### 2.1 Prova Social (Social Proof)

**Métricas coletadas (valores brutos):**

| Métrica                   | Fonte      | Tipo                     |
| ------------------------- | ---------- | ------------------------ |
| `github_stars`            | GitHub API | Exponencial              |
| `github_forks`            | GitHub API | Exponencial              |
| `npm_downloads_weekly`    | npm API    | Exponencial              |
| `pypi_downloads_monthly`  | PyPI API   | Exponencial              |
| `contributors_count`      | GitHub API | Linear                   |
| `open_issues_count`       | GitHub API | Linear                   |
| `closed_issues_count`     | GitHub API | Linear                   |
| `last_commit_days_ago`    | GitHub API | Inverso (menor = melhor) |
| `releases_last_year`      | GitHub API | Linear                   |
| `stackoverflow_questions` | SO API     | Exponencial              |

**Cálculo do Tier de Social Proof:**

```yaml
social_proof_tier:
  components:
    - dimension: popularity
      metrics: [github_stars, npm_downloads, pypi_downloads]
      weight: 0.30

    - dimension: community_health
      metrics: [contributors_count, issues_response_ratio]
      weight: 0.25

    - dimension: activity
      metrics: [last_commit_days_ago, releases_last_year]
      weight: 0.25
      note: "last_commit é INVERSO - menor = melhor"

    - dimension: adoption
      metrics: [stackoverflow_questions, known_users]
      weight: 0.20

  calculation: |
    Para cada dimension:
      1. Normalizar cada métrica (0-10) dentro do dataset
      2. Média das métricas da dimension
      3. Aplicar weight

    social_proof_score = sum(dimension_score * weight)
    social_proof_tier = percentile_tier(social_proof_score, all_scores)
```

### 2.2 Segurança (Security)

**NOTA:** Segurança é a ÚNICA dimensão com alguns critérios absolutos, pois CVEs são fatos objetivos.

**Métricas coletadas:**

| Métrica                | Fonte           | Tipo                 |
| ---------------------- | --------------- | -------------------- |
| `critical_cves`        | NVD/MITRE       | Absoluto (0 = ideal) |
| `high_cves`            | NVD/MITRE       | Absoluto (0 = ideal) |
| `medium_cves`          | NVD/MITRE       | Linear               |
| `low_cves`             | NVD/MITRE       | Linear               |
| `deps_vulnerabilities` | npm audit / pip | Contagem             |
| `has_security_policy`  | GitHub          | Boolean              |
| `has_security_audit`   | Pesquisa        | Boolean              |
| `signed_releases`      | GitHub          | Boolean              |

**Cálculo do Security Score:**

```yaml
security_assessment:
  # Critérios FACTUAIS (não arbitrários)
  factual_flags:
    - critical_cve_unpatched:
        condition: "CVE crítica conhecida sem patch"
        action: "FLAG - requer atenção humana"
        note: "NÃO é VETO automático, mas destaque importante"

    - malware_history:
        condition: "Incidente de segurança documentado"
        action: "FLAG - requer análise do incidente"
        note: "Pode ter sido resolvido, humano decide"

  # Scoring relativo (comparando com outros do dataset)
  relative_scoring:
    base: 10

    deductions_relative:
      # Comparar quantidade de CVEs com outros projetos
      - cve_count_tier:
          tier_1: -0 # Menos CVEs que 80% dos projetos
          tier_2: -1 # Menos que mediana
          tier_3: -2 # Mais que mediana
          tier_4: -3 # Mais que 80% dos projetos

      - deps_vulnerabilities_tier:
          tier_1: -0
          tier_2: -0.5
          tier_3: -1
          tier_4: -2

    bonuses:
      - has_security_policy: +0.5
      - has_security_audit: +1.0
      - signed_releases: +0.5
      - bug_bounty_program: +0.5

  final_score: "base - deductions + bonuses"
  final_tier: "percentile_tier(score, all_security_scores)"
```

### 2.3 Maturidade (Maturity)

**Métricas coletadas:**

| Métrica                      | Fonte                 | Tipo       |
| ---------------------------- | --------------------- | ---------- |
| `age_months`                 | GitHub created_at     | Linear     |
| `major_version`              | package.json/setup.py | Linear     |
| `breaking_changes_last_year` | CHANGELOG             | Inverso    |
| `documentation_completeness` | Manual check          | Score 1-5  |
| `has_examples`               | Repo check            | Boolean    |
| `has_tests`                  | Repo check            | Boolean    |
| `test_coverage`              | Codecov/similar       | Percentual |

**Cálculo:**

```yaml
maturity_tier:
  components:
    - dimension: longevity
      metrics: [age_months, major_version]
      weight: 0.30

    - dimension: stability
      metrics: [breaking_changes_last_year] # Inverso
      weight: 0.25

    - dimension: documentation
      metrics: [documentation_completeness, has_examples]
      weight: 0.25

    - dimension: quality
      metrics: [has_tests, test_coverage]
      weight: 0.20

  calculation: "Same as social_proof - normalize, weight, percentile"
```

### 2.4 Adequação ao Domínio (Domain Fit)

**Esta dimensão é QUALITATIVA e requer análise:**

```yaml
domain_fit_assessment:
  questions:
    - capability_coverage:
        question: "Quantos dos gaps identificados esta tool preenche?"
        scoring: "gaps_filled / total_gaps * 10"
        weight: 0.40

    - specificity:
        question: "A tool foi feita para este domínio ou é genérica?"
        options:
          - "Feita especificamente para o domínio": 10
          - "Adaptável ao domínio com config": 7
          - "Genérica mas aplicável": 5
          - "Tangencialmente relacionada": 3
        weight: 0.30

    - integration_complexity:
        question: "Quão fácil integrar com o squad?"
        options:
          - "Drop-in, funciona imediatamente": 10
          - "Config simples necessária": 8
          - "Wrapper/adapter necessário": 5
          - "Desenvolvimento significativo": 3
        weight: 0.30

  tier_calculation: "percentile of (capability * 0.4 + specificity * 0.3 + integration * 0.3)"
```

---

## 3. RICE FRAMEWORK (Adaptado para Comparação Relativa)

### 3.1 Reach (Alcance)

```yaml
reach:
  definition: "Proporção de use cases do squad que a tool afeta"

  calculation: |
    reach_raw = use_cases_affected / total_use_cases
    reach_score = reach_raw * 10

  # Tier é relativo aos outros tools encontrados
  tier: "percentile_tier(reach_score, all_reach_scores)"

  interpretation:
    tier_1: "Afeta mais use cases que 80% das alternativas"
    tier_2: "Afeta mais que a mediana"
    tier_3: "Afeta menos que a mediana"
    tier_4: "Afeta menos use cases que 80% das alternativas"
```

### 3.2 Impact (Impacto)

```yaml
impact:
  definition: "Magnitude do benefício quando implementado"

  assessment_questions:
    - "Quanto trabalho manual elimina? (%)"
    - "Quanto melhora a qualidade do output? (%)"
    - "O squad consegue funcionar sem esta tool?"
    - "Esta tool é um diferencial competitivo?"

  scoring:
    # Em vez de valores fixos, comparar benefícios entre tools
    calculation: |
      impact_raw = (manual_work_reduction * 0.3 +
                    quality_improvement * 0.3 +
                    necessity_score * 0.2 +
                    differentiation_score * 0.2)

      # Normalizar para escala 0.25 - 3.0 (RICE tradicional)
      impact_normalized = 0.25 + (impact_raw / 10) * 2.75

  tier: "percentile_tier(impact_normalized, all_impact_scores)"
```

### 3.3 Confidence (Confiança)

```yaml
confidence:
  definition: "Certeza sobre as estimativas de Reach e Impact"

  evidence_levels:
    high_confidence: # 90-100%
      criteria:
        - "Testamos a tool em ambiente similar"
        - "Temos métricas concretas de uso"
        - "Case studies documentados no nosso contexto"

    medium_confidence: # 70-89%
      criteria:
        - "Reviews confiáveis de usuários similares"
        - "Documentação clara com exemplos"
        - "Comunidade ativa respondendo dúvidas"

    low_confidence: # 50-69%
      criteria:
        - "Parece promissor pela descrição"
        - "Pouca evidência de uso real"
        - "Documentação escassa"

    speculative: # < 50%
      criteria:
        - "Projeto muito novo"
        - "Nenhuma evidência de uso"
        - "Apenas README básico"

  scoring: |
    # Baseado em evidências encontradas durante pesquisa
    confidence_score = evidence_points / max_possible_points * 100

  tier: "percentile_tier(confidence_score, all_confidence_scores)"
```

### 3.4 Effort (Esforço)

```yaml
effort:
  definition: "Tempo e recursos para implementar"

  components:
    installation:
      one_command: 0.1 # npm install, brew install
      few_steps: 0.25 # config file necessário
      moderate_setup: 0.5 # env vars, API keys
      complex_setup: 1.0 # docker, múltiplas deps

    integration:
      drop_in: 0.1 # Usar diretamente
      minor_wrapper: 0.25 # Adapter simples
      moderate_code: 0.5 # Algum desenvolvimento
      significant_dev: 1.0 # Integração custom

    learning_curve:
      intuitive: 0.0
      quick_docs: 0.1
      tutorial_needed: 0.25
      deep_learning: 0.5

    maintenance:
      set_and_forget: 0.0
      occasional: 0.1
      monthly: 0.25
      weekly: 0.5

  calculation: |
    effort_raw = installation + integration + learning + maintenance
    # Escala 0.25 - 8 (RICE tradicional)
    effort_normalized = 0.25 + (effort_raw / 4) * 7.75

  # NOTA: Para effort, MENOR é MELHOR
  # Então tier 1 = menor effort (top 20% mais fáceis)
  tier: "percentile_tier_inverse(effort_normalized, all_effort_scores)"
```

### 3.5 RICE Score Final

```yaml
rice_calculation:
  formula: "(Reach * Impact * Confidence) / Effort"

  # O score RICE é comparado relativamente
  interpretation: |
    Não existe "RICE > 50 é bom" universal.

    Comparamos RICE scores entre as ferramentas encontradas:
    - Tier 1: Top 20% (melhores relação benefício/esforço)
    - Tier 2: 21-50%
    - Tier 3: 51-80%
    - Tier 4: Bottom 20%
```

---

## 4. WSJF FRAMEWORK (Weighted Shortest Job First)

### 4.1 Cost of Delay

```yaml
cost_of_delay:
  components:
    user_business_value:
      weight: 0.40
      question: "Quanto valor de negócio o usuário ganha?"
      assessment: |
        Comparar entre as tools encontradas:
        - Qual gera mais valor imediato?
        - Qual resolve problema mais crítico?
      scoring: "relative_ranking(value_estimates) * 10"

    time_criticality:
      weight: 0.30
      question: "Quão urgente é ter esta capability?"
      context_dependent: |
        Depende do squad sendo criado:
        - Squad para lançamento iminente = alta criticidade
        - Squad para exploração = baixa criticidade
      scoring: "1-10 baseado no contexto do projeto"

    risk_reduction:
      weight: 0.30
      question: "Quanto risco a tool mitiga?"
      examples:
        - "Automatiza processo propenso a erros"
        - "Adiciona validação/verificação"
        - "Reduz dependência de conhecimento tácito"
      scoring: "relative_ranking(risk_reduction) * 10"

  calculation: |
    cod = (user_value * 0.4) + (time_crit * 0.3) + (risk_red * 0.3)
```

### 4.2 Job Duration

```yaml
job_duration:
  definition: "Tempo estimado para implementar"

  # Mapeamento para escala 1-10
  mapping:
    1: "< 1 hora"
    2: "1-4 horas"
    3: "4-8 horas (1 dia)"
    4: "1-2 dias"
    5: "3-5 dias (1 semana)"
    6: "1-2 semanas"
    7: "2-4 semanas"
    8: "1-2 meses"
    9: "2-3 meses"
    10: "> 3 meses"

  estimation_factors:
    - complexity_of_integration
    - team_familiarity
    - documentation_quality
    - dependencies_required
```

### 4.3 WSJF Score

```yaml
wsjf_calculation:
  formula: "Cost_of_Delay / Job_Duration"

  interpretation: |
    WSJF alto = Alto valor, baixo esforço (fazer primeiro)
    WSJF baixo = Baixo valor ou alto esforço (fazer depois)

    Comparação relativa entre tools encontradas determina prioridade.
```

---

## 5. COST-BENEFIT ANALYSIS (Paid vs Open Source)

### 5.1 Princípio

```yaml
principle: |
  NÃO existe regra "só paga se ROI > X%".

  A decisão depende do CONTEXTO:
  - Budget do projeto
  - Criticidade da capability
  - Qualidade das alternativas OSS encontradas
  - Tempo disponível para integração
```

### 5.2 Análise Comparativa

```yaml
paid_vs_oss_analysis:
  step_1_inventory:
    action: "Listar todas as alternativas encontradas"
    separate: "Paid vs OSS"

  step_2_capability_matrix:
    action: "Criar matriz de capabilities"
    columns: [tool_name, capability_1, capability_2, ...]
    values: [supports, partial, not_supported]

  step_3_compare_within_tiers:
    action: |
      Para cada capability gap:
      1. Identificar tools que preenchem (paid e oss)
      2. Comparar tiers de social_proof, security, maturity
      3. Comparar RICE/WSJF scores

    output:
      - "OSS Tool X é Tier 1 em tudo → preferir OSS"
      - "Paid Tool Y é Tier 1, OSS é Tier 3 → considerar paid"
      - "Empate técnico → preferir OSS (custo zero)"

  step_4_cost_context:
    questions:
      - "Qual o budget disponível para tools?"
      - "Custo da paid vs tempo economizado?"
      - "Paid tem free tier suficiente para o uso?"

    analysis: |
      Se OSS Tier 1-2 existe: Usar OSS
      Se só Paid é Tier 1 e OSS é Tier 3-4:
        - Calcular: (tempo_economizado * valor_hora) vs custo_mensal
        - Apresentar análise para decisão humana
```

### 5.3 Apresentação da Análise

```yaml
cost_benefit_output:
  format: |
    ## Análise: {capability_name}

    ### Alternativas Encontradas
    | Tool | Tipo | Tier Geral | Custo | Gaps Preenchidos |
    |------|------|------------|-------|------------------|
    | Tool A | OSS | Tier 2 | Free | 3/5 |
    | Tool B | Paid | Tier 1 | $49/mo | 5/5 |
    | Tool C | OSS | Tier 3 | Free | 2/5 |

    ### Comparação Detalhada (Tier 1-2 apenas)
    | Dimensão | Tool A (OSS) | Tool B (Paid) |
    |----------|--------------|---------------|
    | Social Proof | Tier 2 | Tier 1 |
    | Security | Tier 1 | Tier 1 |
    | Maturity | Tier 2 | Tier 1 |
    | Domain Fit | Tier 2 | Tier 1 |

    ### Análise de Custo
    - Tool B preenche 2 gaps extras (4 e 5)
    - Estimativa de tempo economizado: X horas/mês
    - Break-even: Se hora vale > $Y, paid compensa

    ### Recomendação
    [Apresentar opções para decisão humana, não decidir automaticamente]
```

---

## 6. COMPOSITE SCORING (Tiers Finais)

### 6.1 Cálculo do Tier Composto

```yaml
composite_tier:
  weights:
    rice_tier: 0.30
    wsjf_tier: 0.25
    social_proof_tier: 0.20
    security_tier: 0.15
    maturity_tier: 0.10

  calculation: |
    # Converter tiers para scores (Tier 1 = 4, Tier 2 = 3, etc.)
    tier_to_score = {1: 4, 2: 3, 3: 2, 4: 1}

    composite_score = (
      tier_to_score[rice_tier] * 0.30 +
      tier_to_score[wsjf_tier] * 0.25 +
      tier_to_score[social_proof_tier] * 0.20 +
      tier_to_score[security_tier] * 0.15 +
      tier_to_score[maturity_tier] * 0.10
    )

    # Reconverter para tier
    if composite_score >= 3.5: return Tier 1
    elif composite_score >= 2.5: return Tier 2
    elif composite_score >= 1.5: return Tier 3
    else: return Tier 4
```

### 6.2 Decision Matrix (Relativa)

```
                    Tier 1-2 Effort      Tier 3-4 Effort
                    (Mais fácil)         (Mais difícil)
                    ┌─────────────────┬─────────────────┐
   Tier 1-2 Value   │   QUICK WINS    │   STRATEGIC     │
   (Mais valor)     │   Fazer agora   │   Planejar      │
                    ├─────────────────┼─────────────────┤
   Tier 3-4 Value   │   FILL-INS      │   BACKLOG       │
   (Menos valor)    │   Se sobrar     │   Talvez nunca  │
                    └─────────────────┴─────────────────┘
```

---

## 7. FLAGS E DESTAQUES (Em vez de VETOs)

### 7.1 Filosofia

```yaml
no_automatic_vetos: |
  Em vez de VETO automático, usamos FLAGS que requerem atenção humana.

  Razão: Um projeto com "problema" pode ainda ser a melhor opção
  se todas as alternativas tiverem problemas piores.
```

### 7.2 Security Flags

```yaml
security_flags:
  - flag: "🔴 CRITICAL_CVE"
    condition: "CVE crítica não corrigida"
    action: "Destacar no relatório, requerer análise"
    note: "Verificar se há patch disponível ou workaround"

  - flag: "🟠 HIGH_CVE"
    condition: "CVE alta não corrigida"
    action: "Destacar, comparar com alternativas"

  - flag: "🟡 SECURITY_INCIDENT"
    condition: "Histórico de incidente de segurança"
    action: "Pesquisar detalhes, verificar se foi resolvido"

  - flag: "🟢 SECURITY_AUDITED"
    condition: "Passou por auditoria formal"
    action: "Destacar positivamente"
```

### 7.3 Maturity Flags

```yaml
maturity_flags:
  - flag: "🔵 VERY_NEW"
    condition: "Projeto com < 3 meses"
    action: "Destacar, pode ser inovador ou instável"

  - flag: "🟤 SINGLE_MAINTAINER"
    condition: "Apenas 1 contribuidor"
    action: "Destacar bus factor, verificar se há org por trás"

  - flag: "⚪ NO_RELEASES"
    condition: "Sem releases em 12 meses"
    action: "Verificar se é abandonado ou estável"
```

---

## 8. OUTPUT FORMAT

### 8.1 Relatório por Tool

```yaml
tool_evaluation_report:
  tool_name: ""
  category: "mcp | api | cli | library | github"

  # Métricas brutas coletadas
  raw_metrics:
    github_stars: N
    downloads: N
    contributors: N
    last_commit: "YYYY-MM-DD"
    # ... todas as métricas

  # Tiers relativos (comparado com outras N tools encontradas)
  relative_tiers:
    social_proof: "Tier X of 4 (top Y%)"
    security: "Tier X of 4"
    maturity: "Tier X of 4"
    domain_fit: "Tier X of 4"
    rice: "Tier X of 4"
    wsjf: "Tier X of 4"
    composite: "Tier X of 4"

  # Flags de atenção
  flags: ["🔴 CRITICAL_CVE", "🔵 VERY_NEW"]

  # Posição no ranking geral
  ranking:
    position: "N of M tools"
    quadrant: "Quick Win | Strategic | Fill-in | Backlog"

  # Comparação com alternativas diretas
  vs_alternatives:
    - tool: "Alternative A"
      comparison: "This tool is Tier 1 vs Tier 2"
      tradeoff: "More features but harder setup"
```

### 8.2 Relatório Comparativo

```yaml
comparative_report:
  domain: ""
  total_tools_found: N

  # Distribuição de tiers
  tier_distribution:
    tier_1: N tools (top 20%)
    tier_2: N tools (21-50%)
    tier_3: N tools (51-80%)
    tier_4: N tools (bottom 20%)

  # Ranking geral
  overall_ranking:
    - position: 1
      tool: "Tool A"
      composite_tier: 1
      quadrant: "Quick Win"
      key_strength: "Best domain fit"
    - position: 2
      # ...

  # Por categoria
  by_category:
    mcp:
      best: "Tool X (Tier 1)"
      alternatives: ["Tool Y (Tier 2)", "Tool Z (Tier 2)"]
    api:
      # ...

  # Análise de gaps
  gaps_analysis:
    - gap: "email_automation"
      best_option: "Tool A (Tier 1)"
      alternatives: ["Tool B (Tier 2)"]
      recommendation: "Tool A é claramente superior"

    - gap: "competitor_analysis"
      best_options: ["Tool X (Tier 1)", "Tool Y (Tier 1)"]
      note: "Empate técnico, apresentar ambos para decisão"
```

---

## 9. QUICK REFERENCE

```
┌─────────────────────────────────────────────────────────────────┐
│              TOOL EVALUATION QUICK REFERENCE v2.0               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PRINCÍPIO: Comparar entre si, não contra valores absolutos     │
│                                                                 │
│  TIERS (sempre relativos ao dataset encontrado):                │
│    Tier 1 = Top 20% (melhores do grupo)                         │
│    Tier 2 = 21-50% (acima da mediana)                           │
│    Tier 3 = 51-80% (abaixo da mediana)                          │
│    Tier 4 = Bottom 20% (piores do grupo)                        │
│                                                                 │
│  DIMENSÕES:                                                     │
│    □ Social Proof  - Popularidade relativa                      │
│    □ Security      - Vulnerabilidades (flags, não vetos)        │
│    □ Maturity      - Idade e estabilidade relativas             │
│    □ Domain Fit    - Adequação ao caso de uso                   │
│    □ RICE Score    - Reach*Impact*Confidence/Effort             │
│    □ WSJF Score    - Cost of Delay / Job Duration               │
│                                                                 │
│  FLAGS (requerem atenção, não são vetos automáticos):           │
│    🔴 CRITICAL_CVE    - Verificar se há patch                   │
│    🟠 HIGH_CVE        - Comparar com alternativas               │
│    🟡 SECURITY_INCIDENT - Verificar resolução                   │
│    🔵 VERY_NEW        - Pode ser inovador ou instável           │
│    🟤 SINGLE_MAINTAINER - Bus factor 1                          │
│                                                                 │
│  DECISION MATRIX:                                               │
│    Quick Win  = Tier 1-2 Value + Tier 1-2 Effort                │
│    Strategic  = Tier 1-2 Value + Tier 3-4 Effort                │
│    Fill-in    = Tier 3-4 Value + Tier 1-2 Effort                │
│    Backlog    = Tier 3-4 Value + Tier 3-4 Effort                │
│                                                                 │
│  PAID vs OSS:                                                   │
│    Comparar tiers entre opções paid e oss                       │
│    Se OSS é Tier 1-2: preferir OSS                              │
│    Se empate: preferir OSS (custo zero)                         │
│    Se Paid >> OSS: apresentar análise para decisão humana       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

_Framework Version: 2.0_
_Last Updated: 2026-02-03_
_Philosophy: Comparative analysis over absolute thresholds_
