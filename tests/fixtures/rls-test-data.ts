/**
 * RLS Test Data Fixtures
 *
 * Creates comprehensive test data for RLS validation:
 * - 2 tenants (Tenant A, Tenant B)
 * - 2 users per tenant
 * - 5-10 rows per table for comprehensive coverage
 */

import { v4 as uuidv4 } from 'uuid';
import { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// Test Data Identifiers (Fixed for Deterministic Tests)
// ============================================================================

export const TEST_TENANTS = {
  A: {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Tenant A',
  },
  B: {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Tenant B',
  },
};

export const TEST_USERS = {
  A1: {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    tenant_id: TEST_TENANTS.A.id,
    email: 'user-a1@tenant-a.test',
  },
  A2: {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    tenant_id: TEST_TENANTS.A.id,
    email: 'user-a2@tenant-a.test',
  },
  B1: {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    tenant_id: TEST_TENANTS.B.id,
    email: 'user-b1@tenant-b.test',
  },
  B2: {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    tenant_id: TEST_TENANTS.B.id,
    email: 'user-b2@tenant-b.test',
  },
};

// ============================================================================
// Factory Functions - Test Data Builders
// ============================================================================

/**
 * Create test tenant record
 */
export function createTestTenant(overrides?: Partial<typeof TEST_TENANTS.A>) {
  return {
    id: TEST_TENANTS.A.id,
    name: TEST_TENANTS.A.name,
    subscription_status: 'active',
    connection_status: 'connected',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create test user record
 */
export function createTestUser(overrides?: Partial<Record<string, unknown>>) {
  return {
    id: TEST_USERS.A1.id,
    tenant_id: TEST_USERS.A1.tenant_id,
    email: TEST_USERS.A1.email,
    role: 'owner',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create test kanban record
 */
export function createTestKanban(tenant_id: string, index: number = 1) {
  return {
    id: uuidv4(),
    tenant_id,
    name: `Kanban ${tenant_id.substring(0, 1)} - ${index}`,
    is_main: index === 1,
    order_position: index,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Create test column record
 */
export function createTestColumn(kanban_id: string, index: number = 1) {
  return {
    id: uuidv4(),
    kanban_id,
    name: `Column ${index}`,
    order_position: index,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Create test contact record
 */
export function createTestContact(tenant_id: string, index: number = 1) {
  return {
    id: uuidv4(),
    tenant_id,
    name: `Contact ${index}`,
    phone: `+55-11-9999-${String(index).padStart(4, '0')}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Create test conversation record
 */
export function createTestConversation(tenant_id: string, index: number = 1, contactId?: string, waPhone?: string) {
  return {
    id: uuidv4(),
    tenant_id,
    contact_id: contactId || uuidv4(),
    wa_phone: waPhone || `+55-11-9999-${String(index).padStart(4, '0')}`,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Create test message record
 * sender_type: 'contact' (from contact), 'agent' (from user), 'system' (automated)
 */
export function createTestMessage(conversation_id: string, index: number = 1) {
  const senderTypes = ['contact', 'agent', 'system'];
  return {
    id: uuidv4(),
    conversation_id,
    sender_type: senderTypes[index % senderTypes.length],
    content: `Test message ${index}`,
    created_at: new Date().toISOString(),
  };
}

/**
 * Create test automatic message (template) record
 */
export function createTestAutomaticMessage(tenant_id: string, index: number = 1, scheduled_kanban_id?: string) {
  return {
    id: uuidv4(),
    tenant_id,
    name: `Template ${index}`,
    message: `Automatic message template ${index}`,
    scheduled_interval_minutes: 60,
    scheduled_kanban_id: scheduled_kanban_id || null, // Can be null - optional
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// ============================================================================
// Comprehensive Test Dataset
// ============================================================================

/**
 * Generate comprehensive test dataset:
 * - 2 tenants
 * - 2 users per tenant
 * - 5-10 rows per table
 *
 * Used for:
 * - TC-RLS-001 to TC-RLS-010 (attack scenario testing)
 * - Isolation verification
 * - Performance baseline
 */
export function generateComprehensiveTestDataset() {
  // Tenant A data
  const tenantAKanbans = [
    createTestKanban(TEST_TENANTS.A.id, 1),
    createTestKanban(TEST_TENANTS.A.id, 2),
    createTestKanban(TEST_TENANTS.A.id, 3),
  ];

  const tenantAColumns = tenantAKanbans.flatMap((kanban, _ki) =>
    Array.from({ length: 3 }, (_, ci) =>
      createTestColumn(kanban.id, ci + 1)
    )
  );

  const tenantAContacts = Array.from({ length: 5 }, (_, i) =>
    createTestContact(TEST_TENANTS.A.id, i + 1)
  );

  // Conversations linked to REAL contacts and a REAL kanban!
  const tenantAConversations = Array.from({ length: 4 }, (_, i) => ({
    ...createTestConversation(
      TEST_TENANTS.A.id,
      i + 1,
      tenantAContacts[i % tenantAContacts.length].id, 
      tenantAContacts[i % tenantAContacts.length].phone 
    ),
    kanban_id: tenantAKanbans[0].id, // Link to first kanban
    column_id: tenantAColumns[0].id  // Link to first column
  }));

  const tenantAMessages = tenantAConversations.flatMap((conv, _ci) =>
    Array.from({ length: 5 }, (_, mi) =>
      createTestMessage(conv.id, mi + 1)
    )
  );

  const tenantAAutomaticMessages = Array.from({ length: 6 }, (_, i) =>
    createTestAutomaticMessage(
      TEST_TENANTS.A.id,
      i + 1,
      i < tenantAKanbans.length ? tenantAKanbans[i].id : undefined // Link to real kanban or null
    )
  );

  // Tenant B data (identical structure to ensure isolation testing)
  const tenantBKanbans = [
    createTestKanban(TEST_TENANTS.B.id, 1),
    createTestKanban(TEST_TENANTS.B.id, 2),
    createTestKanban(TEST_TENANTS.B.id, 3),
  ];

  const tenantBColumns = tenantBKanbans.flatMap((kanban, _ki) =>
    Array.from({ length: 3 }, (_, ci) =>
      createTestColumn(kanban.id, ci + 1)
    )
  );

  const tenantBContacts = Array.from({ length: 5 }, (_, i) =>
    createTestContact(TEST_TENANTS.B.id, i + 1)
  );

  // Conversations linked to REAL contacts and a REAL kanban!
  const tenantBConversations = Array.from({ length: 4 }, (_, i) => ({
    ...createTestConversation(
      TEST_TENANTS.B.id,
      i + 1,
      tenantBContacts[i % tenantBContacts.length].id, 
      tenantBContacts[i % tenantBContacts.length].phone 
    ),
    kanban_id: tenantBKanbans[0].id, // Link to first kanban
    column_id: tenantBColumns[0].id  // Link to first column
  }));

  const tenantBMessages = tenantBConversations.flatMap((conv, _ci) =>
    Array.from({ length: 5 }, (_, mi) =>
      createTestMessage(conv.id, mi + 1)
    )
  );

  const tenantBAutomaticMessages = Array.from({ length: 6 }, (_, i) =>
    createTestAutomaticMessage(
      TEST_TENANTS.B.id,
      i + 1,
      i < tenantBKanbans.length ? tenantBKanbans[i].id : undefined // Link to real kanban or null
    )
  );

  return {
    tenants: [createTestTenant(TEST_TENANTS.A), createTestTenant(TEST_TENANTS.B)],
    users: [
      createTestUser({ ...TEST_USERS.A1 }),
      createTestUser({ ...TEST_USERS.A2 }),
      createTestUser({ ...TEST_USERS.B1 }),
      createTestUser({ ...TEST_USERS.B2 }),
    ],
    kanbans: [...tenantAKanbans, ...tenantBKanbans],
    columns: [...tenantAColumns, ...tenantBColumns],
    contacts: [...tenantAContacts, ...tenantBContacts],
    conversations: [...tenantAConversations, ...tenantBConversations],
    messages: [...tenantAMessages, ...tenantBMessages],
    automatic_messages: [...tenantAAutomaticMessages, ...tenantBAutomaticMessages],
  };
}

// ============================================================================
// Data Cleanup Helpers
// ============================================================================

/**
 * DEPRECATED: This function was removed because it deleted real database data.
 *
 * ⚠️  DO NOT USE - This caused production data loss
 * Test cleanup should only happen in isolated test databases, never in production.
 */
export async function cleanupTestData(_supabase: SupabaseClient) {
  console.warn('⚠️  cleanupTestData() is deprecated and disabled to prevent data loss');
  console.warn('Test data should only be cleaned in isolated test environments');
  return;
}

// ============================================================================
// Test Data Seeding
// ============================================================================

/**
 * Seed test data into database
 *
 * Usage:
 * ```
 * const supabase = createClient(url, key);
 * await seedTestData(supabase);
 * ```
 */
/**
 * DEPRECATED: This function was removed because it inserted real data into the database.
 *
 * ⚠️  DO NOT USE - Tests should not manipulate production databases
 * Use isolated test databases or mock data generators instead.
 */
export async function seedTestData(_adminClient: SupabaseClient) {
  console.warn('⚠️  seedTestData() is deprecated and disabled to prevent database pollution');
  console.warn('Test data should only be created in isolated test databases, never in production');
  return;
}
