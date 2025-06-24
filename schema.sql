-- 🚀 AppWatch Galactic Database Schema
-- För Cloudflare D1 Database - Space Station Registry

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
    uptime_percentage REAL DEFAULT 100.0
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

-- Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category);
CREATE INDEX IF NOT EXISTS idx_apps_created_at ON apps(created_at);
CREATE INDEX IF NOT EXISTS idx_status_logs_app_id ON status_logs(app_id);
CREATE INDEX IF NOT EXISTS idx_status_logs_checked_at ON status_logs(checked_at);
CREATE INDEX IF NOT EXISTS idx_alerts_app_id ON alerts(app_id);
CREATE INDEX IF NOT EXISTS idx_sla_app_id ON sla_configs(app_id);

-- Deploy the first starship as example
INSERT OR IGNORE INTO apps (id, name, url, description, category, status, created_at)
VALUES (
    'starship-sparappen-001',
    '🚀 Sparappen Command',
    'https://sparappen.davidrydgren.workers.dev',
    'Primary financial management starship - handles galactic savings operations',
    'web',
    'unknown',
    CURRENT_TIMESTAMP
); 