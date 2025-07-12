# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AppWatch Dashboard is a Cloudflare Workers-based monitoring application that tracks the health and status of web applications. It features a dual-theme system with a modern "Space Station" theme and a retro "Pip-Boy Terminal" theme inspired by the Fallout universe.

## Development Commands

### Core Development
- `npm run dev` - Start local development server using Wrangler
- `npm run deploy` - Deploy to Cloudflare Workers
- `wrangler d1 execute appwatch_db --file=./schema.sql` - Apply database schema

### Database Operations
- `wrangler d1 create appwatch_db` - Create new D1 database
- `wrangler d1 execute appwatch_db --command="SELECT * FROM apps"` - Query database
- Database binding is configured in wrangler.toml as "DB"

### Testing
- No test framework is currently configured (package.json shows "no test specified")
- Manual testing through local development server and deployed endpoints

## Architecture

### Backend Structure
- **Main Handler**: `src/index.js` - Cloudflare Workers entry point with request routing
- **Database**: Cloudflare D1 (SQLite) with schema defined in `schema.sql`
- **Static Assets**: Served dynamically from `src/assets.js` (CSS/JS content)

### Database Schema
Four main tables:
- `apps` - Application registry with monitoring configuration
- `status_logs` - Historical status check data
- `alerts` - Alert configuration per app
- `sla_configs` - SLA targets and thresholds

### API Endpoints
- `GET /api/apps` - List all monitored applications
- `POST /api/apps` - Add new application
- `POST /api/apps/{id}/check` - Manual health check
- `DELETE /api/apps/{id}` - Remove application
- `GET /api/stats` - Dashboard statistics
- `GET /api/export` - Export monitoring data
- `GET /api/apps/{id}/history` - Get status history

### Frontend Architecture
- **Single Page Application**: HTML embedded in `src/index.js`
- **Theme System**: Space Station (default) and Pip-Boy Terminal themes
- **Real-time Updates**: JavaScript-based dashboard with API polling
- **Responsive Design**: Mobile-first approach with CSS Grid/Flexbox

## Key Features

### Monitoring System
- HTTP HEAD requests for health checking
- Configurable check intervals (5min - 1hr)
- Response time tracking
- Uptime percentage calculation
- Status logging with history

### Dual Theme System
- **Space Station**: Modern sci-fi interface with glassmorphism, neon effects, and animated starfield
- **Pip-Boy**: Retro terminal interface with CRT effects, green monochrome, and scanlines
- Theme persistence via localStorage

### App Categories
- Web Application
- API Service  
- Database
- Microservice
- Other

## Development Notes

### File Structure
```
src/
├── index.js     # Main Cloudflare Workers handler
├── assets.js    # CSS and JavaScript assets (if exists)
├── styles.css   # Standalone CSS file
└── script.js    # Standalone JavaScript file
```

### Configuration
- **wrangler.toml**: Cloudflare Workers configuration
- **D1 Database ID**: d3d78c08-9acd-4162-b3b4-4231e13d7437
- **Environment**: Development mode configured

### CORS Configuration
All API endpoints include CORS headers for cross-origin access.

### Error Handling
- Try-catch blocks around all async operations
- Proper HTTP status codes
- JSON error responses
- Database transaction safety

## Important Considerations

### Security
- No authentication system implemented
- CORS allows all origins (*)
- URLs are validated as proper URLs before storing
- Database uses parameterized queries to prevent SQL injection

### Performance
- Static assets served from memory via dynamic imports
- Database indexes on frequently queried columns
- Efficient SQL queries with proper filtering

### Limitations
- No real-time WebSocket connections
- No email/webhook alerting system implemented
- No user management or multi-tenancy
- 10-second timeout for health checks

## Theme Development

When working with themes:
- CSS variables define color schemes
- JavaScript theme switcher in main script
- Theme state persisted in localStorage
- Two distinct visual identities maintained

## Database Migrations

To update database schema:
1. Modify `schema.sql`
2. Run `wrangler d1 execute appwatch_db --file=./schema.sql`
3. Test locally with `npm run dev`
4. Deploy with `npm run deploy`

## Deployment Notes

- Uses Cloudflare Workers platform
- D1 database automatically connected via binding
- No build step required (vanilla JavaScript)
- Environment variables configurable in wrangler.toml