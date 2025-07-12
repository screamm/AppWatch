-- 🚀 AppWatch Galactic Database Schema
-- För Cloudflare D1 Database - Space Station Registry

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

-- Starship Fleet Registry
CREATE TABLE IF NOT EXISTS apps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'web', -- 'web', 'api', 'database', 'microservice', 'other'
    status TEXT DEFAULT 'unknown', -- 'online', 'offline', 'unknown'
    response_time INTEGER, -- milliseconds
    check_interval INTEGER DEFAULT 300, -- seconds between checks
    timeout INTEGER DEFAULT 10000, -- request timeout in ms
    enable_alerts BOOLEAN DEFAULT true,
    last_checked DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    uptime_percentage REAL DEFAULT 100.0,
    owner_id TEXT NOT NULL, -- Reference to users table
    cloudflare_worker_name TEXT, -- Original Cloudflare Worker/Pages name
    auto_discovered BOOLEAN DEFAULT false, -- If discovered automatically
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Mission Control Logs - Historical Status Data
CREATE TABLE IF NOT EXISTS status_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT NOT NULL,
    status TEXT NOT NULL,
    response_time INTEGER,
    checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE
);

-- Alert Configuration
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT NOT NULL,
    alert_type TEXT NOT NULL, -- 'email', 'webhook', 'sms'
    endpoint TEXT NOT NULL, -- email address, webhook URL, etc.
    enabled BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE
);

-- SLA Configuration
CREATE TABLE IF NOT EXISTS sla_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT NOT NULL,
    target_uptime REAL DEFAULT 99.9, -- target uptime percentage
    max_response_time INTEGER DEFAULT 2000, -- max acceptable response time in ms
    enabled BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE
);

-- Performance Optimization Indexes
-- Primary query patterns: status, time ranges, app lookups

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login DESC);

-- Cloudflare accounts indexes
CREATE INDEX IF NOT EXISTS idx_cf_accounts_user_id ON cloudflare_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_cf_accounts_active ON cloudflare_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_cf_accounts_account_id ON cloudflare_accounts(account_id);

-- Apps table indexes (updated for multi-tenant)
CREATE INDEX IF NOT EXISTS idx_apps_owner_id ON apps(owner_id);
CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category);
CREATE INDEX IF NOT EXISTS idx_apps_created_at ON apps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_apps_last_checked ON apps(last_checked);
CREATE INDEX IF NOT EXISTS idx_apps_status_last_checked ON apps(status, last_checked);
CREATE INDEX IF NOT EXISTS idx_apps_owner_status ON apps(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_apps_auto_discovered ON apps(auto_discovered);
CREATE INDEX IF NOT EXISTS idx_apps_cloudflare_worker ON apps(cloudflare_worker_name);

-- Status logs indexes (most queried table)
CREATE INDEX IF NOT EXISTS idx_status_logs_app_id ON status_logs(app_id);
CREATE INDEX IF NOT EXISTS idx_status_logs_checked_at ON status_logs(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_logs_status ON status_logs(status);
CREATE INDEX IF NOT EXISTS idx_status_logs_app_checked ON status_logs(app_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_logs_status_time ON status_logs(status, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_logs_time_range ON status_logs(checked_at DESC, status, response_time);

-- Alerts table indexes
CREATE INDEX IF NOT EXISTS idx_alerts_app_id ON alerts(app_id);
CREATE INDEX IF NOT EXISTS idx_alerts_enabled ON alerts(enabled);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type);

-- SLA configs indexes
CREATE INDEX IF NOT EXISTS idx_sla_app_id ON sla_configs(app_id);
CREATE INDEX IF NOT EXISTS idx_sla_enabled ON sla_configs(enabled);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_apps_monitoring_schedule ON apps(last_checked, check_interval);

-- Create default admin user (for initial setup)
INSERT OR IGNORE INTO users (id, email, name, role, created_at)
VALUES (
    'admin-001',
    'david@davidrydgren.com',
    'David Rydgren',
    'admin',
    CURRENT_TIMESTAMP
);

-- Deploy the first starship as example
INSERT OR IGNORE INTO apps (id, name, url, description, category, status, owner_id, created_at)
VALUES (
    'starship-sparappen-001',
    '🚀 Sparappen Command',
    'https://sparappen.davidrydgren.workers.dev',
    'Primary financial management starship - handles galactic savings operations',
    'web',
    'unknown',
    'admin-001',
    CURRENT_TIMESTAMP
); 