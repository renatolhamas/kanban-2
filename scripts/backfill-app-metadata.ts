/**
 * Backfill Script: Populate app_metadata for all users
 *
 * Purpose: Inject app_metadata.tenant_id and app_metadata.role from the users table
 * into all existing users via Supabase Auth admin API. This prepares users for the
 * Custom Access Token Hook which injects these values into JWTs.
 *
 * Usage: npx ts-node scripts/backfill-app-metadata.ts
 *
 * Requirements:
 * - SUPABASE_URL in .env.local
 * - SUPABASE_SERVICE_ROLE_KEY in .env.local (has admin privileges)
 *
 * Reference: Story 4.1 — Correção do Isolamento Multi-Tenant via RLS
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize admin client with service role key (has auth privileges)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface UserRecord {
  id: string;
  tenant_id: string;
  role: string;
  email: string;
}

async function backfillAppMetadata() {
  console.log('🔄 Backfill Script: app_metadata Population');
  console.log('━'.repeat(60));
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log();

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ userId: string; email: string; error: string }> = [];

  try {
    // Step 1: Fetch all users from the users table
    console.log('📥 Step 1: Reading users from database...');
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, tenant_id, role, email');

    if (fetchError) {
      console.error('❌ Failed to fetch users:', fetchError);
      process.exit(1);
    }

    if (!users || users.length === 0) {
      console.log('ℹ️  No users found in database. Nothing to backfill.');
      console.log('✅ Backfill complete: 0 users updated');
      process.exit(0);
    }

    console.log(`✅ Found ${users.length} users to backfill`);
    console.log();

    // Step 2: Update each user's app_metadata via auth.admin API
    console.log('⚙️  Step 2: Updating app_metadata for each user...');
    console.log();

    for (let i = 0; i < users.length; i++) {
      const user = users[i] as UserRecord;
      const progress = `[${i + 1}/${users.length}]`;

      try {
        // Update app_metadata via auth.admin.updateUserById
        const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
          user.id,
          {
            app_metadata: {
              tenant_id: user.tenant_id,
              role: user.role,
            },
          }
        );

        if (updateError) {
          throw new Error(updateError.message);
        }

        if (updatedUser) {
          console.log(`✅ ${progress} ${user.email} — app_metadata injected`);
          successCount++;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`❌ ${progress} ${user.email} — failed: ${errorMsg}`);
        errorCount++;
        errors.push({ userId: user.id, email: user.email, error: errorMsg });
      }
    }

    console.log();
    console.log('━'.repeat(60));
    console.log('📊 Results Summary');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors:  ${errorCount}`);
    console.log(`   📈 Total:   ${users.length}`);
    console.log();

    if (errors.length > 0) {
      console.log('❌ Failed Users:');
      errors.forEach(({ email, error }) => {
        console.log(`   • ${email}: ${error}`);
      });
      console.log();
    }

    if (errorCount === 0) {
      console.log('✅ Backfill complete: All users updated successfully');
      process.exit(0);
    } else if (successCount > 0) {
      console.log(`⚠️  Backfill partial: ${successCount} succeeded, ${errorCount} failed`);
      process.exit(1);
    } else {
      console.log('❌ Backfill failed: No users updated');
      process.exit(1);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Fatal error:', errorMsg);
    process.exit(1);
  }
}

// Run the backfill
backfillAppMetadata();
