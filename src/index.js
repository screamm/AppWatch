/**
 * AppWatch Dashboard - Professional Monitoring Platform
 * Cloudflare Workers + D1 Database with Enhanced Security
 */

import { 
  checkRateLimit, 
  getSecureCorsHeaders, 
  getSecurityHeaders,
  validateAppData,
  validators,
  createSecureErrorResponse,
  createSecureResponse,
  verifyAuth
} from './security.js';

import { 
  runAutomatedHealthChecks,
  attemptSelfHealing,
  performMaintenance,
  getMonitoringStats
} from './monitoring.js';

import { logger, loggingMiddleware } from './logging.js';
import { createPerformanceMonitor } from './performance.js';
import { createDatabaseService } from './database.js';
import { createAuthMiddleware, createAuthErrorResponse } from './auth.js';
import { createSimpleAuthMiddleware, createSimpleAuthService } from './simple-auth.js';
import { createUserManagementService } from './user-management.js';
import { createCloudflareDiscoveryService } from './cloudflare-discovery.js';

export default {
  async fetch(request, env, ctx) {
    // Wrap request in logging middleware
    return loggingMiddleware.logRequest(request, async (request) => {
      const url = new URL(request.url);
      const path = url.pathname;
      
      logger.debug('Processing request', {
        method: request.method,
        path: path,
        user_agent: request.headers.get('User-Agent')
      });

      // Enhanced CORS headers with security
      const corsHeaders = getSecureCorsHeaders();
      
      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, { 
          headers: { ...corsHeaders, ...getSecurityHeaders() }
        });
      }

      // Simple Authentication
      const simpleAuthMiddleware = createSimpleAuthMiddleware(env.DB);
      const simpleAuthService = simpleAuthMiddleware.authService;
      
      // Ensure admin user exists
      await simpleAuthService.ensureAdminUser();

      const authResult = await simpleAuthMiddleware.authenticate(request);
      
      if (!authResult.skipAuth && !authResult.authenticated) {
        logger.logSecurityEvent('authentication_failed', 'medium', {
          path: path,
          method: request.method,
          ip: request.headers.get('CF-Connecting-IP'),
          error: authResult.error
        });
        
        return createSecureErrorResponse(
          new Error('Authentication required'), 
          401, 
          { 
            ...corsHeaders, 
            'WWW-Authenticate': 'Bearer realm="AppWatch"',
            'X-Login-Required': 'true'
          }
        );
      }

      // Initialize services
      const userManagement = createUserManagementService(env.DB);
      const cloudflareDiscovery = createCloudflareDiscoveryService(env.DB, userManagement);
      
      // Get current user for multi-tenant operations
      let currentUser = null;
      if (authResult.authenticated && !authResult.skipAuth && authResult.user) {
        // Map simple auth user to AppWatch user system
        currentUser = await userManagement.getOrCreateUser({
          id: `auth-${authResult.user.id}`,
          email: `${authResult.user.username}@local`,
          name: authResult.user.username,
          groups: authResult.user.role === 'admin' ? ['appwatch-admins'] : ['appwatch-operators']
        });
        
        logger.info('User authenticated', {
          user_id: currentUser.id,
          username: authResult.user.username,
          user_role: authResult.user.role,
          path: path
        });
      }

      // Rate limiting check
      const rateLimitResult = checkRateLimit(request);
      if (!rateLimitResult.allowed) {
        logger.logRateLimitEvent(rateLimitResult.identifier, 0, {
          exceeded: true,
          path: path
        });
        return createSecureErrorResponse(
          new Error('Rate limit exceeded'), 
          429, 
          { ...corsHeaders, 'X-RateLimit-Remaining': '0' }
        );
      }

      // Add rate limit headers
      const enhancedHeaders = {
        ...corsHeaders,
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
      };

      try {
        // Routes
        if (path === '/' || path === '/index.html') {
        return await serveHTML(env, enhancedHeaders);
      }
      
      if (path === '/api/apps') {
        if (request.method === 'GET') {
          return await getApps(currentUser, env, enhancedHeaders);
        }
        if (request.method === 'POST') {
          return await addApp(request, currentUser, env, enhancedHeaders);
        }
      }
      
      if (path.startsWith('/api/apps/') && path.endsWith('/check')) {
        const appId = path.split('/')[3];
        // Validate app ID
        const idValidation = validators.uuid(appId);
        if (!idValidation.valid) {
          return createSecureErrorResponse(new Error('Invalid app ID'), 400, enhancedHeaders);
        }
        return await checkAppStatus(appId, env, enhancedHeaders);
      }
      
      if (path.startsWith('/api/apps/') && request.method === 'DELETE') {
        const appId = path.split('/')[3];
        // Validate app ID
        const idValidation = validators.uuid(appId);
        if (!idValidation.valid) {
          return createSecureErrorResponse(new Error('Invalid app ID'), 400, enhancedHeaders);
        }
        return await deleteApp(appId, env, enhancedHeaders);
      }
      
      if (path === '/api/stats') {
        return await getStats(env, enhancedHeaders);
      }
      
      if (path === '/api/export') {
        return await exportData(env, enhancedHeaders);
      }
      
      if (path.startsWith('/api/apps/') && path.endsWith('/history')) {
        const appId = path.split('/')[3];
        // Validate app ID
        const idValidation = validators.uuid(appId);
        if (!idValidation.valid) {
          return createSecureErrorResponse(new Error('Invalid app ID'), 400, enhancedHeaders);
        }
        return await getAppHistory(appId, env, enhancedHeaders);
      }
      
      // Monitoring API endpoints
      if (path === '/api/monitoring/stats') {
        return await getMonitoringStatsAPI(env, enhancedHeaders);
      }
      
      if (path === '/api/monitoring/health-check' && request.method === 'POST') {
        return await runManualHealthCheck(env, enhancedHeaders);
      }
      
      if (path === '/api/monitoring/self-heal' && request.method === 'POST') {
        return await runManualSelfHeal(env, enhancedHeaders);
      }
      
      // Alert management endpoints
      if (path.startsWith('/api/apps/') && path.endsWith('/alerts')) {
        const appId = path.split('/')[3];
        const idValidation = validators.uuid(appId);
        if (!idValidation.valid) {
          return createSecureErrorResponse(new Error('Invalid app ID'), 400, enhancedHeaders);
        }
        
        if (request.method === 'GET') {
          return await getAppAlerts(appId, env, enhancedHeaders);
        }
        if (request.method === 'POST') {
          return await addAppAlert(appId, request, env, enhancedHeaders);
        }
      }
      
      if (path.startsWith('/api/alerts/') && request.method === 'DELETE') {
        const alertId = path.split('/')[3];
        return await deleteAlert(alertId, env, enhancedHeaders);
      }
      
      if (path.startsWith('/api/alerts/') && path.endsWith('/test')) {
        const alertId = path.split('/')[3];
        return await testAlert(alertId, env, enhancedHeaders);
      }
      
      // Performance monitoring endpoints
      if (path === '/api/performance/dashboard') {
        return await getPerformanceDashboard(env, enhancedHeaders);
      }
      
      if (path === '/api/performance/anomalies') {
        return await getAnomalies(env, enhancedHeaders);
      }
      
      if (path === '/api/performance/sla') {
        return await getSLAReport(env, enhancedHeaders);
      }
      
      if (path.startsWith('/api/performance/apps/') && !path.endsWith('/')) {
        const appId = path.split('/')[4];
        const idValidation = validators.uuid(appId);
        if (!idValidation.valid) {
          return createSecureErrorResponse(new Error('Invalid app ID'), 400, enhancedHeaders);
        }
        return await getAppPerformance(appId, env, enhancedHeaders);
      }
      
      // Database management endpoints
      if (path === '/api/database/health') {
        return await getDatabaseHealth(env, enhancedHeaders);
      }
      
      if (path === '/api/database/maintenance' && request.method === 'POST') {
        return await runDatabaseMaintenance(env, enhancedHeaders);
      }
      
      if (path === '/api/database/optimize' && request.method === 'POST') {
        return await optimizeDatabase(env, enhancedHeaders);
      }
      
      // Authentication endpoints
      if (path === '/api/auth/login' && request.method === 'POST') {
        return await loginUser(request, simpleAuthService, enhancedHeaders);
      }
      
      if (path === '/api/auth/logout' && request.method === 'POST') {
        return await logoutUser(request, simpleAuthService, enhancedHeaders);
      }
      
      if (path === '/api/auth/change-password' && request.method === 'POST') {
        return await changePassword(request, authResult, simpleAuthService, enhancedHeaders);
      }

      // User info endpoint
      if (path === '/api/auth/user') {
        return await getUserInfo(authResult, enhancedHeaders);
      }
      
      // User Management endpoints
      if (path === '/api/user/profile') {
        if (request.method === 'GET') {
          return await getUserProfile(currentUser, userManagement, enhancedHeaders);
        }
        if (request.method === 'PUT') {
          return await updateUserProfile(request, currentUser, userManagement, enhancedHeaders);
        }
      }
      
      if (path === '/api/user/stats') {
        return await getUserStats(currentUser, userManagement, enhancedHeaders);
      }
      
      // Cloudflare Auto-Discovery endpoints
      if (path === '/api/cloudflare/discover' && request.method === 'POST') {
        return await discoverCloudflareResources(request, currentUser, cloudflareDiscovery, enhancedHeaders);
      }
      
      if (path === '/api/cloudflare/import' && request.method === 'POST') {
        return await importCloudflareResources(request, currentUser, cloudflareDiscovery, enhancedHeaders);
      }
      
      if (path === '/api/cloudflare/test-token' && request.method === 'POST') {
        return await testCloudflareToken(request, cloudflareDiscovery, enhancedHeaders);
      }
      
      if (path === '/api/cloudflare/accounts') {
        if (request.method === 'GET') {
          return await getUserCloudflareAccounts(currentUser, userManagement, enhancedHeaders);
        }
        if (request.method === 'POST') {
          return await addCloudflareAccount(request, currentUser, userManagement, cloudflareDiscovery, enhancedHeaders);
        }
      }
      
      // Static files with security headers
      if (path === '/styles.css') {
        return await serveCSS(enhancedHeaders);
      }
      
      if (path === '/script.js') {
        return await serveJS(enhancedHeaders);
      }
      
      if (path === '/favicon.ico') {
        return new Response('🚀', { 
          headers: { 
            'Content-Type': 'text/plain',
            ...getSecurityHeaders()
          }
        });
      }

        return createSecureErrorResponse(new Error('Not Found'), 404, enhancedHeaders);
        
      } catch (error) {
        logger.error('Unhandled request error', error, {
          method: request.method,
          path: path,
          correlation_id: logger.getCorrelationId()
        });
        return createSecureErrorResponse(error, 500, enhancedHeaders);
      }
    });
  },

  // Cron Trigger Handler for automated monitoring
  async scheduled(event, env, ctx) {
    const correlationId = logger.correlationManager.generateId();
    logger.setCorrelationId(correlationId);
    
    logger.info('Cron trigger fired', {
      cron: event.cron,
      correlation_id: correlationId
    });
    
    const timer = logger.startTimer('scheduled_tasks');
    
    try {
      // Run automated health checks
      logger.info('Starting automated health checks');
      const healthCheckResults = await runAutomatedHealthChecks(env);
      logger.info('Health checks completed', {
        checked: healthCheckResults.checked,
        duration: healthCheckResults.duration
      });
      
      // Attempt self-healing for failed services
      logger.info('Starting self-healing process');
      const healingResults = await attemptSelfHealing(env);
      const healedApps = healingResults.filter(r => r.healed).length;
      logger.info('Self-healing completed', {
        total_attempts: healingResults.length,
        successful_heals: healedApps
      });
      
      // Run maintenance tasks every hour (check if it's at minute 0)
      const now = new Date();
      if (now.getMinutes() === 0) {
        logger.info('Starting maintenance tasks');
        const maintenanceResults = await performMaintenance(env);
        logger.info('Maintenance completed', { tasks: maintenanceResults });
      }
      
      logger.endTimer('scheduled_tasks');
      logger.info('All scheduled tasks completed successfully');
    } catch (error) {
      logger.error('Error in scheduled tasks', error, {
        cron: event.cron,
        correlation_id: correlationId
      });
      // Don't throw - we want the cron to continue running
    }
  }
};

// HTML Dashboard
async function serveHTML(env, headers) {
  const html = `<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AppWatch Dashboard 📊</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <!-- Login Screen -->
    <div id="login-screen" class="login-screen">
        <div class="login-container">
            <div class="login-header">
                <h1 id="login-title">AppWatch</h1>
                <div id="login-subtitle" class="login-subtitle">Galactic Monitoring Station</div>
            </div>
            <div class="login-form-container">
                <form id="login-form" class="login-form">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" required autocomplete="username">
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required autocomplete="current-password">
                    </div>
                    <button type="submit" class="btn btn-primary login-btn">Access Terminal</button>
                </form>
                <div id="login-error" class="login-error" style="display: none;"></div>
            </div>
            <div class="login-theme-selector">
                <select id="login-theme-selector">
                    <option value="space">Space Station</option>
                    <option value="pipboy">Pip-Boy Terminal</option>
                    <option value="mario">Super Mario 8-bit</option>
                </select>
            </div>
        </div>
    </div>

    <!-- Main Dashboard (hidden initially) -->
    <div id="main-dashboard" class="container" style="display: none;">
        <header class="header">
            <div class="header-top">
                <div class="header-left">
                    <h1>AppWatch</h1>
                    <div class="subtitle">Galactic Monitoring Station</div>
                </div>
                <div class="theme-selector">
                    <select id="themeSelector">
                        <option value="space">Space Station</option>
                        <option value="pipboy">Pip-Boy Terminal</option>
                        <option value="mario">Super Mario 8-bit</option>
                    </select>
                </div>
                <div class="user-menu">
                    <span id="username-display">admin</span>
                    <button id="logout-btn" class="btn btn-secondary">Logout</button>
                </div>
            </div>
            <div class="status-badge">Station Online</div>
        </header>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>Fleet Size</h3>
                <div class="value" id="total-apps">-</div>
                <div class="trend">Total Starships</div>
            </div>
            <div class="stat-card success">
                <h3>Active</h3>
                <div class="value status-online" id="online-apps">-</div>
                <div class="trend">Systems Online</div>
            </div>
            <div class="stat-card danger">
                <h3>Offline</h3>
                <div class="value status-offline" id="offline-apps">-</div>
                <div class="trend">Need Attention</div>
            </div>
            <div class="stat-card">
                <h3>Efficiency</h3>
                <div class="value" id="avg-uptime">-</div>
                <div class="trend">Uptime Rating</div>
            </div>
            <div class="stat-card warning">
                <h3>Response</h3>
                <div class="value" id="avg-response">-</div>
                <div class="trend">Average Time</div>
            </div>
            <div class="stat-card">
                <h3>Incidents</h3>
                <div class="value" id="total-incidents">-</div>
                <div class="trend">Last 24h</div>
            </div>
        </div>

        <div class="control-panel">
            <div class="search-container">
                <input type="text" id="search-input" class="search-input" placeholder="Search starships...">
            </div>
            <div class="actions">
                <button id="add-app-btn" class="btn btn-primary">Add App</button>
                <button id="refresh-btn" class="btn btn-secondary">Scan All</button>
                <button id="export-btn" class="btn btn-secondary">Export Data</button>
                <button id="settings-btn" class="btn btn-secondary">Settings</button>
            </div>
        </div>

        <div id="apps-grid" class="apps-grid">
            <!-- Apps kommer laddas här -->
        </div>

        <!-- Starship Registration Portal -->
        <div id="add-app-modal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <div class="modal-title">Add App</div>
                <form id="add-app-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="app-name">App Name</label>
                                                          <input type="text" id="app-name" required placeholder="My App">
                        </div>
                        <div class="form-group">
                            <label for="app-category">Category</label>
                            <select id="app-category">
                                <option value="web">Web Application</option>
                                <option value="api">API Service</option>
                                <option value="database">Database</option>
                                <option value="microservice">Microservice</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row single">
                        <div class="form-group">
                            <label for="app-url">URL</label>
                            <input type="url" id="app-url" required placeholder="https://example.com">
                        </div>
                    </div>
                    <div class="form-row single">
                        <div class="form-group">
                            <label for="app-description">Description</label>
                            <textarea id="app-description" placeholder="Describe what this app does..."></textarea>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="check-interval">Scan Interval</label>
                            <select id="check-interval">
                                <option value="300">5 minutes</option>
                                <option value="600">10 minutes</option>
                                <option value="1800">30 minutes</option>
                                <option value="3600">1 hour</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="timeout">Timeout (ms)</label>
                            <input type="number" id="timeout" value="10000" min="1000" max="30000">
                        </div>
                    </div>
                    <div class="checkbox-group">
                        <input type="checkbox" id="enable-alerts" checked>
                        <label for="enable-alerts">Enable Alert Notifications</label>
                    </div>
                    <button type="submit" class="btn btn-primary">Add App</button>
                </form>
            </div>
        </div>

        <!-- Settings Portal -->
        <div id="settings-modal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <div class="modal-title">Mission Control Settings</div>
                <form id="settings-form">
                    <div class="form-group">
                        <label for="global-interval">Global Scan Interval</label>
                        <select id="global-interval">
                            <option value="300">5 minutes</option>
                            <option value="600">10 minutes</option>
                            <option value="1800">30 minutes</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="retention-days">Data Retention (days)</label>
                        <input type="number" id="retention-days" value="30" min="1" max="365">
                    </div>
                    <div class="checkbox-group">
                        <input type="checkbox" id="enable-sound" checked>
                        <label for="enable-sound">Enable Sound Alerts</label>
                    </div>
                    <div class="checkbox-group">
                        <input type="checkbox" id="dark-mode" checked>
                        <label for="dark-mode">Dark Mode (Space Theme)</label>
                    </div>
                    <button type="submit" class="btn btn-primary">Save Configuration</button>
                </form>
            </div>
        </div>
    </div>

    <script src="/script.js"></script>
</body>
</html>`;

  return new Response(html, {
    headers: { 
      'Content-Type': 'text/html; charset=utf-8',
      ...getSecurityHeaders()
    }
  });
}

// API Functions
async function getApps(currentUser, env, corsHeaders) {
  const timer = logger.startTimer('get_apps');
  
  try {
    if (!currentUser) {
      return createSecureErrorResponse(new Error('Authentication required'), 401, corsHeaders);
    }

    logger.logDatabaseOperation('SELECT', 'apps', { 
      owner_id: currentUser.id,
      order_by: 'created_at DESC' 
    });
    
    const apps = await env.DB.prepare(`
      SELECT * FROM apps 
      WHERE owner_id = ? 
      ORDER BY created_at DESC
    `).bind(currentUser.id).all();
    
    logger.endTimer('get_apps', { 
      app_count: (apps.results || []).length,
      user_id: currentUser.id
    });
    
    logger.logMetric('apps_fetched', (apps.results || []).length);
    
    return createSecureResponse({ 
      apps: apps.results || [] 
    }, corsHeaders);
  } catch (error) {
    logger.error('Error fetching apps', error, {
      operation: 'get_apps',
      user_id: currentUser?.id,
      correlation_id: logger.getCorrelationId()
    });
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function addApp(request, currentUser, env, corsHeaders) {
  const timer = logger.startTimer('add_app');
  
  try {
    if (!currentUser) {
      return createSecureErrorResponse(new Error('Authentication required'), 401, corsHeaders);
    }

    const data = await request.json();
    
    logger.debug('Adding new app', { 
      app_name: data.name,
      app_url: data.url,
      category: data.category,
      user_id: currentUser.id
    });
    
    // Validate input data
    const validation = validateAppData(data);
    if (!validation.valid) {
      logger.warn('App validation failed', {
        errors: validation.errors,
        submitted_data: data,
        user_id: currentUser.id
      });
      return createSecureErrorResponse(
        new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`), 
        400, 
        corsHeaders
      );
    }
    
    const { 
      name, 
      url, 
      description = '', 
      category = 'web',
      check_interval = 300,
      timeout = 10000,
      enable_alerts = true 
    } = validation.data;
    
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    logger.logDatabaseOperation('INSERT', 'apps', {
      app_id: id,
      app_name: name,
      category: category,
      owner_id: currentUser.id
    });
    
    await env.DB.prepare(`
      INSERT INTO apps (
        id, name, url, description, category, 
        check_interval, timeout, enable_alerts,
        status, last_checked, created_at, uptime_percentage, owner_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unknown', ?, ?, 100, ?)
    `).bind(
      id, name, url, description, category,
      check_interval, timeout, enable_alerts ? 1 : 0,
      now, now, currentUser.id
    ).run();
    
    logger.endTimer('add_app', {
      app_id: id,
      app_name: name
    });
    
    logger.info('App added successfully', {
      app_id: id,
      app_name: name,
      app_url: url,
      category: category
    });
    
    logger.logMetric('app_created', 1);
    
    return createSecureResponse({ 
      app: { 
        id, name, url, description, category,
        check_interval, timeout, enable_alerts,
        status: 'unknown', created_at: now 
      }
    }, corsHeaders);
  } catch (error) {
    logger.error('Error adding app', error, {
      operation: 'add_app',
      correlation_id: logger.getCorrelationId()
    });
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function checkAppStatus(appId, env, corsHeaders) {
  try {
    const app = await env.DB.prepare('SELECT * FROM apps WHERE id = ?').bind(appId).first();
    
    if (!app) {
      return createSecureErrorResponse(new Error('App not found'), 404, corsHeaders);
    }
    
    const startTime = Date.now();
    const timeoutMs = app.timeout || 10000;
    
    try {
      const response = await fetch(app.url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(timeoutMs)
      });
      const responseTime = Date.now() - startTime;
      
      const status = response.ok ? 'online' : 'offline';
      const now = new Date().toISOString();
      
      // Update status in database
      await env.DB.prepare(`
        UPDATE apps 
        SET status = ?, last_checked = ?, response_time = ?
        WHERE id = ?
      `).bind(status, now, responseTime, appId).run();
      
      // Log check in status_logs
      await env.DB.prepare(`
        INSERT INTO status_logs (app_id, status, response_time, checked_at)
        VALUES (?, ?, ?, ?)
      `).bind(appId, status, responseTime, now).run();
      
      return createSecureResponse({
        status,
        response_time: responseTime,
        checked_at: now
      }, corsHeaders);
      
    } catch (fetchError) {
      const now = new Date().toISOString();
      
      // Update status to offline
      await env.DB.prepare(`
        UPDATE apps 
        SET status = 'offline', last_checked = ?
        WHERE id = ?
      `).bind(now, appId).run();
      
      // Log the failure
      await env.DB.prepare(`
        INSERT INTO status_logs (app_id, status, response_time, checked_at, error_message)
        VALUES (?, ?, ?, ?, ?)
      `).bind(appId, 'offline', Date.now() - startTime, now, fetchError.message).run();
      
      return createSecureResponse({
        status: 'offline',
        error: 'Health check failed',
        checked_at: now
      }, corsHeaders);
    }
  } catch (error) {
    console.error('Error checking app status:', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function deleteApp(appId, env, corsHeaders) {
  try {
    // Check if app exists
    const app = await env.DB.prepare('SELECT id FROM apps WHERE id = ?').bind(appId).first();
    if (!app) {
      return createSecureErrorResponse(new Error('App not found'), 404, corsHeaders);
    }
    
    // Delete app and related data (cascade via foreign key)
    await env.DB.prepare('DELETE FROM apps WHERE id = ?').bind(appId).run();
    await env.DB.prepare('DELETE FROM status_logs WHERE app_id = ?').bind(appId).run();
    await env.DB.prepare('DELETE FROM alerts WHERE app_id = ?').bind(appId).run();
    await env.DB.prepare('DELETE FROM sla_configs WHERE app_id = ?').bind(appId).run();
    
    return createSecureResponse({ message: 'App deleted successfully' }, corsHeaders);
  } catch (error) {
    console.error('Error deleting app:', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function getStats(env, corsHeaders) {
  try {
    const [appsCount, onlineCount, offlineCount, avgUptime, avgResponse] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) as count FROM apps').first(),
      env.DB.prepare('SELECT COUNT(*) as count FROM apps WHERE status = "online"').first(),
      env.DB.prepare('SELECT COUNT(*) as count FROM apps WHERE status = "offline"').first(),
      env.DB.prepare('SELECT AVG(uptime_percentage) as avg FROM apps').first(),
      env.DB.prepare('SELECT AVG(response_time) as avg FROM apps WHERE response_time IS NOT NULL').first()
    ]);
    
    // Calculate incidents in last 24h
    const incidentsResult = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM status_logs 
      WHERE status = 'offline' AND checked_at > datetime('now', '-24 hours')
    `).first();
    
    return createSecureResponse({
      stats: {
        total: appsCount.count,
        online: onlineCount.count,
        offline: offlineCount.count,
        avg_uptime: Math.round(avgUptime.avg || 100),
        avg_response: Math.round(avgResponse.avg || 0),
        incidents_24h: incidentsResult.count
      }
    }, corsHeaders);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

// Enhanced API Functions
async function exportData(env, corsHeaders) {
  try {
    const [apps, logs, stats] = await Promise.all([
      env.DB.prepare('SELECT * FROM apps ORDER BY created_at DESC').all(),
      env.DB.prepare(`
        SELECT * FROM status_logs 
        WHERE checked_at > datetime('now', '-7 days')
        ORDER BY checked_at DESC
      `).all(),
      env.DB.prepare(`
        SELECT 
          COUNT(*) as total_checks,
          SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as successful_checks,
          AVG(response_time) as avg_response_time
        FROM status_logs 
        WHERE checked_at > datetime('now', '-7 days')
      `).first()
    ]);
    
    return createSecureResponse({
      export_data: {
        apps: apps.results || [],
        logs: logs.results || [],
        summary: {
          total_apps: (apps.results || []).length,
          total_checks: stats.total_checks || 0,
          success_rate: stats.total_checks > 0 ? 
            Math.round((stats.successful_checks / stats.total_checks) * 100) : 0,
          avg_response_time: Math.round(stats.avg_response_time || 0)
        },
        exported_at: new Date().toISOString()
      }
    }, corsHeaders);
  } catch (error) {
    console.error('Error exporting data:', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function getAppHistory(appId, env, corsHeaders) {
  try {
    // Check if app exists
    const app = await env.DB.prepare('SELECT id, name FROM apps WHERE id = ?').bind(appId).first();
    if (!app) {
      return createSecureErrorResponse(new Error('App not found'), 404, corsHeaders);
    }
    
    const [history, stats] = await Promise.all([
      env.DB.prepare(`
        SELECT * FROM status_logs 
        WHERE app_id = ? 
        ORDER BY checked_at DESC 
        LIMIT 100
      `).bind(appId).all(),
      env.DB.prepare(`
        SELECT 
          COUNT(*) as total_checks,
          SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as successful_checks,
          AVG(response_time) as avg_response_time,
          MIN(checked_at) as first_check,
          MAX(checked_at) as last_check
        FROM status_logs 
        WHERE app_id = ?
      `).bind(appId).first()
    ]);
    
    return createSecureResponse({
      history: history.results || [],
      app_info: {
        id: app.id,
        name: app.name
      },
      statistics: {
        total_checks: stats.total_checks || 0,
        success_rate: stats.total_checks > 0 ? 
          Math.round((stats.successful_checks / stats.total_checks) * 100) : 0,
        avg_response_time: Math.round(stats.avg_response_time || 0),
        monitoring_period: {
          start: stats.first_check,
          end: stats.last_check
        }
      }
    }, corsHeaders);
  } catch (error) {
    console.error('Error fetching app history:', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

// Static file serving with security headers
async function serveCSS(headers) {
  try {
    const { CSS } = await import('./assets.js');
    return new Response(CSS, {
      headers: { 
        'Content-Type': 'text/css',
        ...getSecurityHeaders(),
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Error serving CSS:', error);
    return createSecureErrorResponse(error, 500, headers);
  }
}

async function serveJS(headers) {
  try {
    // Try to import the full script content from assets.js
    const { SCRIPT } = await import('./assets.js');
    return new Response(SCRIPT, {
      headers: { 
        'Content-Type': 'application/javascript',
        ...getSecurityHeaders(),
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.warn('Assets.js not found, serving fallback script');
    // Fallback - serve basic script with theme functionality
    const basicScript = `
// AppWatch Dashboard - Basic Script
console.log('AppWatch Dashboard loading...');

// Global theme functions
window.changeTheme = function(theme) {
    console.log('Changing theme to:', theme);
    document.body.className = theme === 'pipboy' ? 'theme-pipboy' : '';
    localStorage.setItem('appwatch-theme', theme);
    
    // Update title based on theme
    const title = theme === 'pipboy' ? 
        'ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL' : 
        'AppWatch';
    const h1 = document.querySelector('h1');
    if (h1) h1.textContent = title;
    
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) {
        subtitle.textContent = theme === 'pipboy' ? 
            'TERMINAL ACCESS PROTOCOL' : 
            'Galactic Monitoring Station';
    }
    
    console.log('Theme changed successfully to:', theme);
};

// Initialize theme
function initializeTheme() {
    console.log('Initializing theme...');
    const savedTheme = localStorage.getItem('appwatch-theme') || 'space';
    const themeSelector = document.getElementById('themeSelector');
    if (themeSelector) {
        themeSelector.value = savedTheme;
        themeSelector.addEventListener('change', function() {
            console.log('Theme selector changed to:', this.value);
            changeTheme(this.value);
        });
    }
    changeTheme(savedTheme);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTheme);
} else {
    initializeTheme();
}

console.log('Theme system loaded');
`;
    return new Response(basicScript, {
      headers: { 
        'Content-Type': 'application/javascript',
        ...getSecurityHeaders(),
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }
}

// Monitoring API Functions
async function getMonitoringStatsAPI(env, corsHeaders) {
  try {
    const stats = await getMonitoringStats(env);
    return createSecureResponse({ monitoring: stats }, corsHeaders);
  } catch (error) {
    console.error('Error fetching monitoring stats:', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function runManualHealthCheck(env, corsHeaders) {
  try {
    const results = await runAutomatedHealthChecks(env);
    return createSecureResponse({ 
      health_check: {
        message: 'Manual health check completed',
        ...results
      }
    }, corsHeaders);
  } catch (error) {
    console.error('Error running manual health check:', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function runManualSelfHeal(env, corsHeaders) {
  try {
    const results = await attemptSelfHealing(env);
    return createSecureResponse({ 
      self_healing: {
        message: 'Self-healing process completed',
        results
      }
    }, corsHeaders);
  } catch (error) {
    console.error('Error running self-healing:', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

// Alert Management Functions
async function getAppAlerts(appId, env, corsHeaders) {
  try {
    const alerts = await env.DB.prepare(`
      SELECT * FROM alerts 
      WHERE app_id = ? 
      ORDER BY created_at DESC
    `).bind(appId).all();
    
    return createSecureResponse({ 
      alerts: alerts.results || [] 
    }, corsHeaders);
  } catch (error) {
    console.error('Error fetching app alerts:', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function addAppAlert(appId, request, env, corsHeaders) {
  try {
    const data = await request.json();
    const { alert_type, endpoint, enabled = true } = data;
    
    // Validate alert configuration
    const { createEscalationManager } = await import('./alerting.js');
    const escalationManager = createEscalationManager(env);
    
    const validation = escalationManager.validateAlertConfig(alert_type, endpoint);
    if (!validation.valid) {
      return createSecureErrorResponse(new Error(validation.error), 400, corsHeaders);
    }
    
    // Check if app exists
    const app = await env.DB.prepare('SELECT id FROM apps WHERE id = ?').bind(appId).first();
    if (!app) {
      return createSecureErrorResponse(new Error('App not found'), 404, corsHeaders);
    }
    
    // Add alert
    const result = await env.DB.prepare(`
      INSERT INTO alerts (app_id, alert_type, endpoint, enabled)
      VALUES (?, ?, ?, ?)
      RETURNING id, app_id, alert_type, endpoint, enabled, created_at
    `).bind(appId, alert_type, endpoint, enabled ? 1 : 0).first();
    
    return createSecureResponse({ 
      alert: result,
      message: 'Alert added successfully'
    }, corsHeaders);
  } catch (error) {
    console.error('Error adding app alert:', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function deleteAlert(alertId, env, corsHeaders) {
  try {
    const result = await env.DB.prepare(`
      DELETE FROM alerts 
      WHERE id = ?
      RETURNING id
    `).bind(alertId).first();
    
    if (!result) {
      return createSecureErrorResponse(new Error('Alert not found'), 404, corsHeaders);
    }
    
    return createSecureResponse({ 
      message: 'Alert deleted successfully' 
    }, corsHeaders);
  } catch (error) {
    console.error('Error deleting alert:', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function testAlert(alertId, env, corsHeaders) {
  try {
    const alert = await env.DB.prepare(`
      SELECT a.*, ap.name as app_name, ap.url as app_url 
      FROM alerts a 
      JOIN apps ap ON a.app_id = ap.id 
      WHERE a.id = ?
    `).bind(alertId).first();
    
    if (!alert) {
      return createSecureErrorResponse(new Error('Alert not found'), 404, corsHeaders);
    }
    
    // Test the alert
    const { createAlertingService } = await import('./alerting.js');
    const alertingService = createAlertingService(env);
    
    const testResult = await alertingService.testAlert(alert);
    
    return createSecureResponse({ 
      test_result: testResult 
    }, corsHeaders);
  } catch (error) {
    console.error('Error testing alert:', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

// Performance Monitoring Functions
async function getPerformanceDashboard(env, corsHeaders) {
  const timer = logger.startTimer('performance_dashboard');
  
  try {
    const performanceMonitor = createPerformanceMonitor(env);
    const dashboardData = await performanceMonitor.getDashboardData();
    
    logger.endTimer('performance_dashboard');
    logger.logMetric('performance_dashboard_generated', 1);
    
    return createSecureResponse({
      performance: dashboardData
    }, corsHeaders);
  } catch (error) {
    logger.error('Error generating performance dashboard', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function getAnomalies(env, corsHeaders) {
  try {
    const performanceMonitor = createPerformanceMonitor(env);
    const anomalies = await performanceMonitor.healthAnalyzer.detectAnomalies();
    
    logger.info('Anomaly detection completed', {
      anomalies_found: anomalies.length,
      high_severity: anomalies.filter(a => a.severity === 'high').length
    });
    
    return createSecureResponse({
      anomalies,
      detected_at: new Date().toISOString()
    }, corsHeaders);
  } catch (error) {
    logger.error('Error detecting anomalies', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function getSLAReport(env, corsHeaders) {
  try {
    const performanceMonitor = createPerformanceMonitor(env);
    const slaReport = await performanceMonitor.slaMonitor.generateSLAReport();
    
    logger.info('SLA report generated', {
      total_apps: slaReport.summary.total_apps,
      compliant_apps: slaReport.summary.compliant_apps,
      compliance_rate: slaReport.summary.compliant_apps / slaReport.summary.total_apps
    });
    
    return createSecureResponse({
      sla_report: slaReport
    }, corsHeaders);
  } catch (error) {
    logger.error('Error generating SLA report', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function getAppPerformance(appId, env, corsHeaders) {
  try {
    const performanceMonitor = createPerformanceMonitor(env);
    const appPerformance = await performanceMonitor.healthAnalyzer.analyzeAppPerformance(appId);
    
    if (!appPerformance) {
      return createSecureErrorResponse(new Error('App not found'), 404, corsHeaders);
    }
    
    logger.debug('App performance analyzed', {
      app_id: appId,
      app_name: appPerformance.app_name,
      uptime: appPerformance.uptime_24h
    });
    
    return createSecureResponse({
      performance: appPerformance
    }, corsHeaders);
  } catch (error) {
    logger.error('Error analyzing app performance', error, { app_id: appId });
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

// Database Management Functions
async function getDatabaseHealth(env, corsHeaders) {
  try {
    const dbService = createDatabaseService(env);
    const healthReport = await dbService.getHealthReport();
    
    logger.info('Database health report generated', {
      table_count: Object.keys(healthReport.performance.tables).length,
      cache_hit_ratio: healthReport.cache_stats.cache_hit_ratio,
      maintenance_needed: healthReport.maintenance.cleanup_recommended
    });
    
    return createSecureResponse({
      database_health: healthReport
    }, corsHeaders);
  } catch (error) {
    logger.error('Error generating database health report', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function runDatabaseMaintenance(env, corsHeaders) {
  const timer = logger.startTimer('database_maintenance');
  
  try {
    const dbService = createDatabaseService(env);
    const maintenanceResult = await dbService.performMaintenance();
    
    logger.endTimer('database_maintenance');
    logger.info('Database maintenance completed', {
      success: maintenanceResult.success,
      tasks_completed: maintenanceResult.tasks.length,
      duration: Date.now() - new Date(maintenanceResult.started_at).getTime()
    });
    
    logger.logMetric('database_maintenance_completed', 1);
    
    return createSecureResponse({
      maintenance_result: maintenanceResult
    }, corsHeaders);
  } catch (error) {
    logger.error('Error running database maintenance', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function optimizeDatabase(env, corsHeaders) {
  try {
    const dbService = createDatabaseService(env);
    
    // Run optimization tasks
    const [cleanupResult, performanceAnalysis] = await Promise.all([
      dbService.maintenance.cleanupOldData(),
      dbService.maintenance.analyzePerformance()
    ]);
    
    // Clear query cache for fresh performance
    dbService.optimizer.clearCache();
    
    const optimizationResult = {
      cleanup: cleanupResult,
      performance_analysis: performanceAnalysis,
      cache_cleared: true,
      optimized_at: new Date().toISOString()
    };
    
    logger.info('Database optimization completed', {
      deleted_logs: cleanupResult.deleted_logs,
      recommendations: performanceAnalysis.recommendations.length
    });
    
    return createSecureResponse({
      optimization_result: optimizationResult
    }, corsHeaders);
  } catch (error) {
    logger.error('Error optimizing database', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

// Authentication Functions
async function getUserInfo(authResult, corsHeaders) {
  try {
    if (!authResult.authenticated) {
      return createSecureErrorResponse(new Error('Not authenticated'), 401, corsHeaders);
    }

    const userInfo = authResult.skipAuth ? {
      authenticated: false,
      development_mode: true
    } : {
      authenticated: true,
      user: authResult.user_info,
      session: {
        expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
        issued_at: new Date().toISOString()
      }
    };

    return createSecureResponse({
      auth: userInfo
    }, corsHeaders);
  } catch (error) {
    logger.error('Error getting user info', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

// User Management API Functions
async function getUserProfile(currentUser, userManagement, corsHeaders) {
  try {
    if (!currentUser) {
      return createSecureErrorResponse(new Error('Authentication required'), 401, corsHeaders);
    }

    const profile = await userManagement.getUserById(currentUser.id);
    const accounts = await userManagement.getUserCloudflareAccounts(currentUser.id);

    return createSecureResponse({
      profile: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        created_at: profile.created_at,
        last_login: profile.last_login
      },
      cloudflare_accounts: accounts.length
    }, corsHeaders);
  } catch (error) {
    logger.error('Error getting user profile', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function updateUserProfile(request, currentUser, userManagement, corsHeaders) {
  try {
    if (!currentUser) {
      return createSecureErrorResponse(new Error('Authentication required'), 401, corsHeaders);
    }

    const data = await request.json();
    const updatedUser = await userManagement.updateUserProfile(currentUser.id, data);

    return createSecureResponse({
      message: 'Profile updated successfully',
      profile: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      }
    }, corsHeaders);
  } catch (error) {
    logger.error('Error updating user profile', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function getUserStats(currentUser, userManagement, corsHeaders) {
  try {
    if (!currentUser) {
      return createSecureErrorResponse(new Error('Authentication required'), 401, corsHeaders);
    }

    const stats = await userManagement.getUserStats(currentUser.id);

    return createSecureResponse({
      stats: stats
    }, corsHeaders);
  } catch (error) {
    logger.error('Error getting user stats', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

// Cloudflare Auto-Discovery API Functions
async function discoverCloudflareResources(request, currentUser, cloudflareDiscovery, corsHeaders) {
  try {
    if (!currentUser) {
      return createSecureErrorResponse(new Error('Authentication required'), 401, corsHeaders);
    }

    const { api_token } = await request.json();
    
    if (!api_token) {
      return createSecureErrorResponse(new Error('API token is required'), 400, corsHeaders);
    }

    // Test token first
    const tokenTest = await cloudflareDiscovery.testApiToken(api_token);
    if (!tokenTest.valid) {
      return createSecureErrorResponse(new Error(`Invalid API token: ${tokenTest.error}`), 400, corsHeaders);
    }

    const discovered = await cloudflareDiscovery.discoverUserResources(currentUser.id, api_token);

    return createSecureResponse({
      message: 'Discovery completed',
      discovered: {
        workers: discovered.workers.length,
        pages: discovered.pages.length,
        errors: discovered.errors.length
      },
      details: discovered
    }, corsHeaders);
  } catch (error) {
    logger.error('Error discovering Cloudflare resources', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function importCloudflareResources(request, currentUser, cloudflareDiscovery, corsHeaders) {
  try {
    if (!currentUser) {
      return createSecureErrorResponse(new Error('Authentication required'), 401, corsHeaders);
    }

    const { discovered, options = {} } = await request.json();
    
    if (!discovered || (!discovered.workers && !discovered.pages)) {
      return createSecureErrorResponse(new Error('No resources to import'), 400, corsHeaders);
    }

    const imported = await cloudflareDiscovery.importDiscoveredResources(currentUser.id, discovered, options);

    return createSecureResponse({
      message: 'Import completed',
      imported: {
        workers: imported.workers.length,
        pages: imported.pages.length,
        skipped: imported.skipped.length,
        errors: imported.errors.length
      },
      details: imported
    }, corsHeaders);
  } catch (error) {
    logger.error('Error importing Cloudflare resources', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function testCloudflareToken(request, cloudflareDiscovery, corsHeaders) {
  try {
    const { api_token } = await request.json();
    
    if (!api_token) {
      return createSecureErrorResponse(new Error('API token is required'), 400, corsHeaders);
    }

    const result = await cloudflareDiscovery.testApiToken(api_token);

    return createSecureResponse({
      valid: result.valid,
      error: result.error || null,
      token_info: result.token_info || null
    }, corsHeaders);
  } catch (error) {
    logger.error('Error testing Cloudflare token', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function getUserCloudflareAccounts(currentUser, userManagement, corsHeaders) {
  try {
    if (!currentUser) {
      return createSecureErrorResponse(new Error('Authentication required'), 401, corsHeaders);
    }

    const accounts = await userManagement.getUserCloudflareAccounts(currentUser.id);

    return createSecureResponse({
      accounts: accounts.map(account => ({
        id: account.id,
        account_id: account.account_id,
        account_name: account.account_name,
        token_permissions: JSON.parse(account.token_permissions || '[]'),
        is_active: account.is_active,
        last_sync: account.last_sync,
        created_at: account.created_at
      }))
    }, corsHeaders);
  } catch (error) {
    logger.error('Error getting user Cloudflare accounts', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function addCloudflareAccount(request, currentUser, userManagement, cloudflareDiscovery, corsHeaders) {
  try {
    if (!currentUser) {
      return createSecureErrorResponse(new Error('Authentication required'), 401, corsHeaders);
    }

    const { api_token, account_name } = await request.json();
    
    if (!api_token) {
      return createSecureErrorResponse(new Error('API token is required'), 400, corsHeaders);
    }

    // Test token
    const tokenTest = await cloudflareDiscovery.testApiToken(api_token);
    if (!tokenTest.valid) {
      return createSecureErrorResponse(new Error(`Invalid API token: ${tokenTest.error}`), 400, corsHeaders);
    }

    // Encrypt token
    const encryptedToken = await cloudflareDiscovery.encryptApiToken(api_token, currentUser.id);

    // Add account
    const accountId = await userManagement.addCloudflareAccount(currentUser.id, {
      account_id: tokenTest.token_info?.id || null,
      account_name: account_name || 'Cloudflare Account',
      api_token_encrypted: encryptedToken,
      token_permissions: tokenTest.token_info?.policies || []
    });

    return createSecureResponse({
      message: 'Cloudflare account added successfully',
      account_id: accountId
    }, corsHeaders);
  } catch (error) {
    logger.error('Error adding Cloudflare account', error);
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

// Simple Authentication API Functions
async function loginUser(request, simpleAuthService, corsHeaders) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return createSecureErrorResponse(
        new Error('Username and password are required'), 
        400, 
        corsHeaders
      );
    }

    const result = await simpleAuthService.authenticateUser(username, password);
    
    if (!result.success) {
      return createSecureErrorResponse(
        new Error(result.error), 
        401, 
        corsHeaders
      );
    }

    // Set session cookie
    const sessionCookie = `appwatch_session=${result.session_token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`;

    return createSecureResponse({
      message: 'Login successful',
      user: result.user
    }, {
      ...corsHeaders,
      'Set-Cookie': sessionCookie
    });
  } catch (error) {
    logger.error('Error during login', { error: error.message });
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function logoutUser(request, simpleAuthService, corsHeaders) {
  try {
    const sessionToken = simpleAuthService.getSessionFromRequest(request);
    
    if (sessionToken) {
      await simpleAuthService.logout(sessionToken);
    }

    // Clear session cookie
    const clearCookie = 'appwatch_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';

    return createSecureResponse({
      message: 'Logout successful'
    }, {
      ...corsHeaders,
      'Set-Cookie': clearCookie
    });
  } catch (error) {
    logger.error('Error during logout', { error: error.message });
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
}

async function changePassword(request, authResult, simpleAuthService, corsHeaders) {
  try {
    if (!authResult.authenticated || !authResult.user) {
      return createSecureErrorResponse(
        new Error('Authentication required'), 
        401, 
        corsHeaders
      );
    }

    const { current_password, new_password } = await request.json();
    
    if (!current_password || !new_password) {
      return createSecureErrorResponse(
        new Error('Current password and new password are required'), 
        400, 
        corsHeaders
      );
    }

    const result = await simpleAuthService.changePassword(
      authResult.user.id, 
      current_password, 
      new_password
    );
    
    if (!result.success) {
      return createSecureErrorResponse(
        new Error(result.error), 
        400, 
        corsHeaders
      );
    }

    // Clear session cookie to force re-login
    const clearCookie = 'appwatch_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';

    return createSecureResponse({
      message: 'Password changed successfully. Please login again.'
    }, {
      ...corsHeaders,
      'Set-Cookie': clearCookie
    });
  } catch (error) {
    logger.error('Error changing password', { error: error.message });
    return createSecureErrorResponse(error, 500, corsHeaders);
  }
} 