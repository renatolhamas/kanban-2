-- Migration: Add UNIQUE constraint for is_main per tenant in kanbans table
-- Purpose: Ensure only ONE main kanban exists per tenant
-- Created: 2026-04-07
-- Severity: MEDIUM (data quality enforcement)

-- ========================================
-- CONSTRAINT: kanbans unique is_main per tenant
-- ========================================
-- Adds a partial unique constraint to enforce business rule:
-- Each tenant can have at most ONE kanban with is_main = TRUE
--
-- This is a PARTIAL UNIQUE INDEX (only indexed when is_main=TRUE)
-- to allow multiple kanbans with is_main=FALSE per tenant while
-- preventing duplicate main kanbans.

ALTER TABLE public.kanbans
ADD CONSTRAINT kanbans_unique_is_main_per_tenant
UNIQUE (tenant_id, is_main)
WHERE is_main = TRUE;

-- ========================================
-- VERIFICATION
-- ========================================
-- Run this SELECT to verify the constraint was added:
-- SELECT constraint_name, constraint_type
-- FROM information_schema.table_constraints
-- WHERE table_name = 'kanbans' AND table_schema = 'public'
-- ORDER BY constraint_name;
--
-- Expected: constraint_name = 'kanbans_unique_is_main_per_tenant', constraint_type = 'UNIQUE'

-- ========================================
-- ROLLBACK (if needed)
-- ========================================
-- ALTER TABLE public.kanbans
-- DROP CONSTRAINT kanbans_unique_is_main_per_tenant;
