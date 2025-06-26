/**
 * AppWatch Dashboard - Monitoring för alla våra appar
 * Cloudflare Workers + D1 Database
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers för alla responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Routes
      if (path === '/' || path === '/index.html') {
        return await serveHTML(env);
      }
      
      if (path === '/api/apps') {
        if (request.method === 'GET') {
          return await getApps(env, corsHeaders);
        }
        if (request.method === 'POST') {
          return await addApp(request, env, corsHeaders);
        }
      }
      
      if (path.startsWith('/api/apps/') && path.endsWith('/check')) {
        const appId = path.split('/')[3];
        return await checkAppStatus(appId, env, corsHeaders);
      }
      
      if (path.startsWith('/api/apps/') && request.method === 'DELETE') {
        const appId = path.split('/')[3];
        return await deleteApp(appId, env, corsHeaders);
      }
      
      if (path === '/api/stats') {
        return await getStats(env, corsHeaders);
      }
      
      if (path === '/api/export') {
        return await exportData(env, corsHeaders);
      }
      
      if (path.startsWith('/api/apps/') && path.endsWith('/history')) {
        const appId = path.split('/')[3];
        return await getAppHistory(appId, env, corsHeaders);
      }
      
      // Static files
      if (path === '/styles.css') {
        return await serveCSS();
      }
      
      if (path === '/script.js') {
        return await serveJS();
      }
      
      if (path === '/favicon.ico') {
        return new Response('🚀', { 
          headers: { 'Content-Type': 'text/plain' } 
        });
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
      
    } catch (error) {
      console.error('Error:', error);
      return new Response('Internal Server Error', { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: error.message })
      });
    }
  }
};

// HTML Dashboard
async function serveHTML(env) {
  const html = `<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AppWatch Dashboard 📊</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <div class="container">
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
                    </select>
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
                <button id="add-app-btn" class="btn btn-primary">Add Starship</button>
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
                <div class="modal-title">Register New Starship</div>
                <form id="add-app-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="app-name">Starship Name</label>
                            <input type="text" id="app-name" required placeholder="USS Enterprise">
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
                    <div class="form-group">
                        <label for="app-url">Hyperspace Coordinates (URL)</label>
                        <input type="url" id="app-url" required placeholder="https://starship.galaxy.com">
                    </div>
                    <div class="form-group">
                        <label for="app-description">Mission Description</label>
                        <textarea id="app-description" placeholder="Describe the starship's mission and purpose..."></textarea>
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
                    <button type="submit" class="btn btn-primary">Launch Monitoring</button>
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
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// API Functions
async function getApps(env, corsHeaders) {
  const apps = await env.DB.prepare('SELECT * FROM apps ORDER BY created_at DESC').all();
  
  return new Response(JSON.stringify({ 
    success: true, 
    apps: apps.results || [] 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function addApp(request, env, corsHeaders) {
  const data = await request.json();
  const { 
    name, 
    url, 
    description, 
    category = 'web',
    check_interval = 300,
    timeout = 10000,
    enable_alerts = true 
  } = data;
  
  if (!name || !url) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Starship name and hyperspace coordinates required' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await env.DB.prepare(`
    INSERT INTO apps (
      id, name, url, description, category, 
      check_interval, timeout, enable_alerts,
      status, last_checked, created_at, uptime_percentage
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unknown', ?, ?, 100)
  `).bind(
    id, name, url, description || '', category,
    check_interval, timeout, enable_alerts ? 1 : 0,
    now, now
  ).run();
  
  return new Response(JSON.stringify({ 
    success: true, 
    app: { 
      id, name, url, description, category,
      check_interval, timeout, enable_alerts,
      status: 'unknown', created_at: now 
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function checkAppStatus(appId, env, corsHeaders) {
  const app = await env.DB.prepare('SELECT * FROM apps WHERE id = ?').bind(appId).first();
  
  if (!app) {
    return new Response(JSON.stringify({ success: false, error: 'App ej funnen' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const startTime = Date.now();
    const response = await fetch(app.url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(10000) // 10s timeout
    });
    const responseTime = Date.now() - startTime;
    
    const status = response.ok ? 'online' : 'offline';
    const now = new Date().toISOString();
    
    // Uppdatera status i databas
    await env.DB.prepare(`
      UPDATE apps 
      SET status = ?, last_checked = ?, response_time = ?
      WHERE id = ?
    `).bind(status, now, responseTime, appId).run();
    
    // Logga check i status_logs
    await env.DB.prepare(`
      INSERT INTO status_logs (app_id, status, response_time, checked_at)
      VALUES (?, ?, ?, ?)
    `).bind(appId, status, responseTime, now).run();
    
    return new Response(JSON.stringify({
      success: true,
      status,
      response_time: responseTime,
      checked_at: now
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    const now = new Date().toISOString();
    
    await env.DB.prepare(`
      UPDATE apps 
      SET status = 'offline', last_checked = ?
      WHERE id = ?
    `).bind(now, appId).run();
    
    return new Response(JSON.stringify({
      success: true,
      status: 'offline',
      error: error.message,
      checked_at: now
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function deleteApp(appId, env, corsHeaders) {
  await env.DB.prepare('DELETE FROM apps WHERE id = ?').bind(appId).run();
  await env.DB.prepare('DELETE FROM status_logs WHERE app_id = ?').bind(appId).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getStats(env, corsHeaders) {
  const appsCount = await env.DB.prepare('SELECT COUNT(*) as count FROM apps').first();
  const onlineCount = await env.DB.prepare('SELECT COUNT(*) as count FROM apps WHERE status = "online"').first();
  const offlineCount = await env.DB.prepare('SELECT COUNT(*) as count FROM apps WHERE status = "offline"').first();
  const avgUptime = await env.DB.prepare('SELECT AVG(uptime_percentage) as avg FROM apps').first();
  
  return new Response(JSON.stringify({
    success: true,
    stats: {
      total: appsCount.count,
      online: onlineCount.count,
      offline: offlineCount.count,
      avg_uptime: Math.round(avgUptime.avg || 100)
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// New API Functions
async function exportData(env, corsHeaders) {
  try {
    const apps = await env.DB.prepare('SELECT * FROM apps ORDER BY created_at DESC').all();
    const logs = await env.DB.prepare(`
      SELECT * FROM status_logs 
      WHERE checked_at > datetime('now', '-7 days')
      ORDER BY checked_at DESC
    `).all();
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        apps: apps.results || [],
        logs: logs.results || [],
        exported_at: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to export data'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function getAppHistory(appId, env, corsHeaders) {
  try {
    const history = await env.DB.prepare(`
      SELECT * FROM status_logs 
      WHERE app_id = ? 
      ORDER BY checked_at DESC 
      LIMIT 100
    `).bind(appId).all();
    
    return new Response(JSON.stringify({
      success: true,
      history: history.results || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch history'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Static file serving
async function serveCSS() {
  const { CSS } = await import('./assets.js');
  return new Response(CSS, {
    headers: { 'Content-Type': 'text/css' }
  });
}

async function serveJS() {
  const { JS } = await import('./assets.js');
  return new Response(JS, {
    headers: { 'Content-Type': 'application/javascript' }
  });
} 