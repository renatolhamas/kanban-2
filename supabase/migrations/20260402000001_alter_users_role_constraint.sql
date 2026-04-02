-- Migration: Alter users.role CHECK constraint
-- Story: 1.1 (follow-up)
-- Purpose: Replace 'viewer' with 'owner' as valid role value
-- Date: 2026-04-02

-- ============================================================================
-- ALTER users TABLE - Update role CHECK constraint
-- ============================================================================

-- Step 1: Drop the existing CHECK constraint
-- Note: PostgreSQL auto-generates the name as 'users_role_check' for inline constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Add updated CHECK constraint with 'owner' instead of 'viewer'
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'user', 'owner'));

-- ============================================================================
-- VERIFICATION COMMENTS
-- ============================================================================

-- To verify the constraint was updated, run:
-- SELECT conname, consrc FROM pg_constraint
-- WHERE conrelid = 'users'::regclass AND contype = 'c';

-- Test that 'owner' is now accepted:
-- INSERT INTO users (tenant_id, email, role, name)
-- VALUES ('...', 'test@example.com', 'owner', 'Test User');

-- Test that 'viewer' is no longer accepted (should fail):
-- INSERT INTO users (tenant_id, email, role, name)
-- VALUES ('...', 'test2@example.com', 'viewer', 'Test User');
