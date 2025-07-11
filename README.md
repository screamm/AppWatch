# 🚀 AppWatch Dashboard

> **Modern monitoring dashboard med dual-tema system - Space Station & Pip-Boy Terminal**

![Status](https://img.shields.io/badge/status-🛸%20operational-brightgreen)
![Platform](https://img.shields.io/badge/platform-🌌%20Cloudflare%20Workers-blue)
![Themes](https://img.shields.io/badge/themes-🌟%20space%20%7C%20🎮%20pipboy-purple)
![License](https://img.shields.io/badge/license-ISC-blue)

## 🌌 Overview

AppWatch Dashboard är en futuristisk monitoring-lösning med två distinkta teman för att övervaka dina applikationer. Välj mellan det eleganta Space Station-temat eller det retro-futuristiska Pip-Boy Terminal-temat från Fallout-universumet.

### 🎨 Dual Theme System

**🌟 Space Station Theme:**
- 🌌 **Animated Starfield** - Twinklande stjärnor i rörlig bakgrund
- ✨ **Glassmorfism UI** - Futuristisk glasbur-design med backdrop blur
- 🌈 **Neon Glow Effects** - Cyan, pink och grön sci-fi-glow
- 🚀 **Orbitron Typography** - Autentisk space-station typsnitt

**🎮 Pip-Boy Terminal Theme:**
- 💚 **Retro CRT Display** - Autentisk terminal-känsla med scanlines
- 🟢 **Monochrome Green** - Klassisk grön-på-svart färgschema
- ⚡ **CRT Flicker Effects** - Subtila flimmer-animationer
- 🖥️ **Share Tech Mono** - Autentisk terminal-typsnitt

### 📊 Modern Dashboard Features

**🎯 Real-time Monitoring:**
- 📱 **App Management** - Lägg till, redigera och ta bort applikationer
- ⚡ **Live Status Tracking** - Real-time övervakning med auto-refresh
- 📊 **Statistics Dashboard** - Fleet Size, Active, Offline, Efficiency
- 📈 **Response Time Analytics** - Detaljerad prestanda-tracking
- 🔄 **Auto Health Checks** - Konfigurerbar scan-intervaller

**🎮 Advanced Interface:**
- 🔍 **Real-time Search** - Instant filtrering av applikationer
- 🎨 **Theme Switcher** - Växla mellan Space Station och Pip-Boy
- 📊 **Data Export** - Exportera monitoring-data som JSON
- ⌨️ **Keyboard Shortcuts** - Snabba kommandon för power users
- 📱 **Responsive Design** - Optimerad för desktop, tablet och mobil

**🛠️ App Configuration:**
- 🏷️ **Categories** - Web Application, API Service, Database, Microservice, Other
- ⏱️ **Custom Intervals** - Konfigurera scan-frekvens per app
- 🔔 **Alert System** - Aktivera/inaktivera notifikationer
- ⚙️ **Timeout Settings** - Anpassade timeout-värden
- 📝 **Descriptions** - Detaljerad app-dokumentation

## 🛠️ Tech Stack

- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Deployment**: Wrangler CLI
- **Styling**: Modern CSS med Flexbox/Grid, CSS Variables
- **Fonts**: Google Fonts (Orbitron, Exo 2, Share Tech Mono)

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Cloudflare Account

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/screamm/AppWatch.git
cd AppWatch
```

2. **Install Dependencies**
```bash
npm install
```

3. **Setup Cloudflare D1 Database**
```bash
# Create database
wrangler d1 create appwatch_db

# Update database_id in wrangler.toml with generated ID

# Run database migration
wrangler d1 execute appwatch_db --file=./schema.sql
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Open Dashboard**
```
http://localhost:8787
```

### 🌐 Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy
```

## 🎮 Usage Guide

### Adding New Apps

1. Click "**Add App**" button
2. Fill in app details:
   - **App Name** - Your application name
   - **URL** - Application URL to monitor
   - **Description** - What the app does
   - **Category** - Select appropriate category
   - **Scan Interval** - How often to check (5min - 1hr)
   - **Timeout** - Request timeout in milliseconds
3. Enable **Alert Notifications** for automatic alerts
4. Click "**Add App**" to start monitoring

### Status Indicators

- **🟢 Online** - App is responding correctly
- **🔴 Offline** - App is not responding or returns error
- **🟡 Unknown** - Status not yet determined (newly added)

### Theme Switching

Use the theme selector in the header to switch between:
- **Space Station** - Modern space-themed interface
- **Pip-Boy Terminal** - Retro Fallout-inspired terminal

### Keyboard Shortcuts

- `Ctrl + K` - Open search
- `Ctrl + N` - Add new app
- `Ctrl + R` - Refresh all apps
- `Escape` - Close modals

### Dashboard Actions

- **📡 Scan** - Perform immediate health check
- **🗑️ Remove** - Delete app from monitoring
- **🔄 Scan All** - Check status of all apps
- **📊 Export Data** - Download monitoring data as JSON

## 🔌 API Endpoints

AppWatch provides a REST API for programmatic access:

```javascript
// Get all apps
GET /api/apps

// Add new app
POST /api/apps
{
  "name": "My App",
  "url": "https://myapp.com",
  "description": "App description",
  "category": "web",
  "check_interval": 300,
  "timeout": 10000,
  "enable_alerts": true
}

// Check app status
POST /api/apps/{id}/check

// Delete app
DELETE /api/apps/{id}

// Get statistics
GET /api/stats

// Export data
GET /api/export

// Get app history
GET /api/apps/{id}/history
```

## 🗄️ Database Schema

### `apps` - Application Information
- `id` - Unique app ID (UUID)
- `name` - Application name
- `url` - Application URL
- `description` - App description
- `category` - App category (web/api/database/microservice/other)
- `status` - Current status (online/offline/unknown)
- `response_time` - Response time in milliseconds
- `uptime_percentage` - Uptime percentage
- `check_interval` - Scan interval in seconds
- `timeout` - Request timeout in milliseconds
- `enable_alerts` - Alert notifications enabled
- `last_checked` - Last check timestamp
- `created_at` - Creation timestamp

### `status_logs` - Status History
- `id` - Log entry ID
- `app_id` - Reference to app
- `status` - Status at time of check
- `response_time` - Response time in milliseconds
- `checked_at` - Check timestamp
- `error_message` - Error message if any

### `alerts` - Alert Configuration
- `id` - Alert ID
- `app_id` - Reference to app
- `alert_type` - Type of alert
- `threshold` - Alert threshold
- `enabled` - Alert enabled status

### `sla_configs` - SLA Configuration
- `id` - SLA config ID
- `app_id` - Reference to app
- `target_uptime` - Target uptime percentage
- `response_time_threshold` - Response time threshold

## 🎨 Customization

### Adding New Themes

1. Define theme variables in `src/assets.js`
2. Add theme-specific styles
3. Update theme selector in HTML
4. Add theme logic in JavaScript

### Custom Categories

Modify the category options in the Add App modal by updating the select options in `src/index.js`.

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🍴 Fork the project
2. 🌱 Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔄 Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Fallout's Pip-Boy interface
- Space theme inspired by modern sci-fi aesthetics
- Built with Cloudflare Workers platform
- Typography by Google Fonts

---

**Made with 💚 by the AppWatch Team** 