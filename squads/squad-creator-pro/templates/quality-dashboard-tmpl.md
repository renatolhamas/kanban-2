# ═══════════════════════════════════════════════════════════════════════════════

# QUALITY DASHBOARD - {SQUAD_NAME}

# Generated: {DATE}

# Version: 1.0.0

# ═══════════════════════════════════════════════════════════════════════════════

## 📊 Squad Overview

| Metric               | Value                   | Status       |
| -------------------- | ----------------------- | ------------ |
| **Squad Name**       | {squad_name}            | -            |
| **Domain**           | {domain}                | -            |
| **Agents**           | {agent_count}           | -            |
| **Creation Mode**    | {YOLO\|QUALITY\|HYBRID} | -            |
| **Overall Fidelity** | {avg_fidelity}%         | {🟢\|🟡\|🔴} |

---

## 🧠 Agent Quality Matrix

```
┌─────────────────┬─────────┬─────────┬──────────┬──────────┬────────────┐
│ Agent           │ Sources │ Voice   │ Thinking │ Fidelity │ Status     │
├─────────────────┼─────────┼─────────┼──────────┼──────────┼────────────┤
│ {agent_1}       │ {n}     │ {x}/10  │ {y}/9    │ {z}%     │ {✅\|⚠️\|❌} │
│ {agent_2}       │ {n}     │ {x}/10  │ {y}/9    │ {z}%     │ {✅\|⚠️\|❌} │
│ {agent_3}       │ {n}     │ {x}/10  │ {y}/9    │ {z}%     │ {✅\|⚠️\|❌} │
│ {orchestrator}  │ N/A     │ N/A     │ N/A      │ N/A      │ {✅\|⚠️\|❌} │
└─────────────────┴─────────┴─────────┴──────────┴──────────┴────────────┘
```

**Status Legend:**

- ✅ = Pronto para produção (fidelity ≥ 80%)
- ⚠️ = Funcional, melhorias possíveis (fidelity 60-79%)
- ❌ = Precisa trabalho (fidelity < 60%)

---

## 📈 Per-Agent Details

### {Agent 1 Name}

```yaml
agent_metrics:
  slug: "{agent_slug}"
  domain: "{domain}"

  sources:
    total: 0
    tier_1: 0
    tier_1_ratio: "0%"
    types: []
    hours_content: 0
    pages_content: 0

  voice_dna:
    score: "0/10"
    power_words: 0
    signature_phrases: 0
    stories: 0
    anti_patterns: 0
    immune_system: 0
    contradictions: 0

    gaps:
      - "Faltam exemplos de tom em situação X"

  thinking_dna:
    score: "0/9"
    frameworks: 0
    heuristics: 0
    recognition_patterns: 0
    objection_responses: 0
    handoff_triggers: 0

    gaps:
      - "Framework secundário não triangulado"

  fidelity:
    estimate: "0%"
    tier: "fast-clone|standard|high-fidelity"
    confidence: "alta|média|baixa"

  recommendations:
    - action: ""
      impact: "alto|médio|baixo"
      effort: "alto|médio|baixo"
```

---

## 🔗 Integration Quality

```yaml
integration_metrics:
  orchestrator:
    status: "configured|tested|validated"
    routing_rules: 0
    fallback_defined: true|false

  handoffs:
    total_defined: 0
    tested: 0
    coverage: "0%"

  smoke_tests:
    passed: 0
    failed: 0
    skipped: 0

  scenarios_tested:
    - scenario: "Basic query in domain"
      result: "pass|fail"
      agent_used: ""

    - scenario: "Complex multi-step"
      result: "pass|fail"
      handoffs: []
```

---

## 📊 Source Coverage Analysis

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SOURCE DISTRIBUTION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Tier 1 (Primary)    ████████████████████░░░░░░░░░░  65%  ({n} sources)    │
│  Tier 2 (Secondary)  ██████████░░░░░░░░░░░░░░░░░░░░  25%  ({n} sources)    │
│  Tier 3 (Tertiary)   ███░░░░░░░░░░░░░░░░░░░░░░░░░░░  10%  ({n} sources)    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                           SOURCE TYPES                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Books               █████████████░░░░░░░░░░░░░░░░░  35%                   │
│  Interviews          ████████████████░░░░░░░░░░░░░░  40%                   │
│  Articles            █████░░░░░░░░░░░░░░░░░░░░░░░░░  15%                   │
│  Videos              ███░░░░░░░░░░░░░░░░░░░░░░░░░░░  10%                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Gaps & Risks

```yaml
critical_gaps:
  - agent: ""
    gap: ""
    risk: "alto"
    mitigation: ""
    blocking: true|false

warnings:
  - agent: ""
    warning: ""
    risk: "médio"
    recommendation: ""

improvement_opportunities:
  - agent: ""
    opportunity: ""
    impact: "alto|médio|baixo"
    effort: "alto|médio|baixo"
```

---

## 🎯 Triangulation Status

```yaml
triangulation:
  claims_validated:
    - claim: "Primary framework"
      sources: 3
      status: "✅ Triangulated"

    - claim: "Core principles"
      sources: 2
      status: "⚠️ Needs 1 more"

    - claim: "Signature methodology"
      sources: 1
      status: "❌ Not triangulated"

  overall_score: "2/3 claims validated"
```

---

## 📋 Quality Gates Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          QUALITY GATES STATUS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SOURCE_QUALITY      ✅ PASS    5/5 blocking checks                        │
│  VOICE_QUALITY       ✅ PASS    8/10 score (min: 6/10)                     │
│  THINKING_QUALITY    ⚠️ WARN    6/9 score (min: 5/9)                       │
│  SYNTHESIS_QUALITY   ✅ PASS    Voice+Thinking consistent                  │
│  INTEGRATION_TEST    ✅ PASS    All smoke tests passed                     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  OVERALL             ✅ READY FOR DEPLOYMENT                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📈 Fidelity Estimation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FIDELITY EXPECTATION                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  100% ─┬─────────────────────────────────────────────────────────          │
│        │                                                                    │
│   95% ─┤                                     ┌───────────────────          │
│        │                                     │ Your Squad                   │
│   85% ─┤                           ┌─────────┤ (with user materials)       │
│        │                           │ QUALITY │                              │
│   75% ─┤               ┌───────────┤ Mode    │                              │
│        │               │           │         └───────────────────          │
│   65% ─┤   ┌───────────┤ YOLO +    └─────────────────────────────          │
│        │   │ YOLO      │ Some                                               │
│   55% ─┤   │ Basic     │ Sources                                            │
│        │   │     ▲     │                                                    │
│   45% ─┼───┴─────┼─────┴─────────────────────────────────────────          │
│        │         │                                                          │
│        │    Current Squad: {fidelity}%                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Improvement Roadmap

```yaml
immediate_actions:
  - action: "Add 2 more sources for Agent X to triangulate framework"
    impact: "+10% fidelity"
    effort: "30 min"

  - action: "Extract anti-patterns for Agent Y"
    impact: "+5% accuracy"
    effort: "15 min"

future_improvements:
  - action: "Get user's proprietary materials for Agent Z"
    impact: "+20% fidelity"
    effort: "Depends on user"

  - action: "Add fidelity tests with real scenarios"
    impact: "Validation confidence"
    effort: "1 hour"
```

---

## 📝 Notes

```yaml
creation_notes:
  mode_used: "{YOLO|QUALITY|HYBRID}"
  user_materials_provided: true|false
  human_checkpoints_used: 0
  total_time: ""

known_limitations:
  - ""

special_considerations:
  - ""
```

---

**Squad Architect | Quality Dashboard v1.0**
_Generated: {DATE}_
