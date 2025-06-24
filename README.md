# 🚀 AppWatch Dashboard

> **En modern monitoring-dashboard för att övervaka alla dina Cloudflare Workers appar**

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Platform](https://img.shields.io/badge/platform-Cloudflare%20Workers-orange)
![License](https://img.shields.io/badge/license-ISC-blue)

## 📊 Översikt

AppWatch är en kraftfull monitoring-dashboard som hjälper dig att hålla koll på alla dina webbapplikationer. Byggd specifikt för Cloudflare Workers med D1 Database som backend, erbjuder den realtidsövervakning, uptime-statistik och en intuitiv webbaserad interface.

### ✨ Huvudfunktioner

- 🔍 **Realtidsövervakning** - Kontinuerlig övervakning av dina appar
- 📈 **Uptime-statistik** - Detaljerad statistik över tillgänglighet
- ⚡ **Snabb dashboard** - Responsiv webinterface byggd för hastighet
- 🎯 **Status-tracking** - Historik över appstatus och svarstider
- 🔧 **Enkel konfiguration** - Lägg till nya appar med ett klick
- 📱 **Mobiloptimerad** - Fungerar perfekt på alla enheter

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

## 📖 Användning

### Lägga till en ny app

1. Klicka på "**+ Lägg till App**" i dashboarden
2. Fyll i appens namn, URL och beskrivning
3. Klicka "**Lägg till**"
4. Appen börjar övervakas automatiskt

### Övervaka appar

- **Grön status** 🟢 - Appen är online och svarar
- **Röd status** 🔴 - Appen är offline eller svarar inte
- **Grå status** ⚪ - Status okänd (nyligen tillagd)

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

**David Rydgren**
- GitHub: [@screamm](https://github.com/screamm)

## 🙏 Tack

- Cloudflare för deras fantastiska Workers-plattform
- Alla som bidrar till open source-ekosystemet

---

<div align="center">
  <p>Gjort med ❤️ för developer-communityn</p>
  <p>⭐ Ge projektet en stjärna om du gillar det!</p>
</div> 