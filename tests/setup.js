// Test setup for AppWatch Dashboard
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { Miniflare } from 'miniflare';

// Global test environment setup
let mf;

beforeAll(async () => {
  // Create Miniflare instance for testing
  mf = new Miniflare({
    modules: true,
    scriptPath: 'src/index.js',
    bindings: {
      ENVIRONMENT: 'test'
    },
    d1Databases: {
      DB: 'test-db'
    }
  });
});

afterAll(async () => {
  if (mf) {
    await mf.dispose();
  }
});

// Test database setup
beforeEach(async () => {
  if (mf) {
    const db = await mf.getD1Database('DB');
    
    // Create test schema
    await db.exec(`
      CREATE TABLE IF NOT EXISTS apps (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'web',
        status TEXT DEFAULT 'unknown',
        response_time INTEGER,
        check_interval INTEGER DEFAULT 300,
        timeout INTEGER DEFAULT 10000,
        enable_alerts BOOLEAN DEFAULT true,
        last_checked DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        uptime_percentage REAL DEFAULT 100.0
      );
      
      CREATE TABLE IF NOT EXISTS status_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app_id TEXT NOT NULL,
        status TEXT NOT NULL,
        response_time INTEGER,
        checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        error_message TEXT,
        FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app_id TEXT NOT NULL,
        alert_type TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        enabled BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS sla_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app_id TEXT NOT NULL,
        target_uptime REAL DEFAULT 99.9,
        max_response_time INTEGER DEFAULT 2000,
        enabled BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE
      );
    `);
  }
});

afterEach(async () => {
  if (mf) {
    const db = await mf.getD1Database('DB');
    
    // Clean up test data
    await db.exec(`
      DELETE FROM status_logs;
      DELETE FROM alerts;
      DELETE FROM sla_configs;
      DELETE FROM apps;
    `);
  }
});

// Test utilities
export const testUtils = {
  // Create a test app
  async createTestApp(db, overrides = {}) {
    const defaultApp = {
      id: 'test-app-' + Date.now(),
      name: 'Test App',
      url: 'https://example.com',
      description: 'Test application',
      category: 'web',
      status: 'unknown',
      check_interval: 300,
      timeout: 10000,
      enable_alerts: true,
      created_at: new Date().toISOString(),
      uptime_percentage: 100
    };
    
    const app = { ...defaultApp, ...overrides };
    
    await db.prepare(`
      INSERT INTO apps (id, name, url, description, category, status, check_interval, timeout, enable_alerts, created_at, uptime_percentage)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      app.id, app.name, app.url, app.description, app.category,
      app.status, app.check_interval, app.timeout, app.enable_alerts,
      app.created_at, app.uptime_percentage
    ).run();
    
    return app;
  },
  
  // Create a test status log
  async createTestStatusLog(db, appId, overrides = {}) {
    const defaultLog = {
      app_id: appId,
      status: 'online',
      response_time: 200,
      checked_at: new Date().toISOString(),
      error_message: null
    };
    
    const log = { ...defaultLog, ...overrides };
    
    const result = await db.prepare(`
      INSERT INTO status_logs (app_id, status, response_time, checked_at, error_message)
      VALUES (?, ?, ?, ?, ?)
      RETURNING id
    `).bind(
      log.app_id, log.status, log.response_time, log.checked_at, log.error_message
    ).first();
    
    return { ...log, id: result.id };
  },
  
  // Create a test alert
  async createTestAlert(db, appId, overrides = {}) {
    const defaultAlert = {
      app_id: appId,
      alert_type: 'webhook',
      endpoint: 'https://hooks.slack.com/test',
      enabled: true,
      created_at: new Date().toISOString()
    };
    
    const alert = { ...defaultAlert, ...overrides };
    
    const result = await db.prepare(`
      INSERT INTO alerts (app_id, alert_type, endpoint, enabled, created_at)
      VALUES (?, ?, ?, ?, ?)
      RETURNING id
    `).bind(
      alert.app_id, alert.alert_type, alert.endpoint, alert.enabled, alert.created_at
    ).first();
    
    return { ...alert, id: result.id };
  },
  
  // Get miniflare instance
  getMiniflare() {
    return mf;
  }
};

// Global test helpers
globalThis.testUtils = testUtils;