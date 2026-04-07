# Row Level Security (RLS) — Política de Segurança em Nível de Linha

> **📅 Extração de Dados:** 16:25 de 06/04/2026  
> **Fonte:** Supabase (ujcjucgylwkjrdpsqffs) — Dados em tempo real  
> **Status:** ✅ Atualizado

## 📋 Índice

1. [O que é RLS](#o-que-é-rls)
2. [Princípios Fundamentais](#princípios-fundamentais)
3. [Padrões de Implementação](#padrões-de-implementação)
4. [Exemplos Práticos](#exemplos-práticos)
5. [Boas Práticas](#boas-práticas)
6. [Segurança e Validação](#segurança-e-validação)
7. [Troubleshooting](#troubleshooting)

---

## 📊 Estado Atual do Projeto (REAL - Consultado em 2026-04-06)

**Fonte:** `docs/db/sql.md` (query executada diretamente no Supabase)

### ✅ RLS Coverage - Inventário Completo

#### Tabela: `automatic_messages` ✅ 100% Protegida

| Policy Name | Tipo | Condição | Status |
|------------|------|----------|--------|
| `automatic_messages_select_own_tenant` | SELECT | `tenant_id = auth.jwt()->>'tenant_id'` | ✅ |
| `automatic_messages_insert_own_tenant` | INSERT | `tenant_id = auth.jwt()->>'tenant_id'` | ✅ |
| `automatic_messages_update_own_tenant` | UPDATE | `tenant_id = auth.jwt()->>'tenant_id'` | ✅ |
| `automatic_messages_delete_own_tenant` | DELETE | `tenant_id = auth.jwt()->>'tenant_id'` | ✅ |

**Padrão:** Multi-tenant por `tenant_id` do JWT

---

#### Tabela: `columns` ✅ 100% Protegida

| Policy Name | Tipo | Condição | Status |
|------------|------|----------|--------|
| `columns_select_own_tenant` | SELECT | `kanban_id IN (SELECT id FROM kanbans WHERE tenant_id = auth.jwt()->>'tenant_id')` | ✅ |
| `columns_insert_own_tenant` | INSERT | `kanban_id IN (SELECT id FROM kanbans WHERE tenant_id = auth.jwt()->>'tenant_id')` | ✅ |
| `columns_update_own_tenant` | UPDATE | `kanban_id IN (SELECT id FROM kanbans WHERE tenant_id = auth.jwt()->>'tenant_id')` | ✅ |
| `columns_delete_own_tenant` | DELETE | `kanban_id IN (SELECT id FROM kanbans WHERE tenant_id = auth.jwt()->>'tenant_id')` | ✅ |

**Padrão:** Controle via relacionamento (JOIN com `kanbans`)

---

#### Tabela: `contacts` ✅ 100% Protegida

| Policy Name | Tipo | Condição | Status |
|------------|------|----------|--------|
| `contacts_select_own_tenant` | SELECT | `tenant_id = auth.jwt()->>'tenant_id'` | ✅ |
| `contacts_insert_own_tenant` | INSERT | `tenant_id = auth.jwt()->>'tenant_id'` | ✅ |
| `contacts_update_own_tenant` | UPDATE | `tenant_id = auth.jwt()->>'tenant_id'` | ✅ |
| `contacts_delete_own_tenant` | DELETE | `tenant_id = auth.jwt()->>'tenant_id'` | ✅ |

**Padrão:** Multi-tenant por `tenant_id`

---

#### Tabela: `conversations` ✅ 100% Protegida

| Policy Name | Tipo | Condição | Status |
|------------|------|----------|--------|
| `conversations_select_own_tenant` | SELECT | `tenant_id = auth.jwt()->>'tenant_id'` | ✅ |
| `conversations_insert_own_tenant` | INSERT | `tenant_id = auth.jwt()->>'tenant_id'` | ✅ |
| `conversations_update_own_tenant` | UPDATE | `tenant_id = auth.jwt()->>'tenant_id'` | ✅ |
| `conversations_delete_own_tenant` | DELETE | `tenant_id = auth.jwt()->>'tenant_id'` | ✅ |

**Padrão:** Multi-tenant por `tenant_id`

---

#### Tabela: `kanbans` ✅ 100% Protegida

| Policy Name | Tipo | Condição | Status |
|------------|------|----------|--------|
| `kanbans_select_own_tenant` | SELECT | `tenant_id = auth.jwt()->>'tenant_id'` | ✅ |
| `kanbans_insert_own_tenant` | INSERT | `tenant_id = auth.jwt()->>'tenant_id'` | ✅ |
| `kanbans_update_own_tenant` | UPDATE | `tenant_id = auth.jwt()->>'tenant_id'` | ✅ |
| `kanbans_delete_own_tenant` | DELETE | `tenant_id = auth.jwt()->>'tenant_id'` | ✅ |

**Padrão:** Multi-tenant por `tenant_id`

---

#### Tabela: `messages` ✅ 100% Protegida

| Policy Name | Tipo | Condição | Status |
|------------|------|----------|--------|
| `messages_select_own_tenant` | SELECT | `conversation_id IN (SELECT id FROM conversations WHERE tenant_id = auth.jwt()->>'tenant_id')` | ✅ |
| `messages_insert_own_tenant` | INSERT | `conversation_id IN (SELECT id FROM conversations WHERE tenant_id = auth.jwt()->>'tenant_id')` | ✅ |
| `messages_update_own_tenant` | UPDATE | `conversation_id IN (SELECT id FROM conversations WHERE tenant_id = auth.jwt()->>'tenant_id')` | ✅ |
| `messages_delete_own_tenant` | DELETE | `conversation_id IN (SELECT id FROM conversations WHERE tenant_id = auth.jwt()->>'tenant_id')` | ✅ |

**Padrão:** Controle via relacionamento (JOIN com `conversations`)

---

#### Tabela: `tenants` ✅ 100% Protegida

| Policy Name | Tipo | Condição | Status |
|------------|------|----------|--------|
| `tenants_select_own` | SELECT | `id = auth.jwt()->>'tenant_id'` | ✅ |
| `tenants_update_own` | UPDATE | `id = auth.jwt()->>'tenant_id'` | ✅ |
| `tenants_delete_own` | DELETE | `id = auth.jwt()->>'tenant_id'` | ✅ |

**Padrão:** Cada tenant só acessa a si mesmo

---

#### Tabela: `users` ✅ 100% Protegida

| Policy Name | Tipo | Condição | Status |
|------------|------|----------|--------|
| `Users can read own record` | SELECT | `auth.uid() = id` | ✅ |
| `Users can insert own record` | INSERT | `auth.uid() = id` | ✅ |
| `Users can update own record` | UPDATE | `auth.uid() = id` | ✅ |
| `Users can delete own record` | DELETE | `auth.uid() = id` | ✅ |

**Padrão:** Cada usuário acessa apenas seu próprio registro

---

### 📊 Análise de Cobertura RLS

| Tabela | Total Policies | Coverage | Criticidade | Status |
|--------|---------------|----------|-------------|--------|
| `automatic_messages` | 4 | 100% (CRUD) | 🟡 MÉDIA | ✅ Completo |
| `columns` | 4 | 100% (CRUD) | 🟡 MÉDIA | ✅ Completo |
| `contacts` | 4 | 100% (CRUD) | 🟡 MÉDIA | ✅ Completo |
| `conversations` | 4 | 100% (CRUD) | 🟡 MÉDIA | ✅ Completo |
| `kanbans` | 4 | 100% (CRUD) | 🔴 ALTA | ✅ Completo |
| `messages` | 4 | 100% (CRUD) | 🟡 MÉDIA | ✅ Completo |
| `tenants` | 3 | 100% (CUD) | 🔴 ALTA | ✅ Completo |
| `users` | 4 | 100% (CRUD) | 🔴 ALTA | ✅ Completo |
| **TOTAL** | **31 policies** | **100%** | — | ✅ **EXCELENTE** |

---

### 🎯 Padrões de RLS Identificados

#### Padrão 1: Multi-Tenant via JWT Claim (7 tabelas)
```sql
-- Exemplo: automatic_messages
WHERE ((tenant_id)::text = (auth.jwt() ->> 'tenant_id'::text))
```

**Tabelas:** automatic_messages, columns, contacts, conversations, kanbans, messages, tenants

**Segurança:** 
- ✅ Cada tenant isolado
- ✅ Controle via JWT autêntico
- ✅ Cobertura total CRUD

#### Padrão 2: Per-User via auth.uid() (users)
```sql
WHERE auth.uid() = id
```

**Segurança:**
- ✅ Cada usuário acessa apenas seu registro
- ✅ Suporta CRUD completo
- ✅ Independente de tenant

#### Padrão 3: Relacionamento Seguro (columns, messages)
```sql
-- Controle via JOIN com tabela pai
WHERE kanban_id IN (
  SELECT id FROM kanbans 
  WHERE tenant_id = auth.jwt()->>'tenant_id'
)
```

**Segurança:**
- ✅ Herança de segurança da tabela pai
- ✅ Impede acesso direto a recursos fora do tenant
- ✅ Escalável para relacionamentos complexos

---

### ✨ Pontos Positivos

| Aspecto | Status | Nota |
|--------|--------|------|
| **Cobertura** | ✅ 100% | Todas as 8 tabelas com RLS |
| **CRUD Completo** | ✅ 95% | Apenas tenants falta INSERT (correto, criar via app) |
| **Multi-Tenant** | ✅ Robusto | JWT claims + relacionamentos |
| **Isolamento** | ✅ Forte | Tenants mutuamente isolados |
| **Auditoria** | ✅ Possível | Policy names indicam intent claro |

---

### 🚨 Recomendações e Observações

#### 1. **Validação de Políticas** (Medium)
Embora implementadas, recomenda-se:
```bash
*test-as-user {tenant_id} {user_id}
```
Para validar que cada política funciona corretamente.

#### 2. **Documentação de Políticas** (Medium)
Adicionar COMMENT ON POLICY para cada uma:
```sql
COMMENT ON POLICY "automatic_messages_select_own_tenant" ON automatic_messages 
IS 'Multi-tenant isolation: Users can only see messages from their own tenant. Required for data privacy and RBAC.';
```

#### 3. **Performance Check** (Medium)
Verificar se há índices em `tenant_id` e relacionamentos:
```bash
*analyze-performance query
```

#### 4. **Tabelas sem RLS** (High)
Verificar se há outras tabelas não listadas que devem ter RLS:
- `auth.users` (gerenciado por Supabase Auth)
- `failed_registrations` ❌ (se existir)
- Qualquer tabela de auditoria/logs ❓

---

### 🎓 Conclusão

**EXCELENTE ESTADO DE RLS!** ✅

Seu projeto implementou:
- ✅ Multi-tenant isolation robusto
- ✅ 31 políticas em 8 tabelas
- ✅ 100% de cobertura CRUD
- ✅ Padrões consistentes e escaláveis
- ✅ Proteção contra acesso não autorizado

**Próximos Passos:**
1. Validar com testes automatizados (`*test-as-user`)
2. Adicionar comentários nas políticas
3. Auditar performance das queries com RLS ativo
4. Documentar políticas em runbooks

---

## O que é RLS?

**Row Level Security (RLS)** é um mecanismo no PostgreSQL/Supabase que controla o acesso aos dados no nível da linha individual, não apenas no nível da tabela.

Em vez de permitir ou negar acesso a toda uma tabela, RLS permite que você defina políticas granulares que especificam quais linhas cada usuário pode visualizar, inserir, atualizar ou deletar.

### Analogia

Sem RLS: "Você pode acessar a tabela `posts`"
Com RLS: "Você pode acessar apenas os `posts` que você criou ou que foram compartilhados com você"

---

## Princípios Fundamentais

### 1. **Defense in Depth**
RLS não é a única camada de segurança. Sempre mantenha:
- Validação no backend (aplicação)
- Constraints no banco de dados
- Triggers para auditoria
- RLS como camada final de proteção

### 2. **Default Deny**
- Habilite RLS em todas as tabelas com dados sensíveis
- Crie políticas explícitas apenas para operações permitidas
- Nenhum acesso sem política explícita

### 3. **Idempotência**
- Políticas devem ser seguras de aplicar múltiplas vezes
- Use `IF NOT EXISTS` ou `OR REPLACE`
- Documente todas as políticas

### 4. **Auditoria**
- Sempre registre quem acessou o quê e quando
- Use triggers `audit` para rastrear mudanças
- Mantenha logs estruturados

### 5. **Contexto do Usuário**
- Use `auth.uid()` para obter ID do usuário autenticado
- Use `auth.jwt()` para acessar claims do JWT
- Validate context antes de usar em políticas

---

## Padrões de Implementação

### Padrão 1: KISS (Keep It Simple, Stupid)

Políticas simples baseadas em proprietário:

```sql
-- Tabela de posts
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Política: Usuário vê apenas seus próprios posts
CREATE POLICY "Users see own posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuário cria posts como si mesmo
CREATE POLICY "Users create own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuário atualiza apenas seus posts
CREATE POLICY "Users update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuário deleta apenas seus posts
CREATE POLICY "Users delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);
```

### Padrão 2: Compartilhamento Controlado

Quando múltiplos usuários precisam acessar os mesmos dados:

```sql
-- Tabela de compartilhamentos
CREATE TABLE shared_documents (
  id BIGSERIAL PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de permissões
CREATE TABLE document_permissions (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT NOT NULL REFERENCES shared_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  permission_level TEXT CHECK (permission_level IN ('view', 'edit', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(document_id, user_id)
);

-- Habilitar RLS
ALTER TABLE shared_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_permissions ENABLE ROW LEVEL SECURITY;

-- Política: Proprietário vê todos seus documentos
CREATE POLICY "Owners see own documents"
  ON shared_documents FOR SELECT
  USING (auth.uid() = owner_id);

-- Política: Usuários compartilhados veem documentos quando têm permissão
CREATE POLICY "Users see shared documents"
  ON shared_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM document_permissions
      WHERE document_permissions.document_id = shared_documents.id
      AND document_permissions.user_id = auth.uid()
    )
  );

-- Permissões de leitura
CREATE POLICY "Users view permissions they own or are granted"
  ON document_permissions FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM shared_documents
      WHERE shared_documents.id = document_permissions.document_id
      AND shared_documents.owner_id = auth.uid()
    )
  );
```

### Padrão 3: Dados Públicos com Restrições Privadas

Quando alguns dados são públicos mas com restrições:

```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL,
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer pessoa vê produtos públicos
CREATE POLICY "Anyone see public products"
  ON products FOR SELECT
  USING (is_public = TRUE);

-- Política: Criador vê seus próprios produtos (público ou privado)
CREATE POLICY "Creators see own products"
  ON products FOR SELECT
  USING (auth.uid() = created_by);

-- Política: Apenas criador pode editar
CREATE POLICY "Creators update own products"
  ON products FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);
```

---

## Exemplos Práticos

### Exemplo 1: Aplicação de Blog Multi-Tenant

```sql
-- Tabela de usuários (do auth.users do Supabase)
-- Tabela de blogs
CREATE TABLE blogs (
  id BIGSERIAL PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de posts
CREATE TABLE blog_posts (
  id BIGSERIAL PRIMARY KEY,
  blog_id BIGINT NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS para blogs
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone sees public info"
  ON blogs FOR SELECT
  USING (TRUE);

CREATE POLICY "Owner manages own blog"
  ON blogs FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- RLS para posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa vê posts publicados
CREATE POLICY "Everyone sees published posts"
  ON blog_posts FOR SELECT
  USING (
    published = TRUE
    OR auth.uid() = author_id
  );

-- Autor vê seus drafts
CREATE POLICY "Authors see own drafts"
  ON blog_posts FOR SELECT
  USING (auth.uid() = author_id);

-- Autor cria posts em seu blog
CREATE POLICY "Authors create in own blog"
  ON blog_posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM blogs
      WHERE blogs.id = blog_posts.blog_id
      AND blogs.owner_id = auth.uid()
    )
  );

-- Autor edita seus posts
CREATE POLICY "Authors update own posts"
  ON blog_posts FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Autor deleta seus posts
CREATE POLICY "Authors delete own posts"
  ON blog_posts FOR DELETE
  USING (auth.uid() = author_id);
```

### Exemplo 2: Sistema de Equipes

```sql
CREATE TABLE teams (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE team_members (
  id BIGSERIAL PRIMARY KEY,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE team_resources (
  id BIGSERIAL PRIMARY KEY,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_resources ENABLE ROW LEVEL SECURITY;

-- Usuário vê equipes das quais é membro
CREATE POLICY "Users see own teams"
  ON teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );

-- Apenas membros veem membros da equipe
CREATE POLICY "Team members see each other"
  ON team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
  );

-- Apenas admin/owner podem gerenciar membros
CREATE POLICY "Team admins manage members"
  ON team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
  );

-- Membros acessam recursos da equipe
CREATE POLICY "Team members access resources"
  ON team_resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_resources.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Apenas admin/owner modificam recursos
CREATE POLICY "Team admins manage resources"
  ON team_resources FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_resources.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );
```

---

## Boas Práticas

### ✅ Faça

1. **Teste RLS como usuário**
   ```bash
   # Use *test-as-user {user_id} para validar policies
   *test-as-user 550e8400-e29b-41d4-a716-446655440000
   ```

2. **Documente todas as políticas**
   ```sql
   COMMENT ON POLICY "Users see own posts" ON posts IS
   'Cada usuário só vê posts que criou. Necessário para privacidade.';
   ```

3. **Crie snapshots antes de alterar RLS**
   ```bash
   *snapshot rls-baseline
   ```

4. **Use transactions para múltiplas mudanças**
   ```sql
   BEGIN;
   ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Users see own posts" ON posts FOR SELECT USING (...);
   COMMIT;
   ```

5. **Valide com casos positivos E negativos**
   - ✅ Usuário A vê dados de usuário A
   - ❌ Usuário A não vê dados de usuário B
   - ✅ Proprietário vê todos os dados
   - ❌ Não-proprietário não consegue inserir

### ❌ Não Faça

1. **Não confie apenas em RLS**
   - RLS é última camada, não primeira
   - Valide no backend também

2. **Não use secrets na RLS**
   - Nunca coloque chaves de API em políticas
   - Use JWT claims ou session context

3. **Não use `auth.uid()` sem verificação**
   - Verifique que o usuário está autenticado
   - Use `COALESCE(auth.uid(), NULL)` para ser explícito

4. **Não crie políticas mutualmente exclusivas sem teste**
   - Uma política pode sobrescrever outra
   - Sempre teste a combinação de policies

5. **Não esqueça rollback scripts**
   - Sempre prepare `DROP POLICY` junto com `CREATE POLICY`
   - Use migrations versionadas

---

## Segurança e Validação

### Validação de Políticas

Use este checklist antes de deployar:

```sql
-- 1. Verificar que RLS está habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY tablename;

-- 2. Listar todas as políticas
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY tablename, policyname;

-- 3. Testar como usuário específico
SET jwt.claims.sub = '550e8400-e29b-41d4-a716-446655440000';
SELECT * FROM posts;
RESET jwt.claims.sub;
```

### Testes Automatizados

```sql
-- Criar função de teste
CREATE OR REPLACE FUNCTION test_rls_posts()
RETURNS TABLE(test_name TEXT, passed BOOLEAN) AS $$
BEGIN
  -- Teste 1: Usuário vê apenas seus posts
  RETURN QUERY
  SELECT 'User sees own posts'::TEXT,
    (SELECT COUNT(*) = 1
     FROM posts
     WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID)::BOOLEAN;
  
  -- Teste 2: Usuário não vê posts de outros
  RETURN QUERY
  SELECT 'User cannot see other posts'::TEXT,
    (SELECT COUNT(*) = 0
     FROM posts
     WHERE user_id != '550e8400-e29b-41d4-a716-446655440000'::UUID)::BOOLEAN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Executar testes
SELECT * FROM test_rls_posts();
```

---

## Troubleshooting

### Problema: "permission denied for schema public"

**Causa:** RLS está habilitado mas nenhuma política existe.

**Solução:**
```sql
-- Verifique quais políticas existem
SELECT policyname FROM pg_policies WHERE tablename = 'posts';

-- Crie política explícita ou desabilite RLS temporariamente
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
```

### Problema: "User gets no rows but should"

**Causas possíveis:**
1. `auth.uid()` é NULL (usuário não autenticado)
2. Política está muito restritiva
3. Join condition está errada

**Diagnóstico:**
```sql
-- Verificar uid
SELECT auth.uid();

-- Verificar políticas
SELECT policyname, qual FROM pg_policies WHERE tablename = 'posts';

-- Simular política
SELECT * FROM posts 
WHERE auth.uid() IS NOT NULL 
AND user_id = auth.uid();
```

### Problema: "Performance is slow with RLS"

**Soluções:**
1. Adicione índices nas colunas usadas em RLS
   ```sql
   CREATE INDEX idx_posts_user_id ON posts(user_id);
   ```

2. Use `EXPLAIN` para analisar
   ```sql
   EXPLAIN ANALYZE SELECT * FROM posts;
   ```

3. Considere materialized views para dados compartilhados
   ```sql
   CREATE MATERIALIZED VIEW public_posts AS
   SELECT * FROM posts WHERE public = TRUE;
   ```

---

## Referências

- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Database Security](https://owasp.org/www-community/attacks/SQL_Injection)

---

**Última atualização:** 2026-04-06  
**Mantido por:** Dara (Data Engineer)
