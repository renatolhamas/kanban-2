-- Migration: Add evolution_instance_name lookup column to tenants table
-- Purpose: DIV-12 fix — enable tenant lookup via instance name instead of UUID
-- Date: 2026-04-22

-- Add column
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS evolution_instance_name TEXT UNIQUE;

-- Populate for existing tenants
UPDATE public.tenants
SET evolution_instance_name = 'kanban-instance-' || substring(id::text, 1, 8)
WHERE evolution_instance_name IS NULL;

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_tenants_evolution_instance_name
ON public.tenants(evolution_instance_name);
