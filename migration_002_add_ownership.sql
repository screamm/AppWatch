-- Migration 002: Add Ownership Columns to Existing Tables

-- Add owner_id to apps table
ALTER TABLE apps ADD COLUMN owner_id TEXT;
ALTER TABLE apps ADD COLUMN cloudflare_worker_name TEXT;
ALTER TABLE apps ADD COLUMN auto_discovered BOOLEAN DEFAULT false;

-- Update existing apps to be owned by admin user
UPDATE apps SET owner_id = 'admin-001' WHERE owner_id IS NULL;

-- Create new indexes for multi-tenant support
CREATE INDEX IF NOT EXISTS idx_apps_owner_id ON apps(owner_id);
CREATE INDEX IF NOT EXISTS idx_apps_owner_status ON apps(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_apps_auto_discovered ON apps(auto_discovered);
CREATE INDEX IF NOT EXISTS idx_apps_cloudflare_worker ON apps(cloudflare_worker_name);