// AppWatch Dashboard - Static Assets för Cloudflare Workers

export const CSS = `/* AppWatch - Multi-Theme Monitoring Dashboard */

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