// AppWatch Dashboard - Static Assets för Cloudflare Workers

export const CSS = `/* 🚀 AppWatch Space Station - Cosmic Monitoring Dashboard */

@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Exo+2:wght@300;400;500;600;700&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    /* 🌌 Cosmic Color Palette */
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
    
    /* 🎨 UI Colors */
    --primary: var(--stellar-cyan);
    --primary-dark: #00a8cc;
    --secondary: var(--plasma-pink);
    --success: var(--aurora-green);
    --warning: var(--solar-orange);
    --danger: #ff1744;
    --info: #00bcd4;
    
    /* 📐 Spacing & Layout */
    --border-radius: 16px;
    --border-radius-lg: 24px;
    --border-radius-xl: 32px;
    --glow-size: 20px;
    
    /* ✨ Effects */
    --glass-bg: rgba(255, 255, 255, 0.05);
    --glass-border: rgba(255, 255, 255, 0.1);
    --glow-primary: 0 0 var(--glow-size) rgba(0, 212, 255, 0.3);
    --glow-success: 0 0 var(--glow-size) rgba(0, 245, 255, 0.3);
    --glow-danger: 0 0 var(--glow-size) rgba(255, 23, 68, 0.3);
    --glow-warning: 0 0 var(--glow-size) rgba(255, 133, 0, 0.3);
    
    /* 🌟 Animations */
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* 🌌 Cosmic Background */
body {
    font-family: 'Exo 2', 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: var(--starlight);
    background: var(--space-black);
    background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%);
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
}

/* ✨ Animated Stars Background */
body::before {
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
        radial-gradient(1px 1px at 130px 80px, var(--aurora-green), transparent),
        radial-gradient(2px 2px at 160px 30px, var(--starlight), transparent);
    background-repeat: repeat;
    background-size: 200px 100px;
    animation: twinkle 20s linear infinite;
    z-index: -1;
    opacity: 0.6;
}

@keyframes twinkle {
    from { transform: translateY(0); }
    to { transform: translateY(-100px); }
}

/* 🏗️ Layout Structure */
.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    position: relative;
    z-index: 1;
}

/* 🚀 Space Station Header */
.header {
    text-align: center;
    margin-bottom: 40px;
    position: relative;
}

.header::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--stellar-cyan), transparent);
    animation: pulse 2s ease-in-out infinite;
}

.header h1 {
    font-family: 'Orbitron', monospace;
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, var(--stellar-cyan), var(--plasma-pink), var(--aurora-green));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
    animation: glow-text 3s ease-in-out infinite alternate;
}

.header .subtitle {
    font-size: 1.2rem;
    color: var(--lunar-silver);
    opacity: 0.8;
    font-weight: 300;
    letter-spacing: 2px;
    text-transform: uppercase;
}

.header .status-badge {
    display: inline-block;
    margin-top: 10px;
    padding: 8px 16px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    font-size: 0.9rem;
    color: var(--aurora-green);
    animation: float 3s ease-in-out infinite;
}

@keyframes glow-text {
    from { text-shadow: 0 0 20px rgba(0, 212, 255, 0.3); }
    to { text-shadow: 0 0 40px rgba(0, 212, 255, 0.8); }
}

@keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
}

/* 📊 Mission Control Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
}

.stat-card {
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    padding: 28px 24px;
    border-radius: var(--border-radius-lg);
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
    height: 2px;
    background: linear-gradient(90deg, var(--stellar-cyan), var(--plasma-pink));
}

.stat-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: var(--glow-primary);
    border-color: var(--primary);
}

.stat-card.success:hover {
    box-shadow: var(--glow-success);
    border-color: var(--success);
}

.stat-card.danger:hover {
    box-shadow: var(--glow-danger);
    border-color: var(--danger);
}

.stat-card.warning:hover {
    box-shadow: var(--glow-warning);
    border-color: var(--warning);
}

.stat-card .icon {
    font-size: 2rem;
    margin-bottom: 12px;
    opacity: 0.8;
}

.stat-card h3 {
    font-family: 'Orbitron', monospace;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--asteroid-gray);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
}

.stat-card .value {
    font-family: 'Orbitron', monospace;
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--starlight);
    margin-bottom: 8px;
    text-shadow: 0 0 10px currentColor;
}

.stat-card .trend {
    font-size: 0.8rem;
    color: var(--lunar-silver);
    opacity: 0.7;
}

.status-online {
    color: var(--success) !important;
}

.status-offline {
    color: var(--danger) !important;
}

.status-warning {
    color: var(--warning) !important;
}

/* 🎮 Mission Control Panel */
.control-panel {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 40px;
    align-items: center;
    justify-content: space-between;
}

.actions {
    display: flex;
    gap: 16px;
    align-items: center;
}

.search-container {
    position: relative;
    flex: 1;
    max-width: 400px;
}

.search-input {
    width: 100%;
    padding: 12px 20px 12px 45px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius);
    color: var(--starlight);
    font-size: 0.9rem;
    backdrop-filter: blur(10px);
    transition: var(--transition);
}

.search-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: var(--glow-primary);
}

.search-input::placeholder {
    color: var(--asteroid-gray);
}

.search-icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--asteroid-gray);
    font-size: 1.1rem;
}

/* 🚀 Cosmic Buttons */
.btn {
    padding: 12px 24px;
    border: none;
    border-radius: var(--border-radius);
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: var(--transition);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    position: relative;
    overflow: hidden;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    color: var(--starlight);
    backdrop-filter: blur(10px);
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
    border-color: var(--primary);
    box-shadow: var(--glow-primary);
}

.btn-primary {
    background: linear-gradient(135deg, var(--stellar-cyan), var(--cosmic-blue));
    border-color: var(--stellar-cyan);
}

.btn-primary:hover {
    box-shadow: 0 0 25px rgba(0, 212, 255, 0.4);
    transform: translateY(-3px) scale(1.05);
}

.btn-secondary {
    background: var(--glass-bg);
    border-color: var(--asteroid-gray);
}

.btn-secondary:hover {
    border-color: var(--lunar-silver);
    box-shadow: 0 0 20px rgba(201, 209, 217, 0.2);
}

.btn-danger {
    background: linear-gradient(135deg, var(--danger), #ff1744);
    border-color: var(--danger);
}

.btn-danger:hover {
    box-shadow: var(--glow-danger);
}

.btn-success {
    background: linear-gradient(135deg, var(--success), var(--aurora-green));
    border-color: var(--success);
}

.btn-success:hover {
    box-shadow: var(--glow-success);
}

/* 🛸 Starship Fleet Grid */
.apps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 24px;
}

.app-card {
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius-lg);
    padding: 28px;
    transition: var(--transition);
    position: relative;
    overflow: hidden;
}

.app-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--asteroid-gray), var(--asteroid-gray));
    transition: var(--transition);
}

.app-card:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: var(--primary);
    box-shadow: var(--glow-primary);
}

.app-card.status-online::before {
    background: linear-gradient(90deg, var(--success), var(--aurora-green));
    box-shadow: 0 0 10px var(--success);
}

.app-card.status-online:hover {
    box-shadow: var(--glow-success);
    border-color: var(--success);
}

.app-card.status-offline::before {
    background: linear-gradient(90deg, var(--danger), #ff1744);
    box-shadow: 0 0 10px var(--danger);
}

.app-card.status-offline:hover {
    box-shadow: var(--glow-danger);
    border-color: var(--danger);
}

.app-card.status-unknown::before {
    background: linear-gradient(90deg, var(--warning), var(--solar-orange));
    box-shadow: 0 0 10px var(--warning);
}

.app-card.status-unknown:hover {
    box-shadow: var(--glow-warning);
    border-color: var(--warning);
}

.app-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}

.app-title {
    font-family: 'Orbitron', monospace;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--starlight);
    margin-bottom: 6px;
    text-shadow: 0 0 10px currentColor;
}

.app-url {
    font-size: 0.85rem;
    color: var(--primary);
    text-decoration: none;
    word-break: break-all;
    opacity: 0.8;
    transition: var(--transition);
}

.app-url:hover {
    opacity: 1;
    text-shadow: 0 0 8px var(--primary);
}

.app-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: 25px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    backdrop-filter: blur(10px);
    border: 1px solid;
    transition: var(--transition);
}

.app-status.online {
    background: rgba(0, 245, 255, 0.1);
    color: var(--success);
    border-color: var(--success);
    box-shadow: 0 0 15px rgba(0, 245, 255, 0.2);
}

.app-status.offline {
    background: rgba(255, 23, 68, 0.1);
    color: var(--danger);
    border-color: var(--danger);
    box-shadow: 0 0 15px rgba(255, 23, 68, 0.2);
}

.app-status.unknown {
    background: rgba(255, 133, 0, 0.1);
    color: var(--warning);
    border-color: var(--warning);
    box-shadow: 0 0 15px rgba(255, 133, 0, 0.2);
}

.app-description {
    color: var(--lunar-silver);
    font-size: 0.9rem;
    margin-bottom: 20px;
    line-height: 1.6;
    opacity: 0.8;
}

.app-meta {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
    font-size: 0.85rem;
}

.meta-item {
    text-align: center;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: var(--border-radius);
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: var(--transition);
}

.meta-item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: var(--primary);
}

.meta-label {
    font-weight: 500;
    color: var(--asteroid-gray);
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
}

.meta-value {
    font-family: 'Orbitron', monospace;
    font-weight: 600;
    color: var(--starlight);
    font-size: 0.9rem;
}

.app-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.btn-small {
    padding: 8px 16px;
    font-size: 0.75rem;
    border-radius: var(--border-radius);
    flex: 1;
    min-width: 120px;
}

.performance-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
    margin-top: 8px;
}

.ping-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.ping-dot.online {
    background: var(--success);
}

.ping-dot.offline {
    background: var(--danger);
}

.ping-dot.unknown {
    background: var(--warning);
}

@keyframes ping {
    75%, 100% {
        transform: scale(2);
        opacity: 0;
    }
}

/* 🌌 Cosmic Modal Portal */
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(10, 10, 15, 0.8);
    backdrop-filter: blur(8px);
    animation: fadeIn 0.3s ease-out;
}

.modal-content {
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    margin: 50px auto;
    padding: 40px;
    border-radius: var(--border-radius-xl);
    width: 90%;
    max-width: 550px;
    box-shadow: var(--glow-primary);
    position: relative;
    animation: slideIn 0.3s var(--bounce);
}

.modal-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--stellar-cyan), var(--plasma-pink), var(--aurora-green));
    border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
}

.modal-title {
    font-family: 'Orbitron', monospace;
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--starlight);
    margin-bottom: 24px;
    text-align: center;
    text-shadow: 0 0 20px var(--primary);
}

.close {
    position: absolute;
    top: 20px;
    right: 25px;
    color: var(--asteroid-gray);
    font-size: 30px;
    font-weight: bold;
    cursor: pointer;
    line-height: 1;
    transition: var(--transition);
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
}

.close:hover {
    color: var(--danger);
    background: rgba(255, 23, 68, 0.1);
    transform: rotate(90deg);
    box-shadow: 0 0 15px rgba(255, 23, 68, 0.3);
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideIn {
    from { 
        opacity: 0;
        transform: translateY(-50px) scale(0.8);
    }
    to { 
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* 🎛️ Cosmic Control Forms */
.form-group {
    margin-bottom: 24px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-family: 'Orbitron', monospace;
    font-weight: 500;
    color: var(--lunar-silver);
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 14px 18px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius);
    color: var(--starlight);
    font-size: 0.9rem;
    transition: var(--transition);
    backdrop-filter: blur(10px);
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: var(--glow-primary);
    background: rgba(255, 255, 255, 0.08);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
    color: var(--asteroid-gray);
}

.form-group textarea {
    resize: vertical;
    min-height: 100px;
    font-family: inherit;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.checkbox-group {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
}

.checkbox-group input[type="checkbox"] {
    width: auto;
    padding: 0;
}

/* ⚡ Loading & Animation States */
.loading {
    opacity: 0.6;
    pointer-events: none;
    position: relative;
}

.loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    border: 3px solid transparent;
    border-top: 3px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.pulse-loader {
    display: inline-flex;
    gap: 4px;
    align-items: center;
}

.pulse-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--primary);
    animation: pulse-dot 1.4s ease-in-out infinite both;
}

.pulse-dot:nth-child(1) { animation-delay: -0.32s; }
.pulse-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes pulse-dot {
    0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
    }
    40% {
        transform: scale(1);
        opacity: 1;
    }
}

/* 🌌 Empty State */
.empty-state {
    text-align: center;
    padding: 80px 20px;
    color: var(--lunar-silver);
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius-lg);
    backdrop-filter: blur(10px);
}

.empty-state .icon {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.3;
}

.empty-state h3 {
    font-family: 'Orbitron', monospace;
    font-size: 1.4rem;
    margin-bottom: 12px;
    color: var(--starlight);
}

.empty-state p {
    font-size: 1rem;
    opacity: 0.7;
    max-width: 400px;
    margin: 0 auto;
}

/* 📊 Charts & Graphs */
.chart-container {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius-lg);
    padding: 24px;
    margin: 24px 0;
    backdrop-filter: blur(20px);
}

.chart-title {
    font-family: 'Orbitron', monospace;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--starlight);
    margin-bottom: 16px;
    text-align: center;
}

/* 🔔 Notification System */
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: var(--border-radius);
    color: var(--starlight);
    font-weight: 600;
    z-index: 10000;
    backdrop-filter: blur(20px);
    border: 1px solid;
    min-width: 300px;
    animation: slideInRight 0.3s ease-out;
}

.notification.success {
    background: rgba(0, 245, 255, 0.15);
    border-color: var(--success);
    box-shadow: var(--glow-success);
}

.notification.error {
    background: rgba(255, 23, 68, 0.15);
    border-color: var(--danger);
    box-shadow: var(--glow-danger);
}

.notification.warning {
    background: rgba(255, 133, 0, 0.15);
    border-color: var(--warning);
    box-shadow: var(--glow-warning);
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* 📱 Galactic Responsive Design */
@media (max-width: 1024px) {
    .container {
        padding: 16px;
    }
    
    .header h1 {
        font-size: 3rem;
    }
    
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
    }
    
    .control-panel {
        flex-direction: column;
        align-items: stretch;
    }
    
    .search-container {
        max-width: 100%;
        order: -1;
    }
}

@media (max-width: 768px) {
    .container {
        padding: 12px;
    }
    
    .header h1 {
        font-size: 2.5rem;
    }
    
    .header .subtitle {
        font-size: 1rem;
    }
    
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
    }
    
    .apps-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .app-meta {
        grid-template-columns: 1fr;
        gap: 12px;
    }
    
    .form-row {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    
    .modal-content {
        margin: 20px auto;
        padding: 24px;
        width: 95%;
    }
    
    .btn-small {
        min-width: auto;
    }
}

@media (max-width: 480px) {
    .header h1 {
        font-size: 2rem;
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    
    .app-actions {
        flex-direction: column;
        gap: 8px;
    }
    
    .actions {
        flex-direction: column;
        gap: 12px;
    }
    
    .notification {
        left: 10px;
        right: 10px;
        top: 10px;
        min-width: auto;
    }
}

/* 🌟 Special Effects & Animations */
.constellation-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
}

.shooting-star {
    position: absolute;
    width: 2px;
    height: 2px;
    background: var(--starlight);
    border-radius: 50%;
    animation: shooting 3s linear infinite;
}

@keyframes shooting {
    0% {
        transform: translateX(-100px) translateY(100px);
        opacity: 0;
    }
    10% {
        opacity: 1;
    }
    90% {
        opacity: 1;
    }
    100% {
        transform: translateX(100vw) translateY(-100px);
        opacity: 0;
    }
}

/* 🎯 Utility Classes */
.text-primary { color: var(--primary) !important; }
.text-success { color: var(--success) !important; }
.text-danger { color: var(--danger) !important; }
.text-warning { color: var(--warning) !important; }
.text-muted { color: var(--asteroid-gray) !important; }

.bg-primary { background: var(--primary) !important; }
.bg-success { background: var(--success) !important; }
.bg-danger { background: var(--danger) !important; }
.bg-warning { background: var(--warning) !important; }

.glow { box-shadow: var(--glow-primary) !important; }
.glow-success { box-shadow: var(--glow-success) !important; }
.glow-danger { box-shadow: var(--glow-danger) !important; }
.glow-warning { box-shadow: var(--glow-warning) !important; }

.fade-in { animation: fadeIn 0.5s ease-out; }
.slide-up { animation: slideUp 0.5s ease-out; }
.scale-in { animation: scaleIn 0.3s var(--bounce); }

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

/* 🌌 Dark mode specific enhancements */
body.dark-mode {
    --space-black: #000000;
    --glass-bg: rgba(255, 255, 255, 0.03);
    --glass-border: rgba(255, 255, 255, 0.08);
}

/* 🔧 Accessibility & High Contrast */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

@media (prefers-contrast: high) {
    :root {
        --glass-border: rgba(255, 255, 255, 0.3);
        --starlight: #ffffff;
         }
}`;

export const JS = `// 🚀 AppWatch Galactic Monitoring Station - Advanced JavaScript

class AppWatchGalaxy {
    constructor() {
        this.apps = [];
        this.filteredApps = [];
        this.searchTerm = '';
        this.settings = this.loadSettings();
        this.init();
    }

    async init() {
        this.createStarField();
        this.setupEventListeners();
        await this.loadStats();
        await this.loadApps();
        this.startAutoRefresh();
        this.startPeriodicHealthCheck();
    }

    loadSettings() {
        const defaults = {
            globalInterval: 300,
            retentionDays: 30,
            enableSound: true,
            darkMode: true,
            enableAlerts: true
        };
        
        const saved = localStorage.getItem('appwatch-settings');
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    }

    saveSettings() {
        localStorage.setItem('appwatch-settings', JSON.stringify(this.settings));
    }

    createStarField() {
        const starCount = 50;
        const container = document.body;
        
        for (let i = 0; i < starCount; i++) {
            setTimeout(() => {
                const star = document.createElement('div');
                star.className = 'shooting-star';
                star.style.left = Math.random() * 100 + 'vw';
                star.style.top = Math.random() * 100 + 'vh';
                star.style.animationDelay = Math.random() * 3 + 's';
                container.appendChild(star);
                
                setTimeout(() => {
                    if (star.parentNode) {
                        star.parentNode.removeChild(star);
                    }
                }, 3000);
            }, Math.random() * 5000);
        }
        
        setTimeout(() => this.createStarField(), 10000);
    }

    setupEventListeners() {
        // Starship Registration Modal
        const addAppBtn = document.getElementById('add-app-btn');
        const addModal = document.getElementById('add-app-modal');
        const addForm = document.getElementById('add-app-form');

        addAppBtn.addEventListener('click', () => {
            addModal.style.display = 'block';
            addModal.classList.add('fade-in');
        });

        // Settings Modal
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        const settingsForm = document.getElementById('settings-form');

        settingsBtn.addEventListener('click', () => {
            this.openSettingsModal();
        });

        // Search functionality
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.filterAndRenderApps();
        });

        // Modal close handlers
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal);
            });
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });

        // Form submissions
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addApp();
        });

        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveSettingsFromForm();
        });

        // Action buttons
        const refreshBtn = document.getElementById('refresh-btn');
        refreshBtn.addEventListener('click', async () => {
            await this.refreshAll();
        });

        const exportBtn = document.getElementById('export-btn');
        exportBtn.addEventListener('click', () => {
            this.exportData();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        searchInput.focus();
                        break;
                    case 'n':
                        e.preventDefault();
                        addAppBtn.click();
                        break;
                    case 'r':
                        e.preventDefault();
                        refreshBtn.click();
                        break;
                }
            }
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    if (modal.style.display === 'block') {
                        this.closeModal(modal);
                    }
                });
            }
        });
    }

    closeModal(modal) {
        modal.style.display = 'none';
        const form = modal.querySelector('form');
        if (form) form.reset();
    }

    openSettingsModal() {
        const modal = document.getElementById('settings-modal');
        const form = document.getElementById('settings-form');
        
        // Populate form with current settings
        form.querySelector('#global-interval').value = this.settings.globalInterval;
        form.querySelector('#retention-days').value = this.settings.retentionDays;
        form.querySelector('#enable-sound').checked = this.settings.enableSound;
        form.querySelector('#dark-mode').checked = this.settings.darkMode;
        
        modal.style.display = 'block';
        modal.classList.add('fade-in');
    }

    async saveSettingsFromForm() {
        const form = document.getElementById('settings-form');
        
        this.settings.globalInterval = parseInt(form.querySelector('#global-interval').value);
        this.settings.retentionDays = parseInt(form.querySelector('#retention-days').value);
        this.settings.enableSound = form.querySelector('#enable-sound').checked;
        this.settings.darkMode = form.querySelector('#dark-mode').checked;
        
        this.saveSettings();
        this.closeModal(document.getElementById('settings-modal'));
        
        this.showSuccess('🛸 Configuration saved successfully!');
        
        // Apply dark mode setting
        document.body.classList.toggle('dark-mode', this.settings.darkMode);
    }

    async loadStats() {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();
            
            if (data.success) {
                this.updateStatsDisplay(data.stats);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    updateStatsDisplay(stats) {
        document.getElementById('total-apps').textContent = stats.total || 0;
        document.getElementById('online-apps').textContent = stats.online || 0;
        document.getElementById('offline-apps').textContent = stats.offline || 0;
        document.getElementById('avg-uptime').textContent = (stats.avg_uptime || 0) + '%';
        
        // Calculate average response time
        const avgResponse = this.calculateAverageResponse();
        document.getElementById('avg-response').textContent = avgResponse;
        
        // Get incidents count (apps that went offline in last 24h)
        const incidents = this.calculateIncidents();
        document.getElementById('total-incidents').textContent = incidents;
    }

    calculateAverageResponse() {
        if (this.apps.length === 0) return '-';
        
        const validTimes = this.apps
            .filter(app => app.response_time && app.status === 'online')
            .map(app => app.response_time);
            
        if (validTimes.length === 0) return '-';
        
        const avg = validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length;
        return Math.round(avg) + 'ms';
    }

    calculateIncidents() {
        // For now, return offline apps count as incidents
        // In a real implementation, this would check status_logs table
        return this.apps.filter(app => app.status === 'offline').length;
    }

    filterAndRenderApps() {
        if (!this.searchTerm) {
            this.filteredApps = [...this.apps];
        } else {
            this.filteredApps = this.apps.filter(app => 
                app.name.toLowerCase().includes(this.searchTerm) ||
                app.url.toLowerCase().includes(this.searchTerm) ||
                (app.description && app.description.toLowerCase().includes(this.searchTerm))
            );
        }
        this.renderApps();
    }

    async loadApps() {
        try {
            const response = await fetch('/api/apps');
            const data = await response.json();
            
            if (data.success) {
                this.apps = data.apps || [];
                this.filteredApps = [...this.apps];
                this.renderApps();
            }
        } catch (error) {
            console.error('Error loading apps:', error);
            this.showError('Failed to load starship fleet - Check space-time connection');
        }
    }

    renderApps() {
        const grid = document.getElementById('apps-grid');
        const appsToRender = this.filteredApps;
        
        if (this.apps.length === 0) {
            grid.innerHTML = '<div class="empty-state">' +
                '<div class="icon">🛸</div>' +
                '<h3>No Starships in Fleet</h3>' +
                '<p>Register your first starship to begin galactic monitoring</p>' +
                '</div>';
            return;
        }

        if (appsToRender.length === 0) {
            grid.innerHTML = '<div class="empty-state">' +
                '<div class="icon">🔍</div>' +
                '<h3>No Starships Found</h3>' +
                '<p>No starships match your search criteria</p>' +
                '</div>';
            return;
        }

        grid.innerHTML = appsToRender.map(app => this.createAppCard(app)).join('');
        
        // Add animation classes
        grid.querySelectorAll('.app-card').forEach((card, index) => {
            card.style.animationDelay = (index * 0.1) + 's';
            card.classList.add('slide-up');
        });
        
        this.setupAppEventListeners();
    }

    createAppCard(app) {
        const statusClass = app.status || 'unknown';
        const statusText = this.getStatusText(app.status);
        const lastChecked = app.last_checked ? 
            this.formatDateTime(new Date(app.last_checked)) : 'Never';
        const responseTime = app.response_time ? app.response_time + 'ms' : '-';
        const uptime = app.uptime_percentage ? Math.round(app.uptime_percentage) + '%' : '100%';
        const category = app.category || 'web';

        return '<div class="app-card status-' + statusClass + '" data-app-id="' + app.id + '">' +
            '<div class="app-header">' +
                '<div>' +
                    '<div class="app-title">' + this.escapeHtml(app.name) + '</div>' +
                    '<a href="' + app.url + '" target="_blank" class="app-url">' + app.url + '</a>' +
                '</div>' +
                '<div class="app-status ' + statusClass + '">' +
                    this.getStatusIcon(app.status) + ' ' + statusText +
                '</div>' +
            '</div>' +
            (app.description ? '<div class="app-description">' + this.escapeHtml(app.description) + '</div>' : '') +
            '<div class="app-meta">' +
                '<div class="meta-item">' +
                    '<div class="meta-label">Last Scan</div>' +
                    '<div class="meta-value">' + lastChecked + '</div>' +
                '</div>' +
                '<div class="meta-item">' +
                    '<div class="meta-label">Response</div>' +
                    '<div class="meta-value">' + responseTime + '</div>' +
                '</div>' +
                '<div class="meta-item">' +
                    '<div class="meta-label">Uptime</div>' +
                    '<div class="meta-value">' + uptime + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="performance-indicator">' +
                '<div class="ping-dot ' + statusClass + '"></div>' +
                '<span>Signal: ' + this.getSignalStrength(app.response_time) + '</span>' +
            '</div>' +
            '<div class="app-actions">' +
                '<button class="btn btn-secondary btn-small check-btn" data-app-id="' + app.id + '">' +
                    '📡 Scan' +
                '</button>' +
                '<button class="btn btn-secondary btn-small history-btn" data-app-id="' + app.id + '">' +
                    '📊 History' +
                '</button>' +
                '<button class="btn btn-danger btn-small delete-btn" data-app-id="' + app.id + '">' +
                    '💥 Remove' +
                '</button>' +
            '</div>' +
        '</div>';
    }

    formatDateTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return minutes + 'm ago';
        if (hours < 24) return hours + 'h ago';
        if (days < 7) return days + 'd ago';
        return date.toLocaleDateString();
    }

    getSignalStrength(responseTime) {
        if (!responseTime) return 'Unknown';
        if (responseTime < 200) return 'Strong 💚';
        if (responseTime < 500) return 'Good 💛';
        if (responseTime < 1000) return 'Weak 🧡';
        return 'Poor 💔';
    }

    setupAppEventListeners() {
        document.querySelectorAll('.check-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const appId = e.target.dataset.appId;
                await this.checkAppStatus(appId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const appId = e.target.dataset.appId;
                const app = this.apps.find(a => a.id === appId);
                
                if (confirm('Är du säker på att du vill ta bort "' + app.name + '"?')) {
                    await this.deleteApp(appId);
                }
            });
        });
    }

    async addApp() {
        const form = document.getElementById('add-app-form');
        
        const appData = {
            name: document.getElementById('app-name').value,
            url: document.getElementById('app-url').value,
            description: document.getElementById('app-description').value,
            category: document.getElementById('app-category').value,
            check_interval: parseInt(document.getElementById('check-interval').value),
            timeout: parseInt(document.getElementById('timeout').value),
            enable_alerts: document.getElementById('enable-alerts').checked
        };

        try {
            const response = await fetch('/api/apps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appData)
            });

            const data = await response.json();

            if (data.success) {
                this.closeModal(document.getElementById('add-app-modal'));
                
                await this.loadApps();
                await this.loadStats();
                
                this.showSuccess('🚀 Starship "' + appData.name + '" registered successfully!');
                this.playSound('success');
            } else {
                this.showError(data.error || 'Failed to register starship');
            }
        } catch (error) {
            console.error('Error adding app:', error);
            this.showError('Failed to register starship - Check your hyperdrive connection');
        }
    }

    async exportData() {
        try {
            const response = await fetch('/api/export');
            const data = await response.json();
            
            if (data.success) {
                const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'appwatch-data-' + new Date().toISOString().split('T')[0] + '.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showSuccess('📊 Data exported successfully!');
            }
        } catch (error) {
            console.error('Export error:', error);
            this.showError('Failed to export data');
        }
    }

    playSound(type) {
        if (!this.settings.enableSound) return;
        
        // Create audio context for space-like sounds
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'success') {
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        } else if (type === 'error') {
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
        }
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }

    startPeriodicHealthCheck() {
        // Perform health checks every minute for critical apps
        setInterval(async () => {
            const criticalApps = this.apps.filter(app => app.status === 'offline');
            if (criticalApps.length > 0) {
                console.log('🚨 Performing emergency health check for', criticalApps.length, 'offline starships');
                for (const app of criticalApps) {
                    await this.checkAppStatus(app.id, true); // Silent check
                }
            }
        }, 60000); // 1 minute
    }

    async checkAppStatus(appId) {
        const btn = document.querySelector('[data-app-id="' + appId + '"].check-btn');
        const originalText = btn.textContent;
        
        btn.innerHTML = '<span class="spinner"></span> Kollar...';
        btn.disabled = true;

        try {
            const response = await fetch('/api/apps/' + appId + '/check', {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
                const appIndex = this.apps.findIndex(a => a.id === appId);
                if (appIndex !== -1) {
                    this.apps[appIndex] = {
                        ...this.apps[appIndex],
                        status: data.status,
                        last_checked: data.checked_at,
                        response_time: data.response_time
                    };
                }
                
                this.renderApps();
                await this.loadStats();
                
                const statusText = this.getStatusText(data.status);
                this.showSuccess('Status uppdaterad: ' + statusText);
            } else {
                this.showError(data.error || 'Kunde inte kolla status');
            }
        } catch (error) {
            console.error('Error checking status:', error);
            this.showError('Kunde inte kolla status');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    async deleteApp(appId) {
        try {
            const response = await fetch('/api/apps/' + appId, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                this.apps = this.apps.filter(a => a.id !== appId);
                this.renderApps();
                await this.loadStats();
                this.showSuccess('App har tagits bort');
            } else {
                this.showError('Kunde inte ta bort app');
            }
        } catch (error) {
            console.error('Error deleting app:', error);
            this.showError('Kunde inte ta bort app');
        }
    }

    async refreshAll() {
        const refreshBtn = document.getElementById('refresh-btn');
        const originalText = refreshBtn.textContent;
        
        refreshBtn.innerHTML = '<span class="spinner"></span> Uppdaterar...';
        refreshBtn.disabled = true;

        try {
            const checkPromises = this.apps.map(app => 
                fetch('/api/apps/' + app.id + '/check', { method: 'POST' })
            );
            
            await Promise.allSettled(checkPromises);
            
            await this.loadApps();
            await this.loadStats();
            
            this.showSuccess('Alla appar uppdaterade!');
        } catch (error) {
            console.error('Error refreshing:', error);
            this.showError('Kunde inte uppdatera alla appar');
        } finally {
            refreshBtn.textContent = originalText;
            refreshBtn.disabled = false;
        }
    }

    getStatusText(status) {
        const statusMap = {
            'online': 'Online',
            'offline': 'Offline', 
            'unknown': 'Okänd'
        };
        return statusMap[status] || 'Okänd';
    }

    getStatusIcon(status) {
        const iconMap = {
            'online': '🟢',
            'offline': '🔴',
            'unknown': '🟡'
        };
        return iconMap[status] || '🟡';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Create space-themed notification
        const notification = document.createElement('div');
        notification.className = 'notification ' + type;
        notification.innerHTML = '<strong>' + message + '</strong>';
        
        document.body.appendChild(notification);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 4000);
    }

    startAutoRefresh() {
        setInterval(async () => {
            await this.loadStats();
            console.log('Auto-refreshed stats');
        }, 5 * 60 * 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AppWatchGalaxy();
});`;