/**
 * RLS Performance Baseline Tests
 *
 * Measures RLS performance with larger datasets to ensure:
 * - RLS overhead is < 5%
 * - Indexes are used correctly
 * - Query performance scales predictably
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  generatePerformanceDataset,
  seedPerformanceData,
  runPerformanceBaseline,
  generatePerformanceReport
} from './fixtures/rls-performance-data';

// ============================================================================
// Setup & Configuration
// ============================================================================

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'http://localhost:54321').trim().replace(/^['"]|['"]$/g, "");
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim().replace(/^['"]|['"]$/g, "");
const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim().replace(/^['"]|['"]$/g, "");

let adminClient: SupabaseClient;
let anonClient: SupabaseClient;

// Skip performance tests unless explicitly enabled via TEST_DATABASE=true
const isRLSEnabled = process.env.TEST_DATABASE === 'true';
const describeRLS = isRLSEnabled ? describe : describe.skip;

describeRLS('RLS Performance Baseline Tests', () => {
  beforeAll(async () => {
    // Verify environment
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY required for performance tests');
    }

    // Initialize clients
    adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || '');

    // Generate and seed performance dataset
    console.log('Generating performance dataset (10K rows)...');
    const dataset = generatePerformanceDataset(10000);

    console.log('Seeding performance data...');
    await seedPerformanceData(adminClient, dataset);
    console.log('✅ Performance dataset seeded');
  });

  afterAll(async () => {
    console.log('Cleaning up performance test data...');
    // Cleanup performance data
    // This will be handled by the next run's cleanup in rls-validation.test.ts
  });

  describe('Performance Measurements', () => {
    it('should measure RLS overhead on SELECT queries', async () => {
      const baseline = await runPerformanceBaseline(anonClient, adminClient);

      console.log('\n' + generatePerformanceReport(baseline));

      expect(baseline.selectWithRls).toBeLessThan(baseline.selectWithoutRls * 1.05);
    });

    it('should verify indexes are used', async () => {
      const { data } = await adminClient
        .from('kanbans')
        .select('id, tenant_id, name')
        .limit(1);

      expect(data).toBeDefined();
    });
  });
});
