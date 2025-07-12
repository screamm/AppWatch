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
    
    /* Super Mario 8-bit Theme Colors */
    --mario-red: #FF0000;
    --mario-blue: #0000FF;
    --mario-dark-blue: #000080;
    --mario-yellow: #FFD700;
    --mario-orange: #FF8C00;
    --mario-brown: #8B4513;
    --mario-beige: #F5DEB3;
    --mario-green: #228B22;
    --mario-gray: #696969;
    --mario-white: #FFFFFF;
    --mario-black: #000000;
    --mario-purple: #8A2BE2;
    
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

/* Super Mario 8-bit Theme */
body.theme-mario {
    --bg-primary: var(--mario-blue);
    --bg-secondary: var(--mario-dark-blue);
    --bg-card: rgba(255, 215, 0, 0.15);
    --text-primary: var(--mario-white);
    --text-secondary: var(--mario-beige);
    --accent-primary: var(--mario-red);
    --accent-secondary: var(--mario-yellow);
    --accent-success: var(--mario-green);
    --accent-warning: var(--mario-orange);
    --accent-danger: var(--mario-red);
    --border-color: var(--mario-yellow);
    --font-primary: 'Courier New', monospace;
    --font-secondary: 'Courier New', monospace;
    --glow-primary: 0 0 var(--glow-size) rgba(255, 215, 0, 0.6);
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

/* Mario 8-bit Pixel Background */
body.theme-mario::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
        linear-gradient(90deg, rgba(255, 215, 0, 0.1) 50%, transparent 50%),
        linear-gradient(rgba(255, 0, 0, 0.05) 50%, transparent 50%);
    background-size: 20px 20px, 40px 40px;
    background-position: 0 0, 10px 10px;
    pointer-events: none;
    z-index: -1;
    animation: mario-scroll 20s linear infinite;
}

@keyframes twinkle {
    from { transform: translateY(0); }
    to { transform: translateY(-100px); }
}

@keyframes crt-flicker {
    0% { opacity: 1; }
    100% { opacity: 0.98; }
}

@keyframes mario-scroll {
    from { transform: translateX(0); }
    to { transform: translateX(-40px); }
}

@keyframes mario-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
}

@keyframes coin-spin {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(360deg); }
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
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
    margin-bottom: 50px;
    padding: 0 10px;
}

.app-card {
    background: var(--bg-card);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 20px;
    transition: var(--transition);
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 280px;
}

.app-card:hover {
    box-shadow: var(--glow-primary);
}

.app-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    gap: 16px;
}

.app-header > div:first-child {
    flex: 1;
    min-width: 0; /* Allows text to truncate */
}

.app-title {
    font-family: var(--font-primary);
    font-size: 1.2rem;
    color: var(--text-primary);
    margin-bottom: 6px;
    font-weight: 600;
    line-height: 1.3;
}

.app-url {
    font-size: 0.85rem;
    color: var(--accent-primary);
    text-decoration: none;
    word-break: break-all;
    display: block;
    margin-bottom: 4px;
    transition: var(--transition);
}

.app-url:hover {
    color: var(--accent-secondary);
    text-shadow: 0 0 8px currentColor;
}

.app-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    white-space: nowrap;
    padding: 6px 12px;
    border-radius: 20px;
    border: 1px solid var(--border-color);
    background: var(--bg-secondary);
}

.app-status.online {
    color: var(--accent-success);
    border-color: var(--accent-success);
    background: rgba(0, 245, 255, 0.1);
}

.app-status.offline {
    color: var(--accent-danger);
    border-color: var(--accent-danger);
    background: rgba(255, 23, 68, 0.1);
}

.app-status.unknown {
    color: var(--text-secondary);
    border-color: var(--text-secondary);
    background: rgba(110, 118, 129, 0.1);
}

.app-description {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 16px;
    line-height: 1.5;
    flex-grow: 1;
}

.app-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
}

.meta-item {
    font-size: 0.8rem;
}

.meta-label {
    color: var(--text-secondary);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 0.75rem;
}

.meta-item:not(.meta-label) {
    color: var(--text-primary);
    font-weight: 600;
    margin-top: 4px;
}

.app-actions {
    display: flex;
    gap: 10px;
    margin-top: auto;
}

/* Empty State */
.empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 20px;
    background: var(--bg-card);
    border: 2px dashed var(--border-color);
    border-radius: var(--border-radius-lg);
    backdrop-filter: blur(20px);
}

.empty-state h3 {
    font-family: var(--font-primary);
    font-size: 1.5rem;
    color: var(--text-primary);
    margin-bottom: 12px;
}

.empty-state p {
    color: var(--text-secondary);
    font-size: 1rem;
    margin-bottom: 24px;
}

body.theme-pipboy .empty-state {
    border-color: var(--pip-green);
    background: rgba(0, 255, 0, 0.05);
    box-shadow: inset 0 0 20px rgba(0, 255, 0, 0.1);
}

body.theme-pipboy .empty-state h3 {
    color: var(--pip-green);
    text-shadow: 0 0 10px var(--pip-green);
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
    padding: 28px;
    max-width: 700px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    backdrop-filter: blur(20px);
    box-shadow: var(--glow-primary), 0 20px 40px rgba(0, 0, 0, 0.3);
}

.close {
    position: absolute;
    top: 16px;
    right: 20px;
    font-size: 28px;
    font-weight: bold;
    color: var(--text-secondary);
    cursor: pointer;
    transition: var(--transition);
    z-index: 10;
}

.close:hover {
    color: var(--accent-danger);
    text-shadow: 0 0 10px var(--accent-danger);
}

.modal-title {
    font-family: var(--font-primary);
    color: var(--accent-primary);
    margin-bottom: 16px;
    font-size: 1.4rem;
    font-weight: 600;
    text-align: center;
    padding-right: 40px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 12px;
}

.form-row.single {
    grid-template-columns: 1fr;
}

.form-group {
    margin-bottom: 10px;
}

.form-group label {
    display: block;
    color: var(--text-primary);
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 10px 14px;
    border-radius: 8px;
    font-family: var(--font-secondary);
    font-size: 14px;
    transition: var(--transition);
    backdrop-filter: blur(10px);
    min-height: 40px;
    box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
}

.form-group textarea {
    resize: vertical;
    min-height: 60px;
    line-height: 1.4;
}

.checkbox-group {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding: 10px 16px;
    background: var(--bg-card);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    min-height: 40px;
    box-sizing: border-box;
}

.checkbox-group input[type="checkbox"] {
    width: auto;
    margin: 0;
    accent-color: var(--accent-primary);
}

.checkbox-group label {
    margin: 0;
    font-weight: 500;
    text-transform: none;
    letter-spacing: normal;
}

.form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--border-color);
}

.modal form button[type="submit"] {
    padding: 14px 32px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 10px;
    min-width: 140px;
    transition: var(--transition);
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

/* Desktop Optimizations */
@media (min-width: 1024px) {
    .modal-content {
        max-width: 900px;
        padding: 20px 32px;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    .form-row {
        gap: 20px;
        margin-bottom: 8px;
    }
    
    .form-group {
        margin-bottom: 8px;
    }
    
    .modal-title {
        font-size: 1.5rem;
        margin-bottom: 12px;
    }
    
    .form-actions {
        margin-top: 16px;
        padding-top: 12px;
    }
    
    .form-group textarea {
        min-height: 50px;
    }
    
    .checkbox-group {
        margin-bottom: 8px;
        padding: 6px 12px;
        min-height: 32px;
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
        padding: 8px 12px;
        min-height: 36px;
        font-size: 14px;
    }
    
    .form-group label {
        margin-bottom: 4px;
        font-size: 0.8rem;
    }
    
    .close {
        font-size: 20px;
        top: 10px;
        right: 15px;
    }
}

/* Responsive Design */
@media (max-width: 1200px) {
    .apps-grid {
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    }
}

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
    
    .app-card {
        min-height: auto;
        padding: 16px;
    }
    
    .app-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
    
    .app-status {
        align-self: flex-start;
    }
    
    .app-meta {
        grid-template-columns: 1fr;
        gap: 12px;
    }
    
    .app-actions {
        flex-wrap: wrap;
        gap: 8px;
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
        max-width: 90vw;
    }
    
    .form-row {
        grid-template-columns: 1fr;
        gap: 12px;
    }
    
    .modal-title {
        font-size: 1.5rem;
        padding-right: 30px;
    }
    
    .close {
        font-size: 24px;
        top: 12px;
        right: 16px;
    }
}

@media (max-width: 480px) {
    .apps-grid {
        padding: 0;
    }
    
    .app-card {
        padding: 12px;
        min-height: auto;
    }
    
    .app-header {
        gap: 8px;
    }
    
    .app-title {
        font-size: 1.1rem;
    }
    
    .app-url {
        font-size: 0.8rem;
    }
    
    .app-meta {
        padding: 8px;
    }
}

/* Pip-Boy Specific Styles */
body.theme-pipboy .stat-card,
body.theme-pipboy .app-card {
    border-color: var(--pip-green);
    background: rgba(0, 255, 0, 0.05);
    box-shadow: inset 0 0 10px rgba(0, 255, 0, 0.1);
}

body.theme-pipboy .stat-card:hover,
body.theme-pipboy .app-card:hover {
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.3), inset 0 0 15px rgba(0, 255, 0, 0.15);
    border-color: var(--pip-amber);
}

body.theme-pipboy .stat-number {
    color: var(--pip-green);
    text-shadow: 0 0 10px var(--pip-green);
}

body.theme-pipboy .app-title {
    color: var(--pip-green);
    text-shadow: 0 0 8px var(--pip-green);
}

body.theme-pipboy .app-url {
    color: var(--pip-amber);
    text-shadow: 0 0 5px var(--pip-amber);
}

body.theme-pipboy .app-url:hover {
    color: var(--pip-light-green);
    text-shadow: 0 0 8px var(--pip-light-green);
}

body.theme-pipboy .app-status.online {
    color: var(--pip-green);
    border-color: var(--pip-green);
    background: rgba(0, 255, 0, 0.15);
    text-shadow: 0 0 5px var(--pip-green);
}

body.theme-pipboy .app-status.offline {
    color: var(--pip-amber);
    border-color: var(--pip-amber);
    background: rgba(255, 204, 0, 0.15);
    text-shadow: 0 0 5px var(--pip-amber);
}

body.theme-pipboy .app-status.unknown {
    color: var(--pip-green);
    border-color: var(--pip-green);
    background: rgba(0, 255, 0, 0.1);
    text-shadow: 0 0 5px var(--pip-green);
}

body.theme-pipboy .app-meta {
    background: rgba(0, 255, 0, 0.08);
    border-color: var(--pip-green);
    box-shadow: inset 0 0 5px rgba(0, 255, 0, 0.1);
}

body.theme-pipboy .meta-label {
    color: var(--pip-light-green);
    text-shadow: 0 0 3px var(--pip-green);
}

body.theme-pipboy .modal-content {
    background: var(--pip-dark);
    border-color: var(--pip-green);
    box-shadow: 0 0 30px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 255, 0, 0.1);
}

body.theme-pipboy .modal-title {
    color: var(--pip-green);
    text-shadow: 0 0 15px var(--pip-green);
}

body.theme-pipboy .close {
    color: var(--pip-amber);
    text-shadow: 0 0 8px var(--pip-amber);
}

body.theme-pipboy .close:hover {
    color: var(--pip-light-green);
    text-shadow: 0 0 12px var(--pip-light-green);
}

body.theme-pipboy .form-group label {
    color: var(--pip-light-green);
    text-shadow: 0 0 5px var(--pip-green);
}

body.theme-pipboy .form-group input,
body.theme-pipboy .form-group select,
body.theme-pipboy .form-group textarea {
    background: var(--pip-dark);
    border-color: var(--pip-green);
    color: var(--pip-green);
    text-shadow: 0 0 3px var(--pip-green);
    box-shadow: inset 0 0 8px rgba(0, 255, 0, 0.1);
}

body.theme-pipboy .form-group input:focus,
body.theme-pipboy .form-group select:focus,
body.theme-pipboy .form-group textarea:focus {
    border-color: var(--pip-amber);
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.5), inset 0 0 12px rgba(0, 255, 0, 0.15);
}

body.theme-pipboy .checkbox-group {
    background: rgba(0, 255, 0, 0.05);
    border-color: var(--pip-green);
    box-shadow: inset 0 0 5px rgba(0, 255, 0, 0.1);
}

body.theme-pipboy .control-panel {
    background: rgba(0, 255, 0, 0.05);
    border-color: var(--pip-green);
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
}

/* Login Screen Styles */
.login-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--bg-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.login-container {
    background: var(--bg-card);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    padding: 32px;
    max-width: 400px;
    width: 90%;
    max-height: 85vh;
    overflow-y: auto;
    text-align: center;
    box-shadow: var(--glow-primary);
}

.login-header h1 {
    font-family: var(--font-primary);
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0 0 8px 0;
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary), var(--accent-success));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 30px rgba(0, 212, 255, 0.6);
    letter-spacing: 2px;
    animation: glow-pulse 3s ease-in-out infinite alternate;
}

.login-subtitle {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 32px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.login-form-container {
    margin-bottom: 24px;
}

.login-form .form-group {
    text-align: left;
    margin-bottom: 20px;
}

.login-form .form-group:last-of-type {
    margin-bottom: 32px;
}

.login-form label {
    display: block;
    color: var(--text-primary);
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.login-form input {
    width: 100%;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 12px 16px;
    border-radius: 12px;
    font-family: var(--font-secondary);
    font-size: 16px;
    transition: var(--transition);
    backdrop-filter: blur(10px);
    box-sizing: border-box;
}

.login-form input:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
}

.login-btn {
    width: 100%;
    padding: 16px;
    font-size: 16px;
    font-weight: 700;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.login-error {
    background: rgba(255, 23, 68, 0.1);
    border: 1px solid var(--accent-danger);
    border-radius: 8px;
    padding: 12px;
    margin-top: 16px;
    color: var(--accent-danger);
    font-size: 14px;
    text-align: center;
}

.login-theme-selector {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
}

.login-theme-selector select {
    background: var(--bg-card);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 8px 12px;
    font-family: var(--font-secondary);
    font-size: 14px;
    cursor: pointer;
    backdrop-filter: blur(10px);
    transition: var(--transition);
}

.login-theme-selector select:hover {
    border-color: var(--accent-primary);
    box-shadow: var(--glow-primary);
}

.user-menu {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 14px;
}

#username-display {
    color: var(--accent-primary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Pip-Boy Login Theme */
body.theme-pipboy .login-screen {
    background: var(--pip-black);
}

body.theme-pipboy .login-container {
    background: var(--pip-dark);
    border-color: var(--pip-green);
    box-shadow: 0 0 30px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 255, 0, 0.1);
}

body.theme-pipboy .login-header h1 {
    background: none;
    -webkit-background-clip: unset;
    -webkit-text-fill-color: unset;
    color: var(--pip-green);
    text-shadow: 0 0 25px var(--pip-green), 0 0 50px var(--pip-green);
    text-transform: uppercase;
    animation: pip-glow 2s ease-in-out infinite alternate;
}

body.theme-pipboy .login-subtitle {
    color: var(--pip-light-green);
    text-shadow: 0 0 5px var(--pip-green);
}

body.theme-pipboy .login-form label {
    color: var(--pip-light-green);
    text-shadow: 0 0 5px var(--pip-green);
}

body.theme-pipboy .login-form input {
    background: var(--pip-dark);
    border-color: var(--pip-green);
    color: var(--pip-green);
    text-shadow: 0 0 3px var(--pip-green);
    box-shadow: inset 0 0 8px rgba(0, 255, 0, 0.1);
}

body.theme-pipboy .login-form input:focus {
    border-color: var(--pip-amber);
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.5), inset 0 0 12px rgba(0, 255, 0, 0.15);
}

body.theme-pipboy .login-btn {
    background: var(--pip-green);
    color: var(--pip-black);
    text-shadow: none;
    border: none;
}

body.theme-pipboy .login-btn:hover {
    background: var(--pip-light-green);
    box-shadow: 0 0 20px var(--pip-green);
}

body.theme-pipboy .login-error {
    background: rgba(255, 204, 0, 0.15);
    border-color: var(--pip-amber);
    color: var(--pip-amber);
    text-shadow: 0 0 5px var(--pip-amber);
}

body.theme-pipboy .login-theme-selector {
    border-color: var(--pip-green);
}

body.theme-pipboy .login-theme-selector select {
    background: var(--pip-dark);
    border-color: var(--pip-green);
    color: var(--pip-green);
    text-shadow: 0 0 5px var(--pip-green);
    box-shadow: inset 0 0 10px rgba(0, 255, 0, 0.1);
}

body.theme-pipboy .login-theme-selector select:hover {
    border-color: var(--pip-amber);
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
}

body.theme-pipboy #username-display {
    color: var(--pip-green);
    text-shadow: 0 0 8px var(--pip-green);
}

/* Super Mario 8-bit Theme Styles */
body.theme-mario {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
}

body.theme-mario .login-container,
body.theme-mario .stat-card,
body.theme-mario .app-card {
    border: 3px solid var(--mario-yellow);
    border-radius: 0;
    background: var(--mario-red);
    background-image: 
        linear-gradient(45deg, var(--mario-red) 25%, var(--mario-dark-blue) 25%),
        linear-gradient(-45deg, var(--mario-red) 25%, var(--mario-dark-blue) 25%),
        linear-gradient(45deg, var(--mario-dark-blue) 75%, var(--mario-red) 75%),
        linear-gradient(-45deg, var(--mario-dark-blue) 75%, var(--mario-red) 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    box-shadow: 
        4px 4px 0 var(--mario-brown),
        8px 8px 0 var(--mario-gray);
}

body.theme-mario .login-container:hover,
body.theme-mario .stat-card:hover,
body.theme-mario .app-card:hover {
    animation: mario-bounce 0.6s ease-in-out;
    box-shadow: 
        6px 6px 0 var(--mario-brown),
        10px 10px 0 var(--mario-gray);
}

body.theme-mario .header h1 {
    background: none;
    -webkit-background-clip: unset;
    -webkit-text-fill-color: unset;
    color: var(--mario-yellow);
    text-shadow: 
        3px 3px 0 var(--mario-red),
        6px 6px 0 var(--mario-brown);
    font-family: 'Courier New', monospace;
    font-weight: bold;
    text-transform: uppercase;
    animation: mario-bounce 2s ease-in-out infinite;
}

body.theme-mario .btn {
    border: 3px solid var(--mario-yellow);
    border-radius: 0;
    background: var(--mario-red);
    color: var(--mario-white);
    font-family: 'Courier New', monospace;
    font-weight: bold;
    text-transform: uppercase;
    box-shadow: 
        3px 3px 0 var(--mario-brown),
        6px 6px 0 var(--mario-gray);
    transition: all 0.1s ease;
}

body.theme-mario .btn:hover {
    transform: translate(2px, 2px);
    box-shadow: 
        1px 1px 0 var(--mario-brown),
        3px 3px 0 var(--mario-gray);
}

body.theme-mario .btn-primary {
    background: var(--mario-green);
    border-color: var(--mario-yellow);
    color: var(--mario-white);
}

body.theme-mario .btn::before {
    background: none;
}

body.theme-mario .stat-number {
    color: var(--mario-yellow);
    text-shadow: 
        2px 2px 0 var(--mario-red),
        4px 4px 0 var(--mario-brown);
    font-family: 'Courier New', monospace;
    animation: coin-spin 3s ease-in-out infinite;
}

body.theme-mario .app-title {
    color: var(--mario-yellow);
    text-shadow: 
        1px 1px 0 var(--mario-red),
        2px 2px 0 var(--mario-brown);
    font-family: 'Courier New', monospace;
    font-weight: bold;
}

body.theme-mario .app-url {
    color: var(--mario-beige);
    text-shadow: 1px 1px 0 var(--mario-brown);
}

body.theme-mario .app-url:hover {
    color: var(--mario-yellow);
    text-shadow: 
        1px 1px 0 var(--mario-red),
        2px 2px 0 var(--mario-brown);
}

body.theme-mario .app-status.online {
    background: var(--mario-green);
    color: var(--mario-white);
    border: 2px solid var(--mario-yellow);
    border-radius: 0;
    text-shadow: 1px 1px 0 var(--mario-brown);
}

body.theme-mario .app-status.offline {
    background: var(--mario-red);
    color: var(--mario-white);
    border: 2px solid var(--mario-yellow);
    border-radius: 0;
    text-shadow: 1px 1px 0 var(--mario-brown);
}

body.theme-mario .app-status.unknown {
    background: var(--mario-gray);
    color: var(--mario-white);
    border: 2px solid var(--mario-yellow);
    border-radius: 0;
    text-shadow: 1px 1px 0 var(--mario-brown);
}

body.theme-mario .form-group input,
body.theme-mario .form-group select,
body.theme-mario .form-group textarea {
    border: 3px solid var(--mario-yellow);
    border-radius: 0;
    background: var(--mario-white);
    color: var(--mario-black);
    font-family: 'Courier New', monospace;
    box-shadow: 
        2px 2px 0 var(--mario-brown),
        4px 4px 0 var(--mario-gray);
}

body.theme-mario .form-group input:focus,
body.theme-mario .form-group select:focus,
body.theme-mario .form-group textarea:focus {
    border-color: var(--mario-red);
    box-shadow: 
        3px 3px 0 var(--mario-brown),
        6px 6px 0 var(--mario-gray);
}

body.theme-mario .modal-content {
    border: 4px solid var(--mario-yellow);
    border-radius: 0;
    background: var(--mario-blue);
    box-shadow: 
        6px 6px 0 var(--mario-brown),
        12px 12px 0 var(--mario-gray);
}

body.theme-mario .modal-title {
    color: var(--mario-yellow);
    text-shadow: 
        2px 2px 0 var(--mario-red),
        4px 4px 0 var(--mario-brown);
    font-family: 'Courier New', monospace;
    font-weight: bold;
}

body.theme-mario .login-header h1 {
    background: none;
    -webkit-background-clip: unset;
    -webkit-text-fill-color: unset;
    color: var(--mario-yellow);
    text-shadow: 
        3px 3px 0 var(--mario-red),
        6px 6px 0 var(--mario-brown);
    text-transform: uppercase;
    animation: mario-bounce 2s ease-in-out infinite;
}

body.theme-mario .login-subtitle {
    color: var(--mario-beige);
    text-shadow: 1px 1px 0 var(--mario-brown);
    font-family: 'Courier New', monospace;
}

body.theme-mario .login-form label {
    color: var(--mario-yellow);
    text-shadow: 1px 1px 0 var(--mario-brown);
    font-family: 'Courier New', monospace;
    font-weight: bold;
}

body.theme-mario .login-form input {
    border: 3px solid var(--mario-yellow);
    border-radius: 0;
    background: var(--mario-white);
    color: var(--mario-black);
    box-shadow: 
        2px 2px 0 var(--mario-brown),
        4px 4px 0 var(--mario-gray);
}

body.theme-mario .login-form input:focus {
    border-color: var(--mario-red);
    box-shadow: 
        3px 3px 0 var(--mario-brown),
        6px 6px 0 var(--mario-gray);
}

body.theme-mario .login-btn {
    background: var(--mario-green);
    border: 3px solid var(--mario-yellow);
    border-radius: 0;
    color: var(--mario-white);
    font-family: 'Courier New', monospace;
    font-weight: bold;
    text-transform: uppercase;
    box-shadow: 
        3px 3px 0 var(--mario-brown),
        6px 6px 0 var(--mario-gray);
}

body.theme-mario .login-btn:hover {
    transform: translate(2px, 2px);
    box-shadow: 
        1px 1px 0 var(--mario-brown),
        3px 3px 0 var(--mario-gray);
}

body.theme-mario .theme-selector select,
body.theme-mario .login-theme-selector select {
    border: 3px solid var(--mario-yellow);
    border-radius: 0;
    background: var(--mario-white);
    color: var(--mario-black);
    font-family: 'Courier New', monospace;
    font-weight: bold;
    box-shadow: 
        2px 2px 0 var(--mario-brown),
        4px 4px 0 var(--mario-gray);
}

body.theme-mario #username-display {
    color: var(--mario-yellow);
    text-shadow: 
        1px 1px 0 var(--mario-red),
        2px 2px 0 var(--mario-brown);
    font-family: 'Courier New', monospace;
    font-weight: bold;
}

body.theme-mario .control-panel {
    border: 3px solid var(--mario-yellow);
    border-radius: 0;
    background: var(--mario-red);
    box-shadow: 
        4px 4px 0 var(--mario-brown),
        8px 8px 0 var(--mario-gray);
}

body.theme-mario .search-input {
    border: 3px solid var(--mario-yellow);
    border-radius: 0;
    background: var(--mario-white);
    color: var(--mario-black);
    font-family: 'Courier New', monospace;
    box-shadow: 
        2px 2px 0 var(--mario-brown),
        4px 4px 0 var(--mario-gray);
}

body.theme-mario .search-input:focus {
    border-color: var(--mario-red);
    box-shadow: 
        3px 3px 0 var(--mario-brown),
        6px 6px 0 var(--mario-gray);
}
`;

export const SCRIPT = `// AppWatch Dashboard - Modern JavaScript with Authentication

// Authentication Management
class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
    }

    async checkAuth() {
        try {
            const response = await fetch('/api/auth/user');
            const data = await response.json();
            
            if (data.success && data.auth.authenticated) {
                this.isAuthenticated = true;
                this.currentUser = data.auth.user;
                return true;
            } else {
                this.isAuthenticated = false;
                this.currentUser = null;
                return false;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.isAuthenticated = false;
            this.currentUser = null;
            return false;
        }
    }

    async login(username, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            if (data.success) {
                this.isAuthenticated = true;
                this.currentUser = data.user;
                return { success: true };
            } else {
                return { success: false, error: data.error || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error occurred' };
        }
    }

    async logout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.isAuthenticated = false;
            this.currentUser = null;
            this.showLogin();
        }
    }

    showLogin() {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('main-dashboard').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-dashboard').style.display = 'block';
        
        // Update username display
        if (this.currentUser) {
            const usernameDisplay = document.getElementById('username-display');
            if (usernameDisplay) {
                usernameDisplay.textContent = this.currentUser.username;
            }
        }
    }
}

// Global theme functions
window.changeTheme = function(theme) {
    // Set theme class
    document.body.className = '';
    if (theme === 'pipboy') {
        document.body.className = 'theme-pipboy';
    } else if (theme === 'mario') {
        document.body.className = 'theme-mario';
    }
    
    localStorage.setItem('appwatch-theme', theme);
    
    // Update title based on theme for both login and dashboard
    const titles = {
        login: theme === 'pipboy' ? 
            'ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL' : 
            theme === 'mario' ?
            'SUPER MARIO WORLD' :
            'AppWatch',
        dashboard: theme === 'pipboy' ? 
            'ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL' : 
            theme === 'mario' ?
            'SUPER MARIO WORLD' :
            'AppWatch'
    };
    
    const subtitles = {
        login: theme === 'pipboy' ? 
            'TERMINAL ACCESS PROTOCOL' : 
            theme === 'mario' ?
            'WARP ZONE MONITORING SYSTEM' :
            'Galactic Monitoring Station',
        dashboard: theme === 'pipboy' ? 
            'TERMINAL ACCESS PROTOCOL' : 
            theme === 'mario' ?
            'WARP ZONE MONITORING SYSTEM' :
            'Galactic Monitoring Station'
    };
    
    // Update login screen
    const loginTitle = document.getElementById('login-title');
    const loginSubtitle = document.getElementById('login-subtitle');
    if (loginTitle) loginTitle.textContent = titles.login;
    if (loginSubtitle) loginSubtitle.textContent = subtitles.login;
    
    // Update dashboard
    const dashboardTitle = document.querySelector('#main-dashboard h1');
    const dashboardSubtitle = document.querySelector('#main-dashboard .subtitle');
    if (dashboardTitle) dashboardTitle.textContent = titles.dashboard;
    if (dashboardSubtitle) dashboardSubtitle.textContent = subtitles.dashboard;
    
    const notificationMessages = {
        'space': 'SPACE STATION THEME ACTIVATED',
        'pipboy': 'TERMINAL THEME ACTIVATED', 
        'mario': 'MAMMA MIA! 8-BIT THEME ACTIVATED! 🍄'
    };
    
    showNotification(
        notificationMessages[theme] || 'THEME ACTIVATED',
        'success'
    );
};

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('appwatch-theme') || 'space';
    
    // Login theme selector
    const loginThemeSelector = document.getElementById('login-theme-selector');
    if (loginThemeSelector) {
        loginThemeSelector.value = savedTheme;
        loginThemeSelector.addEventListener('change', function() {
            changeTheme(this.value);
        });
    }
    
    // Dashboard theme selector
    const themeSelector = document.getElementById('themeSelector');
    if (themeSelector) {
        themeSelector.value = savedTheme;
        themeSelector.addEventListener('change', function() {
            changeTheme(this.value);
        });
    }
    
    changeTheme(savedTheme);
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.textContent = message;
    notification.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 16px 20px;
        max-width: 400px;
        z-index: 3000;
        transform: translateX(100%);
        transition: all 0.3s ease;
        box-shadow: var(--glow-primary);
    \`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

class AppWatchDashboard {
    constructor() {
        this.apps = [];
        this.authManager = new AuthManager();
        this.init();
    }

    async init() {
        initializeTheme();
        
        // Check authentication first
        const isAuthenticated = await this.authManager.checkAuth();
        
        if (isAuthenticated) {
            this.authManager.showDashboard();
            this.setupEventListeners();
            await this.loadStats();
            await this.loadApps();
            this.startAutoRefresh();
        } else {
            this.authManager.showLogin();
            this.setupLoginEventListeners();
        }
    }

    setupLoginEventListeners() {
        const loginForm = document.getElementById('login-form');
        const loginError = document.getElementById('login-error');
        
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const submitBtn = loginForm.querySelector('.login-btn');
                
                // Show loading state
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Connecting...';
                submitBtn.disabled = true;
                loginError.style.display = 'none';
                
                try {
                    const result = await this.authManager.login(username, password);
                    
                    if (result.success) {
                        // Login successful - initialize dashboard
                        this.authManager.showDashboard();
                        this.setupEventListeners();
                        await this.loadStats();
                        await this.loadApps();
                        this.startAutoRefresh();
                        
                        // Clear form
                        loginForm.reset();
                    } else {
                        // Show error
                        loginError.textContent = result.error;
                        loginError.style.display = 'block';
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    loginError.textContent = 'Connection failed. Please try again.';
                    loginError.style.display = 'block';
                } finally {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            });
        }
    }

    setupEventListeners() {
        // Add App Modal
        const addAppBtn = document.getElementById('add-app-btn');
        const modal = document.getElementById('add-app-modal');
        const closeBtn = modal.querySelector('.close');
        const form = document.getElementById('add-app-form');

        addAppBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            form.reset();
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                form.reset();
            }
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addApp();
        });

        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        refreshBtn.addEventListener('click', async () => {
            await this.refreshAll();
        });

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await this.authManager.logout();
            });
        }
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
        document.getElementById('total-apps').textContent = stats.total;
        document.getElementById('online-apps').textContent = stats.online;
        document.getElementById('offline-apps').textContent = stats.offline;
        document.getElementById('avg-uptime').textContent = stats.avg_uptime + '%';
    }

    async loadApps() {
        try {
            const response = await fetch('/api/apps');
            const data = await response.json();
            
            if (data.success) {
                this.apps = data.apps;
                this.renderApps();
            }
        } catch (error) {
            console.error('Error loading apps:', error);
            this.showError('Kunde inte ladda appar');
        }
    }

    renderApps() {
        const grid = document.getElementById('apps-grid');
        
        if (this.apps.length === 0) {
            grid.innerHTML = \`
                <div class="empty-state">
                    <h3>No starships to monitor yet</h3>
                    <p>Add your first starship to get started!</p>
                </div>
            \`;
            return;
        }

        grid.innerHTML = this.apps.map(app => this.createAppCard(app)).join('');
        
        // Add event listeners to app cards
        this.setupAppEventListeners();
    }

    createAppCard(app) {
        const statusClass = app.status || 'unknown';
        const statusText = this.getStatusText(app.status);
        const lastChecked = app.last_checked ? 
            new Date(app.last_checked).toLocaleString('sv-SE') : 'Aldrig';
        const responseTime = app.response_time ? app.response_time + 'ms' : '-';

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
                    '<span class="meta-label">Senast kollad:</span><br>' +
                    lastChecked +
                '</div>' +
                '<div class="meta-item">' +
                    '<span class="meta-label">Svarstid:</span><br>' +
                    responseTime +
                '</div>' +
            '</div>' +
            '<div class="app-actions">' +
                '<button class="btn btn-secondary btn-small check-btn" data-app-id="' + app.id + '">' +
                    'Scan' +
                '</button>' +
                '<button class="btn btn-danger btn-small delete-btn" data-app-id="' + app.id + '">' +
                    'Remove' +
                '</button>' +
            '</div>' +
        '</div>';
    }

    setupAppEventListeners() {
        // Check status buttons
        document.querySelectorAll('.check-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const appId = e.target.dataset.appId;
                await this.checkAppStatus(appId);
            });
        });

        // Delete buttons
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
        const formData = new FormData(form);
        
        const appData = {
            name: formData.get('app-name') || document.getElementById('app-name').value,
            url: formData.get('app-url') || document.getElementById('app-url').value,
            description: formData.get('app-description') || document.getElementById('app-description').value
        };

        try {
            const response = await fetch('/api/apps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(appData)
            });

            const data = await response.json();

            if (data.success) {
                // Close modal and reset form
                document.getElementById('add-app-modal').style.display = 'none';
                form.reset();
                
                // Reload apps and stats
                await this.loadApps();
                await this.loadStats();
                
                this.showSuccess('"' + appData.name + '" har lagts till!');
            } else {
                this.showError(data.error || 'Kunde inte lägga till app');
            }
        } catch (error) {
            console.error('Error adding app:', error);
            this.showError('Kunde inte lägga till app');
        }
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
                // Update app in local array
                const appIndex = this.apps.findIndex(a => a.id === appId);
                if (appIndex !== -1) {
                    this.apps[appIndex] = {
                        ...this.apps[appIndex],
                        status: data.status,
                        last_checked: data.checked_at,
                        response_time: data.response_time
                    };
                }
                
                // Re-render apps and update stats
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
                // Remove from local array
                this.apps = this.apps.filter(a => a.id !== appId);
                
                // Re-render and update stats
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
            // Check status for all apps
            const checkPromises = this.apps.map(app => 
                fetch('/api/apps/' + app.id + '/check', { method: 'POST' })
            );
            
            await Promise.allSettled(checkPromises);
            
            // Reload data
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
            'online': '●',
            'offline': '●',
            'unknown': '●'
        };
        return iconMap[status] || '●';
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
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification notification-' + type;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'success' ? '#10b981' : '#ef4444'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    startAutoRefresh() {
        // Auto-refresh every 5 minutes
        setInterval(async () => {
            await this.loadStats();
            console.log('Auto-refreshed stats');
        }, 5 * 60 * 1000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AppWatchDashboard();
}); 
`;