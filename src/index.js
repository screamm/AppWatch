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
      
      // Static files
      if (path === '/styles.css') {
        return await serveCSS();
      }
      
      if (path === '/script.js') {
        return await serveJS();
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
            <h1>🚀 AppWatch Dashboard</h1>
            <p>Monitoring för alla våra appar</p>
        </header>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>Totalt Appar</h3>
                <span id="total-apps">-</span>
            </div>
            <div class="stat-card">
                <h3>Online</h3>
                <span id="online-apps" class="status-online">-</span>
            </div>
            <div class="stat-card">
                <h3>Offline</h3>
                <span id="offline-apps" class="status-offline">-</span>
            </div>
            <div class="stat-card">
                <h3>Uptime</h3>
                <span id="avg-uptime">-</span>
            </div>
        </div>

        <div class="actions">
            <button id="add-app-btn" class="btn btn-primary">+ Lägg till App</button>
            <button id="refresh-btn" class="btn btn-secondary">🔄 Uppdatera</button>
        </div>

        <div id="apps-grid" class="apps-grid">
            <!-- Apps kommer laddas här -->
        </div>

        <!-- Add App Modal -->
        <div id="add-app-modal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Lägg till ny app</h2>
                <form id="add-app-form">
                    <div class="form-group">
                        <label for="app-name">App-namn:</label>
                        <input type="text" id="app-name" required placeholder="t.ex. Sparappen">
                    </div>
                    <div class="form-group">
                        <label for="app-url">URL:</label>
                        <input type="url" id="app-url" required placeholder="https://exempel.com">
                    </div>
                    <div class="form-group">
                        <label for="app-description">Beskrivning:</label>
                        <textarea id="app-description" placeholder="Kort beskrivning av appen"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Lägg till</button>
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
  const { name, url, description } = data;
  
  if (!name || !url) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Name och URL krävs' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await env.DB.prepare(`
    INSERT INTO apps (id, name, url, description, status, last_checked, created_at, uptime_percentage)
    VALUES (?, ?, ?, ?, 'unknown', ?, ?, 100)
  `).bind(id, name, url, description || '', now, now).run();
  
  return new Response(JSON.stringify({ 
    success: true, 
    app: { id, name, url, description, status: 'unknown', created_at: now }
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