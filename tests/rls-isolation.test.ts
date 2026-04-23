/**
 * Story 5.4.1 — Multi-Tenant RLS Isolation & Performance Tests
 * 
 * Validates:
 * - AC4: Tenant A ≠ Tenant B (Zero overlap)
 * - AC4: JWT Tampering protection
 * - AC4: No JWT access protection
 * - AC5: Performance benchmarks (< 500ms)
 * 
 * Run: npm test -- tests/rls-isolation.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import {
  TEST_TENANTS,
  TEST_USERS,
  seedTestData,
  cleanupTestData,
} from './fixtures/rls-test-data';
import {
  generateValidJWT,
} from './fixtures/jwt-generator';

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const rawAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const rawServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

const SUPABASE_URL = rawUrl.replace(/^['"]|['"]$/g, "").match(/https?:\/\/[^\s"']+/)?.[0] || rawUrl;
const SUPABASE_ANON_KEY = rawAnonKey.replace(/^['"]|['"]$/g, "");
const SUPABASE_SERVICE_ROLE_KEY = rawServiceKey.replace(/^['"]|['"]$/g, "");

// Skip if missing environment
const hasSupabase = !!SUPABASE_URL && !!SUPABASE_ANON_KEY && !!SUPABASE_SERVICE_ROLE_KEY;
const describeRLS = hasSupabase && process.env.TEST_DATABASE === 'true' ? describe : describe.skip;

describeRLS('Story 5.4.1 — RLS Isolation & Performance', () => {
  let jwtA: string;
  let jwtB: string;
  let kanbanAId: string;
  let kanbanBId: string;

  beforeAll(async () => {
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Seed standard test data
    await seedTestData(adminClient);

    // Get a kanban ID for Tenant A
    const { data: kanbanA } = await adminClient
      .from('kanbans')
      .select('id')
      .eq('tenant_id', TEST_TENANTS.A.id)
      .limit(1)
      .single();
    kanbanAId = kanbanA.id;

    // Get a kanban ID for Tenant B
    const { data: kanbanB } = await adminClient
      .from('kanbans')
      .select('id')
      .eq('tenant_id', TEST_TENANTS.B.id)
      .limit(1)
      .single();
    kanbanBId = kanbanB.id;

    // Generate JWTs
    jwtA = await generateValidJWT(TEST_USERS.A1);
    jwtB = await generateValidJWT(TEST_USERS.B1);
  });

  afterAll(async () => {
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    await cleanupTestData(adminClient);
  });

  describe('AC4: Security — Multi-Tenant RLS Isolation', () => {
    
    it('Scenario 1: Tenant A fetches only Tenant A data', async () => {
      const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${jwtA}` } }
      });

      // Extract tenant_id from JWT (simulating API route behavior)
      const claims = JSON.parse(Buffer.from(jwtA.split('.')[1], 'base64url').toString());
      const tenantIdFromJWT = claims.app_metadata.tenant_id;

      const { data, error } = await clientA.rpc('get_conversations_with_last_message', {
        p_kanban_id: kanbanAId,
        p_tenant_id: tenantIdFromJWT
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
      
      const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const conversationIds = data.map((c: { id: string }) => c.id);
      
      const { data: crossTenantRows } = await adminClient
        .from('conversations')
        .select('id')
        .in('id', conversationIds)
        .eq('tenant_id', TEST_TENANTS.B.id);

      expect(crossTenantRows?.length).toBe(0); // Zero overlap
    });

    it('Scenario 2: Tenant B fetches only Tenant B data', async () => {
      const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${jwtB}` } }
      });

      const claims = JSON.parse(Buffer.from(jwtB.split('.')[1], 'base64url').toString());
      const tenantIdFromJWT = claims.app_metadata.tenant_id;

      const { data, error } = await clientB.rpc('get_conversations_with_last_message', {
        p_kanban_id: kanbanBId,
        p_tenant_id: tenantIdFromJWT
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);

      const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const conversationIds = data.map((c: { id: string }) => c.id);
      
      const { data: crossTenantRows } = await adminClient
        .from('conversations')
        .select('id')
        .in('id', conversationIds)
        .eq('tenant_id', TEST_TENANTS.A.id);

      expect(crossTenantRows?.length).toBe(0); // Zero overlap
    });

    it('Scenario 3: JWT Tampering — Tenant A using Tenant B JWT sees Tenant B data', async () => {
      const clientAWithBToken = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${jwtB}` } }
      });

      const claims = JSON.parse(Buffer.from(jwtB.split('.')[1], 'base64url').toString());
      const tenantIdFromJWT = claims.app_metadata.tenant_id;

      const { data, error } = await clientAWithBToken.rpc('get_conversations_with_last_message', {
        p_kanban_id: kanbanBId,
        p_tenant_id: tenantIdFromJWT
      });

      expect(error).toBeNull();
      expect(data.every((c: { id: string }) => c.id !== undefined)).toBe(true);
      
      // Verify they don't see Tenant A data even if they try to pass Tenant A ID with Tenant B JWT
      // (The RPC has WHERE tenant_id = p_tenant_id, but the RLS on the table should still block it if it were a direct query)
      // Actually, since the RPC is SECURITY DEFINER, it bypasses RLS on the table.
      // So the security depends on the API Route passing the CORRECT tenant_id from the JWT.
      const { data: tenantAData, error: tamperingError } = await clientAWithBToken.rpc('get_conversations_with_last_message', {
        p_kanban_id: kanbanAId,
        p_tenant_id: TEST_TENANTS.A.id // Try to force Tenant A ID
      });
      
      // Now that the RPC has strict validation, it should return an error
      expect(tamperingError).not.toBeNull();
      expect(tamperingError?.message).toContain('Forbidden');
      expect(tenantAData).toBeNull();
    });

    it('Scenario 4: No JWT results in 401 or empty data', async () => {
      const clientNoAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const { data, error } = await clientNoAuth.rpc('get_conversations_with_last_message', {
        p_kanban_id: kanbanAId
      });

      // Depending on Supabase/PostgREST config, this might be a 401 or empty
      expect(error !== null || (data && data.length === 0)).toBe(true);
    });
  });

  describe('AC5: Performance — Benchmarks', () => {
    it('API response time should be < 500ms', async () => {
      const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${jwtA}` } }
      });

      const claims = JSON.parse(Buffer.from(jwtA.split('.')[1], 'base64url').toString());
      const tenantIdFromJWT = claims.app_metadata.tenant_id;

      const start = performance.now();
      const { error } = await clientA.rpc('get_conversations_with_last_message', {
        p_kanban_id: kanbanAId,
        p_tenant_id: tenantIdFromJWT
      });
      const end = performance.now();

      expect(error).toBeNull();
      const duration = end - start;
      console.log(`RPC Execution Duration: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(500);
    });
  });
});
