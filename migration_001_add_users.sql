-- Migration 001: Add Users and Multi-tenant Support
-- First create the new tables

-- Command Center Personnel Registry
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    cloudflare_account_id TEXT,
    role TEXT DEFAULT 'operator', -- 'admin', 'operator', 'viewer'
    is_active BOOLEAN DEFAULT true,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cloudflare Account Integration
CREATE TABLE IF NOT EXISTS cloudflare_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    account_id TEXT,
    account_name TEXT,
    api_token_encrypted TEXT, -- Encrypted Cloudflare API token
    token_permissions TEXT, -- JSON array of permissions
    is_active BOOLEAN DEFAULT true,
    last_sync DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create default admin user (for initial setup)
INSERT OR IGNORE INTO users (id, email, name, role, created_at)
VALUES (
    'admin-001',
    'david@davidrydgren.com',
    'David Rydgren',
    'admin',
    CURRENT_TIMESTAMP
);

-- Add new indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login DESC);

-- Cloudflare accounts indexes
CREATE INDEX IF NOT EXISTS idx_cf_accounts_user_id ON cloudflare_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_cf_accounts_active ON cloudflare_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_cf_accounts_account_id ON cloudflare_accounts(account_id);