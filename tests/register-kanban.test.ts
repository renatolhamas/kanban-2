/**
 * Register Integration Tests - Kanban Auto-Creation
 *
 * Tests verify that default kanban "Main" with 4 columns
 * is created automatically during user registration
 *
 * Run: npm test -- register-kanban.test.ts
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { createDefaultKanban } from "@/lib/kanban";
import type { SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient;
let testTenantId: string;

describe("Register Integration - Kanban Auto-Creation", () => {
  beforeEach(async () => {
    // Initialize Supabase client
    const url = process.env.SUPABASE_URL || "";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!url || !key) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    supabase = createClient(url, key);

    // Create a test tenant
    const { data, error } = await supabase
      .from("tenants")
      .insert([{ name: `Test Tenant ${Date.now()}` }])
      .select("id")
      .single();

    if (error) throw error;
    testTenantId = data.id;
  });

  afterEach(async () => {
    // Cleanup: delete test tenant (cascade will delete kanbans and columns)
    if (testTenantId) {
      await supabase.from("tenants").delete().eq("id", testTenantId);
    }
  });

  describe("createDefaultKanban() function", () => {
    it("should create kanban 'Main' with is_main=true and order_position=1", async () => {
      const kanbanId = await createDefaultKanban(supabase, testTenantId);

      expect(kanbanId).toBeDefined();
      expect(typeof kanbanId).toBe("string");

      // Verify kanban was created
      const { data: kanban, error } = await supabase
        .from("kanbans")
        .select("id, name, is_main, order_position, tenant_id")
        .eq("id", kanbanId)
        .single();

      expect(error).toBeNull();
      expect(kanban).toBeDefined();
      expect(kanban.name).toBe("Main");
      expect(kanban.is_main).toBe(true);
      expect(kanban.order_position).toBe(1);
      expect(kanban.tenant_id).toBe(testTenantId);
    });

    it("should create exactly 4 columns with correct names and order", async () => {
      const kanbanId = await createDefaultKanban(supabase, testTenantId);

      // Verify columns were created
      const { data: columns, error } = await supabase
        .from("columns")
        .select("id, name, order_position, kanban_id")
        .eq("kanban_id", kanbanId)
        .order("order_position");

      expect(error).toBeNull();
      expect(columns).toHaveLength(4);

      // Verify column names and order
      expect(columns?.[0].name).toBe("Novo");
      expect(columns?.[0].order_position).toBe(1);

      expect(columns?.[1].name).toBe("Qualificado");
      expect(columns?.[1].order_position).toBe(2);

      expect(columns?.[2].name).toBe("Em Negociação");
      expect(columns?.[2].order_position).toBe(3);

      expect(columns?.[3].name).toBe("Fechado");
      expect(columns?.[3].order_position).toBe(4);

      // Verify all columns link to correct kanban
      columns?.forEach((col) => {
        expect(col.kanban_id).toBe(kanbanId);
      });
    });

    it("should enforce unique constraint: only 1 is_main=true per tenant", async () => {
      // Create first kanban with is_main=true
      await createDefaultKanban(supabase, testTenantId);

      // Try to create second kanban with is_main=true (should fail)
      const { error } = await supabase
        .from("kanbans")
        .insert([
          {
            tenant_id: testTenantId,
            name: "Second Main",
            is_main: true,
            order_position: 2,
          },
        ]);

      expect(error).toBeDefined();
    });
  });

  describe("Full registration flow simulation", () => {
    it("should support complete onboarding: tenant -> user -> kanban", async () => {
      // Simulate the registration flow:
      // 1. Create tenant (STEP 4)
      // 2. Create user (STEP 5)
      // 3. Create kanban (STEP 5.5)

      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .insert([{ name: "Onboarding Test Tenant" }])
        .select("id")
        .single();

      expect(tenantError).toBeNull();

      // Create kanban for this tenant
      const kanbanId = await createDefaultKanban(supabase, tenant.id);
      expect(kanbanId).toBeDefined();

      // Verify kanban setup
      const { data: kanban } = await supabase
        .from("kanbans")
        .select("id, name, tenant_id")
        .eq("id", kanbanId)
        .single();

      const { data: columns } = await supabase
        .from("columns")
        .select("id, name")
        .eq("kanban_id", kanbanId)
        .order("order_position");

      expect(kanban).toBeDefined();
      expect(kanban.tenant_id).toBe(tenant.id);
      expect(columns).toHaveLength(4);

      // Cleanup
      await supabase.from("tenants").delete().eq("id", tenant.id);
    });
  });
});
