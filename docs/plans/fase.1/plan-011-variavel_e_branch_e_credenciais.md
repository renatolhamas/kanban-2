# Plan 011 — Proteção de Segurança para CI/CD RLS Tests

**Status:** Documento de Planejamento  
**Data:** 2026-04-07  
**Contexto:** Story 1.4 concluída. RLS tests atualmente deletam TODAS as tabelas no banco de teste. Necessário documentar proteções para futura escalação para produção.

---

## Contexto do Problema

A suite de testes RLS (`tests/fixtures/rls-test-data.ts`) executa **limpeza agressiva de dados**:

```typescript
// Deleta TUDO das tabelas
const { error } = await adminClient
  .from(table)
  .delete()
  .gte('id', '00000000-0000-0000-0000-000000000000');
```

**Questão Crítica:** Se este workflow rodar contra **banco de produção por engano**, apagaria TODOS os dados de produção.

**Estado Atual:** ✅ Seguro (aponta para banco de teste ujcjucgylwkjrdpsqffs)  
**Futuro Risk:** ⚠️ Necessário adicionar proteções defensivas antes de escalar

---

## 3 Camadas de Proteção

### 🔐 **Opção 1: Proteção em Runtime (Código)**

**Implementação:** Verificação de ambiente no código de teste

```typescript
// No topo de tests/fixtures/rls-test-data.ts

const SUPABASE_URL = process.env.SUPABASE_URL || '';

if (SUPABASE_URL.includes('production') || SUPABASE_URL.includes('prod')) {
  throw new Error(
    '🚨 PRODUCTION DATABASE DETECTED!\n' +
    'RLS tests MUST NOT run against production.\n' +
    'This would DELETE ALL DATA from production tables.\n' +
    'Verify SUPABASE_URL in .env.local points to test database.\n\n' +
    `Current URL: ${SUPABASE_URL}\n` +
    'Expected: Contains "test" or "staging" in URL'
  );
}
```

**Ou usando NODE_ENV:**

```typescript
if (process.env.NODE_ENV === 'production') {
  throw new Error(
    '❌ RLS tests cannot run in production mode.\n' +
    'This prevents accidental data deletion on prod databases.\n' +
    'Set NODE_ENV=development or NODE_ENV=test to proceed.'
  );
}
```

**Vantagens:**
- ✅ Verificação no nível de código (mais rápida)
- ✅ Mensagem de erro clara ao desenvolvedor
- ✅ Funciona localmente e em CI/CD

**Desvantagens:**
- ❌ Pode ser contornada se alguém remover a verificação
- ❌ Requer cooperação do desenvolvedor

**Implementar:** Imediatamente (antes de escalar para prod)

---

### 🚦 **Opção 2: Proteção em CI/CD (GitHub Actions)**

**Implementação:** Branch Protection Rules + Workflow Verification

**A. Adicionar step de verificação em `.github/workflows/rls-tests.yml`:**

```yaml
jobs:
  rls-tests:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # ✅ NOVO: Verificação defensiva antes dos testes
      - name: Verify test environment
        run: |
          echo "🔍 Verifying this is a TEST database..."
          
          # Rejeita se URL contiver 'production'
          if [[ "$SUPABASE_URL" == *"production"* ]]; then
            echo "❌ ERROR: Detected production Supabase project!"
            echo "RLS tests CANNOT delete production data."
            echo "Current URL: $SUPABASE_URL"
            exit 1
          fi
          
          # Rejeita se URL contiver 'prod'
          if [[ "$SUPABASE_URL" == *"prod"* ]]; then
            echo "❌ ERROR: Detected production Supabase project!"
            exit 1
          fi
          
          # Aceita se URL contiver 'test' ou 'ujcjucgyl' (seu projeto teste)
          if [[ "$SUPABASE_URL" == *"test"* ]] || [[ "$SUPABASE_URL" == *"ujcjucgyl"* ]]; then
            echo "✅ Confirmed: Test environment detected"
            echo "Proceeding with RLS tests..."
          else
            echo "⚠️  WARNING: Could not verify test database"
            echo "URL: $SUPABASE_URL"
            echo "Proceeding with caution..."
          fi
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}

      - name: Install dependencies
        run: npm ci

      - name: Run RLS validation tests
        run: npm run test:rls
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          # ... rest of env vars
```

**B. Adicionar Branch Protection Rule (GitHub Web UI):**

```
Settings → Branches → Add rule

Rule:
- Apply to: master, main, production
- Require: "RLS tests" workflow pass
- Dismiss stale reviews on push
- Require code review from: 1 reviewer (for prod)
- Require status checks to pass:
  - rls-tests (Verify test environment)
  - rls-tests (Run RLS validation tests)
  - typecheck
  - lint
```

**Vantagens:**
- ✅ Bloqueia automaticamente se workflow falhar
- ✅ Ninguém pode fazer push sem passar nos testes
- ✅ Visível no GitHub UI (clara comunicação)
- ✅ Funciona mesmo se desenvolvedores contornarem código

**Desvantagens:**
- ❌ Requer credenciais corretas em GitHub Secrets
- ❌ Pode ser desativado por admin (se não protegido)

**Implementar:** Após mudar para produção

---

### 🔑 **Opção 3: Separação de Credenciais (Recomendado)**

**Implementação:** Manter credenciais de teste e produção em ambientes separados

**A. Estrutura de arquivo `.env`:**

```bash
# .env.local (SEMPRE commitado, credenciais de TESTE)
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=https://ujcjucgylwkjrdpsqffs.supabase.co
SUPABASE_URL=https://ujcjucgylwkjrdpsqffs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...
JWT_SECRET=d0934902-888c-4f61-bcf1-39e7d5bb91d2
```

```bash
# .env.production (⚠️ NUNCA commitado - gitignored)
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://prod-projeto.supabase.co
SUPABASE_URL=https://prod-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-ey...
SUPABASE_SERVICE_ROLE_KEY=prod-ey...
JWT_SECRET=xxxxx-xxxxx-xxxxx
```

**B. Configurar `.gitignore`:**

```bash
# .gitignore

# Environment files
.env
.env.production
.env.staging
.env.local.prod

# ALWAYS safe to commit:
# .env.local (test credentials only)
# .env.example
```

**C. Configurar Next.js para carregar correto:**

```javascript
// next.config.js ou vitest.config.ts

const env = process.env.NODE_ENV || 'development';

// Carrega .env.local (sempre) + .env.{env} se existir
const dotenv = require('dotenv');
const path = require('path');

if (env === 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });
} else {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
}
```

**D. GitHub Secrets (para CI/CD):**

```yaml
# Settings → Secrets → Actions

# Para branch: main/master (teste)
SUPABASE_URL=https://ujcjucgylwkjrdpsqffs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=test-ey...

# Para branch: production (prod)
# Configurado em different environment (GitHub Environments)
# Settings → Environments → production
SUPABASE_URL=https://prod-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=prod-ey...
```

**Vantagens:**
- ✅ Impossível fazer push acidental de credenciais de produção
- ✅ Teste e produção isolados completamente
- ✅ Fácil adicionar staging, preview, etc.
- ✅ Desenvolvedores trabalham sempre com credenciais de teste

**Desvantagens:**
- ❌ Requer workflow diferente para CI/CD de produção
- ❌ Mais complex setup inicial

**Implementar:** Recomendado para escalação profissional

---

## 📋 Matriz de Decisão

| Layer | Proteção | Quando Usar | Esforço | Eficácia |
|-------|----------|------------|--------|----------|
| **Código** | Verificação de URL em runtime | AGORA (teste → prod) | 🟢 Baixo | 🟡 Média |
| **CI/CD** | Branch protection + workflow check | Ao escalar para prod | 🟡 Médio | 🟢 Alta |
| **Credenciais** | Separação de ambientes | Setup profissional | 🔴 Alto | 🟢🟢 Muito Alta |

---

## ✅ Implementação Recomendada (Roadmap)

### **Fase 1: AGORA (imediato)**
- [ ] Adicionar verificação de URL em `tests/fixtures/rls-test-data.ts` (Opção 1)
- [ ] Testar localmente que a verificação funciona
- [ ] Commit com mensagem: "test: add production database safeguard"

### **Fase 2: Antes de Produção**
- [ ] Implementar GitHub Actions check (Opção 2)
- [ ] Configurar branch protection rules
- [ ] Testar que workflow bloqueia em prod URL

### **Fase 3: Setup Profissional (Opcional)**
- [ ] Criar `.env.production` (não commitado)
- [ ] Configurar GitHub Environments para prod
- [ ] Separar CI/CD pipeline para test vs prod

---

## 🚨 Checklist de Segurança

Antes de QUALQUER escala para produção:

- [ ] Verificação de URL implementada em código (Opção 1)
- [ ] Mensagem de erro clara e visível
- [ ] Testado localmente contra URL de teste
- [ ] Testado que falha com URL de produção fake
- [ ] Credenciais de produção NUNCA em `.env.local`
- [ ] `.env.production` está em `.gitignore`
- [ ] GitHub Secrets configurados corretamente
- [ ] Branch protection ativado em main/master
- [ ] Documentação de recovery plan (se algo der errado)

---

## 📞 Referências

- **Story 1.4:** RLS Policies Validation - Testes concluídos com sucesso
- **File:** `tests/fixtures/rls-test-data.ts` - Lógica de cleanup agressivo
- **File:** `.github/workflows/rls-tests.yml` - Workflow de CI/CD
- **File:** `.env.local` - Credenciais de teste atuais

---

**Próximas Ações:**

1. ✅ **Implementar Opção 1 AGORA** (5 min)
   ```bash
   # Adicione a verificação em tests/fixtures/rls-test-data.ts
   # Teste localmente
   # Commit e push
   ```

2. ⏳ **Implementar Opção 2** (quando escalar para produção)
   ```bash
   # Adicione GitHub Actions check
   # Configure branch protection
   # Teste em PR antes de merge
   ```

3. 🔮 **Considerar Opção 3** (setup profissional, futuro)
   ```bash
   # Criar múltiplos arquivos .env
   # Configurar GitHub Environments
   # Documentar deployment workflow
   ```

---

**Documento criado:** 2026-04-07  
**Contexto:** Story 1.4 QA Review + Security Planning  
**Responsável:** Gage (DevOps)
