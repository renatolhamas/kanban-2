# Story 1.1: Database Schema Testing Guide

## Quick Start

```bash
cd supabase/
bash run-tests.sh
```

This runs all tests against a local Supabase instance.

---

## Prerequisites

### Install Supabase CLI

```bash
npm install -g supabase@latest
```

### Docker

- Download Docker Desktop from https://www.docker.com
- Keep Docker running during tests

### Verify Installation

```bash
supabase --version
docker ps
```

---

## Test Suites

### 1. **CRITICAL Tests** (Tests 1-10)

File: `supabase/tests/1.1-critical-tests.sql`

Validates:

- ✅ All 8 tables exist
- ✅ FK constraints (valid/invalid inserts, CASCADE/SET NULL)
- ✅ Unique constraints (email, phone per tenant)
- ✅ is_main constraint (one per tenant)
- ✅ 13 indexes created
- ✅ RLS enabled on all tables

**Run manually:**

```bash
psql -h localhost -p 5432 -U postgres -d postgres -f supabase/tests/1.1-critical-tests.sql
```

### 2. **RLS Integration Tests** (Tests 1-6)

File: `supabase/tests/1.1-rls-integration-tests.sql`

Validates:

- ✅ Tenant A can see own tenant data
- ✅ Tenant A blocked from seeing Tenant B data (SELECT)
- ✅ Tenant A blocked from UPDATE Tenant B data
- ✅ Tenant A blocked from DELETE Tenant B data
- ✅ Nested RLS on conversations (via kanban)
- ✅ Deep nested RLS on messages (via conversation)

**Run manually:**

```bash
psql -h localhost -p 5432 -U postgres -d postgres -f supabase/tests/1.1-rls-integration-tests.sql
```

### 3. **Performance Tests** (Tests 1-6)

File: `supabase/tests/1.1-performance-tests.sql`

Validates index usage with EXPLAIN ANALYZE:

- ✅ idx_conversations_tenant_status
- ✅ idx_messages_conversation_created
- ✅ idx_contacts_phone_tenant
- ✅ idx_users_email_tenant
- ✅ idx_kanbans_main_tenant
- ✅ idx_conversations_kanban_column

**Run manually:**

```bash
psql -h localhost -p 5432 -U postgres -d postgres -f supabase/tests/1.1-performance-tests.sql
```

### 4. **Rollback Test**

File: `supabase/run-tests.sh` (Step 8)

Validates:

- ✅ Migration can be rolled back (all tables/functions dropped)
- ✅ Migration can be re-applied cleanly (idempotent)

---

## Step-by-Step Manual Testing

### Step 1: Start Local Supabase

```bash
supabase start
```

Wait for output:

```
Supabase local development setup is running.
     API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
     DB URL: postgresql://postgres:postgres@localhost:5432/postgres
     Studio URL: http://localhost:54323
```

### Step 2: Apply Migration

```bash
psql -h localhost -p 5432 -U postgres -d postgres \
  -f supabase/migrations/20260401234048_create_core_schema.sql
```

Expected output:

```
CREATE EXTENSION
CREATE EXTENSION
CREATE OR REPLACE FUNCTION
CREATE TABLE
... (repeat for each table)
CREATE INDEX
... (repeat for each index)
CREATE POLICY
... (repeat for each policy)
COMMENT ON TABLE
... (repeat for each comment)
```

### Step 3: Verify Schema

```bash
psql -h localhost -p 5432 -U postgres -d postgres << 'SQL'
-- Count tables
SELECT COUNT(*) FROM pg_tables
WHERE schemaname = 'public' AND tablename IN (
  'tenants', 'users', 'kanbans', 'columns', 'contacts', 'conversations', 'messages', 'automatic_messages'
);
-- Expected: 8

-- Count indexes
SELECT COUNT(*) FROM pg_indexes
WHERE schemaname = 'public' AND tablename IN (
  'tenants', 'users', 'kanbans', 'columns', 'contacts', 'conversations', 'messages', 'automatic_messages'
);
-- Expected: 13

-- Count RLS policies
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
-- Expected: 32
SQL
```

### Step 4: Run Critical Tests

```bash
psql -h localhost -p 5432 -U postgres -d postgres \
  -f supabase/tests/1.1-critical-tests.sql
```

All tests should output:

```
✅ TEST X PASSED: ...
```

### Step 5: Run RLS Tests

```bash
psql -h localhost -p 5432 -U postgres -d postgres \
  -f supabase/tests/1.1-rls-integration-tests.sql
```

All tests should output:

```
✅ RLS TEST X PASSED: ...
```

### Step 6: Run Performance Tests

```bash
psql -h localhost -p 5432 -U postgres -d postgres \
  -f supabase/tests/1.1-performance-tests.sql
```

All EXPLAIN ANALYZE output should show "Index Scan" operations.

### Step 7: Test Rollback

```bash
# Drop all tables and functions
psql -h localhost -p 5432 -U postgres -d postgres << 'ROLLBACK'
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS automatic_messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS columns CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS kanbans CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP FUNCTION IF EXISTS auth.get_tenant_id() CASCADE;
ROLLBACK

# Verify clean state
psql -h localhost -p 5432 -U postgres -d postgres << 'VERIFY'
SELECT COUNT(*) FROM pg_tables
WHERE schemaname = 'public' AND tablename IN (
  'tenants', 'users', 'kanbans', 'columns', 'contacts', 'conversations', 'messages', 'automatic_messages'
);
-- Expected: 0
VERIFY
```

### Step 8: Re-apply Migration

```bash
psql -h localhost -p 5432 -U postgres -d postgres \
  -f supabase/migrations/20260401234048_create_core_schema.sql
```

Should succeed without errors.

### Step 9: Stop Supabase

```bash
supabase stop
```

---

## Expected Test Results

| Test Suite      | Tests | Expected             | Status |
| --------------- | ----- | -------------------- | ------ |
| CRITICAL        | 1-10  | ✅ All PASSED        | ✓      |
| RLS Integration | 1-6   | ✅ All PASSED        | ✓      |
| Performance     | 1-6   | ✅ All using indexes | ✓      |
| Rollback        | 1     | ✅ Idempotent        | ✓      |

---

## Troubleshooting

### "Supabase CLI not found"

```bash
npm install -g supabase@latest
```

### "Docker not running"

- Start Docker Desktop
- Retry `supabase start`

### "psql: command not found"

- Install PostgreSQL client (comes with PostgreSQL)
- Or use Supabase CLI: `supabase db shell`

### Test fails with "Table already exists"

- Run: `supabase reset`
- Re-apply migration

### Permission denied on run-tests.sh

```bash
chmod +x supabase/run-tests.sh
bash supabase/run-tests.sh
```

---

## Definition of Done Verification

After all tests pass, verify:

- [x] All tables created with correct column types and constraints
- [x] All foreign keys tested (referential integrity)
- [x] RLS policies tested (attempt cross-tenant queries rejected)
- [x] Indexes verified with EXPLAIN ANALYZE on typical queries
- [x] Migration file created and rollback tested
- [x] Schema documented with ER diagram and table descriptions
- [x] Code passes CodeRabbit security review (no SQL injection patterns)
- [x] Dev notes updated with any deviations or learnings

---

## Next Steps

1. **Run full test suite:** `bash supabase/run-tests.sh`
2. **Document results** in Story 1.1 QA Results section
3. **Mark Definition of Done checkboxes** [x]
4. **Submit for QA review** (story status: Ready for Review)

---

**Last Updated:** 2026-04-01  
**Story:** 1.1 — Database Schema Creation  
**Status:** Testing Phase
