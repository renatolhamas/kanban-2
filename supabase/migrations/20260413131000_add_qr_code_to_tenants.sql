-- Add QR code fields to tenants table
-- This allows storing the WhatsApp QR code that comes via webhook

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS qr_code TEXT,
  ADD COLUMN IF NOT EXISTS qr_code_expires_at TIMESTAMPTZ;

-- Comment for clarity
COMMENT ON COLUMN tenants.qr_code IS 'WhatsApp QR code for pairing, received from Evo GO webhook QRCODE_UPDATED';
COMMENT ON COLUMN tenants.qr_code_expires_at IS 'Timestamp when the QR code expires (typically 5 minutes after generation)';
