# Explicação: Testes RLS - Proteção de Banco de Dados

## Visão Geral

Os testes RLS (Row Level Security) foram implementados com **3 camadas de proteção** para evitar apagar dados reais do banco de dados acidentalmente.

**Status Padrão:** ✅ Testes RLS estão **DESATIVADOS** (pulados silenciosamente)

---

## 3 Camadas de Proteção

### Camada 1: Guard de Ambiente (`TEST_DATABASE`)
- Verifica se `TEST_DATABASE === 'true'` antes de executar
- Se `false`, lança erro: "seedTestData() recusou execução"
- **Padrão:** `false` (seguro)

### Camada 2: DELETE Escopado
- Deleta APENAS registros com UUIDs específicos de teste
- Nunca afeta dados reais do banco
- Exemplo: `.delete().in('tenant_id', [TEST_TENANT_IDS])`

### Camada 3: Skip Condicional
- Testes RLS são automaticamente **PULADOS** quando `TEST_DATABASE !== 'true'`
- Workflow do GitHub Actions passa normalmente
- Nenhum alarme falso

---

## Como Ativar os Testes RLS

### Local (Sua Máquina)

#### Passo 1: Abrir arquivo `.env.local`
```
c:\git\kanban.2\.env.local
```

#### Passo 2: Encontrar a linha
```
TEST_DATABASE=false
```

#### Passo 3: Mudar para
```
TEST_DATABASE=true
```

#### Passo 4: Rodar o teste
```bash
npm run test:rls
```

**O que acontece:**
- ✅ Guard permite execução (TEST_DATABASE === 'true')
- ✅ DELETE escopado apaga apenas dados de teste
- ✅ Testes RLS rodam completamente
- ✅ Banco de dados real fica protegido

#### Passo 5: Depois, desativar (opcional)
```
TEST_DATABASE=false
```

---

### GitHub Actions (Workflow)

#### Passo 1: Abrir arquivo
```
c:\git\kanban.2\.github\workflows\rls-tests.yml
```

#### Passo 2: Encontrar as 2 linhas com `TEST_DATABASE: 'false'`

**Job `rls-tests` (linha ~38):**
```yaml
env:
  TEST_DATABASE: 'false'  ← Mudar isto
```

**Job `performance-baseline` (linha ~74):**
```yaml
env:
  TEST_DATABASE: 'false'  ← E isto também
```

#### Passo 3: Mudar AMBAS para `'true'`
```yaml
env:
  TEST_DATABASE: 'true'
```

#### Passo 4: Fazer commit e push
```bash
git add .github/workflows/rls-tests.yml
git commit -m "ci: enable RLS tests in GitHub Actions"
git push origin master
```

**O que acontece:**
- ✅ GitHub Actions dispara o workflow
- ✅ Jobs tentam rodar (não são invisíveis)
- ✅ Guard permite execução (TEST_DATABASE === 'true')
- ✅ Testes RLS executam no servidor do GitHub
- ✅ Banco de dados real fica protegido

---

## Fluxo Completo: Teste Local → Push → GitHub Actions

### 1️⃣ Preparar Localmente

```bash
# Ativar testes RLS
# Editar .env.local: TEST_DATABASE=false → TEST_DATABASE=true

npm run test:rls
# ✅ Testes executam e passam

# Desativar para não rodar desnecessariamente
# Editar .env.local: TEST_DATABASE=true → TEST_DATABASE=false
```

### 2️⃣ Fazer Commit

```bash
git add .
git commit -m "feat: implement new feature with RLS validation"
git push origin master
```

### 3️⃣ GitHub Actions Roda Automaticamente

```
GitHub Actions dispara
  ↓
Jobs rls-tests e performance-baseline tentam rodar
  ↓
Guard checa: TEST_DATABASE === 'true'?
  ↓
SIM (configurado no workflow) → Testes executam
  NÃO (se TEST_DATABASE=false) → Testes pulam
  ↓
Workflow completa (success ou failure)
```

---

## Cenários Comuns

### Cenário 1: Quero rodar testes RLS AGORA

**Local:**
1. Editar `.env.local`: `TEST_DATABASE=false` → `TEST_DATABASE=true`
2. Rodar: `npm run test:rls`
3. Depois: `TEST_DATABASE=false` (para deixar seguro)

**GitHub Actions:**
1. Editar `.github/workflows/rls-tests.yml`: ambas as linhas `'false'` → `'true'`
2. Commit e push
3. Workflow roda automaticamente

---

### Cenário 2: Alguém deletou dados por acidente

**O que já está protegido:**
- ✅ Camada 1: Guard bloqueia sem `TEST_DATABASE=true`
- ✅ Camada 2: DELETE escopado não afeta dados reais
- ✅ Camada 3: Skip condicional pula testes por padrão

**Se aconteceu:**
1. Verificar se `TEST_DATABASE=false` (padrão)
2. Se sim: testes RLS não rodaram (estão skipped)
3. Se não: investigar o que disparou os testes

---

### Cenário 3: npm test rodou acidentalmente

**O que acontece:**
```
npm test
  ↓
Testes RLS estão no exclude? Sim, pulam silenciosamente ✅
  ↓
Workflow passa normalmente
```

**Resultado:** ✅ Banco de dados fica seguro

---

## Configuração Atual

| Componente | Valor | Status |
|---|---|---|
| `.env.local` | `TEST_DATABASE=false` | ✅ Seguro |
| `.github/workflows/rls-tests.yml` (rls-tests) | `TEST_DATABASE: 'false'` | ✅ Seguro |
| `.github/workflows/rls-tests.yml` (performance-baseline) | `TEST_DATABASE: 'false'` | ✅ Seguro |
| Testes RLS | SKIPPED por padrão | ✅ Seguro |

---

## Resumo Rápido

| Ação | Como Fazer |
|---|---|
| ✅ Ativar LOCAL | `.env.local`: `false` → `true`, rodar `npm run test:rls` |
| ✅ Ativar GITHUB ACTIONS | `.github/workflows/rls-tests.yml`: ambas `'false'` → `'true'`, push |
| ✅ Desativar LOCAL | `.env.local`: `true` → `false` |
| ✅ Desativar GITHUB ACTIONS | `.github/workflows/rls-tests.yml`: ambas `'true'` → `'false'`, push |
| ✅ Verificar status | `npm test` (pula RLS tests) ou `gh run list` (vê GitHub Actions) |

---

## Referência Técnica

### Arquivos Envolvidos

```
.env.local                              ← Variável de ambiente local
.github/workflows/rls-tests.yml         ← Configuração do workflow
tests/fixtures/rls-test-data.ts         ← Guard + DELETE escopado
tests/rls-validation.test.ts            ← Skip condicional
tests/rls-performance.test.ts           ← Skip condicional
```

### Variável de Controle

```
TEST_DATABASE=true   → Testes RLS executam
TEST_DATABASE=false  → Testes RLS são pulados
```

---

**Documentação criada em:** 2026-04-08  
**Última atualização:** Proteção RLS em 3 camadas implementada
