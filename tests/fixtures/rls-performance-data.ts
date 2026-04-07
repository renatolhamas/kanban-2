/**
 * RLS Performance Testing Fixtures
 *
 * Generates large datasets (10K+ rows) for performance baseline testing
 * Measures SELECT query performance with and without RLS
 */

import { v4 as uuidv4 } from 'uuid';
import { SupabaseClient } from '@supabase/supabase-js';
import { TEST_TENANTS, TEST_USERS } from './rls-test-data';

// ============================================================================
// Performance Test Dataset Generator
// ============================================================================

/**
 * Generate 10K rows for performance testing
 * Creates large number of kanbans in Tenant A for SELECT performance baseline
 *
 * Usage:
 * ```
 * const dataset = generatePerformanceDataset(10000);
 * await seedPerformanceData(supabase, dataset);
 * ```
 */
export function generatePerformanceDataset(rowCount: number = 10000) {
  const kanbanRows = Array.from({ length: rowCount }, (_, i) => ({
    id: uuidv4(),
    tenant_id: TEST_TENANTS.A.id,
    name: `Performance Test Kanban ${i + 1}`,
    description: `Kanban for performance baseline test #${i + 1}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  return {
    kanbans: kanbanRows,
  };
}

// ============================================================================
// Performance Data Seeding
// ============================================================================

/**
 * Seed performance test data into database
 *
 * WARNING: This inserts 10K rows! Use cautiously.
 * Only seed when running performance tests specifically.
 *
 * Usage:
 * ```
 * if (process.env.RLS_PERFORMANCE_TEST) {
 *   const dataset = generatePerformanceDataset(10000);
 *   await seedPerformanceData(supabase, dataset);
 * }
 * ```
 */
export async function seedPerformanceData(supabase: SupabaseClient, dataset: ReturnType<typeof generatePerformanceDataset>) {
  try {
    // Insert in batches to avoid timeout
    const batchSize = 1000;
    for (let i = 0; i < dataset.kanbans.length; i += batchSize) {
      const batch = dataset.kanbans.slice(i, i + batchSize);
      const { error } = await supabase.from('kanbans').insert(batch);

      if (error) {
        console.error(`Error inserting batch ${i / batchSize}:`, error);
        throw error;
      }

      console.log(
        `✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(dataset.kanbans.length / batchSize)}`
      );
    }

    console.log(`✅ Seeded ${dataset.kanbans.length} performance test rows`);
  } catch (error) {
    console.error('Error seeding performance data:', error);
    throw error;
  }
}

// ============================================================================
// Performance Measurement Utilities
// ============================================================================

export interface PerformanceMeasurement {
  description: string;
  queryType: string;
  rowCount: number;
  withRLS: boolean;
  durationMs: number;
  rowsReturned: number;
  timestamp: string;
}

export interface PerformanceBaseline {
  measurements: PerformanceMeasurement[];
  overhead: number; // Percentage overhead of RLS vs non-RLS
  meetsThreshold: boolean; // < 5% target
  selectWithRls?: number; // Duration in ms for SELECT with RLS
  selectWithoutRls?: number; // Duration in ms for SELECT without RLS
}

/**
 * Measure SELECT query performance
 *
 * Returns execution time in milliseconds
 */
export async function measureSelectPerformance(
  supabase: SupabaseClient,
  tableName: string,
  filterCondition?: { column: string; value: string }
): Promise<{ durationMs: number; rowCount: number }> {
  const startTime = performance.now();

  let query = supabase.from(tableName).select('id');

  if (filterCondition) {
    query = query.eq(filterCondition.column, filterCondition.value);
  }

  const { data, error } = await query;

  const endTime = performance.now();
  const durationMs = endTime - startTime;

  if (error) {
    throw new Error(`Query failed: ${error.message}`);
  }

  return {
    durationMs,
    rowCount: data?.length || 0,
  };
}

/**
 * Run performance baseline test
 *
 * Compares SELECT performance with vs without RLS to measure overhead
 */
export async function runPerformanceBaseline(
  anonClient: SupabaseClient,
  adminClient: SupabaseClient,
  rowCount: number = 10000
): Promise<PerformanceBaseline> {
  const measurements: PerformanceMeasurement[] = [];

  // Measurement 1: SELECT from Tenant A with RLS
  // (User A authenticated via JWT, RLS enforced)
  const rls_tenant_a = await measureSelectPerformance(
    anonClient,
    'kanbans',
    { column: 'tenant_id', value: TEST_TENANTS.A.id }
  );

  measurements.push({
    description: 'SELECT with RLS (Tenant A)',
    queryType: 'SELECT',
    rowCount,
    withRLS: true,
    durationMs: rls_tenant_a.durationMs,
    rowsReturned: rls_tenant_a.rowCount,
    timestamp: new Date().toISOString(),
  });

  // Measurement 2: SELECT without RLS (admin/service role)
  // (Bypasses RLS entirely for comparison)
  const no_rls = await measureSelectPerformance(
    adminClient,
    'kanbans'
  );

  measurements.push({
    description: 'SELECT without RLS (admin)',
    queryType: 'SELECT',
    rowCount,
    withRLS: false,
    durationMs: no_rls.durationMs,
    rowsReturned: no_rls.rowCount,
    timestamp: new Date().toISOString(),
  });

  // Calculate overhead: (RLS_time - NoRLS_time) / NoRLS_time * 100
  const overhead = no_rls.durationMs > 0
    ? ((rls_tenant_a.durationMs - no_rls.durationMs) / no_rls.durationMs) * 100
    : 0;

  return {
    measurements,
    overhead,
    meetsThreshold: overhead < 5,
    selectWithRls: rls_tenant_a.durationMs,
    selectWithoutRls: no_rls.durationMs,
  };
}

// ============================================================================
// Performance Report Generation
// ============================================================================

/**
 * Generate performance test report
 */
export function generatePerformanceReport(baseline: PerformanceBaseline): string {
  const report = `
# RLS Performance Baseline Report

**Generated:** ${new Date().toISOString()}

## Test Results

| Metric | Value |
|--------|-------|
| Total Rows Tested | ${baseline.measurements[0]?.rowCount || 'N/A'} |
| RLS Query Duration | ${baseline.measurements[0]?.durationMs.toFixed(2) || 'N/A'}ms |
| RLS Overhead | ${baseline.overhead.toFixed(2)}% |
| Meets Threshold (<5%) | ${baseline.meetsThreshold ? '✅ YES' : '❌ NO'} |

## Detailed Measurements

${baseline.measurements
  .map(
    (m) => `
### ${m.description}

- Query Type: ${m.queryType}
- With RLS: ${m.withRLS}
- Duration: ${m.durationMs.toFixed(2)}ms
- Rows Returned: ${m.rowsReturned}
- Timestamp: ${m.timestamp}
`
  )
  .join('\n')}

## Analysis

${
  baseline.meetsThreshold
    ? '✅ RLS performance is acceptable (<5% overhead)'
    : '⚠️  RLS overhead exceeds 5% threshold - consider indexing'
}

## Recommendations

1. **Index Strategy:** Ensure indexes exist on:
   - \`tenant_id\` (used in all multi-tenant policies)
   - Foreign key columns (kanban_id, conversation_id)

2. **Query Optimization:** Use EXPLAIN ANALYZE to verify RLS predicates use indexes

3. **Monitoring:** Track performance metrics in production to detect regressions
`;

  return report;
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Delete performance test data (cleanup)
 */
export async function cleanupPerformanceData(supabase: SupabaseClient) {
  try {
    // Delete all Tenant A kanbans created by performance tests
    // (they all have 'Performance Test Kanban' in the name)
    const { error } = await supabase
      .from('kanbans')
      .delete()
      .like('name', 'Performance Test Kanban%')
      .eq('tenant_id', TEST_TENANTS.A.id);

    if (error) {
      console.error('Error cleaning up performance data:', error);
      throw error;
    }

    console.log('✅ Performance test data cleaned up');
  } catch (error) {
    console.error('Cleanup warning:', error);
    // Don't throw - cleanup failure shouldn't block tests
  }
}
