-- Migration: Add secure RLS policy for the users table
-- Story: 1.2 (Bugfix)
-- Purpose: Allow users to read their own metadata during login without service role bypass
-- Date: 2026-04-02

-- ============================================================================
-- ENABLE Row Level Security (RLS) - Ensuring it is active
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT POLICY - Users can read their own record
-- This allows the login route (using Anon Key) to fetch tenant_id and role 
-- once the auth.uid() is established.
-- ============================================================================
DROP POLICY IF EXISTS "Users can read own record" ON users;
CREATE POLICY "Users can read own record" 
  ON users FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- ============================================================================
-- UPDATE POLICY - Users can manage their own profile (useful for Story 1.4)
-- ============================================================================
DROP POLICY IF EXISTS "Users can update own record" ON users;
CREATE POLICY "Users can update own record" 
  ON users FOR UPDATE
  TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- VERIFICATION COMMENTS
-- ============================================================================
-- To verify the policy, try a query as an authenticated user:
-- SELECT * FROM users WHERE id = auth.uid();
