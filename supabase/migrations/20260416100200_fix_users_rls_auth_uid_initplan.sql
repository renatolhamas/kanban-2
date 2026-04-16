-- Migration: Fix users RLS policies for auth.uid() initplan optimization
-- Date: 2026-04-16
-- Reason: Performance optimization — avoid per-row evaluation of auth.uid()
-- Detail: Current policies evaluate auth.uid() for each row (expensive at scale)
--         New policies wrap in (SELECT auth.uid()) for single evaluation per query
-- Impact: Significant performance improvement for users table queries on large datasets

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own record" ON public.users;
DROP POLICY IF EXISTS "Users can insert own record" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;
DROP POLICY IF EXISTS "Users can delete own record" ON public.users;

-- Recreate with (SELECT auth.uid()) for initplan optimization
CREATE POLICY "Users can read own record" ON public.users
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert own record" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own record" ON public.users
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can delete own record" ON public.users
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Verification
-- SELECT policyname, qual FROM pg_policies WHERE tablename = 'users';
-- Expected: All 4 policies have qual containing "(SELECT auth.uid())"
