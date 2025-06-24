-- AppWatch Dashboard Database Schema
-- För Cloudflare D1 Database

-- Tabell för appar som ska övervakas
CREATE TABLE IF NOT EXISTS apps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'unknown', -- 'online', 'offline', 'unknown'
    response_time INTEGER, -- milliseconds
    last_checked DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    uptime_percentage REAL DEFAULT 100.0
);

-- Tabell för status-historik
CREATE TABLE IF NOT EXISTS status_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id TEXT NOT NULL,
    status TEXT NOT NULL,
    response_time INTEGER,
    checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE
);

-- Index för bättre prestanda
CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);
CREATE INDEX IF NOT EXISTS idx_apps_created_at ON apps(created_at);
CREATE INDEX IF NOT EXISTS idx_status_logs_app_id ON status_logs(app_id);
CREATE INDEX IF NOT EXISTS idx_status_logs_checked_at ON status_logs(checked_at);

-- Lägg till första exempelappen (Sparappen)
INSERT OR IGNORE INTO apps (id, name, url, description, status, created_at)
VALUES (
    'sparappen-001',
    'Sparappen',
    'https://sparappen.davidrydgren.workers.dev',
    'Vår första app att övervaka - sparhantering',
    'unknown',
    CURRENT_TIMESTAMP
); 