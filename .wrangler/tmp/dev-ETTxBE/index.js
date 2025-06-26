var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// .wrangler/tmp/bundle-9mR8cd/checked-fetch.js
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
var urls;
var init_checked_fetch = __esm({
  ".wrangler/tmp/bundle-9mR8cd/checked-fetch.js"() {
    urls = /* @__PURE__ */ new Set();
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_checked_fetch();
    init_modules_watch_stub();
  }
});

// node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// src/assets.js
var assets_exports = {};
__export(assets_exports, {
  CSS: () => CSS
});
var CSS;
var init_assets = __esm({
  "src/assets.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    CSS = `/* AppWatch - Multi-Theme Monitoring Dashboard */

@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Exo+2:wght@300;400;500;600;700&family=Share+Tech+Mono:wght@400&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    /* Space Theme Colors */
    --space-black: #0a0a0f;
    --deep-space: #1a1a2e;
    --nebula-purple: #16213e;
    --cosmic-blue: #0f3460;
    --stellar-cyan: #00d4ff;
    --plasma-pink: #ff006e;
    --aurora-green: #00f5ff;
    --solar-orange: #ff8500;
    --lunar-silver: #c9d1d9;
    --asteroid-gray: #6e7681;
    --void-gray: #30363d;
    --starlight: #f0f6fc;
    
    /* Pip-Boy Theme Colors */
    --pip-black: #000000;
    --pip-dark: #001100;
    --pip-green: #00ff00;
    --pip-amber: #ffcc00;
    --pip-grey: #333333;
    --pip-light-green: #66ff66;
    --pip-dark-green: #004400;
    
    /* Layout */
    --border-radius: 16px;
    --border-radius-lg: 24px;
    --glow-size: 20px;
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Default Theme Variables (Space) */
body {
    --bg-primary: var(--space-black);
    --bg-secondary: var(--deep-space);
    --bg-card: rgba(255, 255, 255, 0.08);
    --text-primary: var(--starlight);
    --text-secondary: var(--lunar-silver);
    --accent-primary: var(--stellar-cyan);
    --accent-secondary: var(--plasma-pink);
    --accent-success: var(--aurora-green);
    --accent-warning: var(--solar-orange);
    --accent-danger: #ff1744;
    --border-color: rgba(255, 255, 255, 0.15);
    --font-primary: 'Orbitron', monospace;
    --font-secondary: 'Exo 2', sans-serif;
    --glow-primary: 0 0 var(--glow-size) rgba(0, 212, 255, 0.4);
}

/* Pip-Boy Theme */
body.theme-pipboy {
    --bg-primary: var(--pip-black);
    --bg-secondary: var(--pip-dark);
    --bg-card: rgba(0, 255, 0, 0.1);
    --text-primary: var(--pip-green);
    --text-secondary: var(--pip-light-green);
    --accent-primary: var(--pip-amber);
    --accent-secondary: var(--pip-green);
    --accent-success: var(--pip-green);
    --accent-warning: var(--pip-amber);
    --accent-danger: var(--pip-amber);
    --border-color: var(--pip-green);
    --font-primary: 'Share Tech Mono', monospace;
    --font-secondary: 'Share Tech Mono', monospace;
    --glow-primary: 0 0 var(--glow-size) rgba(0, 255, 0, 0.5);
}

/* Base Styles */
body {
    font-family: var(--font-secondary);
    line-height: 1.6;
    color: var(--text-primary);
    background: var(--bg-primary);
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
    transition: var(--transition);
}

/* Space Theme Background */
body:not(.theme-pipboy) {
    background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%);
}

/* Space Stars Animation */
body:not(.theme-pipboy)::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
        radial-gradient(2px 2px at 20px 30px, var(--starlight), transparent),
        radial-gradient(2px 2px at 40px 70px, var(--stellar-cyan), transparent),
        radial-gradient(1px 1px at 90px 40px, var(--plasma-pink), transparent),
        radial-gradient(1px 1px at 130px 80px, var(--aurora-green), transparent);
    background-repeat: repeat;
    background-size: 200px 100px;
    animation: twinkle 20s linear infinite;
    z-index: -1;
    opacity: 0.6;
}

/* Pip-Boy CRT Scanlines */
body.theme-pipboy::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
        repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 0, 0.1) 2px,
            rgba(0, 255, 0, 0.1) 4px
        );
    pointer-events: none;
    z-index: 1000;
    animation: crt-flicker 0.1s infinite linear alternate;
}

@keyframes twinkle {
    from { transform: translateY(0); }
    to { transform: translateY(-100px); }
}

@keyframes crt-flicker {
    0% { opacity: 1; }
    100% { opacity: 0.98; }
}

/* Layout */
.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    position: relative;
    z-index: 1;
}

/* Header */
.header {
    text-align: center;
    margin-bottom: 40px;
    position: relative;
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 20px;
}

.header-left {
    flex: 1;
}

.theme-selector select {
    background: var(--bg-card);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 10px 16px;
    font-family: var(--font-secondary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    backdrop-filter: blur(10px);
    transition: var(--transition);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.theme-selector select:hover {
    border-color: var(--accent-primary);
    box-shadow: var(--glow-primary);
    transform: translateY(-1px);
}

body.theme-pipboy .theme-selector select {
    border-color: var(--pip-green);
    background: var(--pip-dark);
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
    text-shadow: 0 0 5px var(--pip-green);
}

body.theme-pipboy .theme-selector select:hover {
    border-color: var(--pip-amber);
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
}

.header h1 {
    font-family: var(--font-primary);
    font-size: 3.2rem;
    font-weight: 800;
    margin: 0;
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary), var(--accent-success));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 30px rgba(0, 212, 255, 0.6);
    letter-spacing: 3px;
    animation: glow-pulse 3s ease-in-out infinite alternate;
}

@keyframes glow-pulse {
    from { text-shadow: 0 0 20px rgba(0, 212, 255, 0.4); }
    to { text-shadow: 0 0 40px rgba(0, 212, 255, 0.8); }
}

body.theme-pipboy .header h1 {
    background: none;
    -webkit-background-clip: unset;
    -webkit-text-fill-color: unset;
    color: var(--pip-green);
    text-shadow: 0 0 25px var(--pip-green), 0 0 50px var(--pip-green);
    text-transform: uppercase;
    animation: pip-glow 2s ease-in-out infinite alternate;
}

@keyframes pip-glow {
    from { text-shadow: 0 0 20px var(--pip-green), 0 0 40px var(--pip-green); }
    to { text-shadow: 0 0 30px var(--pip-green), 0 0 60px var(--pip-green); }
}

/* Controls */
.controls {
    display: flex;
    gap: 20px;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 50px;
    padding: 20px;
}

.control-panel {
    background: var(--bg-card);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 24px;
    margin-bottom: 40px;
}

.control-panel .search-container {
    margin-bottom: 20px;
}

.control-panel .actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
}

.btn {
    background: var(--bg-card);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    padding: 14px 28px;
    border-radius: 12px;
    cursor: pointer;
    font-family: var(--font-secondary);
    font-weight: 600;
    transition: var(--transition);
    backdrop-filter: blur(15px);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 14px;
    text-decoration: none;
    display: inline-block;
    position: relative;
    overflow: hidden;
}

.btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
}

.btn:hover::before {
    left: 100%;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--glow-primary);
    border-color: var(--accent-primary);
}

.btn-primary {
    background: linear-gradient(45deg, var(--accent-primary), var(--accent-secondary));
    border: none;
    color: var(--bg-primary);
    font-weight: 700;
}

body.theme-pipboy .btn {
    background: var(--pip-dark);
    border-color: var(--pip-green);
    text-shadow: 0 0 10px var(--pip-green);
    box-shadow: inset 0 0 10px rgba(0, 255, 0, 0.1);
}

body.theme-pipboy .btn:hover {
    background: rgba(0, 255, 0, 0.15);
    box-shadow: 0 0 20px var(--pip-green), inset 0 0 15px rgba(0, 255, 0, 0.2);
    border-color: var(--pip-amber);
}

body.theme-pipboy .btn::before {
    background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.2), transparent);
}

body.theme-pipboy .btn-primary {
    background: var(--pip-green);
    color: var(--pip-black);
    text-shadow: none;
}

.search-input {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 14px 20px;
    border-radius: 12px;
    font-family: var(--font-secondary);
    font-size: 14px;
    backdrop-filter: blur(15px);
    min-width: 280px;
    transition: var(--transition);
    font-weight: 500;
}

.search-input:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: var(--glow-primary);
    transform: translateY(-1px);
}

.search-input::placeholder {
    color: var(--text-secondary);
}

body.theme-pipboy .search-input {
    background: var(--pip-dark);
    border-color: var(--pip-green);
    text-shadow: 0 0 5px var(--pip-green);
    box-shadow: inset 0 0 10px rgba(0, 255, 0, 0.1);
}

body.theme-pipboy .search-input:focus {
    border-color: var(--pip-amber);
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.5), inset 0 0 15px rgba(0, 255, 0, 0.2);
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 32px;
    margin-bottom: 50px;
    padding: 0 10px;
}

.stat-card {
    background: var(--bg-card);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-color);
    padding: 32px 24px;
    border-radius: var(--border-radius);
    text-align: center;
    transition: var(--transition);
    position: relative;
    overflow: hidden;
}

.stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
    opacity: 0;
    transition: var(--transition);
}

.stat-card:hover::before {
    opacity: 1;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--glow-primary);
}

.stat-card .stat-number {
    font-family: var(--font-primary);
    font-size: 2.8rem;
    font-weight: 700;
    color: var(--accent-primary);
    margin-bottom: 12px;
    display: block;
    text-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
}

.stat-card.success .stat-number {
    color: var(--accent-success);
}

.stat-card.danger .stat-number {
    color: var(--accent-danger);
}

.stat-card.warning .stat-number {
    color: var(--accent-warning);
}

.stat-card .stat-label {
    font-size: 1rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 500;
}

/* Apps Grid */
.apps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 32px;
    margin-bottom: 50px;
    padding: 0 10px;
}

.app-card {
    background: var(--bg-card);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 24px;
    transition: var(--transition);
    position: relative;
}

.app-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--glow-primary);
}

.app-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
}

.app-info h3 {
    font-family: var(--font-primary);
    font-size: 1.3rem;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.app-info .app-url {
    font-size: 0.9rem;
    color: var(--text-secondary);
    word-break: break-all;
}

.app-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    font-weight: 600;
}

.status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    animation: pulse-dot 2s infinite;
}

.status-online { background: var(--accent-success); }
.status-offline { background: var(--accent-danger); }
.status-unknown { background: var(--text-secondary); }

@keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.app-description {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 16px;
    line-height: 1.5;
}

.app-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.btn-small {
    padding: 6px 12px;
    font-size: 12px;
    border-radius: 6px;
}

/* Modal Styles */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    z-index: 2000;
    align-items: center;
    justify-content: center;
}

.modal.show {
    display: flex;
}

.modal-content {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    padding: 32px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
}

.modal h2 {
    font-family: var(--font-primary);
    color: var(--accent-primary);
    margin-bottom: 24px;
    font-size: 1.5rem;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    color: var(--text-primary);
    margin-bottom: 8px;
    font-weight: 600;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 12px;
    border-radius: 8px;
    font-family: var(--font-secondary);
    font-size: 14px;
}

.form-group textarea {
    resize: vertical;
    min-height: 80px;
}

.form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
}

/* Notifications */
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 16px 20px;
    max-width: 400px;
    z-index: 3000;
    transform: translateX(100%);
    transition: var(--transition);
    box-shadow: var(--glow-primary);
}

.notification.show {
    transform: translateX(0);
}

.notification.success {
    border-color: var(--accent-success);
    box-shadow: 0 0 var(--glow-size) rgba(0, 245, 255, 0.3);
}

.notification.error {
    border-color: var(--accent-danger);
    box-shadow: 0 0 var(--glow-size) rgba(255, 23, 68, 0.3);
}

/* Loading States */
.loading {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid var(--border-color);
    border-radius: 50%;
    border-top-color: var(--accent-primary);
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
    .container {
        padding: 16px;
    }
    
    .header h1 {
        font-size: 2rem;
    }
    
    .header-top {
        flex-direction: column;
        text-align: center;
    }
    
    .controls {
        flex-direction: column;
        align-items: stretch;
    }
    
    .search-input {
        min-width: unset;
    }
    
    .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 20px;
        padding: 0 5px;
    }
    
    .apps-grid {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 0 5px;
    }
    
    .control-panel {
        padding: 16px;
        margin-bottom: 30px;
    }
    
    .control-panel .actions {
        flex-direction: column;
        gap: 12px;
    }
    
    .modal-content {
        padding: 24px;
        margin: 16px;
    }
}

/* Pip-Boy Specific Styles */
body.theme-pipboy .stat-card,
body.theme-pipboy .app-card {
    border-color: var(--pip-green);
    background: rgba(0, 255, 0, 0.05);
}

body.theme-pipboy .stat-card:hover,
body.theme-pipboy .app-card:hover {
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
}

body.theme-pipboy .stat-number {
    color: var(--pip-green);
    text-shadow: 0 0 10px var(--pip-green);
}

body.theme-pipboy .modal-content {
    background: var(--pip-dark);
    border-color: var(--pip-green);
}

body.theme-pipboy .control-panel {
    background: rgba(0, 255, 0, 0.05);
    border-color: var(--pip-green);
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
}
`;
  }
});

// .wrangler/tmp/bundle-9mR8cd/middleware-loader.entry.ts
init_checked_fetch();
init_modules_watch_stub();

// .wrangler/tmp/bundle-9mR8cd/middleware-insertion-facade.js
init_checked_fetch();
init_modules_watch_stub();

// src/index.js
init_checked_fetch();
init_modules_watch_stub();
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    try {
      if (path === "/" || path === "/index.html") {
        return await serveHTML(env);
      }
      if (path === "/api/apps") {
        if (request.method === "GET") {
          return await getApps(env, corsHeaders);
        }
        if (request.method === "POST") {
          return await addApp(request, env, corsHeaders);
        }
      }
      if (path.startsWith("/api/apps/") && path.endsWith("/check")) {
        const appId = path.split("/")[3];
        return await checkAppStatus(appId, env, corsHeaders);
      }
      if (path.startsWith("/api/apps/") && request.method === "DELETE") {
        const appId = path.split("/")[3];
        return await deleteApp(appId, env, corsHeaders);
      }
      if (path === "/api/stats") {
        return await getStats(env, corsHeaders);
      }
      if (path === "/api/export") {
        return await exportData(env, corsHeaders);
      }
      if (path.startsWith("/api/apps/") && path.endsWith("/history")) {
        const appId = path.split("/")[3];
        return await getAppHistory(appId, env, corsHeaders);
      }
      if (path === "/styles.css") {
        return await serveCSS();
      }
      if (path === "/script.js") {
        return await serveJS();
      }
      if (path === "/favicon.ico") {
        return new Response("\u{1F680}", {
          headers: { "Content-Type": "text/plain" }
        });
      }
      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error("Error:", error);
      return new Response("Internal Server Error", {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: error.message })
      });
    }
  }
};
async function serveHTML(env) {
  const html = `<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AppWatch Dashboard \u{1F4CA}</title>
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
            <!-- Apps kommer laddas h\xE4r -->
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

    <script src="/script.js"><\/script>
</body>
</html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
__name(serveHTML, "serveHTML");
async function getApps(env, corsHeaders) {
  const apps = await env.DB.prepare("SELECT * FROM apps ORDER BY created_at DESC").all();
  return new Response(JSON.stringify({
    success: true,
    apps: apps.results || []
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(getApps, "getApps");
async function addApp(request, env, corsHeaders) {
  const data = await request.json();
  const {
    name,
    url,
    description,
    category = "web",
    check_interval = 300,
    timeout = 1e4,
    enable_alerts = true
  } = data;
  if (!name || !url) {
    return new Response(JSON.stringify({
      success: false,
      error: "Starship name and hyperspace coordinates required"
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  const id = crypto.randomUUID();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(`
    INSERT INTO apps (
      id, name, url, description, category, 
      check_interval, timeout, enable_alerts,
      status, last_checked, created_at, uptime_percentage
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unknown', ?, ?, 100)
  `).bind(
    id,
    name,
    url,
    description || "",
    category,
    check_interval,
    timeout,
    enable_alerts ? 1 : 0,
    now,
    now
  ).run();
  return new Response(JSON.stringify({
    success: true,
    app: {
      id,
      name,
      url,
      description,
      category,
      check_interval,
      timeout,
      enable_alerts,
      status: "unknown",
      created_at: now
    }
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(addApp, "addApp");
async function checkAppStatus(appId, env, corsHeaders) {
  const app = await env.DB.prepare("SELECT * FROM apps WHERE id = ?").bind(appId).first();
  if (!app) {
    return new Response(JSON.stringify({ success: false, error: "App ej funnen" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  try {
    const startTime = Date.now();
    const response = await fetch(app.url, {
      method: "HEAD",
      signal: AbortSignal.timeout(1e4)
      // 10s timeout
    });
    const responseTime = Date.now() - startTime;
    const status = response.ok ? "online" : "offline";
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await env.DB.prepare(`
      UPDATE apps 
      SET status = ?, last_checked = ?, response_time = ?
      WHERE id = ?
    `).bind(status, now, responseTime, appId).run();
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
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await env.DB.prepare(`
      UPDATE apps 
      SET status = 'offline', last_checked = ?
      WHERE id = ?
    `).bind(now, appId).run();
    return new Response(JSON.stringify({
      success: true,
      status: "offline",
      error: error.message,
      checked_at: now
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(checkAppStatus, "checkAppStatus");
async function deleteApp(appId, env, corsHeaders) {
  await env.DB.prepare("DELETE FROM apps WHERE id = ?").bind(appId).run();
  await env.DB.prepare("DELETE FROM status_logs WHERE app_id = ?").bind(appId).run();
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(deleteApp, "deleteApp");
async function getStats(env, corsHeaders) {
  const appsCount = await env.DB.prepare("SELECT COUNT(*) as count FROM apps").first();
  const onlineCount = await env.DB.prepare('SELECT COUNT(*) as count FROM apps WHERE status = "online"').first();
  const offlineCount = await env.DB.prepare('SELECT COUNT(*) as count FROM apps WHERE status = "offline"').first();
  const avgUptime = await env.DB.prepare("SELECT AVG(uptime_percentage) as avg FROM apps").first();
  return new Response(JSON.stringify({
    success: true,
    stats: {
      total: appsCount.count,
      online: onlineCount.count,
      offline: offlineCount.count,
      avg_uptime: Math.round(avgUptime.avg || 100)
    }
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(getStats, "getStats");
async function exportData(env, corsHeaders) {
  try {
    const apps = await env.DB.prepare("SELECT * FROM apps ORDER BY created_at DESC").all();
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
        exported_at: (/* @__PURE__ */ new Date()).toISOString()
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to export data"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(exportData, "exportData");
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
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch history"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(getAppHistory, "getAppHistory");
async function serveCSS() {
  const { CSS: CSS2 } = await Promise.resolve().then(() => (init_assets(), assets_exports));
  return new Response(CSS2, {
    headers: { "Content-Type": "text/css" }
  });
}
__name(serveCSS, "serveCSS");
async function serveJS() {
  const { JS } = await Promise.resolve().then(() => (init_assets(), assets_exports));
  return new Response(JS, {
    headers: { "Content-Type": "application/javascript" }
  });
}
__name(serveJS, "serveJS");

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_checked_fetch();
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_checked_fetch();
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-9mR8cd/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
init_checked_fetch();
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-9mR8cd/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
