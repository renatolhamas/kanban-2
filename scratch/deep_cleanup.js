
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config();
}

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const rawKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

// Clean quotes
const SUPABASE_URL = rawUrl.replace(/^['"]|['"]$/g, "").match(/https?:\/\/[^\s"']+/)?.[0] || rawUrl;
const SUPABASE_SERVICE_ROLE_KEY = rawKey.replace(/^['"]|['"]$/g, "");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing');
}

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function deepCleanup() {
  console.log('Starting deep cleanup...');
  
  // List all users in auth
  const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
  if (listError) throw listError;
  
  console.log(`Found ${users.length} users in auth.users. Deleting...`);
  
  for (const user of users) {
    await adminClient.auth.admin.deleteUser(user.id);
  }
  
  console.log('Deleted all auth users.');
  
  // Tables cleanup is handled by seedTestData, but let's be sure
  const testTenantIds = ['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'];
  await adminClient.from('tenants').delete().in('id', testTenantIds);
  
  console.log('Cleanup complete.');
}

deepCleanup();
