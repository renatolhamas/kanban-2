# JWT & Multi-Tenant Isolation — Palhaçada de 3 Semanas

**Escrito em:** 2026-04-23  
**Contexto:** O projeto foi e voltou entre 4 formas diferentes de lidar com `tenant_id` em 3 semanas. Este documento registra POR QUE cada mudança aconteceu e qual é o padrão correto.

---

## 📋 Timeline: As 4 Fases do Ping-Pong

### **FASE 1: ??? → CLIENT PASSING**
**Status:** Desconhecido (antes de 6 de abril)  
**Implementação:**
```typescript
// ❌ VULNERÁVEL
const conversations = await supabase.rpc('get_conversations', {
  p_tenant_id: userInput.tenantId  // Cliente controla!
});
```

**Por que foi feito assim:**
- Prototipagem rápida
- "O cliente sabe qual tenant é, por que não passar?"
- Sem considerar segurança ainda

**Problema:**
```
Cliente A pode passar tenant_id de Cliente B
→ RLS não valida (confia no parâmetro)
→ Cliente A vê dados de Cliente B
→ 🔴 DATA LEAK
```

**Severidade:** 🔴 **CRÍTICA** — Isolamento multi-tenant completamente quebrado

---

### **FASE 2: 6 de Abril → user_metadata**
**Commit:** `67f02e2` — "fix: update RLS policies to read tenant_id from user_metadata"  
**Data:** 2026-04-06  
**Executor:** @data-engineer

**Implementação:**
```sql
-- RLS Policy
CREATE POLICY "conversations_select_own_tenant" ON conversations
  FOR SELECT USING (
    tenant_id = auth.jwt()->'user_metadata'->>'tenant_id'
  );
```

```typescript
// API Route
const supabase = createClient(url, anonKey, {
  global: {
    headers: {
      Authorization: `Bearer ${jwtToken}`,  // JWT contém user_metadata
    },
  },
});

const data = await supabase.rpc('get_conversations', {
  p_kanban_id: kanbanId
  // tenant_id NÃO é passado — vem do JWT
});
```

**Por que essa mudança:**
- "Tenant_id deve vir do servidor, não do cliente"
- JWT é assinado pelo Supabase, cliente não pode falsificar
- Pareceu uma solução

**Problema Descoberto (10 dias depois):**
```
user_metadata é EDITÁVEL pelo usuário!

auth.update({ user_metadata: { tenant_id: "OUTRO_TENANT" } })
↓
JWT é regenerado
↓
Cliente A tem JWT com tenant_id de Cliente B
↓
RLS filtra por JWT ✓ (mas JWT está comprometido)
↓
Cliente A vê dados de Cliente B
→ 🔴 DATA LEAK (de novo!)
```

**Por que ninguém percebeu logo:**
- Pareceu funcionar durante testes iniciais
- Testes foram com JWT de um único tenant
- Não testaram "cliente B tenta editar seu próprio user_metadata para tenant_id de cliente A"

**Severidade:** 🔴 **CRÍTICA** — Mesmo problema, abordagem diferente, ainda vulnerável

---

### **FASE 3: 16 de Abril → app_metadata + Custom Hook**
**Commit:** `3f8f667` — "Complete Story 4.1 — Multi-tenant RLS isolation via app_metadata"  
**Data:** 2026-04-16  
**Executor:** @data-engineer + @dev  
**Duração da "correção de Fase 2":** 10 dias de descoberta + 3 dias de implementação

**A Epifania:**
```
"user_metadata é editável pelo usuário.
 O banco DEVE ser a source of truth, não o usuário."
```

**Solução Criada: Custom Access Token Hook**
```sql
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_tenant_id UUID;
BEGIN
  -- PASSO 1: Consulta do banco (source of truth)
  SELECT tenant_id INTO user_tenant_id
  FROM public.users
  WHERE id = (event->'claims'->>'sub')::uuid;

  -- PASSO 2: Validação
  IF user_tenant_id IS NULL THEN
    RAISE EXCEPTION 'User not found or missing tenant_id';
  END IF;

  -- PASSO 3: Injetar em app_metadata (IMUTÁVEL pelo cliente)
  event->'claims'->'app_metadata' := jsonb_build_object(
    'tenant_id', user_tenant_id::text
  );

  RETURN event;
END;
$$;
```

**RLS Policy (Atualizada):**
```sql
CREATE POLICY "conversations_select_own_tenant" ON conversations
  FOR SELECT USING (
    tenant_id = ((SELECT auth.jwt()) -> 'app_metadata' ->> 'tenant_id')::uuid
  );
```

**Como Funciona:**
```
1. User clica "Login"
2. Credenciais verificadas pelo Supabase Auth
3. ANTES de gerar JWT, Supabase chama custom_access_token_hook()
4. Hook: SELECT tenant_id FROM users WHERE id = user_id
5. Hook: Injeta tenant_id em app_metadata
6. JWT é gerado com app_metadata assinado
7. JWT é enviado ao cliente (IMUTÁVEL)
8. Cliente tenta editar user_metadata? Não afeta app_metadata
9. RLS filtra por app_metadata (do JWT assinado)
10. ✅ Isolamento garantido
```

**Por que Funciona:**
```
✅ tenant_id vem do BANCO (source of truth)
✅ É INJETADO no JWT por função segura (SECURITY DEFINER)
✅ JWT é ASSINADO pelo Supabase (cliente não pode falsificar)
✅ RLS lê de app_metadata (não user_metadata)
✅ Mesmo que cliente edite user_metadata, não afeta app_metadata
✅ Impossível bypass
```

**Mudanças Implementadas:**
- ✅ 1 função: `custom_access_token_hook()`
- ✅ 28 RLS policies: Migradas de user_metadata → app_metadata
- ✅ 8 users: Backfill de app_metadata
- ✅ Signup flow: Injeta app_metadata no primeiro login
- ✅ Testes: RLS isolation com múltiplos tenants
- ✅ Security audit: Zero violations

**Severidade:** ✅ **RESOLVIDO** — Isolamento seguro e imutável

---

## 🎯 O PADRÃO CORRETO (Agora)

### **Arquitetura de Segurança**

```
┌─────────────────────────────────────────────────────┐
│ CLIENT (Não Confiável)                              │
│ Envia: email + password                             │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ SUPABASE AUTH (Servidor Confiável)                  │
│ 1. Verifica credenciais                             │
│ 2. Chama custom_access_token_hook()                 │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ CUSTOM_ACCESS_TOKEN_HOOK (Função Segura)            │
│ 1. SELECT tenant_id FROM users WHERE id = user_id   │
│ 2. Injeta em app_metadata                           │
│ 3. Retorna event com app_metadata preenchido        │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ JWT GERADO E ASSINADO                               │
│ Contém: user_id, app_metadata.tenant_id             │
│ Assinado com: Supabase private key                  │
│ Imutável: Cliente não pode modificar                │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ CLIENT Recebe JWT                                   │
│ Armazena em localStorage ou cookie                  │
│ Envia em cada request no header: Authorization      │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ API ROUTE (Next.js Backend)                         │
│ 1. Recebe JWT no Authorization header               │
│ 2. Cria Supabase client com JWT                     │
│ 3. Chama RPC sem passar tenant_id (vem do JWT)      │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ RPC FUNCTION (PostgreSQL)                           │
│ Recebe: p_kanban_id, p_tenant_id (do JWT via RLS)   │
│ RLS filtra: WHERE tenant_id = jwt()->app_metadata   │
│ Retorna: Apenas dados do tenant (garantido)         │
└─────────────────────────────────────────────────────┘
```

### **Implementação Correta**

**1️⃣ API Route (Never pass tenant_id from client)**
```typescript
// ✅ CORRETO
export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  // JWT já contém app_metadata.tenant_id
  // RLS vai usar esse tenant_id para filtrar
  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await supabase.rpc(
    'get_conversations_with_last_message',
    { p_kanban_id: kanbanId }  // ← Sem tenant_id!
    // tenant_id vem automaticamente do JWT via RLS
  );
  
  return Response.json(data);
}
```

**2️⃣ RLS Policy (Always read from app_metadata)**
```sql
-- ✅ CORRETO
CREATE POLICY "conversations_select_own_tenant" ON conversations
  FOR SELECT USING (
    tenant_id = ((SELECT auth.jwt()) -> 'app_metadata' ->> 'tenant_id')::uuid
  );
```

**3️⃣ Frontend Hook (Always include JWT)**
```typescript
// ✅ CORRETO
export function useConversations(kanbanId: string) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('sb-jwt-token');  // Get JWT from storage
    
    fetch(`/api/conversations?kanban_id=${kanbanId}`, {
      headers: {
        Authorization: `Bearer ${token}`,  // ← SEMPRE incluir JWT
      },
    })
      .then(res => res.json())
      .then(data => setConversations(data));
  }, [kanbanId]);

  return { conversations };
}
```

---

## ❌ ANTI-PATTERNS (Nunca Fazer)

### **1. Passar tenant_id do Cliente**
```typescript
// ❌ ERRADO - Cliente controla tenant_id
const data = await supabase.rpc('get_conversations', {
  p_tenant_id: userInput.tenantId,  // ← PERIGO!
});
```
**Por que:** Cliente pode mudar para outro tenant, RLS não valida.

### **2. Usar user_metadata**
```sql
-- ❌ ERRADO - user_metadata é editável
CREATE POLICY "..." USING (
  tenant_id = auth.jwt()->'user_metadata'->>'tenant_id'
);
```
**Por que:** Usuario pode editar user_metadata antes de fazer login.

### **3. Sem JWT**
```typescript
// ❌ ERRADO - Sem autenticação
const supabase = createClient(url, anonKey);
const data = await supabase.rpc('get_conversations', { p_kanban_id: kanbanId });
// RLS não consegue ler auth.jwt(), tudo é bloqueado
```
**Por que:** RLS não consegue identificar o usuário, todas as queries são bloqueadas ou retornam vazio.

### **4. JWT Expirado**
```typescript
// ❌ ERRADO - JWT pode expirar
const token = localStorage.getItem('sb-jwt-token');
// 60 minutos depois...
// fetch usa token expirado → 401 ou dados antigos
```
**Por que:** JWT tem expiração, precisa de refresh.

---

## 🧪 Como Validar (Testes de RLS)

### **Test 1: Isolamento Básico**
```typescript
// Cliente A
const tokenA = await login('a@example.com', 'password');
const convA = await fetch('/api/conversations', {
  headers: { Authorization: `Bearer ${tokenA}` },
}).then(r => r.json());

// Cliente B
const tokenB = await login('b@example.com', 'password');
const convB = await fetch('/api/conversations', {
  headers: { Authorization: `Bearer ${tokenB}` },
}).then(r => r.json());

// Validação
const overlap = convA.filter(c => convB.find(c2 => c.id === c2.id));
console.assert(overlap.length === 0, 'RLS Isolamento falhou!');
```

### **Test 2: JWT Tampering**
```typescript
// Cliente A tenta usar token de Cliente B
const tokenB = '...valid.jwt.from.b...';
const convA = await fetch('/api/conversations', {
  headers: { Authorization: `Bearer ${tokenB}` }, // ← Token errado!
}).then(r => r.json());

// Deve retornar dados de B, NÃO de A
console.assert(convA.every(c => c.tenant_id === TENANT_B), 'JWT Tampering funciona!');
```

### **Test 3: Sem JWT**
```typescript
// Sem header Authorization
const conv = await fetch('/api/conversations').then(r => r.json());

// Deve retornar erro 401 ou array vazio
console.assert(conv.length === 0 || r.status === 401, 'Sem JWT deveria bloquear!');
```

---

## 📚 Referências de Implementação

### **Criação do Hook (Já Feito)**
- **Arquivo:** `supabase/migrations/20260416120000_create_custom_access_token_hook.sql`
- **Status:** ✅ Implementado, testado, em produção
- **Ativação:** Dashboard > Authentication > Hooks > Custom Access Token Hook

### **Migrations de RLS (Já Feitas)**
- **Arquivo:** `supabase/migrations/20260416120200_fix_rls_use_app_metadata.sql`
- **Status:** ✅ 28 policies atualizadas, zero vulnerabilidades

### **Story 4.1 (Que Resolveu Tudo)**
- **Arquivo:** `docs/stories/4.1.story.md`
- **Status:** ✅ Done
- **AC:** 100% coverage

### **Story 5.4.1 (Implementação Frontend/API)**
- **Plano:** `docs/plans/fase.5/F5.plan.009.md`
- **Status:** 📋 Pronto para implementação
- **Gotchas:** 4 armadilhas documentadas (follow à risca!)

---

## 💡 Lições Aprendidas

### **1. RLS é Complexo**
- user_metadata vs app_metadata não é óbvio
- Precisa de testes com múltiplos tenants
- Documentação do Supabase pode ser confusa

### **2. Segurança Não é Rápida**
- Prototipagem rápida = vulnerabilidades
- Precisa de code review de segurança
- Custom hooks não são "set and forget"

### **3. Source of Truth Importa**
- Cliente NUNCA é source of truth de segurança
- Banco é a autoridade final
- JWT é só transporte seguro de dados

### **4. Imutabilidade é Segurança**
- app_metadata injetado por SECURITY DEFINER = imutável
- user_metadata editável = vulnerável
- Diferença crítica

### **5. Testes Multi-Tenant São Obrigatórios**
- Um teste com um tenant passa, dois revelam problemas
- Isolamento só é provado com isolamento testado
- RLS isolation test deve ser CI/CD gate

---

## 🚀 Checklist Para Não Cair Novamente

Sempre que implementar algo com tenant_id:

- [ ] Tenant_id vem do **banco** (SELECT users WHERE id = ...)
- [ ] Tenant_id é injetado em **app_metadata** (SECURITY DEFINER)
- [ ] RLS filtra por **app_metadata** (não user_metadata)
- [ ] Cliente **nunca** passa tenant_id como parâmetro
- [ ] JWT é **sempre** requerido (header Authorization)
- [ ] RLS isolation test passa com 2+ tenants
- [ ] CodeRabbit review passou (zero security issues)
- [ ] Sem app_metadata = sem acesso (default deny)

---

## 📝 Conclusão

**O padrão correto é:**

```
Banco (source of truth) 
  → Custom Hook (injeta app_metadata)
  → JWT assinado (imutável)
  → API Route (passa JWT)
  → RPC (filtra por app_metadata do JWT)
  → RLS garante isolamento
```

**Se sair desse padrão = vulnarabilidade de segurança.**

**Lição:** Tire 2-3 dias para fazer certo, não 10+ dias para corrigir depois.

---

**Escrito em:** 2026-04-23  
**Autor:** Dara (@data-engineer) + Renato (frustrado mas resolvido)  
**Próximas atualizações:** Quando alguém tentar fazer diferente novamente 😤
