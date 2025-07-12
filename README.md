# 🚀 AppWatch Dashboard

> **Säker monitoring dashboard med tri-tema system och lösenordsskydd - Space Station, Pip-Boy Terminal & Super Mario 8-bit**

![Status](https://img.shields.io/badge/status-🛸%20operational-brightgreen)
![Platform](https://img.shields.io/badge/platform-🌌%20Cloudflare%20Workers-blue)
![Themes](https://img.shields.io/badge/themes-🌟%20space%20%7C%20🎮%20pipboy%20%7C%20🍄%20mario-purple)
![Security](https://img.shields.io/badge/security-🔐%20PBKDF2%20protected-red)
![License](https://img.shields.io/badge/license-ISC-blue)

## 🌌 Overview

AppWatch Dashboard är en säker, futuristisk monitoring-lösning med lösenordsskydd och tre distinkta teman för att övervaka dina applikationer. Välj mellan det eleganta Space Station-temat, det retro-futuristiska Pip-Boy Terminal-temat från Fallout-universumet, eller det nostalgiska Super Mario 8-bit-temat från Nintendo-eran.

### 🔐 Security Features

**🛡️ Enterprise Security:**
- 🔑 **PBKDF2 Authentication** - 100,000 iterationer för säker lösenordshashing
- 🍪 **Secure Session Cookies** - HttpOnly, Secure, SameSite protection
- ⏰ **Session Timeout** - 8-timmars automatisk utloggning
- 🧹 **Session Cleanup** - Automatisk cleanup av utgångna sessioner
- 👤 **User Management** - Multi-user support med roller
- 🔄 **Lösenordsbyte** - Säker lösenordsändrings-funktion

**🎮 Autentiserad Pip-Boy Experience:**
- 🖥️ **Terminal Login Screen** - Autentisk ROBCO INDUSTRIES inloggning
- 💚 **CRT Login Effects** - Scanlines och terminal-glow på login
- 🔐 **Secured Dashboard** - Endast autentiserade användare får åtkomst
- 🚪 **Logout Function** - Säker utloggning med session-rensning

### 🎨 Tri-Theme System

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

**🍄 Super Mario 8-bit Theme:**
- 🎮 **Pixel Perfect Design** - Autentisk 8-bit pixel art estetik
- 🟥 **Classic Nintendo Colors** - Röd, blå, gul från originalspelet
- 🪙 **Coin Spin Animations** - Roterande statistik som gyllene mynt
- 🧱 **Block Patterns** - Tegelblock-mönster och 3D-skuggor
- 🎯 **Mario Bounce Effects** - Hopp-animationer på hover
- 📟 **Courier New Typography** - Monospace för pixel-font känsla

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

6. **Login to Dashboard**
```
Standard inloggning:
Användarnamn: admin
Lösenord: AppWatch2024!

⚠️ VIKTIGT: Byt lösenordet första gången du loggar in!
```

### 🌐 Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy
```

## 🎮 Usage Guide

### 🔐 Authentication & Login

**First Time Setup:**
1. Navigate to your AppWatch dashboard
2. Select theme (Space Station or Pip-Boy Terminal)
3. Login with default credentials:
   - **Username:** `admin`
   - **Password:** `AppWatch2024!`
4. **VIKTIGT:** Change password immediately via settings

**Login Features:**
- 🎨 **Theme Selection** - Choose theme before login
- 🔄 **Auto Session Management** - 8-hour session timeout
- 🚪 **Secure Logout** - Click logout button to end session safely
- ⚡ **Remember Theme** - Theme preference saved locally

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
- **Super Mario 8-bit** - Nostalgic Nintendo-inspired pixel art

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

### 🔐 Authentication Endpoints

```javascript
// Login
POST /api/auth/login
{
  "username": "admin",
  "password": "AppWatch2024!"
}

// Logout
POST /api/auth/logout

// Change password
POST /api/auth/change-password
{
  "current_password": "old_password",
  "new_password": "new_password"
}

// Get user info
GET /api/auth/user
```

### 📱 Application Endpoints

```javascript
// Get all apps (requires authentication)
GET /api/apps

// Add new app (requires authentication)
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

// Check app status (requires authentication)
POST /api/apps/{id}/check

// Delete app (requires authentication)
DELETE /api/apps/{id}

// Get statistics (requires authentication)
GET /api/stats

// Export data (requires authentication)
GET /api/export

// Get app history (requires authentication)
GET /api/apps/{id}/history
```

### 🔒 Security Notes

- All endpoints (except authentication) require valid session cookies
- Session cookies are HttpOnly and Secure
- Sessions expire after 8 hours of inactivity
- Failed login attempts are logged for security monitoring

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

### `auth_users` - User Authentication
- `id` - User ID
- `username` - Username (unique)
- `password_hash` - PBKDF2 hashed password
- `salt` - Password salt
- `role` - User role (admin/user)
- `created_at` - Account creation timestamp
- `last_login` - Last login timestamp

### `auth_sessions` - Active Sessions
- `id` - Session ID
- `user_id` - Reference to user
- `session_token` - Secure session token
- `expires_at` - Session expiration
- `created_at` - Session creation timestamp

## 🎨 Customization

### Adding New Themes

1. Define theme variables in `src/assets.js`
2. Add theme-specific styles with `body.theme-yourtheme` selector
3. Update theme selector options in HTML (both login and dashboard)
4. Add theme logic in JavaScript `changeTheme()` function

**Example themes already implemented:**
- `theme-pipboy` - Fallout terminal aesthetic
- `theme-mario` - Nintendo 8-bit pixel art style

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
- Super Mario theme inspired by classic Nintendo 8-bit games
- Built with Cloudflare Workers platform
- Typography by Google Fonts

---

**Made with 💚 by the AppWatch Team** 