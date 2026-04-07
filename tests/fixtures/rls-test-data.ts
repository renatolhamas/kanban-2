/**
 * RLS Test Data Fixtures
 *
 * Creates comprehensive test data for RLS validation:
 * - 2 tenants (Tenant A, Tenant B)
 * - 2 users per tenant
 * - 5-10 rows per table for comprehensive coverage
 */

import { v4 as uuidv4 } from 'uuid';

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
    ...overrides,
  };
}

/**
 * Create test user record
 */
export function createTestUser(overrides?: any) {
  return {
    id: TEST_USERS.A1.id,
    tenant_id: TEST_USERS.A1.tenant_id,
    email: TEST_USERS.A1.email,
    created_at: new Date().toISOString(),
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
    email: `contact-${index}@test.example.com`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Create test conversation record
 */
export function createTestConversation(tenant_id: string, index: number = 1) {
  return {
    id: uuidv4(),
    tenant_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Create test message record
 */
export function createTestMessage(conversation_id: string, index: number = 1) {
  return {
    id: uuidv4(),
    conversation_id,
    body: `Test message ${index}`,
    sender_id: TEST_USERS.A1.id,
    created_at: new Date().toISOString(),
  };
}

/**
 * Create test automatic message (template) record
 */
export function createTestAutomaticMessage(tenant_id: string, index: number = 1) {
  return {
    id: uuidv4(),
    tenant_id,
    title: `Template ${index}`,
    body: `Automatic message template ${index}`,
    scheduled_interval_minutes: 60,
    scheduled_kanban_id: uuidv4(),
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

  const tenantAColumns = tenantAKanbans.flatMap((kanban, ki) =>
    Array.from({ length: 3 }, (_, ci) =>
      createTestColumn(kanban.id, ci + 1)
    )
  );

  const tenantAContacts = Array.from({ length: 5 }, (_, i) =>
    createTestContact(TEST_TENANTS.A.id, i + 1)
  );

  const tenantAConversations = Array.from({ length: 4 }, (_, i) =>
    createTestConversation(TEST_TENANTS.A.id, i + 1)
  );

  const tenantAMessages = tenantAConversations.flatMap((conv, ci) =>
    Array.from({ length: 5 }, (_, mi) =>
      createTestMessage(conv.id, mi + 1)
    )
  );

  const tenantAAutomaticMessages = Array.from({ length: 6 }, (_, i) =>
    createTestAutomaticMessage(TEST_TENANTS.A.id, i + 1)
  );

  // Tenant B data (identical structure to ensure isolation testing)
  const tenantBKanbans = [
    createTestKanban(TEST_TENANTS.B.id, 1),
    createTestKanban(TEST_TENANTS.B.id, 2),
    createTestKanban(TEST_TENANTS.B.id, 3),
  ];

  const tenantBColumns = tenantBKanbans.flatMap((kanban, ki) =>
    Array.from({ length: 3 }, (_, ci) =>
      createTestColumn(kanban.id, ci + 1)
    )
  );

  const tenantBContacts = Array.from({ length: 5 }, (_, i) =>
    createTestContact(TEST_TENANTS.B.id, i + 1)
  );

  const tenantBConversations = Array.from({ length: 4 }, (_, i) =>
    createTestConversation(TEST_TENANTS.B.id, i + 1)
  );

  const tenantBMessages = tenantBConversations.flatMap((conv, ci) =>
    Array.from({ length: 5 }, (_, mi) =>
      createTestMessage(conv.id, mi + 1)
    )
  );

  const tenantBAutomaticMessages = Array.from({ length: 6 }, (_, i) =>
    createTestAutomaticMessage(TEST_TENANTS.B.id, i + 1)
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
 * Delete all test data (cleanup after tests)
 *
 * Deletes in reverse order of foreign key dependencies:
 * messages → conversations → columns → kanbans
 * automatic_messages, contacts → [tenant-specific data]
 * users → [cross-tenant data]
 * tenants → [last]
 */
export async function cleanupTestData(supabase: any) {
  const testTenantIds = [TEST_TENANTS.A.id, TEST_TENANTS.B.id];
  const testUserIds = [
    TEST_USERS.A1.id,
    TEST_USERS.A2.id,
    TEST_USERS.B1.id,
    TEST_USERS.B2.id,
  ];

  try {
    // Delete messages (has FK to conversations)
    await supabase
      .from('messages')
      .delete()
      .in('conversation_id', [
        // Will be populated from test data
      ]);

    // Delete columns (has FK to kanbans)
    await supabase
      .from('columns')
      .delete()
      .in('kanban_id', [
        // Will be populated from test data
      ]);

    // Delete conversations, kanbans, etc. (has FK to tenants)
    await supabase
      .from('conversations')
      .delete()
      .in('tenant_id', testTenantIds);

    await supabase
      .from('kanbans')
      .delete()
      .in('tenant_id', testTenantIds);

    await supabase
      .from('contacts')
      .delete()
      .in('tenant_id', testTenantIds);

    await supabase
      .from('automatic_messages')
      .delete()
      .in('tenant_id', testTenantIds);

    // Delete users
    await supabase
      .from('users')
      .delete()
      .in('id', testUserIds);

    // Delete tenants
    await supabase
      .from('tenants')
      .delete()
      .in('id', testTenantIds);
  } catch (error) {
    console.error('Error cleaning up test data:', error);
    throw error;
  }
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
 * Seed test data using admin client (with service role key)
 * This bypasses RLS policies so we can seed data for all tenants
 *
 * @param adminClient Supabase admin client (created with SUPABASE_SERVICE_ROLE_KEY)
 */
export async function seedTestData(adminClient: any) {
  const dataset = generateComprehensiveTestDataset();

  try {
    // Clean up existing test data first (in reverse order due to FK constraints)
    // Delete using a condition that matches test tenant IDs
    const testTenantIds = [TEST_TENANTS.A.id, TEST_TENANTS.B.id];

    console.log('Cleaning up test data...');

    const deleteOps = [
      { table: 'automatic_messages', filter: (q: any) => q.delete().is('id', null) },
      { table: 'messages', filter: (q: any) => q.delete().is('conversation_id', null) },
      { table: 'conversations', filter: (q: any) => q.delete().in('tenant_id', testTenantIds) },
      { table: 'contacts', filter: (q: any) => q.delete().in('tenant_id', testTenantIds) },
      { table: 'columns', filter: (q: any) => q.delete().is('id', null) },
      { table: 'kanbans', filter: (q: any) => q.delete().in('tenant_id', testTenantIds) },
      { table: 'users', filter: (q: any) => q.delete().in('tenant_id', testTenantIds) },
      { table: 'tenants', filter: (q: any) => q.delete().in('id', testTenantIds) },
    ];

    for (const op of deleteOps) {
      const { error } = await op.filter(adminClient.from(op.table));
      if (error) {
        console.warn(`Warning deleting ${op.table}:`, error);
        // Continue anyway - table might be empty
      } else {
        console.log(`✓ Cleaned ${op.table}`);
      }
    }

    // Insert with admin client (bypasses RLS)
    const { error: tenantError } = await adminClient.from('tenants').insert(dataset.tenants);
    if (tenantError) throw tenantError;

    const { error: usersError } = await adminClient.from('users').insert(dataset.users);
    if (usersError) throw usersError;

    const { error: kanbansError } = await adminClient.from('kanbans').insert(dataset.kanbans);
    if (kanbansError) throw kanbansError;

    const { error: columnsError } = await adminClient.from('columns').insert(dataset.columns);
    if (columnsError) throw columnsError;

    const { error: contactsError } = await adminClient.from('contacts').insert(dataset.contacts);
    if (contactsError) throw contactsError;

    const { error: conversationsError } = await adminClient.from('conversations').insert(dataset.conversations);
    if (conversationsError) throw conversationsError;

    const { error: messagesError } = await adminClient.from('messages').insert(dataset.messages);
    if (messagesError) throw messagesError;

    const { error: autoMessagesError } = await adminClient.from('automatic_messages').insert(dataset.automatic_messages);
    if (autoMessagesError) throw autoMessagesError;

    console.log('✅ All test data inserted successfully');
  } catch (error) {
    console.error('Error seeding test data:', error);
    throw error;
  }
}
