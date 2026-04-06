# RLS Performance Baseline Report

**Story:** 1.4 - RLS Policies Validation (Testing & Verification)  
**Date:** 2026-04-06  
**Status:** Ready for Execution  
**Framework:** Vitest with Supabase

---

## Overview

This document describes the RLS performance testing framework and baseline measurement process.

## Performance Test Strategy

### Test Scope

**Test Dataset:**
- 10,000 rows in `kanbans` table (Tenant A)
- Comprehensive test fixtures (2 tenants, 2 users per tenant)
- Multi-table relationship testing

**Metrics Measured:**
1. SELECT query duration with RLS enabled
2. Row count returned under isolation
3. RLS overhead (target: <5% vs non-RLS baseline)
4. Index efficiency verification

### Test Execution

**Command:**
```bash
# Run with performance baseline
RLS_PERF_TEST=true npm run test:rls

# Run standard tests only (default)
npm run test:rls
```

**Files Involved:**
- `tests/fixtures/rls-performance-data.ts` — Performance dataset generators
- `tests/rls-validation.test.ts` — Performance tests (Task 6, Phase 5)
- `docs/qa/rls-performance-baseline.md` — This report

## Performance Benchmarks

### Expected Results (10K Rows)

| Metric | Target | Status |
|--------|--------|--------|
| RLS Query Duration | <200ms | Pending |
| Rows Returned | 10,000 | Pending |
| RLS Overhead | <5% | Pending |
| Index Usage | Verified | Pending |

### Critical Success Factors

1. **RLS Overhead <5%** — Acceptable performance impact
2. **Consistent Response Times** — No query timeouts
3. **Index Effectiveness** — Queries use existing indexes
4. **No N+1 Patterns** — Efficient single-pass queries

## Task Breakdown (Task 6)

### Subtask 6.1: Run SELECT performance test on 10K-row table
- ✅ **Implemented:** rls-performance-data.ts + test in Phase 5
- **Action:** Seeds 10K rows, measures SELECT duration
- **Output:** Duration in ms, row count

### Subtask 6.2: Calculate RLS overhead (<5% target)
- ✅ **Implemented:** runPerformanceBaseline() function
- **Action:** Calculates overhead percentage
- **Output:** Overhead %, threshold check (pass/fail)

### Subtask 6.3: Verify EXPLAIN ANALYZE shows index usage
- ✅ **Framework:** Documented in test code
- **Manual Execution:** Run in psql:
  ```sql
  EXPLAIN ANALYZE SELECT * FROM kanbans 
  WHERE tenant_id = '11111111-1111-1111-1111-111111111111';
  ```
- **Verification:** Check that index is used in query plan

### Subtask 6.4: Document baseline in report
- ✅ **Implemented:** generatePerformanceReport() function
- **Output:** Structured markdown report with metrics

## How to Run Performance Tests

### Step 1: Setup Environment
```bash
cd c:/git/kanban.2
npm install  # Ensure dependencies installed
```

### Step 2: Execute Performance Baseline
```bash
# Full performance test suite
RLS_PERF_TEST=true npm run test:rls

# Expected output:
# ✓ Phase 5: Performance Baseline
#   ✓ Task 6.1: Run SELECT performance test on 10K-row table
#   ✓ Task 6.2: Calculate RLS overhead (<5% target)
#   ✓ Task 6.3: Verify EXPLAIN ANALYZE shows index usage
#   ✓ Task 6.4: Document baseline in report
```

### Step 3: Review Report
Performance report is printed to console. Example:
```
📊 RLS Performance Baseline Report

Generated: 2026-04-06T14:30:00.000Z

## Test Results

| Metric | Value |
|--------|-------|
| Total Rows Tested | 10000 |
| RLS Query Duration | 125.45ms |
| RLS Overhead | 2.3% |
| Meets Threshold (<5%) | ✅ YES |

## Analysis

✅ RLS performance is acceptable (<5% overhead)
```

### Step 4: Manual EXPLAIN ANALYZE Verification
```bash
# Connect to Supabase PostgreSQL
psql "postgres://[user]:[password]@db.ujcjucgylwkjrdpsqffs.supabase.co:5432/postgres"

# Run EXPLAIN for kanbans SELECT
EXPLAIN ANALYZE SELECT * FROM kanbans 
WHERE tenant_id = '11111111-1111-1111-1111-111111111111';

# Check output:
# - Uses index on tenant_id? (Seq Scan vs Index Scan)
# - Execution time < 200ms?
```

## Index Requirements

For acceptable RLS performance, ensure these indexes exist:

```sql
-- Multi-tenant table isolation
CREATE INDEX idx_kanbans_tenant_id ON kanbans(tenant_id);
CREATE INDEX idx_contacts_tenant_id ON contacts(tenant_id);
CREATE INDEX idx_conversations_tenant_id ON conversations(tenant_id);

-- Foreign key traversal (for nested RLS policies)
CREATE INDEX idx_columns_kanban_id ON columns(kanban_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
```

**Verify indexes exist:**
```sql
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## Performance Troubleshooting

### Symptom: RLS overhead >5%

**Possible Causes:**
1. Missing indexes on `tenant_id` or foreign keys
2. Large dataset without pagination
3. Complex policy conditions with subqueries

**Solutions:**
1. Create recommended indexes (see above)
2. Use EXPLAIN ANALYZE to identify slow predicates
3. Consider query optimization strategies

### Symptom: Test Timeout (>30s)

**Possible Causes:**
1. Database connection issues
2. Slow network to Supabase
3. Concurrent heavy queries

**Solutions:**
1. Check Supabase status
2. Verify network connectivity
3. Reduce dataset size for initial testing

## Success Criteria (Story 1.4 Completion)

- [x] Performance test framework implemented
- [x] 10K-row dataset generator ready
- [ ] Baseline measured & documented
- [ ] RLS overhead < 5% confirmed
- [ ] Index strategy validated

**Status:** Ready for execution → Awaiting test run

## References

- Story 1.4: RLS Policies Validation
- Task 6: Performance testing & baseline measurement
- Framework: Vitest + Supabase JS client
- Dataset: tests/fixtures/rls-performance-data.ts

---

**Last Updated:** 2026-04-06  
**Next Step:** Execute `RLS_PERF_TEST=true npm run test:rls` to run performance baseline
