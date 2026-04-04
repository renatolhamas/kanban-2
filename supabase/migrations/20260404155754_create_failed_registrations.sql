-- Create failed_registrations audit table
-- Tracks partial/complete cleanup failures for manual audit and recovery

CREATE TABLE IF NOT EXISTS failed_registrations (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_resources JSONB NOT NULL, -- Track what was successfully created: {auth_user: true, tenant: true, user_record: false}
  cleanup_attempted BOOLEAN DEFAULT false,
  cleanup_status JSONB, -- Track cleanup results: {deleteUser: {success: true}, deleteTenant: {success: false, error: "..."}}
  error_message TEXT,
  notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Index for quick lookup by email
CREATE INDEX IF NOT EXISTS failed_registrations_email_idx ON failed_registrations(email);

-- Index for recent failures
CREATE INDEX IF NOT EXISTS failed_registrations_created_at_idx ON failed_registrations(created_at DESC);

-- Index for unresolved items
CREATE INDEX IF NOT EXISTS failed_registrations_resolved_at_idx ON failed_registrations(resolved_at) WHERE resolved_at IS NULL;
