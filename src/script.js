// AppWatch Dashboard - Modern JavaScript

// Theme Management (moved to global scope above)

// Global theme functions
window.changeTheme = function(theme) {
    document.body.className = theme === 'pipboy' ? 'theme-pipboy' : '';
    localStorage.setItem('appwatch-theme', theme);
    
    // Update title based on theme
    const title = theme === 'pipboy' ? 
        'ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL' : 
        'AppWatch';
    document.querySelector('h1').textContent = title;
    document.querySelector('.subtitle').textContent = theme === 'pipboy' ? 
        'TERMINAL ACCESS PROTOCOL' : 
        'Galactic Monitoring Station';
    
    showNotification(
        theme === 'pipboy' ? 
            'TERMINAL THEME ACTIVATED' : 
            'SPACE STATION THEME ACTIVATED',
        'success'
    );
};

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('appwatch-theme') || 'space';
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
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
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
    `;
    
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
        this.init();
    }

    async init() {
        initializeTheme();
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
        document.getElementById('avg-uptime').textContent = `${stats.avg_uptime}%`;
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
            grid.innerHTML = `
                <div class="empty-state">
                    <h3>No starships to monitor yet</h3>
                    <p>Add your first starship to get started!</p>
                </div>
            `;
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
        const responseTime = app.response_time ? `${app.response_time}ms` : '-';

        return `
            <div class="app-card status-${statusClass}" data-app-id="${app.id}">
                <div class="app-header">
                    <div>
                        <div class="app-title">${this.escapeHtml(app.name)}</div>
                        <a href="${app.url}" target="_blank" class="app-url">${app.url}</a>
                    </div>
                    <div class="app-status ${statusClass}">
                        ${this.getStatusIcon(app.status)} ${statusText}
                    </div>
                </div>
                
                ${app.description ? `<div class="app-description">${this.escapeHtml(app.description)}</div>` : ''}
                
                <div class="app-meta">
                    <div class="meta-item">
                        <span class="meta-label">Senast kollad:</span><br>
                        ${lastChecked}
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Svarstid:</span><br>
                        ${responseTime}
                    </div>
                </div>
                
                <div class="app-actions">
                    <button class="btn btn-secondary btn-small check-btn" data-app-id="${app.id}">
                        Scan
                    </button>
                    <button class="btn btn-danger btn-small delete-btn" data-app-id="${app.id}">
                        Remove
                    </button>
                </div>
            </div>
        `;
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
                
                if (confirm(`Är du säker på att du vill ta bort "${app.name}"?`)) {
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
                
                this.showSuccess(`"${appData.name}" har lagts till!`);
            } else {
                this.showError(data.error || 'Kunde inte lägga till app');
            }
        } catch (error) {
            console.error('Error adding app:', error);
            this.showError('Kunde inte lägga till app');
        }
    }

    async checkAppStatus(appId) {
        const btn = document.querySelector(`[data-app-id="${appId}"].check-btn`);
        const originalText = btn.textContent;
        
        btn.innerHTML = '<span class="spinner"></span> Kollar...';
        btn.disabled = true;

        try {
            const response = await fetch(`/api/apps/${appId}/check`, {
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
                this.showSuccess(`Status uppdaterad: ${statusText}`);
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
            const response = await fetch(`/api/apps/${appId}`, {
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
                fetch(`/api/apps/${app.id}/check`, { method: 'POST' })
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
        notification.className = `notification notification-${type}`;
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