-- Add evolution_instance_token to tenants table
-- This stores the instance-specific token needed for /instance/connect, /instance/qr, /instance/status endpoints

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS evolution_instance_token TEXT;

COMMENT ON COLUMN tenants.evolution_instance_token IS
  'Instance-specific token for Evo GO API calls (apikey for connect/qr/status endpoints)';
