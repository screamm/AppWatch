# 🚀 AppWatch Dashboard

# 🚀 AppWatch Galactic Monitoring Station

> **En spektakulär rymdinspirerad monitoring-dashboard för övervakad av alla dina starships (appar)**

![Status](https://img.shields.io/badge/status-🛸%20galactic%20active-brightgreen)
![Platform](https://img.shields.io/badge/platform-🌌%20Cloudflare%20Workers-blue)
![Theme](https://img.shields.io/badge/theme-🌟%20space%20station-purple)
![License](https://img.shields.io/badge/license-ISC-blue)

## 🌌 Galactic Overview

AppWatch Galactic Monitoring Station är den ultimata sci-fi-inspirerade dashboarden för att övervaka din fleet av starships (webbapplikationer). Med ett mörkt rymdtema, animerade stjärnor, neon-glow effekter och advanced space-age funktioner, förvandlar den tråkig appövervakning till en episk galactic adventure!

### 🛸 Galactic Features

**🌟 Space-Age Visual Experience:**
- 🌌 **Animated Starfield** - Twinklande stjärnor i rörlig bakgrund
- ✨ **Glassmorfism UI** - Futuristisk glasbur-design med backdrop blur
- 🌈 **Neon Glow Effects** - Cyan, pink och grön sci-fi-glow
- 🚀 **Orbitron Typography** - Autentisk space-station typsnitt

**📊 Mission Control Dashboard:**
- 🛸 **Fleet Size Monitoring** - Totalt antal starships i din armada
- ⚡ **Real-time Status** - Live-övervakning med ping-indikatorer  
- 📡 **Response Time Tracking** - Signal-styrka för varje starship
- 🚨 **Incident Management** - Automatisk detektering av offline ships
- 📈 **Uptime Analytics** - Detaljerad efficiency-tracking
- 🔄 **Auto Health Checks** - Periodiska emergency scans

**🎮 Advanced Galactic Interface:**
- 🔍 **Quantum Search** - Real-time filtrering med `Ctrl+K`
- ⚙️ **Settings Portal** - Mission control konfiguration
- 📊 **Data Export** - Exportera fleet-data för analys
- 🎵 **Space Audio** - Sci-fi ljud för notifications
- ⌨️ **Keyboard Navigation** - Space commander shortcuts

**🛰️ Starship Management:**
- 🏷️ **Ship Categories** - Web App, API, Database, Microservice
- ⏱️ **Custom Scan Intervals** - Konfigurera övervakning per ship
- 🔔 **Alert Systems** - Notification management
- 💫 **Performance Metrics** - Avancerad diagnostik

## 🛠️ Teknisk Stack

- **Backend**: Cloudflare Workers
- **Databas**: Cloudflare D1 (SQLite)
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Deployment**: Wrangler CLI
- **Styling**: Modern CSS med Flexbox/Grid

## 🚀 Snabbstart

### Förutsättningar

- [Node.js](https://nodejs.org/) (v18+)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Cloudflare-konto

### Installation

1. **Klona repot**
```bash
git clone https://github.com/screamm/AppWatch.git
cd AppWatch
```

2. **Installera beroenden**
```bash
npm install
```

3. **Konfigurera Cloudflare D1 Database**
```bash
# Skapa databas
wrangler d1 create appwatch_db

# Uppdatera database_id i wrangler.toml med det genererade ID:t

# Kör databas-migrering
wrangler d1 execute appwatch_db --file=./schema.sql
```

4. **Starta utvecklingsserver**
```bash
npm run dev
```

5. **Besök dashboarden**
```
http://localhost:8787
```

### 🌐 Deployment

```bash
# Deploy till Cloudflare Workers
npm run deploy
```

## 🚀 Mission Instructions

### Registrera Ny Starship

1. Klicka på "**🛸 Add Starship**" i mission control
2. Fyll i starship-detaljer:
   - **Starship Name** - USS Enterprise, etc.
   - **Category** - Web App, API Service, Database, etc.
   - **Hyperspace Coordinates** - URL till din app
   - **Mission Description** - Beskriv starship-funktionen
   - **Scan Interval** - Hur ofta kontroller ska köras
   - **Timeout Settings** - Request timeout i millisekunder
3. Aktivera **Alert Notifications** för automatiska varningar
4. Klicka "**🚀 Launch Monitoring**"

### Fleet Status Monitoring

- **🟢 Online Signal** - Starship operational och svarar
- **🔴 Offline Signal** - Starship behöver attention
- **🟡 Unknown Signal** - Status unknown (nyregistrerad)
- **💚 Strong Signal** - <200ms response time
- **💛 Good Signal** - 200-500ms response time  
- **🧡 Weak Signal** - 500ms-1s response time
- **💔 Poor Signal** - >1s response time

### Galactic Command Center

**🎮 Keyboard Commands:**
- `Ctrl + K` - Activate quantum search
- `Ctrl + N` - Register new starship
- `Ctrl + R` - Emergency fleet scan
- `Escape` - Close command portals

**📊 Mission Activities:**
- **📡 Scan** - Perform immediate health check
- **📊 History** - View detailed starship logs
- **💥 Remove** - Decommission starship from fleet
- **⚡ Scan All** - Fleet-wide status update

### API Endpoints

AppWatch erbjuder också ett REST API:

```javascript
// Hämta alla appar
GET /api/apps

// Lägg till ny app
POST /api/apps
{
  "name": "Min App",
  "url": "https://minapp.com",
  "description": "Beskrivning av appen"
}

// Kontrollera appstatus
GET /api/apps/{id}/check

// Ta bort app
DELETE /api/apps/{id}

// Hämta statistik
GET /api/stats
```

## 🗄️ Databasschema

AppWatch använder två huvudtabeller:

### `apps` - Appinformation
- `id` - Unikt app-ID
- `name` - Appnamn
- `url` - App-URL
- `description` - Beskrivning
- `status` - Aktuell status (online/offline/unknown)
- `response_time` - Svarstid i millisekunder
- `uptime_percentage` - Uptime i procent

### `status_logs` - Statushistorik
- `app_id` - Referens till app
- `status` - Status vid tidpunkten
- `response_time` - Svarstid
- `checked_at` - Tidpunkt för kontrollen
- `error_message` - Eventuellt felmeddelande

## 🎨 Skärmdumpar

*Dashboard kommer snart att utrustas med skärmdumpar för att visa den moderna designen*

## 🤝 Bidra

Vi välkomnar bidrag! Så här kan du hjälpa till:

1. 🍴 Forka projektet
2. 🌱 Skapa en feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commita dina ändringar (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Pusha till branchen (`git push origin feature/AmazingFeature`)
5. 🔄 Öppna en Pull Request

## 📋 Roadmap

- [ ] 📊 Grafer och diagram för historisk data
- [ ] 🔔 Notifieringar via email/webhook
- [ ] 🎯 SLA-målsättningar och alerting
- [ ] 📱 PWA-stöd för mobilappar
- [ ] 🔐 Autentisering och behörigheter
- [ ] 🌍 Multi-region monitoring
- [ ] 📝 Detaljerade loggar och debugging

## 📝 Licens

Detta projekt är licensierat under ISC License - se [LICENSE](LICENSE) filen för detaljer.

## 👨‍💻 Utvecklare

**David**
- GitHub: [@screamm](https://github.com/screamm)

## 🌟 Galactic Credits

- 🚀 **Cloudflare** - För den fantastiska Workers space-platform
- 🌌 **Open Source Galaxy** - Alla stjärnor som bidrar till universum
- 🛸 **Space Explorer Community** - Utvecklare som vågar utforska nya världar

## 🎯 Mission Roadmap

- [ ] 📊 **Temporal Analytics** - Historiska grafer och trender
- [ ] 🔔 **Quantum Alerts** - Email/webhook notifications
- [ ] 🎯 **SLA Protocols** - Service level agreements
- [ ] 📱 **Mobile Command** - PWA för mobil fleet management
- [ ] 🔐 **Security Protocols** - Autentisering och behörigheter
- [ ] 🌍 **Multi-Sector Monitoring** - Global region tracking
- [ ] 🤖 **AI Assistant** - Intelligent fleet diagnostics

---

<div align="center">
  <h3>🚀 Built for the Galactic Developer Community 🌌</h3>
  <p>⭐ Give this space station a star if you love exploring the cosmos! ⭐</p>
  <p><strong>May the code be with you! 🛸✨</strong></p>
</div> 