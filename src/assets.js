// AppWatch Dashboard - Static Assets för Cloudflare Workers

export const CSS = `/* AppWatch Dashboard - Modern Monitoring Styles */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary-color: #3b82f6;
    --primary-dark: #2563eb;
    --success-color: #10b981;
    --danger-color: #ef4444;
    --warning-color: #f59e0b;
    --gray-50: #f9fafb;
    --gray-100: #f3f4f6;
    --gray-200: #e5e7eb;
    --gray-300: #d1d5db;
    --gray-600: #4b5563;
    --gray-800: #1f2937;
    --gray-900: #111827;
    --border-radius: 12px;
    --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    color: var(--gray-800);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* Header */
.header {
    text-align: center;
    margin-bottom: 30px;
    color: white;
}

.header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header p {
    font-size: 1.1rem;
    opacity: 0.9;
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    background: white;
    padding: 24px;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    text-align: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.stat-card h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--gray-600);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
}

.stat-card span {
    font-size: 2rem;
    font-weight: 700;
    color: var(--gray-900);
}

.status-online {
    color: var(--success-color) !important;
}

.status-offline {
    color: var(--danger-color) !important;
}

/* Actions */
.actions {
    display: flex;
    gap: 15px;
    margin-bottom: 30px;
    justify-content: center;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.btn-primary {
    background: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
}

.btn-secondary {
    background: white;
    color: var(--gray-800);
    border: 1px solid var(--gray-300);
}

.btn-secondary:hover {
    background: var(--gray-50);
    transform: translateY(-1px);
}

.btn-danger {
    background: var(--danger-color);
    color: white;
}

.btn-danger:hover {
    background: #dc2626;
}

/* Apps Grid */
.apps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
}

.app-card {
    background: white;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    padding: 24px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    position: relative;
    overflow: hidden;
}

.app-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.app-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--gray-300);
}

.app-card.status-online::before {
    background: var(--success-color);
}

.app-card.status-offline::before {
    background: var(--danger-color);
}

.app-card.status-unknown::before {
    background: var(--warning-color);
}

.app-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
}

.app-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--gray-900);
    margin-bottom: 4px;
}

.app-url {
    font-size: 0.875rem;
    color: var(--primary-color);
    text-decoration: none;
    word-break: break-all;
}

.app-url:hover {
    text-decoration: underline;
}

.app-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.app-status.online {
    background: #d1fae5;
    color: #065f46;
}

.app-status.offline {
    background: #fee2e2;
    color: #991b1b;
}

.app-status.unknown {
    background: #fef3c7;
    color: #92400e;
}

.app-description {
    color: var(--gray-600);
    font-size: 0.875rem;
    margin-bottom: 16px;
    line-height: 1.5;
}

.app-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
    font-size: 0.875rem;
}

.meta-item {
    color: var(--gray-600);
}

.meta-label {
    font-weight: 600;
    color: var(--gray-800);
}

.app-actions {
    display: flex;
    gap: 8px;
}

.btn-small {
    padding: 6px 12px;
    font-size: 0.75rem;
    border-radius: 6px;
}

/* Modal */
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
}

.modal-content {
    background: white;
    margin: 50px auto;
    padding: 30px;
    border-radius: var(--border-radius);
    width: 90%;
    max-width: 500px;
    box-shadow: var(--shadow-lg);
    position: relative;
}

.close {
    color: var(--gray-600);
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    line-height: 1;
}

.close:hover {
    color: var(--gray-900);
}

/* Form */
.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 600;
    color: var(--gray-800);
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--gray-300);
    border-radius: 6px;
    font-size: 0.875rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group textarea {
    resize: vertical;
    min-height: 80px;
}

/* Loading States */
.loading {
    opacity: 0.6;
    pointer-events: none;
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

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--gray-600);
}

.empty-state h3 {
    font-size: 1.25rem;
    margin-bottom: 8px;
    color: var(--gray-800);
}

/* Responsive */
@media (max-width: 768px) {
    .container {
        padding: 15px;
    }
    
    .header h1 {
        font-size: 2rem;
    }
    
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
    }
    
    .apps-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }
    
    .actions {
        flex-direction: column;
        align-items: center;
    }
    
    .app-meta {
        grid-template-columns: 1fr;
        gap: 8px;
    }
}

@media (max-width: 480px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }
    
    .app-actions {
        flex-direction: column;
    }
}`;

export const JS = `// AppWatch Dashboard - Modern JavaScript

class AppWatchDashboard {
    constructor() {
        this.apps = [];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadStats();
        await this.loadApps();
        this.startAutoRefresh();
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
            grid.innerHTML = '<div class="empty-state"><h3>🎯 Inga appar att övervaka än</h3><p>Lägg till din första app för att komma igång!</p></div>';
            return;
        }

        grid.innerHTML = this.apps.map(app => this.createAppCard(app)).join('');
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
                    '<span class="meta-label">Senast kollad:</span><br>' + lastChecked +
                '</div>' +
                '<div class="meta-item">' +
                    '<span class="meta-label">Svarstid:</span><br>' + responseTime +
                '</div>' +
            '</div>' +
            '<div class="app-actions">' +
                '<button class="btn btn-secondary btn-small check-btn" data-app-id="' + app.id + '">' +
                    '🔍 Kolla Status' +
                '</button>' +
                '<button class="btn btn-danger btn-small delete-btn" data-app-id="' + app.id + '">' +
                    '🗑️ Ta bort' +
                '</button>' +
            '</div>' +
        '</div>';
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
            description: document.getElementById('app-description').value
        };

        try {
            const response = await fetch('/api/apps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appData)
            });

            const data = await response.json();

            if (data.success) {
                document.getElementById('add-app-modal').style.display = 'none';
                form.reset();
                
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
        const notification = document.createElement('div');
        notification.className = 'notification notification-' + type;
        notification.textContent = message;
        
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
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    startAutoRefresh() {
        setInterval(async () => {
            await this.loadStats();
            console.log('Auto-refreshed stats');
        }, 5 * 60 * 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AppWatchDashboard();
});`; 